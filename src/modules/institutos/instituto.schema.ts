import { BadRequestError } from '../../errors/app-error'
import {
  parseOptionalPositiveInt,
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
  parseRequiredTrimmedString,
} from '../../shared/validation/common'
import { InstitutoPayload } from './instituto.types'

const normalizePayload = (body: Record<string, unknown>) => {
  const payload: InstitutoPayload = { ...body }

  if (Object.prototype.hasOwnProperty.call(body, 'nombre')) {
    payload.nombre = parseRequiredTrimmedString(body.nombre, 'nombre')
  }

  if (Object.prototype.hasOwnProperty.call(body, 'distritoId')) {
    payload.distritoId = parseRequiredPositiveInt(body.distritoId, 'distritoId')
  }

  return payload
}

export const institutoSchema = {
  parseId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'id')
  },

  parseCreate(body: Record<string, unknown>) {
    const payload = normalizePayload(body)
    payload.nombre = parseRequiredTrimmedString(payload.nombre, 'nombre')
    payload.distritoId = parseRequiredPositiveInt(payload.distritoId, 'distritoId')
    return payload
  },

  parseUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError('No se proporcionaron campos para actualizar')
    }

    return {
      id: parseRequiredPositiveInt(params.id, 'id'),
      payload: normalizePayload(body),
    }
  },
}
