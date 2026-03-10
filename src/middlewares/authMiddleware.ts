import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../errors/app-error'

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token
  if (!token) return next(new UnauthorizedError('No autorizado'))

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as Express.Request['user']
    req.user = decoded
    return next()
  } catch (_err) {
    return next(new UnauthorizedError('Token invalido o expirado'))
  }
}
