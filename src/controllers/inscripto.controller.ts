import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../utils/response'
import { inscriptoService } from '../services/inscripto.service'
import { storageService } from '../services/storage.service'
import prisma from '../prisma/client'

const ESTADOS = ['PENDIENTE', 'RECHAZADA', 'ASIGNADA', 'LISTA_ESPERA'] as const
const DOCUMENTACIONES = ['VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE'] as const

export const inscriptoController = {
  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const cohorteIdRaw = req.query.cohorteId
      const institutoIdRaw = req.query.institutoId
      const estadoRaw = req.query.estado
      const documentacionRaw = req.query.documentacion
      const search = req.query.search ? String(req.query.search) : undefined

      const cohorteIdText =
        cohorteIdRaw !== undefined && cohorteIdRaw !== null ? String(cohorteIdRaw).trim() : ''
      const cohorteId = cohorteIdText !== '' ? Number(cohorteIdText) : undefined

      if (cohorteIdText !== '' && (cohorteId === undefined || Number.isNaN(cohorteId))) {
        return sendError(res, 'cohorteId invalido', 400)
      }

      const institutoIdText =
        institutoIdRaw !== undefined && institutoIdRaw !== null
          ? String(institutoIdRaw).trim()
          : ''
      const institutoIdQuery = institutoIdText !== '' ? Number(institutoIdText) : undefined

      if (
        institutoIdText !== '' &&
        (institutoIdQuery === undefined || Number.isNaN(institutoIdQuery))
      ) {
        return sendError(res, 'institutoId invalido', 400)
      }

      const estado = estadoRaw ? String(estadoRaw) : undefined
      if (estado && !ESTADOS.includes(estado as (typeof ESTADOS)[number])) {
        return sendError(res, 'estado invalido', 400)
      }

      const documentacion = documentacionRaw ? String(documentacionRaw) : undefined
      if (
        documentacion &&
        !DOCUMENTACIONES.includes(documentacion as (typeof DOCUMENTACIONES)[number])
      ) {
        return sendError(res, 'documentacion invalida', 400)
      }

      let institutoId = institutoIdQuery
      if (req.user?.rol === 'REFERENTE') {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { institutoId: true },
        })

        if (!user?.institutoId) {
          return sendError(res, 'El referente no tiene instituto asignado', 403)
        }

        institutoId = user.institutoId
      }

      const result = await inscriptoService.list({
        cohorteId,
        institutoId,
        estado: estado as (typeof ESTADOS)[number] | undefined,
        documentacion: documentacion as (typeof DOCUMENTACIONES)[number] | undefined,
        search,
        page,
        limit,
      })

      return sendSuccess(res, 'Inscriptos obtenidos correctamente', result)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener inscriptos', 500)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return sendError(res, 'ID invalido', 400)

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
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return sendError(res, 'ID invalido', 400)

      const hasObservaciones = Object.prototype.hasOwnProperty.call(req.body, 'observaciones')
      const hasPrioridad = Object.prototype.hasOwnProperty.call(req.body, 'prioridad')
      const hasCondicionada = Object.prototype.hasOwnProperty.call(req.body, 'condicionada')

      if (!hasObservaciones && !hasPrioridad && !hasCondicionada) {
        return sendError(res, 'Debe enviar al menos un campo editable', 400)
      }

      const data: { observaciones?: string | null; prioridad?: number | null; condicionada?: boolean } =
        {}

      if (hasObservaciones) {
        const value = req.body.observaciones
        if (value === null || value === undefined || String(value).trim() === '') {
          data.observaciones = null
        } else {
          data.observaciones = String(value).trim()
        }
      }

      if (hasPrioridad) {
        const value = req.body.prioridad
        if (value === null || value === undefined || String(value).trim() === '') {
          data.prioridad = null
        } else {
          const parsed = Number(value)
          if (!Number.isInteger(parsed) || parsed < 0) {
            return sendError(res, 'prioridad invalida', 400)
          }
          data.prioridad = parsed
        }
      }

      if (hasCondicionada) {
        if (typeof req.body.condicionada !== 'boolean') {
          return sendError(res, 'condicionada debe ser boolean', 400)
        }
        data.condicionada = req.body.condicionada
      }

      const updated = await inscriptoService.update(id, data)
      return sendSuccess(res, 'Inscripcion actualizada correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar inscripcion', 500)
    }
  },

  async updateEstado(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return sendError(res, 'ID invalido', 400)

      const { estado } = req.body
      if (!estado || !ESTADOS.includes(estado)) {
        return sendError(res, 'estado invalido', 400)
      }

      const updated = await inscriptoService.updateEstado(id, estado)
      return sendSuccess(res, 'Estado de inscripcion actualizado correctamente', updated)
    } catch (error: any) {
      console.error(error)
      if (error?.message === 'Inscripto no encontrado') {
        return sendError(res, error.message, 404)
      }
      if (
        error?.message === 'El inscripto debe tener instituto asignado para pasar a ASIGNADA' ||
        error?.message === 'No hay aulas disponibles para la cohorte e instituto del inscripto'
      ) {
        return sendError(res, error.message, 400)
      }
      return sendError(res, 'Error al actualizar estado de inscripcion', 500)
    }
  },

  async updateDocumentacion(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return sendError(res, 'ID invalido', 400)

      const { documentacion } = req.body
      if (!documentacion || !DOCUMENTACIONES.includes(documentacion)) {
        return sendError(res, 'documentacion invalida', 400)
      }

      const updated = await inscriptoService.updateDocumentacion(id, documentacion)
      return sendSuccess(res, 'Documentacion de inscripcion actualizada correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar documentacion de inscripcion', 500)
    }
  },

  async getDocumentoUrl(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return sendError(res, 'ID invalido', 400)

      const tipo = String(req.params.tipo || '').trim().toLowerCase()
      if (tipo !== 'dni' && tipo !== 'titulo') {
        return sendError(res, 'tipo invalido. Valores permitidos: dni, titulo', 400)
      }

      const expiresIn = req.query.expiresIn ? Number(req.query.expiresIn) : undefined

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
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return sendError(res, 'ID invalido', 400)

      const institutoIdRaw = req.body?.institutoId
      const institutoId =
        institutoIdRaw === null || institutoIdRaw === undefined || String(institutoIdRaw).trim() === ''
          ? null
          : Number(institutoIdRaw)

      if (institutoId !== null && Number.isNaN(institutoId)) {
        return sendError(res, 'institutoId invalido', 400)
      }

      if (institutoId !== null) {
        const instituto = await prisma.instituto.findUnique({
          where: { id: institutoId },
          select: { id: true },
        })
        if (!instituto) return sendError(res, 'Instituto no encontrado', 404)
      }

      const updated = await inscriptoService.assignInstituto(id, institutoId)
      return sendSuccess(res, 'Instituto asignado correctamente al inscripto', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al asignar instituto al inscripto', 500)
    }
  },

  async assignInstitutosBulk(req: Request, res: Response) {
    try {
      const asignacionesRaw = req.body?.asignaciones
      if (!Array.isArray(asignacionesRaw) || asignacionesRaw.length === 0) {
        return sendError(
          res,
          'Debe enviar un array no vacio en "asignaciones" con { inscriptoId, institutoId }',
          400,
        )
      }

      const asignaciones = asignacionesRaw.map((item: any, index: number) => {
        const inscriptoId = Number(item?.inscriptoId)
        const institutoIdRaw = item?.institutoId
        const institutoId =
          institutoIdRaw === null || institutoIdRaw === undefined || String(institutoIdRaw).trim() === ''
            ? null
            : Number(institutoIdRaw)

        if (!Number.isInteger(inscriptoId) || inscriptoId <= 0) {
          throw new Error(`inscriptoId invalido en posicion ${index}`)
        }
        if (institutoId !== null && (!Number.isInteger(institutoId) || institutoId <= 0)) {
          throw new Error(`institutoId invalido en posicion ${index}`)
        }

        return { inscriptoId, institutoId }
      })

      const uniqueInscriptos = new Set(asignaciones.map((a) => a.inscriptoId))
      if (uniqueInscriptos.size !== asignaciones.length) {
        return sendError(res, 'No se permiten inscriptos repetidos en asignaciones', 400)
      }

      const updated = await inscriptoService.assignInstitutosBulk(asignaciones)
      return sendSuccess(res, 'Institutos asignados masivamente', {
        total: updated.length,
        items: updated,
      })
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al asignar institutos masivamente', 500)
    }
  },
}
