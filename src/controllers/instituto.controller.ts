import { Request, Response } from 'express'
import { institutoService } from '../services/instituto.service'
import { sendSuccess, sendError } from '../utils/response'

export const institutoController = {
  async getAll(req: Request, res: Response) {
    try {
      const institutos = await institutoService.getAll()
      return sendSuccess(res, 'Institutos obtenidos correctamente', institutos, {
        total: institutos.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener institutos')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const instituto = await institutoService.getById(id)
      if (!instituto) return sendError(res, 'Instituto no encontrado', 404)
      return sendSuccess(res, 'Instituto obtenido correctamente', instituto)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener instituto')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = req.body
      if (!data.nombre || !data.distritoId) {
        return sendError(res, 'Faltan campos requeridos', 400)
      }

      const newInstituto = await institutoService.create(data)
      return sendSuccess(res, 'Instituto creado correctamente', newInstituto, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear instituto', 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) return sendError(res, 'ID inválido', 400)

      const data = req.body
      const updated = await institutoService.update(id, data)
      return sendSuccess(res, 'Instituto actualizado correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar instituto', 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      await institutoService.remove(id)
      return sendSuccess(res, 'Instituto eliminado correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al eliminar instituto', 400)
    }
  },
}
