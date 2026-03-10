import { Request, Response } from 'express'
import { institutoService } from './instituto.service'
import { sendError, sendSuccess } from '../../shared/http/response'
import { institutoSchema } from './instituto.schema'

export const institutoController = {
  async getAll(_req: Request, res: Response) {
    try {
      const institutos = await institutoService.getAll()
      return sendSuccess(res, 'Institutos obtenidos correctamente', institutos, {
        total: institutos.length,
      })
    } catch (error) {
      console.error('Error al obtener institutos:', error)
      return sendError(res, 'Error al obtener institutos')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = institutoSchema.parseId(req.params as Record<string, unknown>)
      const instituto = await institutoService.getById(id)

      if (!instituto) {
        return sendError(res, 'Instituto no encontrado', 404)
      }

      return sendSuccess(res, 'Instituto obtenido correctamente', instituto)
    } catch (error: any) {
      console.error('Error al obtener instituto:', error)
      return sendError(res, error.message || 'Error al obtener instituto', error.statusCode || 400)
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = institutoSchema.parseCreate((req.body || {}) as Record<string, unknown>)
      const instituto = await institutoService.create(payload)
      return sendSuccess(res, 'Instituto creado correctamente', instituto, null, 201)
    } catch (error: any) {
      console.error('Error al crear instituto:', error)
      return sendError(res, error.message || 'Error al crear instituto', error.statusCode || 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id, payload } = institutoSchema.parseUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const instituto = await institutoService.update(id, payload)
      return sendSuccess(res, 'Instituto actualizado correctamente', instituto)
    } catch (error: any) {
      console.error('Error al actualizar instituto:', error)
      return sendError(res, error.message || 'Error al actualizar instituto', error.statusCode || 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = institutoSchema.parseId(req.params as Record<string, unknown>)
      await institutoService.remove(id)
      return sendSuccess(res, 'Instituto eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar instituto:', error)
      return sendError(res, error.message || 'Error al eliminar instituto', error.statusCode || 400)
    }
  },
}
