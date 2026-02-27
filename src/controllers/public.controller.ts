import { Request, Response } from 'express'
import { publicService } from '../services/public.service'
import { sendSuccess, sendError } from '../utils/response'

export const publicController = {
  async cohortesEnInscripcion(req: Request, res: Response) {
    try {
      const data = await publicService.getCohortesEnInscripcion()
      return sendSuccess(res, 'Cohortes publicas obtenidas', data)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al obtener cohortes publicas')
    }
  },

  async getCohorte(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const data = await publicService.getCohortePublic(id)

      if (!data) return sendError(res, 'Cohorte no encontrada', 404)

      return sendSuccess(res, 'Cohorte publica obtenida', data)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al obtener cohorte publica')
    }
  },

  async createInscripcion(req: Request, res: Response) {
    try {
      const cohorteIdRaw = req.params.id ?? req.body?.cohorteId
      const cohorteId = Number(cohorteIdRaw)
      const { nombre, apellido, dni, email, celular, datosFormulario, dniAdjuntoUrl, tituloAdjuntoUrl } =
        req.body || {}

      const isEmpty = (v: any) =>
        v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

      if (!cohorteIdRaw || isNaN(cohorteId)) {
        return sendError(res, 'Debe enviar un cohorteId valido', 400)
      }
      if (isEmpty(nombre) || isEmpty(apellido) || isEmpty(dni)) {
        return sendError(res, 'Debe enviar nombre, apellido y dni', 400)
      }

      const result = await publicService.createInscripcionPublic({
        cohorteId,
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        dni: String(dni).trim(),
        email: email ? String(email).trim() : null,
        celular: celular ? String(celular).trim() : null,
        datosFormulario: datosFormulario ?? null,
        dniAdjuntoUrl: dniAdjuntoUrl ? String(dniAdjuntoUrl).trim() : null,
        tituloAdjuntoUrl: tituloAdjuntoUrl ? String(tituloAdjuntoUrl).trim() : null,
      })

      if ('error' in result && result.error) {
        return sendError(res, result.error, result.code ?? 400)
      }

      return sendSuccess(res, 'Inscripcion recibida correctamente', result.data, null, 201)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al registrar inscripcion publica', 500)
    }
  },
}
