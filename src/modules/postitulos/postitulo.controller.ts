import { Request, Response } from 'express'
import { postituloService } from './postitulo.service'
import { sendError, sendSuccess } from '../../shared/http/response'
import { postituloSchema } from './postitulo.schema'

export const postituloController = {
  async getAll(_req: Request, res: Response) {
    try {
      const postitulos = await postituloService.getAll()
      return sendSuccess(res, 'Postitulos obtenidos correctamente', postitulos, {
        total: postitulos.length,
      })
    } catch (error) {
      console.error('Error al obtener postitulos:', error)
      return sendError(res, 'Error al obtener postitulos')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = postituloSchema.parseId(req.params as Record<string, unknown>)
      const postitulo = await postituloService.getById(id)

      if (!postitulo) {
        return sendError(res, 'Postitulo no encontrado', 404)
      }

      return sendSuccess(res, 'Postitulo obtenido correctamente', postitulo)
    } catch (error: any) {
      console.error('Error al obtener postitulo:', error)
      return sendError(res, error.message || 'Error al obtener postitulo', error.statusCode || 400)
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = postituloSchema.parseCreate((req.body || {}) as Record<string, unknown>)
      const postitulo = await postituloService.create(payload)
      return sendSuccess(res, 'Postitulo creado correctamente', postitulo, null, 201)
    } catch (error: any) {
      console.error('Error al crear postitulo:', error)
      return sendError(res, error.message || 'Error al crear postitulo', error.statusCode || 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id, payload } = postituloSchema.parseUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const postitulo = await postituloService.update(id, payload)
      return sendSuccess(res, 'Postitulo actualizado correctamente', postitulo)
    } catch (error: any) {
      console.error('Error al actualizar postitulo:', error)
      return sendError(
        res,
        error.message || 'Error al actualizar postitulo',
        error.statusCode || 400,
      )
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = postituloSchema.parseId(req.params as Record<string, unknown>)
      await postituloService.remove(id)
      return sendSuccess(res, 'Postitulo eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar postitulo:', error)
      return sendError(res, error.message || 'Error al eliminar postitulo', error.statusCode || 400)
    }
  },
}
