import { TipoPostitulo } from '@prisma/client'
import { BadRequestError } from '../../errors/app-error'
import {
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
  parseRequiredTrimmedString,
} from '../../shared/validation/common'
import { PostituloPayload, PostituloTipoInput } from './postitulo.types'

const parseOptionalNumber = (value: unknown, field: string) => {
  if (value === undefined) return undefined
  if (value === null || value === '') return null

  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    throw new BadRequestError(`El campo ${field} debe ser numerico`)
  }

  return parsed
}

const normalizeTipos = (tipos: unknown): PostituloTipoInput[] | undefined => {
  if (tipos === undefined) return undefined
  if (!Array.isArray(tipos)) {
    throw new BadRequestError('El campo tipos debe ser un array')
  }

  return tipos.map((tipo, index) => {
    if (!tipo || typeof tipo !== 'object' || Array.isArray(tipo)) {
      throw new BadRequestError(`El item ${index} de tipos es invalido`)
    }

    const input = tipo as Record<string, unknown>
    const titulo = parseRequiredTrimmedString(input.titulo, `tipos[${index}].titulo`)
    const tipoValue = parseRequiredTrimmedString(input.tipo, `tipos[${index}].tipo`).toUpperCase()

    if (!Object.values(TipoPostitulo).includes(tipoValue as TipoPostitulo)) {
      throw new BadRequestError(`El item ${index} de tipos tiene un tipo invalido`)
    }

    return {
      tipo: tipoValue as TipoPostitulo,
      titulo,
    }
  })
}

const normalizePayload = (body: Record<string, unknown>) => {
  const payload: PostituloPayload = { ...body }

  if (Object.prototype.hasOwnProperty.call(body, 'nombre')) {
    payload.nombre = parseRequiredTrimmedString(body.nombre, 'nombre')
  }

  if (Object.prototype.hasOwnProperty.call(body, 'codigo')) {
    payload.codigo = parseOptionalTrimmedString(body.codigo) || null
  }

  if (Object.prototype.hasOwnProperty.call(body, 'cargaHoraria')) {
    payload.cargaHoraria = parseOptionalNumber(body.cargaHoraria, 'cargaHoraria')
  }

  if (Object.prototype.hasOwnProperty.call(body, 'horasSincronicas')) {
    payload.horasSincronicas = parseOptionalNumber(body.horasSincronicas, 'horasSincronicas')
  }

  if (Object.prototype.hasOwnProperty.call(body, 'horasVirtuales')) {
    payload.horasVirtuales = parseOptionalNumber(body.horasVirtuales, 'horasVirtuales')
  }

  if (Object.prototype.hasOwnProperty.call(body, 'tipos')) {
    payload.tipos = normalizeTipos(body.tipos)
  }

  return payload
}

export const postituloSchema = {
  parseId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'id')
  },

  parseCreate(body: Record<string, unknown>) {
    const payload = normalizePayload(body)
    payload.nombre = parseRequiredTrimmedString(payload.nombre, 'nombre')
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
