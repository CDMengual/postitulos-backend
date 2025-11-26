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

  // ---------- 🔹 OPERACIONES DE INSCRIPCIÓN 🔹 ----------

  async create(req: Request, res: Response) {
    try {
      const { nombre, apellido, dni, email, celular, titulo, aulaId } = req.body
      if (!dni || !aulaId) {
        return sendError(res, 'Debe enviar al menos DNI y aulaId', 400)
      }

      // 🔹 Ver si el cursante ya existe
      let cursante = await cursanteService.getByDni(dni)

      if (!cursante) {
        // Si no existe, crear uno nuevo (requiere nombre y apellido)
        if (!nombre || !apellido) {
          return sendError(res, 'Faltan nombre y apellido para crear cursante nuevo', 400)
        }

        cursante = await cursanteService.create({
          nombre,
          apellido,
          dni,
          email,
          celular,
          titulo,
        })
      }

      // 🔹 Inscribir al cursante (usa inscripcionService)
      const inscripto = await inscripcionService.inscribirCursante({
        aulaId: Number(aulaId),
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
      if (!file) return sendError(res, 'No se adjuntó archivo', 400)
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
      return sendSuccess(res, 'Documentación actualizada correctamente', updated)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al actualizar documentación', 500)
    }
  },
}
