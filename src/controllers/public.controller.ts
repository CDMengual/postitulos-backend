import { Request, Response } from 'express'
import { publicService } from '../services/public.service'
import { sendSuccess, sendError } from '../utils/response'

export const publicController = {
  async cohortesEnInscripcion(req: Request, res: Response) {
    try {
      const data = await publicService.getCohortesEnInscripcion()
      return sendSuccess(res, 'Cohortes públicas obtenidas', data)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al obtener cohortes públicas')
    }
  },

  async getCohorte(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const data = await publicService.getCohortePublic(id)

      if (!data) return sendError(res, 'Cohorte no encontrada', 404)

      return sendSuccess(res, 'Cohorte pública obtenida', data)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al obtener cohorte pública')
    }
  },
}
