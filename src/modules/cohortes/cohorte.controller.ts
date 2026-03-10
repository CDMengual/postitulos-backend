import { Request, Response } from 'express'
import { cohorteService } from './cohorte.service'
import { cohorteSchema } from './cohorte.schema'
import { sendSuccess, sendError } from '../../shared/http/response'

export const cohorteController = {
  async getAll(req: Request, res: Response) {
    try {
      const { estado } = cohorteSchema.parseListQuery(req.query as Record<string, unknown>)
      const cohortes = await cohorteService.getAll(estado as any)
      return sendSuccess(res, 'Cohortes obtenidas correctamente', cohortes, {
        total: cohortes.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener cohortes')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = cohorteSchema.parseId(req.params as Record<string, unknown>)
      const cohorte = await cohorteService.getById(id)
      if (!cohorte) return sendError(res, 'Cohorte no encontrada', 404)
      return sendSuccess(res, 'Cohorte obtenida correctamente', cohorte)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener cohorte')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const input = cohorteSchema.parseCreate((req.body || {}) as Record<string, unknown>)
      const cohorte = await cohorteService.createFromInput(input)
      return sendSuccess(res, 'Cohorte creada correctamente', cohorte, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear cohorte', error.statusCode || 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = cohorteSchema.parseId(req.params as Record<string, unknown>)
      const input = cohorteSchema.parseUpdate((req.body || {}) as Record<string, unknown>)
      const cohorte = await cohorteService.updateFromInput(id, input)
      return sendSuccess(res, 'Cohorte actualizada correctamente', cohorte)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar cohorte', error.statusCode || 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = cohorteSchema.parseId(req.params as Record<string, unknown>)
      await cohorteService.remove(id)
      return sendSuccess(res, 'Cohorte eliminada correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al eliminar cohorte', 400)
    }
  },

  async updateEstado(req: Request, res: Response) {
    try {
      const { id, estado } = cohorteSchema.parseUpdateEstado({
        params: req.params as Record<string, unknown>,
        body: (req.body || {}) as Record<string, unknown>,
      })
      const cohorte = await cohorteService.updateEstado(id, estado)
      return sendSuccess(res, 'Estado de cohorte actualizado', cohorte)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al cambiar el estado', error.statusCode || 400)
    }
  },
}
