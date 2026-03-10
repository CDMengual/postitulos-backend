import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../shared/http/response'
import { inscripcionService } from '../inscripciones'
import { storageService } from '../../shared/storage/storage.service'
import { cursanteService } from './cursante.service'
import { cursanteSchema } from './cursante.schema'

export const cursanteController = {
  async getAll(req: Request, res: Response) {
    try {
      const query = cursanteSchema.parseListQuery(req.query as Record<string, unknown>)
      const result = await cursanteService.list(query)
      return sendSuccess(res, 'Cursantes obtenidos correctamente', result)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al obtener cursantes', error.statusCode || 500)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = cursanteSchema.parseId(req.params as Record<string, unknown>)
      const cursante = await cursanteService.getById(id)
      if (!cursante) return sendError(res, 'Cursante no encontrado', 404)
      return sendSuccess(res, 'Cursante obtenido correctamente', cursante)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al obtener cursante', error.statusCode || 500)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = cursanteSchema.parseId(req.params as Record<string, unknown>)
      const updated = await cursanteService.update(id, req.body)
      return sendSuccess(res, 'Cursante actualizado correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar cursante', error.statusCode || 500)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = cursanteSchema.parseId(req.params as Record<string, unknown>)
      await cursanteService.remove(id)
      return sendSuccess(res, 'Cursante eliminado correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al eliminar cursante', error.statusCode || 500)
    }
  },

  async createStandalone(req: Request, res: Response) {
    try {
      const input = cursanteSchema.parseStandaloneCreate((req.body || {}) as Record<string, unknown>)
      const cursante = await cursanteService.createStandalone(input)

      return sendSuccess(res, 'Cursante creado correctamente', cursante, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear cursante', error.statusCode || 500)
    }
  },

  async create(req: Request, res: Response) {
    try {
      const input = cursanteSchema.parseCreateForAula(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const inscripto = await cursanteService.createOrAssignToAula(input)

      return sendSuccess(res, 'Cursante agregado correctamente', inscripto, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear cursante', error.statusCode || 500)
    }
  },

  async assignToAula(req: Request, res: Response) {
    try {
      const { cursanteId, aulaId } = cursanteSchema.parseAssignToAula(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const result = await cursanteService.assignToAula(cursanteId, aulaId)

      if (!result.created) {
        return sendSuccess(res, 'El cursante ya estaba asignado a esa aula', result.cursante)
      }

      return sendSuccess(res, 'Cursante asignado al aula correctamente', result.cursante, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(
        res,
        error.message || 'Error al asignar cursante al aula',
        error.statusCode || 500,
      )
    }
  },

  async removeCursanteFromAula(req: Request, res: Response) {
    try {
      const { aulaId, cursanteId } = cursanteSchema.parseAulaCursanteParams(
        req.params as Record<string, unknown>,
      )
      await inscripcionService.removeFromAula(cursanteId, aulaId)
      return sendSuccess(res, 'Cursante desvinculado correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al desvincular cursante', error.statusCode || 500)
    }
  },

  async importFromFile(req: Request, res: Response) {
    try {
      const { aulaId } = cursanteSchema.parseImportParams(req.params as Record<string, unknown>)
      const file = req.file
      if (!file) return sendError(res, 'No se adjunto archivo', 400)

      const result = await cursanteService.importFromFile(aulaId, file.buffer)
      return sendSuccess(res, 'Archivo procesado correctamente', result)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al importar cursantes', error.statusCode || 500)
    }
  },

  async updateEstado(req: Request, res: Response) {
    try {
      const { aulaId, cursanteId, estado } = cursanteSchema.parseEstadoUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const updated = await inscripcionService.updateEstado(cursanteId, aulaId, estado)
      return sendSuccess(res, 'Estado actualizado correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar estado', error.statusCode || 500)
    }
  },

  async updateDocumentacion(req: Request, res: Response) {
    try {
      const { aulaId, cursanteId, documentacion } = cursanteSchema.parseDocumentacionUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const updated = await inscripcionService.updateDocumentacion(
        cursanteId,
        aulaId,
        documentacion,
      )
      return sendSuccess(res, 'Documentacion actualizada correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(
        res,
        error.message || 'Error al actualizar documentacion',
        error.statusCode || 500,
      )
    }
  },

  async getDetalleEnAula(req: Request, res: Response) {
    try {
      const { aulaId, cursanteId } = cursanteSchema.parseAulaCursanteParams(
        req.params as Record<string, unknown>,
      )
      const detalle = await cursanteService.getDetalleEnAula(cursanteId, aulaId)
      if (!detalle) {
        return sendError(res, 'Cursante no encontrado en esa aula', 404)
      }

      return sendSuccess(res, 'Detalle de cursante en aula obtenido correctamente', detalle)
    } catch (error: any) {
      console.error(error)
      return sendError(
        res,
        error.message || 'Error al obtener detalle de cursante en aula',
        error.statusCode || 500,
      )
    }
  },

  async updateObservacionesEnAula(req: Request, res: Response) {
    try {
      const { aulaId, cursanteId, observaciones: observacionesRaw } =
        cursanteSchema.parseObservacionesUpdate(
          req.params as Record<string, unknown>,
          (req.body || {}) as Record<string, unknown>,
        )
      const observaciones = cursanteService.normalizeObservaciones(observacionesRaw)
      const updated = await inscripcionService.updateObservaciones(cursanteId, aulaId, observaciones)
      return sendSuccess(res, 'Observaciones actualizadas correctamente', updated)
    } catch (error: any) {
      console.error(error)
      if (error?.code === 'P2025') {
        return sendError(res, 'Cursante no encontrado en esa aula', 404)
      }
      return sendError(res, 'Error al actualizar observaciones', 500)
    }
  },

  async getDocumentoUrlEnAula(req: Request, res: Response) {
    try {
      const { aulaId, cursanteId, tipo, expiresIn } = cursanteSchema.parseDocumentoUrl(
        req.params as Record<string, unknown>,
        req.query as Record<string, unknown>,
      )
      const doc = await inscripcionService.getDocumentoPath(cursanteId, aulaId, tipo)
      if (!doc) return sendError(res, 'Cursante no encontrado en esa aula', 404)
      if (!doc.path) return sendError(res, 'El cursante no tiene documento cargado', 404)

      const signedResult = await storageService.createSignedReadUrl(doc.path, expiresIn)
      if ('error' in signedResult && signedResult.error) {
        return sendError(res, signedResult.error, signedResult.code ?? 500)
      }

      return sendSuccess(res, 'URL firmada de documento generada', signedResult.data)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al obtener URL del documento', error.statusCode || 500)
    }
  },
}
