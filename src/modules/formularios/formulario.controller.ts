import { Request, Response } from 'express'
import { formularioService } from './formulario.service'
import { sendSuccess, sendError } from '../../shared/http/response'
import { formularioSchema } from './formulario.schema'

export const formularioController = {
  async getAll(req: Request, res: Response) {
    try {
      const { postituloId } = formularioSchema.parseListQuery(req.query as Record<string, unknown>)
      const formularios = await formularioService.getAll(postituloId)
      return sendSuccess(res, 'Formularios obtenidos correctamente', formularios, {
        total: formularios.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener formularios')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = formularioSchema.parseId(req.params as Record<string, unknown>)
      const formulario = await formularioService.getById(id)

      if (!formulario) return sendError(res, 'Formulario no encontrado', 404)

      return sendSuccess(res, 'Formulario obtenido correctamente', formulario)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener formulario')
    }
  },
}
