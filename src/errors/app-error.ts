export class AppError extends Error {
  statusCode: number
  details?: unknown

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Solicitud invalida', details?: unknown) {
    super(message, 400, details)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', details?: unknown) {
    super(message, 401, details)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso no permitido', details?: unknown) {
    super(message, 403, details)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', details?: unknown) {
    super(message, 404, details)
    this.name = 'NotFoundError'
  }
}
