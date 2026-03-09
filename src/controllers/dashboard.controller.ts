import { Request, Response } from 'express'
import { dashboardService } from '../services/dashboard.service'
import { sendError, sendSuccess } from '../utils/response'

export const dashboardController = {
  async getResumen(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const rol = req.user?.rol

      if (!userId || !rol) {
        return sendError(res, 'No autorizado', 401)
      }

      const dashboard = await dashboardService.getResumen(userId, rol)
      return sendSuccess(res, 'Dashboard obtenido correctamente', dashboard)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener dashboard', 500)
    }
  },

  async getDesgranamiento(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const rol = req.user?.rol

      if (!userId || !rol) {
        return sendError(res, 'No autorizado', 401)
      }

      const data = await dashboardService.getDesgranamiento(userId, rol)
      return sendSuccess(res, 'Desgranamiento obtenido correctamente', data)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener desgranamiento', 500)
    }
  },
}
