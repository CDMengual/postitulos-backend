import { NextFunction, Request, Response } from 'express'
import { ForbiddenError, UnauthorizedError } from '../errors/app-error'

type Role = 'ADMIN' | 'REFERENTE' | 'FORMADOR' | 'COORDINADOR'

export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user

    if (!user?.id || !user.rol) {
      return next(new UnauthorizedError('No autorizado'))
    }

    if (!allowedRoles.includes(user.rol as Role)) {
      return next(new ForbiddenError('Acceso no permitido'))
    }

    return next()
  }
}
