import { Rol } from '@prisma/client'
import { BadRequestError } from '../../errors/app-error'
import {
  parseOptionalPositiveInt,
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
  parseRequiredTrimmedString,
} from '../../shared/validation/common'

const normalizeRol = (value: unknown, field = 'rol') => {
  const rol = parseOptionalTrimmedString(value)?.toUpperCase()
  if (!rol) return undefined
  if (!Object.values(Rol).includes(rol as Rol)) {
    throw new BadRequestError(`${field} invalido`)
  }

  return rol as Rol
}

const normalizePassword = (value: unknown, required: boolean) => {
  const password = parseOptionalTrimmedString(value)
  if (!password) {
    if (required) {
      throw new BadRequestError('Password is required')
    }
    return undefined
  }

  return password
}

const normalizeUserPayload = (body: Record<string, unknown>, options: { requirePassword: boolean }) => {
  const payload: Record<string, unknown> = { ...body }

  if (Object.prototype.hasOwnProperty.call(body, 'nombre')) {
    payload.nombre = parseRequiredTrimmedString(body.nombre, 'nombre')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'apellido')) {
    payload.apellido = parseRequiredTrimmedString(body.apellido, 'apellido')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'dni')) {
    payload.dni = parseRequiredTrimmedString(body.dni, 'dni')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    payload.email = parseRequiredTrimmedString(body.email, 'email')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'celular')) {
    payload.celular = parseOptionalTrimmedString(body.celular) || null
  }
  if (Object.prototype.hasOwnProperty.call(body, 'institutoId')) {
    payload.institutoId =
      body.institutoId === null || body.institutoId === ''
        ? null
        : parseOptionalPositiveInt(body.institutoId, 'institutoId')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'rol')) {
    payload.rol = normalizeRol(body.rol, 'rol')
  }
  if (Object.prototype.hasOwnProperty.call(body, 'password') || options.requirePassword) {
    payload.password = normalizePassword(body.password, options.requirePassword)
  }

  return payload
}

export const userSchema = {
  parseListQuery(query: Record<string, unknown>) {
    return {
      rol: normalizeRol(query.rol, 'rol'),
    }
  },

  parseId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'id')
  },

  parseCreate(body: Record<string, unknown>) {
    return normalizeUserPayload(body, { requirePassword: true })
  },

  parseUpdate(params: Record<string, unknown>, body: Record<string, unknown>) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError('No fields provided to update')
    }

    return {
      id: parseRequiredPositiveInt(params.id, 'id'),
      payload: normalizeUserPayload(body, { requirePassword: false }),
    }
  },
}
