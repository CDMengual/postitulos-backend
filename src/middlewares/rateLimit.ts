import rateLimit from 'express-rate-limit'

const buildLimiter = ({
  windowMs,
  max,
  message,
}: {
  windowMs: number
  max: number
  message: string
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
      meta: {
        code: 429,
      },
    },
  })

export const authLoginRateLimit = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de inicio de sesion. Intente nuevamente mas tarde.',
})

export const publicUploadRateLimit = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: 'Demasiadas solicitudes de firma de carga. Intente nuevamente mas tarde.',
})

export const publicInscripcionRateLimit = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: 'Demasiadas solicitudes de inscripcion. Intente nuevamente mas tarde.',
})
