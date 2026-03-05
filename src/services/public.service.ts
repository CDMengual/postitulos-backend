import prisma from '../prisma/client'

type PublicDbClient = {
  cohorte: typeof prisma.cohorte
  inscripto: typeof prisma.inscripto
}

const getCapacidad = (value: number | null | undefined) => Math.max(value ?? 0, 0)

const isEnListaDeEspera = (inscripto: { estado: string; listaEspera: boolean }) =>
  inscripto.estado === 'LISTA_ESPERA' || inscripto.listaEspera

const calcularDisponibilidad = ({
  cupos,
  cuposListaEspera,
  inscriptosRegulares,
  inscriptosEspera,
}: {
  cupos?: number | null
  cuposListaEspera?: number | null
  inscriptosRegulares: number
  inscriptosEspera: number
}) => {
  const capacidadRegular = getCapacidad(cupos)
  const capacidadEspera = getCapacidad(cuposListaEspera)
  const cuposTotales = capacidadRegular + capacidadEspera
  const inscriptosTotales = inscriptosRegulares + inscriptosEspera
  const cuposDisponibles = Math.max(capacidadRegular - inscriptosRegulares, 0)
  const cuposEsperaDisponibles = Math.max(capacidadEspera - inscriptosEspera, 0)
  const cuposTotalesDisponibles = Math.max(cuposTotales - inscriptosTotales, 0)

  return {
    cupos: capacidadRegular,
    cuposListaEspera: capacidadEspera,
    cuposTotales,
    inscriptosRegulares,
    inscriptosEspera,
    inscriptosTotales,
    cuposDisponibles,
    cuposEsperaDisponibles,
    cuposTotalesDisponibles,
    inscripcionHabilitada: cuposTotalesDisponibles > 0,
  }
}

const estaEnPeriodoInscripcion = ({
  fechaInicioInscripcion,
  fechaFinInscripcion,
  now,
}: {
  fechaInicioInscripcion: Date | null
  fechaFinInscripcion: Date | null
  now: Date
}) => {
  if (fechaInicioInscripcion && now < fechaInicioInscripcion) return false
  if (fechaFinInscripcion && now > fechaFinInscripcion) return false
  return true
}

const normalizeKey = (key: string) => key.trim().toLowerCase()

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const getValueByKeys = (source: Record<string, unknown>, keys: string[]) => {
  const entries = Object.entries(source)
  for (const key of keys) {
    const normalizedTarget = normalizeKey(key)
    const found = entries.find(([entryKey]) => normalizeKey(entryKey) === normalizedTarget)
    if (found) return found[1]
  }
  return undefined
}

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', 'si', 'sí', 'yes', '1'].includes(normalized)) return true
    if (['false', 'no', '0'].includes(normalized)) return false
  }
  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }
  return null
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.').trim())
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter((item) => item.length > 0)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()]
  }
  return []
}

const evaluarPrioridadEI = (datosFormularioRaw: unknown) => {
  const datosFormulario = toRecord(datosFormularioRaw)

  const poseeTituloValue = getValueByKeys(datosFormulario, ['posee_titulo_docente'])
  const poseeTitulo = toBoolean(poseeTituloValue)

  if (poseeTitulo === false) {
    return {
      estado: 'RECHAZADA' as const,
      prioridad: 0,
      observaciones:
        'Rechazada por no cumplir requisito excluyente: titulo docente o tramo pedagogico habilitante.',
    }
  }

  let prioridad = 0

  const requisitosPrioritariosValue = getValueByKeys(datosFormulario, ['requisitos_prioritarios'])
  const requisitosPrioritarios = toStringArray(requisitosPrioritariosValue).map((value) =>
    value.toLowerCase(),
  )

  const enEjercicioValue = getValueByKeys(datosFormulario, ['ejercicio_cargo_actual'])
  const enEjercicio =
    toBoolean(enEjercicioValue) === true ||
    requisitosPrioritarios.some((item) => item.includes('estar en ejercicio'))
  if (enEjercicio) prioridad += 1

  const nivelDesempenioValue = getValueByKeys(datosFormulario, ['nivel_desempenio'])
  const nivelDesempenioTexto =
    typeof nivelDesempenioValue === 'string' ? nivelDesempenioValue.toLowerCase() : ''
  const nivelSecundario =
    nivelDesempenioTexto.includes('secundario') ||
    requisitosPrioritarios.some((item) => item.includes('nivel secundario'))
  if (nivelSecundario) prioridad += 1

  const antiguedadValue = getValueByKeys(datosFormulario, [
    'antiguedad_docente',
    'antiguedad_anios',
    'antiguedad',
  ])
  const antiguedad = toNumber(antiguedadValue)
  const antiguedadPrioritaria =
    (antiguedad !== null && antiguedad >= 0 && antiguedad <= 5) ||
    requisitosPrioritarios.some((item) => item.includes('0 y 5'))
  if (antiguedadPrioritaria) prioridad += 1

  return {
    estado: 'PENDIENTE' as const,
    prioridad,
    observaciones: null,
  }
}

export const publicService = {
  // Cohortes en inscripcion (solo datos publicos)
  async getCohortesEnInscripcion() {
    const ahora = new Date()

    const cohortes = await prisma.cohorte.findMany({
      where: {
        estado: 'INSCRIPCION',
      },
      select: {
        id: true,
        nombre: true,
        anio: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        cupos: true,
        cuposListaEspera: true,
        cuposTotales: true,
        inscriptos: {
          select: {
            estado: true,
            listaEspera: true,
          },
          where: {
            estado: {
              not: 'RECHAZADA',
            },
          },
        },

        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            destinatarios: true,
          },
        },

        formulario: {
          select: {
            id: true,
            nombre: true,
            campos: true,
          },
        },
      },
      orderBy: {
        anio: 'desc',
      },
    })

    return cohortes
      .map((cohorte) => {
        const { inscriptos, ...cohorteBase } = cohorte
        const inscriptosEspera = inscriptos.filter(isEnListaDeEspera).length
        const inscriptosRegulares = inscriptos.length - inscriptosEspera

        const disponibilidad = calcularDisponibilidad({
          cupos: cohorte.cupos,
          cuposListaEspera: cohorte.cuposListaEspera,
          inscriptosRegulares,
          inscriptosEspera,
        })

        const enPeriodo = estaEnPeriodoInscripcion({
          fechaInicioInscripcion: cohorte.fechaInicioInscripcion,
          fechaFinInscripcion: cohorte.fechaFinInscripcion,
          now: ahora,
        })
        const tieneCuposDisponibles = disponibilidad.inscripcionHabilitada

        return {
          ...cohorteBase,
          ...disponibilidad,
          inscripcionHabilitada: enPeriodo && tieneCuposDisponibles,
          enPeriodoInscripcion: enPeriodo,
          fueraDePeriodoInscripcion: !enPeriodo,
          tieneCuposDisponibles,
          sinCuposDisponibles: !tieneCuposDisponibles,
        }
      })
  },

  // Obtener cohorte publica por ID
  async getCohortePublic(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        anio: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,

        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            destinatarios: true,
            planEstudios: true,
            resolucion: true,
            tipos: {
              select: {
                id: true,
                tipo: true,
                titulo: true,
              },
            },
          },
        },

        formulario: {
          select: {
            id: true,
            nombre: true,
            campos: true,
          },
        },
      },
    })
  },

  async validateCohorteDisponibleParaInscripcion(
    cohorteId: number,
    db: PublicDbClient = prisma,
  ) {
    const cohorte = await db.cohorte.findUnique({
      where: { id: cohorteId },
      select: {
        id: true,
        estado: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        cupos: true,
        cuposListaEspera: true,
      },
    })

    if (!cohorte) {
      return { error: 'Cohorte no encontrada', code: 404 as const }
    }

    if (cohorte.estado !== 'INSCRIPCION') {
      return { error: 'La cohorte no esta en periodo de inscripcion', code: 400 as const }
    }

    const now = new Date()
    if (cohorte.fechaInicioInscripcion && now < cohorte.fechaInicioInscripcion) {
      return { error: 'La inscripcion aun no esta habilitada', code: 400 as const }
    }
    if (cohorte.fechaFinInscripcion && now > cohorte.fechaFinInscripcion) {
      return { error: 'La inscripcion para esta cohorte ya cerro', code: 400 as const }
    }

    const [inscriptosRegulares, inscriptosEspera] = await Promise.all([
      db.inscripto.count({
        where: {
          cohorteId,
          estado: { not: 'RECHAZADA' },
          NOT: [{ estado: 'LISTA_ESPERA' }, { listaEspera: true }],
        },
      }),
      db.inscripto.count({
        where: {
          cohorteId,
          estado: { not: 'RECHAZADA' },
          OR: [{ estado: 'LISTA_ESPERA' }, { listaEspera: true }],
        },
      }),
    ])

    const disponibilidad = calcularDisponibilidad({
      cupos: cohorte.cupos,
      cuposListaEspera: cohorte.cuposListaEspera,
      inscriptosRegulares,
      inscriptosEspera,
    })

    if (!disponibilidad.inscripcionHabilitada) {
      return { error: 'La cohorte no tiene cupos disponibles', code: 400 as const }
    }

    return { data: { ...cohorte, ...disponibilidad } }
  },

  async existsInscripcionByCohorteYDni(
    cohorteId: number,
    dni: string,
    db: PublicDbClient = prisma,
  ) {
    const existente = await db.inscripto.findUnique({
      where: { cohorteId_dni: { cohorteId, dni } },
      select: { id: true },
    })
    return Boolean(existente)
  },

  async createInscripcionPublic(data: {
    cohorteId: number
    nombre: string
    apellido: string
    dni: string
    email?: string | null
    celular?: string | null
    datosFormulario?: any
    dniAdjuntoUrl?: string | null
    tituloAdjuntoUrl?: string | null
  }) {
    return prisma.$transaction(async (tx) => {
      const cohorteResult = await this.validateCohorteDisponibleParaInscripcion(data.cohorteId, tx)
      if ('error' in cohorteResult && cohorteResult.error) {
        return cohorteResult
      }

      const yaExiste = await this.existsInscripcionByCohorteYDni(data.cohorteId, data.dni, tx)
      if (yaExiste) {
        return {
          error: 'Ya existe una inscripcion para este DNI en la cohorte',
          code: 409 as const,
        }
      }

      const cohorteMeta = await tx.cohorte.findUnique({
        where: { id: data.cohorteId },
        select: {
          postitulo: {
            select: { codigo: true },
          },
        },
      })

      const codigoPostitulo = (cohorteMeta?.postitulo?.codigo || '').trim().toUpperCase()
      const evaluacionPrioridad =
        codigoPostitulo === 'EI'
          ? evaluarPrioridadEI(data.datosFormulario)
          : { estado: 'PENDIENTE' as const, prioridad: 0, observaciones: null }

      const inscripto = await tx.inscripto.create({
        data: {
          cohorteId: data.cohorteId,
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          email: data.email || null,
          celular: data.celular || null,
          datosFormulario: data.datosFormulario ?? null,
          dniAdjuntoUrl: data.dniAdjuntoUrl || null,
          tituloAdjuntoUrl: data.tituloAdjuntoUrl || null,
          estado: evaluacionPrioridad.estado,
          prioridad: evaluacionPrioridad.prioridad,
          observaciones: evaluacionPrioridad.observaciones,
          listaEspera: false,
        },
        select: {
          id: true,
          cohorteId: true,
          nombre: true,
          apellido: true,
          dni: true,
          email: true,
          celular: true,
          estado: true,
          listaEspera: true,
          createdAt: true,
        },
      })

      return { data: inscripto }
    })
  },
}
