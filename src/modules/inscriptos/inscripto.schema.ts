import {
  parseOptionalPositiveInt,
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
} from '../../shared/validation/common'
import { BadRequestError } from '../../errors/app-error'

const ESTADOS = ['PENDIENTE', 'RECHAZADA', 'ASIGNADA', 'LISTA_ESPERA'] as const
const DOCUMENTACIONES = ['VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE'] as const

const ensureAllowed = <T extends readonly string[]>(value: unknown, field: string, allowed: T) => {
  const normalized = parseOptionalTrimmedString(value)
  if (!normalized) return undefined
  if (!allowed.includes(normalized as T[number])) {
    throw new BadRequestError(`${field} invalido`)
  }
  return normalized as T[number]
}

export const inscriptoSchema = {
  parseListQuery(query: Record<string, unknown>) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    if (!Number.isInteger(page) || page <= 0) {
      throw new BadRequestError('page invalido')
    }
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new BadRequestError('limit invalido')
    }

    return {
      page,
      limit,
      cohorteId: parseOptionalPositiveInt(query.cohorteId, 'cohorteId'),
      institutoId: parseOptionalPositiveInt(query.institutoId, 'institutoId'),
      estado: ensureAllowed(query.estado, 'estado', ESTADOS),
      documentacion: ensureAllowed(query.documentacion, 'documentacion', DOCUMENTACIONES),
      search: parseOptionalTrimmedString(query.search),
    }
  },

  parseId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'ID')
  },

  parseEstadoUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    const estado = ensureAllowed(body.estado, 'estado', ESTADOS)
    if (!estado) {
      throw new BadRequestError('estado invalido')
    }
    return {
      id: parseRequiredPositiveInt(params.id, 'ID'),
      estado,
    }
  },

  parseDocumentacionUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    const documentacion = ensureAllowed(body.documentacion, 'documentacion', DOCUMENTACIONES)
    if (!documentacion) {
      throw new BadRequestError('documentacion invalida')
    }
    return {
      id: parseRequiredPositiveInt(params.id, 'ID'),
      documentacion,
    }
  },

  parseDocumentoUrl(params: Record<string, unknown>, query: Record<string, unknown>) {
    const tipo = String(params.tipo || '').trim().toLowerCase()
    if (tipo !== 'dni' && tipo !== 'titulo') {
      throw new BadRequestError('tipo invalido. Valores permitidos: dni, titulo')
    }

    return {
      id: parseRequiredPositiveInt(params.id, 'ID'),
      tipo: tipo as 'dni' | 'titulo',
      expiresIn:
        query.expiresIn === undefined || query.expiresIn === null || String(query.expiresIn).trim() === ''
          ? undefined
          : Number(query.expiresIn),
    }
  },

  parseAssignInstituto(params: Record<string, unknown>, body: Record<string, unknown>) {
    const institutoIdRaw = body.institutoId
    return {
      id: parseRequiredPositiveInt(params.id, 'ID'),
      institutoId:
        institutoIdRaw === null || institutoIdRaw === undefined || String(institutoIdRaw).trim() === ''
          ? null
          : parseRequiredPositiveInt(institutoIdRaw, 'institutoId'),
    }
  },
}
