import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../shared/http/response'
import { storageService } from '../../shared/storage/storage.service'
import { inscriptoService } from './inscripto.service'
import { inscriptoSchema } from './inscripto.schema'

export const inscriptoController = {
  async getAll(req: Request, res: Response) {
    try {
      const { page, limit, cohorteId, institutoId: institutoIdQuery, estado, documentacion, search } =
        inscriptoSchema.parseListQuery(req.query as Record<string, unknown>)
      const institutoId = await inscriptoService.resolveInstitutoFilterForUser(req.user, institutoIdQuery)
      const result = await inscriptoService.list({
        cohorteId,
        institutoId,
        estado,
        documentacion,
        search,
        page,
        limit,
      })

      return sendSuccess(res, 'Inscriptos obtenidos correctamente', result)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al obtener inscriptos', error.statusCode || 500)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = inscriptoSchema.parseId(req.params as Record<string, unknown>)
      const inscripto = await inscriptoService.getById(id)
      if (!inscripto) return sendError(res, 'Inscripto no encontrado', 404)
      return sendSuccess(res, 'Inscripto obtenido correctamente', inscripto)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener inscripto', 500)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = inscriptoSchema.parseId(req.params as Record<string, unknown>)
      const data = inscriptoService.normalizeUpdatePayload(req.body || {})
      const updated = await inscriptoService.update(id, data)
      return sendSuccess(res, 'Inscripcion actualizada correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar inscripcion', error.statusCode || 500)
    }
  },

  async updateEstado(req: Request, res: Response) {
    try {
      const { id, estado } = inscriptoSchema.parseEstadoUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const updated = await inscriptoService.updateEstado(id, estado)
      return sendSuccess(res, 'Estado de inscripcion actualizado correctamente', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar estado de inscripcion', error.statusCode || 500)
    }
  },

  async updateDocumentacion(req: Request, res: Response) {
    try {
      const { id, documentacion } = inscriptoSchema.parseDocumentacionUpdate(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const updated = await inscriptoService.updateDocumentacion(id, documentacion)
      return sendSuccess(res, 'Documentacion de inscripcion actualizada correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar documentacion de inscripcion', 500)
    }
  },

  async getDocumentoUrl(req: Request, res: Response) {
    try {
      const { id, tipo, expiresIn } = inscriptoSchema.parseDocumentoUrl(
        req.params as Record<string, unknown>,
        req.query as Record<string, unknown>,
      )
      const doc = await inscriptoService.getDocumentoPath(id, tipo)
      if (!doc) return sendError(res, 'Inscripto no encontrado', 404)
      if (!doc.path) return sendError(res, 'El inscripto no tiene documento cargado', 404)

      const signedResult = await storageService.createSignedReadUrl(doc.path, expiresIn)
      if ('error' in signedResult && signedResult.error) {
        return sendError(res, signedResult.error, signedResult.code ?? 500)
      }

      return sendSuccess(res, 'URL firmada de documento generada', signedResult.data)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener URL del documento', 500)
    }
  },

  async assignInstituto(req: Request, res: Response) {
    try {
      const { id, institutoId } = inscriptoSchema.parseAssignInstituto(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )
      const updated = await inscriptoService.assignInstituto(id, institutoId)
      return sendSuccess(res, 'Instituto asignado correctamente al inscripto', updated)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al asignar instituto al inscripto', error.statusCode || 500)
    }
  },

  async assignInstitutosBulk(req: Request, res: Response) {
    try {
      const asignaciones = inscriptoService.normalizeBulkAsignaciones(req.body?.asignaciones)
      const updated = await inscriptoService.assignInstitutosBulk(asignaciones)
      return sendSuccess(res, 'Institutos asignados masivamente', { total: updated.length, items: updated })
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al asignar institutos masivamente', error.statusCode || 500)
    }
  },
}
