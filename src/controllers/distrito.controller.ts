import { Request, Response } from 'express'
import { distritoService } from '../services/distrito.service'
import { sendSuccess, sendError } from '../utils/response'

export const distritoController = {
  async getAll(req: Request, res: Response) {
    try {
      const distritos = await distritoService.getAll()
      return sendSuccess(res, 'Distritos obtenidos correctamente', distritos, {
        total: distritos.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener distritos')
    }
  },
}
