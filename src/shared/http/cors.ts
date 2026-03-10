import { CorsOptions } from 'cors'

const DEFAULT_CLIENT_URL = 'http://localhost:3000'

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '')

const getAllowedOrigins = () => {
  const rawOrigins = process.env.CLIENT_URL || DEFAULT_CLIENT_URL

  return rawOrigins
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)
}

export const buildCorsOptions = (): CorsOptions => {
  const allowedOrigins = new Set(getAllowedOrigins())

  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true)
      }

      const normalizedOrigin = normalizeOrigin(origin)
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true)
      }

      return callback(new Error('Origen no permitido por CORS'))
    },
    credentials: true,
  }
}
