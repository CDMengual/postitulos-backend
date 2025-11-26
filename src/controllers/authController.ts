import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/response'
import prisma from '../prisma/client'

// --- LOGIN ---
export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body.email, req.body.password)

    // ✅ Seteamos cookie HttpOnly
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    })

    return sendSuccess(res, 'Login exitoso', { user })
  } catch (err: any) {
    return sendError(res, err.message || 'Error al iniciar sesión', err.status || 500)
  }
}

// --- LOGOUT ---
export const logout = async (_: Request, res: Response) => {
  try {
    res.clearCookie('auth_token')
    return sendSuccess(res, 'Sesión cerrada correctamente')
  } catch (err: any) {
    return sendError(res, 'Error al cerrar sesión')
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) return sendError(res, 'No autorizado', 401)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        instituto: {
          include: {
            distrito: { include: { region: true } },
          },
        },
      },
    })

    if (!user) return sendError(res, 'Usuario no encontrado', 404)

    const { password: _, ...safeUser } = user
    return sendSuccess(res, 'Usuario autenticado correctamente', safeUser)
  } catch (err: any) {
    console.error('Error en /auth/me:', err)
    return sendError(res, 'Error al obtener usuario autenticado', 500)
  }
}
