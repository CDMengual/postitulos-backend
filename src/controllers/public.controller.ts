import { Request, Response } from 'express'
import { publicService } from '../services/public.service'
import { storageService } from '../services/storage.service'
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

  async signUpload(req: Request, res: Response) {
    try {
      const cohorteId = Number(req.params.id)
      const { dni, tipo, fileName, contentType, fileSize } = req.body || {}
      const tipoDocumento = String(tipo || '')

      if (isNaN(cohorteId)) {
        return sendError(res, 'Debe enviar un cohorteId valido', 400)
      }

      if (!dni || !tipo || !fileName || !contentType || fileSize === undefined) {
        return sendError(
          res,
          'Campos obligatorios: dni, tipo, fileName, contentType, fileSize',
          400,
        )
      }

      if (!storageService.isSupportedTipo(tipoDocumento)) {
        return sendError(res, 'tipo invalido. Valores permitidos: dni, titulo', 400)
      }

      const cohorteResult = await publicService.validateCohorteDisponibleParaInscripcion(cohorteId)
      if ('error' in cohorteResult && cohorteResult.error) {
        return sendError(res, cohorteResult.error, cohorteResult.code ?? 400)
      }

      const uploadResult = await storageService.createSignedUploadForPublicForm({
        cohorteId,
        dni: String(dni),
        tipo: tipoDocumento,
        fileName: String(fileName),
        contentType: String(contentType),
        fileSize: Number(fileSize),
      })

      if ('error' in uploadResult && uploadResult.error) {
        return sendError(res, uploadResult.error, uploadResult.code ?? 400)
      }

      return sendSuccess(res, 'URL firmada de subida generada', uploadResult.data)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al generar URL firmada de subida', 500)
    }
  },

  async createInscripcion(req: Request, res: Response) {
    try {
      const cohorteIdRaw = req.params.id ?? req.body?.cohorteId
      const cohorteId = Number(cohorteIdRaw)
      const {
        nombre,
        apellido,
        dni,
        email,
        celular,
        datosFormulario,
        dniAdjuntoPath,
        dniAdjuntoUrl,
        tituloAdjuntoPath,
        tituloAdjuntoUrl,
      } = req.body || {}

      const isEmpty = (v: any) =>
        v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

      if (!cohorteIdRaw || isNaN(cohorteId)) {
        return sendError(res, 'Debe enviar un cohorteId valido', 400)
      }
      if (isEmpty(nombre) || isEmpty(apellido) || isEmpty(dni)) {
        return sendError(res, 'Debe enviar nombre, apellido y dni', 400)
      }

      const dniNormalizado = String(dni).replace(/\D/g, '').trim()
      if (!dniNormalizado || dniNormalizado.length < 6 || dniNormalizado.length > 12) {
        return sendError(res, 'Debe enviar un dni valido', 400)
      }

      const dniPathValue = dniAdjuntoPath ?? dniAdjuntoUrl
      const tituloPathValue = tituloAdjuntoPath ?? tituloAdjuntoUrl

      if (dniPathValue) {
        const dniPathResult = await storageService.validateUploadedPublicPath({
          path: String(dniPathValue),
          cohorteId,
          dni: dniNormalizado,
          tipo: 'dni',
        })
        if ('error' in dniPathResult && dniPathResult.error) {
          return sendError(res, dniPathResult.error, dniPathResult.code ?? 400)
        }
      }

      if (tituloPathValue) {
        const tituloPathResult = await storageService.validateUploadedPublicPath({
          path: String(tituloPathValue),
          cohorteId,
          dni: dniNormalizado,
          tipo: 'titulo',
        })
        if ('error' in tituloPathResult && tituloPathResult.error) {
          return sendError(res, tituloPathResult.error, tituloPathResult.code ?? 400)
        }
      }

      const result = await publicService.createInscripcionPublic({
        cohorteId,
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        dni: dniNormalizado,
        email: email ? String(email).trim() : null,
        celular: celular ? String(celular).trim() : null,
        datosFormulario: datosFormulario ?? null,
        dniAdjuntoUrl: dniPathValue ? String(dniPathValue).trim() : null,
        tituloAdjuntoUrl: tituloPathValue ? String(tituloPathValue).trim() : null,
      })

      if ('error' in result && result.error) {
        if (result.code === 409) {
          return sendError(res, result.error, 409, {
            appCode: 'INSCRIPCION_DUPLICADA_COHORTE_DNI',
            field: 'dni',
            cohorteId,
          })
        }
        return sendError(res, result.error, result.code ?? 400)
      }

      return sendSuccess(res, 'Inscripcion recibida correctamente', result.data, null, 201)
    } catch (err) {
      console.error(err)
      return sendError(res, 'Error al registrar inscripcion publica', 500)
    }
  },
}
