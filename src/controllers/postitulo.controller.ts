import { Request, Response } from 'express'
import { postituloService } from '../services/postitulo.service'
import { sendSuccess, sendError } from '../utils/response'

export const postituloController = {
  async getAll(req: Request, res: Response) {
    try {
      const postitulos = await postituloService.getAll()
      return sendSuccess(res, 'Postítulos obtenidos correctamente', postitulos, {
        total: postitulos.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener los postítulos')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) return sendError(res, 'ID inválido', 400)

      const postitulo = await postituloService.getById(id)
      if (!postitulo) return sendError(res, 'Postítulo no encontrado', 404)

      return sendSuccess(res, 'Postítulo obtenido correctamente', postitulo)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener postítulo')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = req.body

      if (!data.nombre) {
        return sendError(res, 'El campo "nombre" es obligatorio', 400)
      }

      const newPostitulo = await postituloService.create(data)
      return sendSuccess(res, 'Postítulo creado correctamente', newPostitulo, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear postítulo', 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) return sendError(res, 'ID inválido', 400)

      const data = req.body
      if (!data || Object.keys(data).length === 0)
        return sendError(res, 'No se proporcionaron campos para actualizar', 400)

      const updated = await postituloService.update(id, data)
      return sendSuccess(res, 'Postítulo actualizado correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar postítulo', 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (isNaN(id)) return sendError(res, 'ID inválido', 400)

      await postituloService.remove(id)
      return sendSuccess(res, 'Postítulo eliminado correctamente')
    } catch (error: any) {
      console.error('Error al eliminar postítulo:', error)
      return sendError(res, error.message || 'Error al eliminar postítulo', 400)
    }
  },
}
