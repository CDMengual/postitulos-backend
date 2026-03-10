import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'
import { publicRepository } from './public.repository'
import { PublicDbClient } from './public.repository'

type DisponibilidadInscripcion = ReturnType<typeof calcularDisponibilidad>
const MAX_SERIALIZATION_RETRIES = 5

const getCapacidad = (value: number | null | undefined) => Math.max(value ?? 0, 0)

const calcularDisponibilidad = ({
  cupos,
  cuposListaEspera,
  inscriptosTotales,
}: {
  cupos?: number | null
  cuposListaEspera?: number | null
  inscriptosTotales: number
}) => {
  const capacidadRegular = getCapacidad(cupos)
  const capacidadEspera = getCapacidad(cuposListaEspera)
  const cuposTotales = capacidadRegular + capacidadEspera
  const inscriptosRegulares = Math.min(inscriptosTotales, capacidadRegular)
  const inscriptosEspera = Math.max(inscriptosTotales - capacidadRegular, 0)
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
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim().length > 0) return [value.trim()]
  return []
}

const CAMPO_TITULO_DOCENTE = {
  id: 'titulo_docente_tramo_pedagogico',
  label: 'Titulo docente o tramo pedagogico',
  type: 'text',
  required: false,
}

const ensureCampoTituloDocente = (camposRaw: unknown) => {
  if (!Array.isArray(camposRaw)) return camposRaw
  const idsPermitidos = new Set([
    'titulo_docente_tramo_pedagogico',
    'titulo_docente_o_tramo_pedagogico',
    'titulo_docente',
    'titulo_tramo_pedagogico',
  ])

  const camposSinTitulo = camposRaw.filter((campo) => {
    if (!campo || typeof campo !== 'object' || Array.isArray(campo)) return false
    const id = (campo as Record<string, unknown>).id
    return !(typeof id === 'string' && idsPermitidos.has(normalizeKey(id)))
  })

  const indexDistrito = camposSinTitulo.findIndex((campo) => {
    if (!campo || typeof campo !== 'object' || Array.isArray(campo)) return false
    const id = (campo as Record<string, unknown>).id
    return typeof id === 'string' && normalizeKey(id) === 'distrito_residencia'
  })

  if (indexDistrito >= 0) {
    return [
      ...camposSinTitulo.slice(0, indexDistrito + 1),
      CAMPO_TITULO_DOCENTE,
      ...camposSinTitulo.slice(indexDistrito + 1),
    ]
  }

  return [...camposSinTitulo, CAMPO_TITULO_DOCENTE]
}

const evaluarPrioridadEI = (datosFormularioRaw: unknown) => {
  const datosFormulario = toRecord(datosFormularioRaw)
  const poseeTitulo = toBoolean(getValueByKeys(datosFormulario, ['posee_titulo_docente']))

  if (poseeTitulo === false) {
    return {
      estado: 'RECHAZADA' as const,
      prioridad: 0,
      observaciones:
        'Rechazada por no cumplir requisito excluyente: titulo docente o tramo pedagogico habilitante.',
    }
  }

  let prioridad = 0
  const requisitosPrioritarios = toStringArray(
    getValueByKeys(datosFormulario, ['requisitos_prioritarios']),
  ).map((value) => value.toLowerCase())
  const enEjercicio =
    toBoolean(getValueByKeys(datosFormulario, ['ejercicio_cargo_actual'])) === true ||
    requisitosPrioritarios.some((item) => item.includes('estar en ejercicio'))
  if (enEjercicio) prioridad += 1

  const nivelDesempenioValue = getValueByKeys(datosFormulario, ['nivel_desempenio'])
  const nivelDesempenioTexto =
    typeof nivelDesempenioValue === 'string' ? nivelDesempenioValue.toLowerCase() : ''
  const nivelSecundario =
    nivelDesempenioTexto.includes('secundario') ||
    requisitosPrioritarios.some((item) => item.includes('nivel secundario'))
  if (nivelSecundario) prioridad += 1

  const antiguedad = toNumber(
    getValueByKeys(datosFormulario, ['antiguedad_docente', 'antiguedad_anios', 'antiguedad']),
  )
  const antiguedadPrioritaria =
    (antiguedad !== null && antiguedad >= 0 && antiguedad <= 5) ||
    requisitosPrioritarios.some((item) => item.includes('0 y 5'))
  if (antiguedadPrioritaria) prioridad += 1

  return { estado: 'PENDIENTE' as const, prioridad, observaciones: null }
}

const evaluarPrioridadEA = (datosFormularioRaw: unknown) => {
  const datosFormulario = toRecord(datosFormularioRaw)
  const poseeTitulo = toBoolean(getValueByKeys(datosFormulario, ['posee_titulo_docente']))
  if (poseeTitulo === false) {
    return {
      estado: 'RECHAZADA' as const,
      prioridad: 0,
      observaciones:
        'Rechazada por no cumplir requisito excluyente: titulo docente habilitante para Educacion Secundaria.',
    }
  }

  const requisitosPrioritarios = toStringArray(
    getValueByKeys(datosFormulario, ['requisitos_prioritarios']),
  ).map((value) => value.toLowerCase())
  let prioridad = 0
  if (requisitosPrioritarios.some((item) => item.includes('estar en ejercicio') && item.includes('educacion secundaria'))) prioridad += 1
  if (requisitosPrioritarios.some((item) => item.includes('equipo de gestion'))) prioridad += 1
  if (requisitosPrioritarios.some((item) => item.includes('bibliotecario'))) prioridad += 1

  return { estado: 'PENDIENTE' as const, prioridad, observaciones: null }
}

const resolveEstadoInscripcion = (
  evaluacion: { estado: 'PENDIENTE' | 'RECHAZADA'; prioridad: number; observaciones: string | null },
) => evaluacion.estado

export const publicService = {
  async getCohortesEnInscripcion() {
    const ahora = new Date()
    const cohortes = await publicRepository.findCohortesEnInscripcion()
    return cohortes.map((cohorte: any) => {
      const { inscriptos, ...cohorteBase } = cohorte
      const disponibilidad = calcularDisponibilidad({
        cupos: cohorte.cupos,
        cuposListaEspera: cohorte.cuposListaEspera,
        inscriptosTotales: inscriptos.length,
      })
      const enPeriodo = estaEnPeriodoInscripcion({
        fechaInicioInscripcion: cohorte.fechaInicioInscripcion,
        fechaFinInscripcion: cohorte.fechaFinInscripcion,
        now: ahora,
      })
      const tieneCuposDisponibles = disponibilidad.inscripcionHabilitada

      return {
        ...cohorteBase,
        formulario: cohorteBase.formulario
          ? { ...cohorteBase.formulario, campos: ensureCampoTituloDocente(cohorteBase.formulario.campos) }
          : cohorteBase.formulario,
        ...disponibilidad,
        inscripcionHabilitada: enPeriodo && tieneCuposDisponibles,
        enPeriodoInscripcion: enPeriodo,
        fueraDePeriodoInscripcion: !enPeriodo,
        tieneCuposDisponibles,
        sinCuposDisponibles: !tieneCuposDisponibles,
      }
    })
  },

  async getCohortePublic(id: number) {
    const cohorte = await publicRepository.findCohortePublic(id)
    if (!cohorte) return null
    return {
      ...cohorte,
      formulario: cohorte.formulario
        ? { ...cohorte.formulario, campos: ensureCampoTituloDocente(cohorte.formulario.campos) }
        : cohorte.formulario,
    }
  },

  async validateCohorteDisponibleParaInscripcion(cohorteId: number, db: PublicDbClient = prisma) {
    const cohorte = await publicRepository.findCohorteDisponibleParaInscripcion(cohorteId, db)
    if (!cohorte) return { error: 'Cohorte no encontrada', code: 404 as const }
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

    const inscriptosTotales = await publicRepository.countInscriptosDisponibles(cohorteId, db)
    const disponibilidad = calcularDisponibilidad({
      cupos: cohorte.cupos,
      cuposListaEspera: cohorte.cuposListaEspera,
      inscriptosTotales,
    })
    if (!disponibilidad.inscripcionHabilitada) {
      return { error: 'La cohorte no tiene cupos disponibles', code: 400 as const }
    }

    return { data: { ...cohorte, ...disponibilidad } }
  },

  async existsInscripcionByCohorteYDni(cohorteId: number, dni: string, db: PublicDbClient) {
    return Boolean(await publicRepository.findInscripcionByCohorteYDni(cohorteId, dni, db))
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
    for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
      try {
        return await prisma.$transaction(
          async (tx: any) => {
            await tx.$queryRaw`SELECT id FROM Cohorte WHERE id = ${data.cohorteId} FOR UPDATE`

            const cohorteResult = await this.validateCohorteDisponibleParaInscripcion(
              data.cohorteId,
              tx as unknown as PublicDbClient,
            )
            if ('error' in cohorteResult && cohorteResult.error) return cohorteResult
            if (!('data' in cohorteResult) || !cohorteResult.data) {
              return { error: 'No se pudo validar la disponibilidad de la cohorte', code: 500 as const }
            }

            const yaExiste = await this.existsInscripcionByCohorteYDni(
              data.cohorteId,
              data.dni,
              tx as unknown as PublicDbClient,
            )
            if (yaExiste) return { error: 'Ya existe una inscripcion para este DNI en la cohorte', code: 409 as const }

            const cohorteMeta = await publicRepository.findCohorteMetaForInscripcion(data.cohorteId, tx)
            const codigoPostitulo = (cohorteMeta?.postitulo?.codigo || '').trim().toUpperCase()
            const evaluacion =
              codigoPostitulo === 'EI'
                ? evaluarPrioridadEI(data.datosFormulario)
                : codigoPostitulo === 'EA'
                  ? evaluarPrioridadEA(data.datosFormulario)
                  : { estado: 'PENDIENTE' as const, prioridad: 0, observaciones: null }

            const inscripto = await publicRepository.createInscripto(
              {
                cohorteId: data.cohorteId,
                nombre: data.nombre,
                apellido: data.apellido,
                dni: data.dni,
                email: data.email || null,
                celular: data.celular || null,
                datosFormulario: data.datosFormulario ?? null,
                dniAdjuntoUrl: data.dniAdjuntoUrl || null,
                tituloAdjuntoUrl: data.tituloAdjuntoUrl || null,
                estado: resolveEstadoInscripcion(evaluacion),
                prioridad: evaluacion.prioridad,
                observaciones: evaluacion.observaciones,
              },
              tx,
            )

            return { data: inscripto }
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        )
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < MAX_SERIALIZATION_RETRIES) {
          continue
        }
        throw error
      }
    }

    throw new Error('No se pudo completar la inscripcion por conflictos de concurrencia')
  },
}
