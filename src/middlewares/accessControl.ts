import { Request, Response, NextFunction } from 'express'
import prisma from '../infrastructure/database/prisma'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/app-error'

export function canAccess(resource: 'aula') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user
      if (!user) return next(new UnauthorizedError('No autenticado'))

      switch (resource) {
        case 'aula': {
          const aulaIdRaw = req.params.aulaId ?? req.params.id
          const aulaId = Number(aulaIdRaw)

          if (!aulaIdRaw || Number.isNaN(aulaId)) {
            return next(new BadRequestError('aulaId invalido'))
          }

          const aula = await prisma.aula.findUnique({
            where: { id: aulaId },
            include: {
              admins: { select: { id: true } },
              coordinadores: { select: { id: true } },
              referentes: { select: { id: true } },
              formadores: { select: { id: true } },
            },
          })

          if (!aula) return next(new NotFoundError('Aula no encontrada'))

          const pertenece =
            aula.admins.some((u: { id: number }) => u.id === user.id) ||
            aula.coordinadores.some((u: { id: number }) => u.id === user.id) ||
            aula.referentes.some((u: { id: number }) => u.id === user.id) ||
            aula.formadores.some((u: { id: number }) => u.id === user.id)

          if (!pertenece && user.rol !== 'ADMIN') {
            return next(new ForbiddenError('Acceso no permitido'))
          }

          return next()
        }

        default:
          return next(new BadRequestError('Tipo de recurso no soportado'))
      }
    } catch (err) {
      console.error('Error en canAccess:', err)
      return next(err)
    }
  }
}
