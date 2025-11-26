import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { userService } from '../services/user.service'
import { sendSuccess, sendError } from '../utils/response'

export const userController = {
  async getAll(req: Request, res: Response) {
    try {
      const { rol } = req.query

      const users = await userService.getAll(
        typeof rol === 'string' ? rol.toUpperCase() : undefined,
      )

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
      const id = Number(req.params.id)
      const user = await userService.getById(id)
      if (!user) return sendError(res, 'Usuario no encontrado', 404)
      return sendSuccess(res, 'Usuario obtenido correctamente', user)
    } catch (error) {
      return sendError(res, 'Error al obtener usuario')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { password, ...userData } = req.body

      if (!password) {
        return res.status(400).json({ error: 'Password is required' })
      }

      // 🔒 Hasheamos la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await userService.create({
        ...userData,
        password: hashedPassword,
      })

      // No devolver el hash en la respuesta
      const { password: _, ...userWithoutPassword } = newUser

      return sendSuccess(res, 'Usuario creado correctamente', userWithoutPassword, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear usuario', 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' })

      const data = req.body
      if (!data || Object.keys(data).length === 0)
        return res.status(400).json({ error: 'No fields provided to update' })

      const updatedUser = await userService.update(id, data)
      return sendSuccess(res, 'Usuario actualizado correctamente', updatedUser)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar usuario', 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      await userService.remove(id)
      return sendSuccess(res, 'Usuario eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error)
      return sendError(res, error.message || 'Error al eliminar usuario', 400)
    }
  },
}
