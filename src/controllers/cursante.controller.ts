import { Request, Response } from 'express'
import * as XLSX from 'xlsx'
import { sendError, sendSuccess } from '../utils/response'
import { cursanteService } from '../services/cursante.service'
import { inscripcionService } from '../services/inscripcion.service'

export const cursanteController = {
  async getAll(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const result = await cursanteService.list({ search, page, limit })
      return sendSuccess(res, 'Cursantes obtenidos correctamente', result)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener cursantes', 500)
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const cursante = await cursanteService.getById(id)
      if (!cursante) return sendError(res, 'Cursante no encontrado', 404)
      return sendSuccess(res, 'Cursante obtenido correctamente', cursante)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener cursante', 500)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const updated = await cursanteService.update(id, req.body)
      return sendSuccess(res, 'Cursante actualizado correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar cursante', 500)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      await cursanteService.remove(id)
      return sendSuccess(res, 'Cursante eliminado correctamente')
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al eliminar cursante', 500)
    }
  },

  async createStandalone(req: Request, res: Response) {
    try {
      const { nombre, apellido, dni, email, celular, titulo } = req.body
      const aulaRaw = req.body?.aulaId ?? req.body?.aula

      if (!nombre || !apellido || !dni) {
        return sendError(res, 'Debe enviar nombre, apellido y dni', 400)
      }

      const existing = await cursanteService.getByDni(String(dni))
      if (existing) return sendError(res, 'Ya existe un cursante con ese DNI', 400)

      const cursante = await cursanteService.create({
        nombre,
        apellido,
        dni: String(dni),
        email: email || null,
        celular: celular || null,
        titulo: titulo || null,
      })

      if (aulaRaw !== undefined && aulaRaw !== null && String(aulaRaw).trim() !== '') {
        const aulaId = Number(aulaRaw)
        if (isNaN(aulaId)) return sendError(res, 'aulaId invalido', 400)
        await inscripcionService.assignExistingCursanteToAula(cursante.id, aulaId)
      }

      const withInscripciones = await cursanteService.getById(cursante.id)
      return sendSuccess(res, 'Cursante creado correctamente', withInscripciones, null, 201)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al crear cursante', 500)
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nombre, apellido, dni, email, celular, titulo } = req.body
      const aulaRaw = req.params.aulaId ?? req.body?.aulaId ?? req.body?.aula
      const aulaId = Number(aulaRaw)

      if (isNaN(aulaId)) {
        return sendError(res, 'Debe enviar un aulaId valido', 400)
      }

      if (!dni) {
        return sendError(res, 'Debe enviar al menos DNI y aulaId', 400)
      }

      let cursante = await cursanteService.getByDni(String(dni))

      if (!cursante) {
        if (!nombre || !apellido) {
          return sendError(res, 'Faltan nombre y apellido para crear cursante nuevo', 400)
        }

        cursante = await cursanteService.create({
          nombre,
          apellido,
          dni: String(dni),
          email: email || null,
          celular: celular || null,
          titulo: titulo || null,
        })
      }

      const inscripto = await inscripcionService.inscribirCursante({
        aulaId,
        dni: cursante.dni,
        nombre: cursante.nombre,
        apellido: cursante.apellido,
        email: cursante.email || undefined,
        celular: cursante.celular || undefined,
        titulo: cursante.titulo || undefined,
      })

      return sendSuccess(res, 'Cursante agregado correctamente', inscripto, null, 201)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al crear cursante', 500)
    }
  },

  async assignToAula(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const aulaRaw = req.body?.aulaId ?? req.body?.aula
      const aulaId = Number(aulaRaw)

      if (isNaN(id)) return sendError(res, 'ID de cursante invalido', 400)
      if (isNaN(aulaId)) return sendError(res, 'Debe enviar un aulaId valido', 400)

      const cursante = await cursanteService.getById(id)
      if (!cursante) return sendError(res, 'Cursante no encontrado', 404)

      const result = await inscripcionService.assignExistingCursanteToAula(id, aulaId)
      const updated = await cursanteService.getById(id)

      if (!result.created) {
        return sendSuccess(res, 'El cursante ya estaba asignado a esa aula', updated)
      }

      return sendSuccess(res, 'Cursante asignado al aula correctamente', updated, null, 201)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al asignar cursante al aula', 500)
    }
  },

  async removeCursanteFromAula(req: Request, res: Response) {
    try {
      const aulaId = Number(req.params.aulaId)
      const cursanteId = Number(req.params.cursanteId)
      await inscripcionService.removeFromAula(cursanteId, aulaId)
      return sendSuccess(res, 'Cursante desvinculado correctamente')
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al desvincular cursante', 500)
    }
  },

  async importFromFile(req: Request, res: Response) {
    try {
      const aulaId = Number(req.params.aulaId)
      const file = req.file
      if (!file) return sendError(res, 'No se adjunto archivo', 400)
      const workbook = XLSX.read(file.buffer, { type: 'buffer' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const result = await inscripcionService.importMany(aulaId, rows)
      return sendSuccess(res, 'Archivo procesado correctamente', result)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al importar cursantes', 500)
    }
  },

  async updateEstado(req: Request, res: Response) {
    try {
      const { estado } = req.body
      const aulaId = Number(req.params.aulaId)
      const cursanteId = Number(req.params.cursanteId)
      const updated = await inscripcionService.updateEstado(cursanteId, aulaId, estado)
      return sendSuccess(res, 'Estado actualizado correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar estado', 500)
    }
  },

  async updateDocumentacion(req: Request, res: Response) {
    try {
      const { documentacion } = req.body
      const aulaId = Number(req.params.aulaId)
      const cursanteId = Number(req.params.cursanteId)
      const updated = await inscripcionService.updateDocumentacion(
        cursanteId,
        aulaId,
        documentacion,
      )
      return sendSuccess(res, 'Documentacion actualizada correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar documentacion', 500)
    }
  },
}
