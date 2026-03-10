import { Prisma } from '@prisma/client'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors/app-error'
import { aulaRepository } from './aula.repository'
import {
  AulaEstadoFiltro,
  AulaWithDetail,
  CreateAulaForUserPayload,
  CreateManyAulasPayload,
  SnapshotPayload,
} from './aula.types'

const getDefaultFechaCorte = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
}

const normalizeFechaCorte = (fechaCorte?: Date) => {
  const baseDate = fechaCorte ?? getDefaultFechaCorte()
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  )
}

const countEstados = async (aulaId: number) => {
  const [activos, adeuda, baja, finalizado] = await Promise.all([
    aulaRepository.countCursantesByEstado(aulaId, 'ACTIVO'),
    aulaRepository.countCursantesByEstado(aulaId, 'ADEUDA'),
    aulaRepository.countCursantesByEstado(aulaId, 'BAJA'),
    aulaRepository.countCursantesByEstado(aulaId, 'FINALIZADO'),
  ])

  return {
    activos,
    adeuda,
    baja,
    finalizado,
    totalFoto: activos + adeuda + baja + finalizado,
  }
}

const buildAulaPayload = ({
  numero,
  cohorte,
  institutoId,
}: {
  numero: number
  cohorte: {
    id: number
    nombre: string | null
    anio: number
    postitulo: {
      codigo: string | null
      nombre: string
    } | null
  }
  institutoId: number | null
}) => {
  if (!cohorte.postitulo?.codigo) {
    throw new BadRequestError('Cohorte sin postitulo asociado')
  }
  if (!cohorte.nombre) {
    throw new BadRequestError('Cohorte sin nombre valido')
  }
  if (!institutoId) {
    throw new BadRequestError('Instituto invalido para crear aula')
  }

  return {
    numero,
    codigo: `${cohorte.postitulo.codigo}-${cohorte.anio}-Aula${String(numero).padStart(2, '0')}`,
    nombre: `${cohorte.postitulo.nombre} - Aula ${numero} (${cohorte.nombre})`,
    cohorte: { connect: { id: cohorte.id } },
    instituto: { connect: { id: institutoId } },
  }
}

const mapAulaDetail = (aula: AulaWithDetail | null) => {
  if (!aula) return null

  return {
    ...aula,
    cursantes: aula.cursantes.map((ins: any) => ({
      id: ins.cursante.id,
      nombre: ins.cursante.nombre,
      apellido: ins.cursante.apellido,
      dni: ins.cursante.dni,
      email: ins.cursante.email,
      celular: ins.cursante.celular,
      titulo: ins.cursante.titulo,
      regionId: ins.cursante.regionId,
      distritoId: ins.cursante.distritoId,
      estado: ins.estado,
      documentacion: ins.documentacion,
      observaciones: ins.observaciones,
      dniAdjuntoUrl: ins.dniAdjuntoUrl,
      tituloAdjuntoUrl: ins.tituloAdjuntoUrl,
    })),
  }
}

export const aulaService = {
  async getAllForUser(
    userId: number,
    rol: string,
    estado?: AulaEstadoFiltro,
    postituloId?: number,
  ) {
    const baseSelect = {
      id: true,
      codigo: true,
      numero: true,
      cohorte: {
        select: {
          id: true,
          nombre: true,
          anio: true,
          estado: true,
          postitulo: { select: { id: true, nombre: true, codigo: true } },
        },
      },
      referentes: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
    }

    const orderBy = [{ cohorteId: 'desc' as const }, { numero: 'asc' as const }]
    const cohorteEstadoWhere: Prisma.CohorteWhereInput =
      !estado || estado === 'ALL'
        ? estado === 'ALL'
          ? {}
          : { estado: { in: ['INSCRIPCION', 'ACTIVA'] } }
        : { estado }
    const cohorteWhere: Prisma.CohorteWhereInput = {
      ...cohorteEstadoWhere,
      ...(postituloId ? { postituloId } : {}),
    }

    return aulaRepository.findManyForUser({
      userId,
      rol,
      cohorteWhere,
      select: baseSelect,
      orderBy,
    })
  },

  async getById(id: number) {
    const aula = await aulaRepository.findById(id)

    return mapAulaDetail(aula)
  },

  async createForUser({ cohorteId, referenteId, currentUser }: CreateAulaForUserPayload) {
    if (!currentUser) {
      throw new UnauthorizedError('No autorizado')
    }

    const admins = await aulaRepository.findAdmins()

    let referentePrincipalId: number

    if (currentUser.rol === 'ADMIN') {
      if (!referenteId) {
        throw new BadRequestError('Debe seleccionar un referente')
      }
      referentePrincipalId = referenteId
    } else if (currentUser.rol === 'REFERENTE') {
      referentePrincipalId = currentUser.id
    } else {
      throw new ForbiddenError('No tiene permisos para crear aulas')
    }

    const referentePrincipal = await aulaRepository.findReferenteById(referentePrincipalId)

    if (!referentePrincipal?.institutoId) {
      throw new BadRequestError('El referente seleccionado no tiene un instituto asignado')
    }

    return aulaRepository.transaction(async (tx: any) => {
      const lastAula = await aulaRepository.findLastAulaByCohorte(cohorteId, tx)

      const nextNumero = (lastAula?.numero ?? 0) + 1
      const cohorte = await aulaRepository.findCohorteById(cohorteId)

      if (!cohorte) throw new NotFoundError('Cohorte no encontrada')

      return aulaRepository.create(
        {
          ...buildAulaPayload({
            numero: nextNumero,
            cohorte,
            institutoId: referentePrincipal.institutoId,
          }),
          admins: { connect: admins.map((admin: { id: number }) => ({ id: admin.id })) },
          referentes: { connect: [{ id: referentePrincipalId }] },
        },
        tx,
      )
    })
  },

  async createManyForAdmin({
    cohorteId,
    total,
    distribucion,
    currentUser,
  }: CreateManyAulasPayload): Promise<any[]> {
    if (!currentUser || currentUser.rol !== 'ADMIN') {
      throw new ForbiddenError('No autorizado')
    }

    const suma = distribucion.reduce((acc, item) => acc + Number(item.cantidad || 0), 0)
    if (suma !== total) {
      throw new BadRequestError(`La suma de aulas (${suma}) no coincide con el total (${total})`)
    }

    const admins = await aulaRepository.findAdmins()

    const cohorte = await aulaRepository.findCohorteById(cohorteId)

    if (!cohorte) throw new NotFoundError('Cohorte no encontrada')
    if (!cohorte.postitulo) throw new BadRequestError('Cohorte sin postitulo')

    return aulaRepository.transaction(async (tx: any) => {
      const created = []
      let numero = 1

      for (const bloque of distribucion) {
        const referente = await tx.user.findUnique({
          where: { id: bloque.referenteId },
          select: { institutoId: true },
        })

        if (!referente?.institutoId) continue

        for (let i = 0; i < bloque.cantidad; i += 1) {
          const aula = await aulaRepository.create(
            {
              ...buildAulaPayload({
                numero,
                cohorte,
                institutoId: referente.institutoId,
              }),
              referentes: { connect: [{ id: bloque.referenteId }] },
              admins: { connect: admins.map((admin: { id: number }) => ({ id: admin.id })) },
            },
            tx,
          )

          created.push(aula)
          numero += 1
        }
      }

      return created
    })
  },

  async update(id: number, data: any) {
    return aulaRepository.update(id, data)
  },

  async remove(id: number) {
    await aulaRepository.deleteCursantesByAulaId(id)
    return aulaRepository.delete(id)
  },

  async createMonthlySnapshot(aulaId: number, payload: SnapshotPayload = {}) {
    const aula = await aulaRepository.findSnapshotAula(aulaId)

    if (!aula) throw new NotFoundError('Aula no encontrada')

    const fechaCorte = normalizeFechaCorte(payload.fechaCorte)
    const anio = fechaCorte.getFullYear()
    const mes = fechaCorte.getMonth() + 1

    const existingBaseSnapshot = await aulaRepository.findBaseSnapshot(aulaId)

    const estadoActual = await countEstados(aulaId)
    const totalInicial =
      existingBaseSnapshot?.totalInicial ??
      (await aulaRepository.countCursantes(aulaId))

    const snapshot = await aulaRepository.upsertSnapshot(aulaId, anio, mes, {
      fechaCorte,
      totalInicial,
      activos: estadoActual.activos,
      adeuda: estadoActual.adeuda,
      baja: estadoActual.baja,
      finalizado: estadoActual.finalizado,
      totalFoto: estadoActual.totalFoto,
      observaciones: payload.observaciones?.trim() || null,
    })

    return {
      ...snapshot,
      aula,
    }
  },

  async createMonthlySnapshotsForCohorte(cohorteId: number, payload: SnapshotPayload = {}) {
    const aulas = await aulaRepository.findAulasByCohorte(cohorteId)

    if (aulas.length === 0) throw new BadRequestError('La cohorte no tiene aulas')

    const snapshots = []
    for (const aula of aulas) {
      const snapshot = await this.createMonthlySnapshot(aula.id, payload)
      snapshots.push(snapshot)
    }

    return snapshots
  },

  async getMonthlySnapshotsByAula(aulaId: number) {
    return aulaRepository.findSnapshotsByAula(aulaId)
  },

  async getMonthlySnapshotsSeriesByCohorte(userId: number, rol: string, cohorteId: number) {
    const aulas = await aulaRepository.findAccessibleAulasByCohorte(userId, rol, cohorteId)

    if (aulas.length === 0) {
      return {
        cohorteId,
        aulas: [],
        serie: [],
      }
    }

    const aulaIds = aulas.map((aula: { id: number }) => aula.id)
    const snapshots = await aulaRepository.findSnapshotsByAulaIds(aulaIds)

    const serieMap = new Map<
      string,
      {
        fechaCorte: Date
        anio: number
        mes: number
        totalInicial: number
        activos: number
        adeuda: number
        baja: number
        finalizado: number
        totalFoto: number
      }
    >()

    for (const snapshot of snapshots) {
      const key = `${snapshot.anio}-${String(snapshot.mes).padStart(2, '0')}`
      const current = serieMap.get(key) ?? {
        fechaCorte: snapshot.fechaCorte,
        anio: snapshot.anio,
        mes: snapshot.mes,
        totalInicial: 0,
        activos: 0,
        adeuda: 0,
        baja: 0,
        finalizado: 0,
        totalFoto: 0,
      }

      current.totalInicial += snapshot.totalInicial
      current.activos += snapshot.activos
      current.adeuda += snapshot.adeuda
      current.baja += snapshot.baja
      current.finalizado += snapshot.finalizado
      current.totalFoto += snapshot.totalFoto
      serieMap.set(key, current)
    }

    return {
      cohorteId,
      aulas,
      serie: [...serieMap.values()],
      snapshots,
    }
  },
}
