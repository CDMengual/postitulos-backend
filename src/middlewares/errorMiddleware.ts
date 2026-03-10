import { ErrorRequestHandler, RequestHandler } from 'express'
import { AppError, NotFoundError } from '../errors/app-error'
import { sendError } from '../shared/http/response'

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`))
}

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details)
  }

  console.error(err)
  return sendError(res, 'Error interno del servidor', 500)
}
