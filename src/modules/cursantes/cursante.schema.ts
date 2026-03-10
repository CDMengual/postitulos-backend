import { EstadoCursante } from '@prisma/client'
import { BadRequestError } from '../../errors/app-error'
import {
  parseOptionalPositiveInt,
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
} from '../../shared/validation/common'

const DOCUMENT_TYPES = ['dni', 'titulo'] as const
const DOCUMENTACIONES = ['VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE'] as const

const normalizeOptionalPositiveInt = (value: unknown, field: string) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null
  }

  return parseRequiredPositiveInt(value, field)
}

export const cursanteSchema = {
  parseListQuery(query: Record<string, unknown>) {
    const page = query.page === undefined ? 1 : Number(query.page)
    const limit = query.limit === undefined ? 10 : Number(query.limit)

    if (!Number.isInteger(page) || page <= 0) {
      throw new BadRequestError('page invalido')
    }
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new BadRequestError('limit invalido')
    }

    return {
      search: parseOptionalTrimmedString(query.search),
      page,
      limit,
    }
  },

  parseId(params: Record<string, unknown>, field = 'id') {
    return parseRequiredPositiveInt(params[field], field)
  },

  parseStandaloneCreate(body: Record<string, unknown>) {
    return {
      ...body,
      aulaId: normalizeOptionalPositiveInt(body.aulaId ?? body.aula, 'aulaId'),
    }
  },

  parseCreateForAula(params: Record<string, unknown>, body: Record<string, unknown>) {
    return {
      ...body,
      aulaId: parseRequiredPositiveInt(params.aulaId ?? body.aulaId ?? body.aula, 'aulaId'),
    }
  },

  parseAssignToAula(params: Record<string, unknown>, body: Record<string, unknown>) {
    return {
      cursanteId: parseRequiredPositiveInt(params.id, 'id'),
      aulaId: parseRequiredPositiveInt(body.aulaId ?? body.aula, 'aulaId'),
    }
  },

  parseAulaCursanteParams(params: Record<string, unknown>) {
    return {
      aulaId: parseRequiredPositiveInt(params.aulaId, 'aulaId'),
      cursanteId: parseRequiredPositiveInt(params.cursanteId, 'cursanteId'),
    }
  },

  parseEstadoUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    const estado = String(body.estado || '')
      .trim()
      .toUpperCase()

    if (!Object.values(EstadoCursante).includes(estado as EstadoCursante)) {
      throw new BadRequestError(
        'Estado invalido. Valores permitidos: ACTIVO, ADEUDA, BAJA, FINALIZADO',
      )
    }

    return {
      ...this.parseAulaCursanteParams(params),
      estado: estado as EstadoCursante,
    }
  },

  parseDocumentacionUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    const documentacion = String(body.documentacion || '')
      .trim()
      .toUpperCase()

    if (!DOCUMENTACIONES.includes(documentacion as (typeof DOCUMENTACIONES)[number])) {
      throw new BadRequestError(
        'documentacion invalida. Valores permitidos: VERIFICADA, PENDIENTE, NO_CORRESPONDE',
      )
    }

    return {
      ...this.parseAulaCursanteParams(params),
      documentacion: documentacion as (typeof DOCUMENTACIONES)[number],
    }
  },

  parseObservacionesUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    if (!Object.prototype.hasOwnProperty.call(body, 'observaciones')) {
      throw new BadRequestError('Debe enviar el campo observaciones')
    }

    return {
      ...this.parseAulaCursanteParams(params),
      observaciones: body.observaciones,
    }
  },

  parseImportParams(params: Record<string, unknown>) {
    return {
      aulaId: parseRequiredPositiveInt(params.aulaId, 'aulaId'),
    }
  },

  parseDocumentoUrl(params: Record<string, unknown>, query: Record<string, unknown>) {
    const tipo = String(params.tipo || '')
      .trim()
      .toLowerCase()

    if (!DOCUMENT_TYPES.includes(tipo as (typeof DOCUMENT_TYPES)[number])) {
      throw new BadRequestError('tipo invalido. Valores permitidos: dni, titulo')
    }

    return {
      ...this.parseAulaCursanteParams(params),
      tipo: tipo as (typeof DOCUMENT_TYPES)[number],
      expiresIn: parseOptionalPositiveInt(query.expiresIn, 'expiresIn'),
    }
  },
}
