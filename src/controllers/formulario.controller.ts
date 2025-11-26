import { Request, Response } from 'express'
import { formularioService } from '../services/formulario.service'
import { sendSuccess, sendError } from '../utils/response'

export const formularioController = {
  // 🔹 GET /api/formularios
  async getAll(req: Request, res: Response) {
    try {
      const postituloId = req.query.postituloId ? Number(req.query.postituloId) : undefined
      const formularios = await formularioService.getAll(postituloId)
      return sendSuccess(res, 'Formularios obtenidos correctamente', formularios, {
        total: formularios.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener formularios')
    }
  },

  // 🔹 GET /api/formularios/:id
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const formulario = await formularioService.getById(id)

      if (!formulario) return sendError(res, 'Formulario no encontrado', 404)

      return sendSuccess(res, 'Formulario obtenido correctamente', formulario)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener formulario')
    }
  },
}
