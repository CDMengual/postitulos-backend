import { Request, Response } from 'express'
import { distritoService } from './distrito.service'
import { sendError, sendSuccess } from '../../shared/http/response'

export const distritoController = {
  async getAll(_req: Request, res: Response) {
    try {
      const distritos = await distritoService.getAll()
      return sendSuccess(res, 'Distritos obtenidos correctamente', distritos, {
        total: distritos.length,
      })
    } catch (error) {
      console.error('Error al obtener distritos:', error)
      return sendError(res, 'Error al obtener distritos')
    }
  },
}
