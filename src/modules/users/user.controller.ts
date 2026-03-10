import { Request, Response } from 'express'
import { userService } from './user.service'
import { sendSuccess, sendError } from '../../shared/http/response'
import { userSchema } from './user.schema'

export const userController = {
  async getAll(req: Request, res: Response) {
    try {
      const query = userSchema.parseListQuery(req.query as Record<string, unknown>)
      const users = await userService.getAll(query.rol)

      return sendSuccess(res, 'Usuarios obtenidos correctamente', users, {
        total: users.length,
      })
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return sendError(res, 'Error al obtener usuarios')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = userSchema.parseId(req.params as Record<string, unknown>)
      const user = await userService.getById(id)
      if (!user) return sendError(res, 'Usuario no encontrado', 404)
      return sendSuccess(res, 'Usuario obtenido correctamente', user)
    } catch (_error) {
      return sendError(res, 'Error al obtener usuario')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = userSchema.parseCreate((req.body || {}) as Record<string, unknown>)
      const newUser = await userService.create(payload)
      return sendSuccess(res, 'Usuario creado correctamente', newUser, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear usuario', error.statusCode || 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id, payload } = userSchema.parseUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const updatedUser = await userService.update(id, payload)
      return sendSuccess(res, 'Usuario actualizado correctamente', updatedUser)
    } catch (error: any) {
      console.error(error)
      return sendError(
        res,
        error.message || 'Error al actualizar usuario',
        error.statusCode || 400,
      )
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = userSchema.parseId(req.params as Record<string, unknown>)
      await userService.remove(id)
      return sendSuccess(res, 'Usuario eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error)
      return sendError(res, error.message || 'Error al eliminar usuario', 400)
    }
  },
}
