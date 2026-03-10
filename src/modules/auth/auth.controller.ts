import { Request, Response } from 'express'
import * as authService from './auth.service'
import { sendSuccess, sendError } from '../../shared/http/response'
import { authSchema } from './auth.schema'
import {
  AUTH_COOKIE_NAME,
  getAuthCookieClearOptions,
  getAuthCookieOptions,
} from '../../shared/http/auth-cookie'

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const input = authSchema.parseLogin((req.body || {}) as Record<string, unknown>)
      const { user, token } = await authService.login(input.email, input.password)

      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

      return sendSuccess(res, 'Login exitoso', { user })
    } catch (err: any) {
      return sendError(res, err.message || 'Error al iniciar sesion', err.statusCode || 500)
    }
  },

  async logout(_: Request, res: Response) {
    try {
      res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieClearOptions())
      return sendSuccess(res, 'Sesion cerrada correctamente')
    } catch (_err) {
      return sendError(res, 'Error al cerrar sesion')
    }
  },

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return sendError(res, 'No autorizado', 401)

      const user = await authService.getCurrentUser(userId)
      return sendSuccess(res, 'Usuario autenticado correctamente', user)
    } catch (err: any) {
      console.error('Error en /auth/me:', err)
      return sendError(
        res,
        err.message || 'Error al obtener usuario autenticado',
        err.statusCode || 500,
      )
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return sendError(res, 'No autorizado', 401)

      const { currentPassword, newPassword } = authSchema.parseChangePassword(
        (req.body || {}) as Record<string, unknown>,
      )
      await authService.changePassword(userId, currentPassword, newPassword)

      return sendSuccess(res, 'Contrasena actualizada correctamente')
    } catch (err: any) {
      return sendError(res, err.message || 'Error al actualizar contrasena', err.statusCode || 500)
    }
  },
}
