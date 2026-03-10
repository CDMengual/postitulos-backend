import { BadRequestError, UnauthorizedError } from '../../errors/app-error'

export const parseRequiredPositiveInt = (value: unknown, field: string) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${field} invalido`)
  }
  return parsed
}

export const parseOptionalPositiveInt = (value: unknown, field: string) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`${field} invalido`)
  }
  return parsed
}

export const parseOptionalDate = (value: unknown, field: string) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined
  }

  const parsed = new Date(value as any)
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError(`${field} invalida`)
  }
  return parsed
}

export const parseOptionalTrimmedString = (value: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export const parseRequiredTrimmedString = (value: unknown, field: string) => {
  const trimmed = parseOptionalTrimmedString(value)
  if (!trimmed) {
    throw new BadRequestError(`${field} invalido`)
  }

  return trimmed
}

export const parseEnumQuery = <T extends readonly string[]>(
  value: unknown,
  field: string,
  allowed: T,
) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()

  if (!normalized) return undefined
  if (!allowed.includes(normalized as T[number])) {
    throw new BadRequestError(`${field} invalido. Valores permitidos: ${allowed.join(', ')}`)
  }

  return normalized as T[number]
}

export const requireAuthUser = (user: { id?: number; rol?: string } | undefined) => {
  if (!user?.id || !user?.rol) {
    throw new UnauthorizedError('No autorizado')
  }

  return {
    userId: user.id,
    rol: user.rol,
  }
}
