import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors/app-error'
import { inscriptoRepository } from './inscripto.repository'
import {
  AsignacionInstituto,
  DocumentacionInscripto,
  EstadoInscripto,
  ListInscriptosParams,
  UpdateInscriptoData,
  UserContext,
} from './inscripto.types'

const toPositiveIntOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    if (Number.isInteger(parsed) && parsed > 0) return parsed
  }
  return null
}

const getValueByKeys = (source: Record<string, unknown> | null, keys: string[]): unknown | null => {
  if (!source) return null
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key]
    }
  }
  return null
}

export const inscriptoService = {
  async resolveInstitutoFilterForUser(user: UserContext | undefined, institutoId?: number) {
    if (!user) throw new ForbiddenError('No autorizado')
    if (user.rol !== 'REFERENTE') return institutoId

    const dbUser = await inscriptoRepository.findUserInstituto(user.id)
    if (!dbUser?.institutoId) throw new ForbiddenError('El referente no tiene instituto asignado')
    return dbUser.institutoId
  },

  async list(params: ListInscriptosParams) {
    const { cohorteId, institutoId, estado, documentacion, search, page, limit } = params
    const where = {
      ...(cohorteId ? { cohorteId } : {}),
      ...(institutoId ? { institutoId } : {}),
      ...(estado ? { estado } : {}),
      ...(documentacion ? { documentacion } : {}),
      ...(search
        ? {
            OR: [
              { nombre: { contains: search } },
              { apellido: { contains: search } },
              { dni: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    }

    const [total, inscriptos] = await Promise.all([
      inscriptoRepository.count(where),
      inscriptoRepository.findMany({ where, page, limit }),
    ])

    return { inscriptos, total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) }
  },

  async getById(id: number) {
    return inscriptoRepository.findById(id)
  },

  normalizeUpdatePayload(payload: Record<string, unknown>): UpdateInscriptoData {
    const hasObservaciones = Object.prototype.hasOwnProperty.call(payload, 'observaciones')
    const hasPrioridad = Object.prototype.hasOwnProperty.call(payload, 'prioridad')
    const hasCondicionada = Object.prototype.hasOwnProperty.call(payload, 'condicionada')
    if (!hasObservaciones && !hasPrioridad && !hasCondicionada) {
      throw new BadRequestError('Debe enviar al menos un campo editable')
    }

    const data: UpdateInscriptoData = {}
    if (hasObservaciones) {
      const value = payload.observaciones
      data.observaciones =
        value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim()
    }

    if (hasPrioridad) {
      const value = payload.prioridad
      if (value === null || value === undefined || String(value).trim() === '') {
        data.prioridad = null
      } else {
        const parsed = Number(value)
        if (!Number.isInteger(parsed) || parsed < 0) throw new BadRequestError('prioridad invalida')
        data.prioridad = parsed
      }
    }

    if (hasCondicionada) {
      if (typeof payload.condicionada !== 'boolean') {
        throw new BadRequestError('condicionada debe ser boolean')
      }
      data.condicionada = payload.condicionada
    }

    return data
  },

  async updateEstado(id: number, estado: EstadoInscripto) {
    return inscriptoRepository.prisma.$transaction(async (tx: any) => {
      const inscripto = await tx.inscripto.findUnique({
        where: { id },
        select: {
          id: true,
          cohorteId: true,
          institutoId: true,
          datosFormulario: true,
          dni: true,
          nombre: true,
          apellido: true,
          email: true,
          celular: true,
          dniAdjuntoUrl: true,
          tituloAdjuntoUrl: true,
          instituto: {
            select: {
              distritoId: true,
              distrito: { select: { regionId: true } },
            },
          },
        },
      })

      if (!inscripto) throw new NotFoundError('Inscripto no encontrado')

      if (estado !== 'ASIGNADA') {
        return tx.inscripto.update({
          where: { id },
          data: { estado },
          select: { id: true, estado: true, updatedAt: true },
        })
      }

      if (!inscripto.institutoId) {
        throw new BadRequestError('El inscripto debe tener instituto asignado para pasar a ASIGNADA')
      }

      const datosFormularioRecord =
        inscripto.datosFormulario && typeof inscripto.datosFormulario === 'object'
          ? (inscripto.datosFormulario as Record<string, unknown>)
          : null
      const tituloDocenteRaw = getValueByKeys(datosFormularioRecord, [
        'titulo_docente_tramo_pedagogico',
        'titulo_docente_o_tramo_pedagogico',
        'titulo_docente',
        'titulo_tramo_pedagogico',
      ])
      const tituloDocente =
        typeof tituloDocenteRaw === 'string' && tituloDocenteRaw.trim().length > 0
          ? tituloDocenteRaw.trim()
          : null

      const regionFormulario = toPositiveIntOrNull(getValueByKeys(datosFormularioRecord, ['region_residencia']))
      const distritoFormulario = toPositiveIntOrNull(
        getValueByKeys(datosFormularioRecord, ['distrito_residencia']),
      )

      let distritoId = inscripto.instituto?.distritoId ?? null
      let regionId = inscripto.instituto?.distrito?.regionId ?? regionFormulario

      if (distritoFormulario) {
        const distrito = await tx.distrito.findUnique({
          where: { id: distritoFormulario },
          select: { id: true, regionId: true },
        })
        if (distrito) {
          distritoId = distrito.id
          regionId = distrito.regionId
        }
      }

      let cursante = await tx.cursante.findUnique({
        where: { dni: inscripto.dni },
        select: { id: true, titulo: true, regionId: true, distritoId: true },
      })

      if (!cursante) {
        cursante = await tx.cursante.create({
          data: {
            dni: inscripto.dni,
            nombre: inscripto.nombre,
            apellido: inscripto.apellido,
            email: inscripto.email,
            celular: inscripto.celular,
            titulo: tituloDocente,
            regionId,
            distritoId,
          },
          select: { id: true, titulo: true, regionId: true, distritoId: true },
        })
      } else if ((!cursante.titulo && tituloDocente) || (!cursante.regionId && regionId) || (!cursante.distritoId && distritoId)) {
        cursante = await tx.cursante.update({
          where: { id: cursante.id },
          data: {
            ...(cursante.titulo ? {} : { titulo: tituloDocente }),
            regionId: cursante.regionId || regionId,
            distritoId: cursante.distritoId || distritoId,
          },
          select: { id: true, titulo: true, regionId: true, distritoId: true },
        })
      }

      const existenteEnCohorte = await tx.cursanteAula.findFirst({
        where: { cursanteId: cursante.id, aula: { cohorteId: inscripto.cohorteId } },
        select: { id: true, aulaId: true },
      })

      let asignacion: { created: boolean; cursanteAulaId: number; aulaId: number } | undefined

      if (existenteEnCohorte) {
        await tx.cursanteAula.update({
          where: { id: existenteEnCohorte.id },
          data: {
            documentacion: 'VERIFICADA',
            dniAdjuntoUrl: inscripto.dniAdjuntoUrl || null,
            tituloAdjuntoUrl: inscripto.tituloAdjuntoUrl || null,
          },
        })
        asignacion = {
          created: false,
          cursanteAulaId: existenteEnCohorte.id,
          aulaId: existenteEnCohorte.aulaId,
        }
      } else {
        const aulas = await tx.aula.findMany({
          where: { cohorteId: inscripto.cohorteId, institutoId: inscripto.institutoId },
          select: { id: true, _count: { select: { cursantes: true } } },
        })
        if (aulas.length === 0) {
          throw new BadRequestError('No hay aulas disponibles para la cohorte e instituto del inscripto')
        }

        const aulaElegida = [...aulas].sort((a, b) =>
          a._count.cursantes !== b._count.cursantes ? a._count.cursantes - b._count.cursantes : a.id - b.id,
        )[0]

        const cursanteAula = await tx.cursanteAula.create({
          data: {
            cursanteId: cursante.id,
            aulaId: aulaElegida.id,
            estado: 'ACTIVO',
            documentacion: 'VERIFICADA',
            dniAdjuntoUrl: inscripto.dniAdjuntoUrl || null,
            tituloAdjuntoUrl: inscripto.tituloAdjuntoUrl || null,
          },
          select: { id: true, aulaId: true },
        })
        asignacion = { created: true, cursanteAulaId: cursanteAula.id, aulaId: cursanteAula.aulaId }
      }

      const updated = await tx.inscripto.update({
        where: { id },
        data: { estado: 'ASIGNADA' },
        select: { id: true, estado: true, updatedAt: true },
      })

      return { ...updated, cursanteId: cursante.id, asignacion }
    })
  },

  async updateDocumentacion(id: number, documentacion: DocumentacionInscripto) {
    return inscriptoRepository.updateDocumentacion(id, documentacion)
  },

  async update(id: number, data: UpdateInscriptoData) {
    return inscriptoRepository.update(id, data as Record<string, unknown>)
  },

  async assignInstituto(id: number, institutoId: number | null) {
    if (institutoId !== null) {
      const instituto = await inscriptoRepository.findInstitutoById(institutoId)
      if (!instituto) throw new NotFoundError('Instituto no encontrado')
    }
    return inscriptoRepository.assignInstituto(id, institutoId)
  },

  normalizeBulkAsignaciones(payload: unknown) {
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new BadRequestError('Debe enviar un array no vacio en "asignaciones" con { inscriptoId, institutoId }')
    }

    const asignaciones = payload.map((item: any, index: number) => {
      const inscriptoId = Number(item?.inscriptoId)
      const institutoIdRaw = item?.institutoId
      const institutoId =
        institutoIdRaw === null || institutoIdRaw === undefined || String(institutoIdRaw).trim() === ''
          ? null
          : Number(institutoIdRaw)

      if (!Number.isInteger(inscriptoId) || inscriptoId <= 0) {
        throw new BadRequestError(`inscriptoId invalido en posicion ${index}`)
      }
      if (institutoId !== null && (!Number.isInteger(institutoId) || institutoId <= 0)) {
        throw new BadRequestError(`institutoId invalido en posicion ${index}`)
      }

      return { inscriptoId, institutoId }
    })

    const uniqueInscriptos = new Set(asignaciones.map((a) => a.inscriptoId))
    if (uniqueInscriptos.size !== asignaciones.length) {
      throw new BadRequestError('No se permiten inscriptos repetidos en asignaciones')
    }

    return asignaciones
  },

  async assignInstitutosBulk(asignaciones: AsignacionInstituto[]) {
    const inscriptoIds = [...new Set(asignaciones.map((a) => a.inscriptoId))]
    const institutoIds = [...new Set(asignaciones.map((a) => a.institutoId).filter((id): id is number => typeof id === 'number' && Number.isInteger(id)))]
    const [inscriptosCount, institutosCount] = await inscriptoRepository.findManyCountsForBulk(inscriptoIds, institutoIds)

    if (inscriptosCount !== inscriptoIds.length) throw new NotFoundError('Uno o mas inscriptos no existen')
    if (institutoIds.length > 0 && institutosCount !== institutoIds.length) {
      throw new NotFoundError('Uno o mas institutos no existen')
    }

    return inscriptoRepository.assignInstitutosBulk(asignaciones)
  },

  async getDocumentoPath(id: number, tipo: 'dni' | 'titulo') {
    const inscripto = await inscriptoRepository.getDocumentoPath(id)
    if (!inscripto) return null
    const path = tipo === 'dni' ? inscripto.dniAdjuntoUrl : inscripto.tituloAdjuntoUrl
    return { id: inscripto.id, path: path || null }
  },
}
