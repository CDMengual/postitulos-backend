import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { publicService } from './public.service'
import { storageService } from '../../shared/storage/storage.service'
import { sendSuccess, sendError } from '../../shared/http/response'
import { publicSchema } from './public.schema'

export const publicController = {
  async cohortesEnInscripcion(_req: Request, res: Response) {
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
      const id = publicSchema.parseCohorteId(req.params as Record<string, unknown>)
      const data = await publicService.getCohortePublic(id)
      if (!data) return sendError(res, 'Cohorte no encontrada', 404)
      return sendSuccess(res, 'Cohorte publica obtenida', data)
    } catch (err: any) {
      console.error(err)
      return sendError(res, err.message || 'Error al obtener cohorte publica', err.statusCode || 500)
    }
  },

  async signUpload(req: Request, res: Response) {
    try {
      const input = publicSchema.parseSignUpload(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )

      const cohorteResult = await publicService.validateCohorteDisponibleParaInscripcion(input.cohorteId)
      if ('error' in cohorteResult && cohorteResult.error) {
        return sendError(res, cohorteResult.error, cohorteResult.code ?? 400)
      }

      const uploadResult = await storageService.createSignedUploadForPublicForm(input)
      if ('error' in uploadResult && uploadResult.error) {
        return sendError(res, uploadResult.error, uploadResult.code ?? 400)
      }

      return sendSuccess(res, 'URL firmada de subida generada', uploadResult.data)
    } catch (err: any) {
      console.error(err)
      return sendError(
        res,
        err.message || 'Error al generar URL firmada de subida',
        err.statusCode || 500,
      )
    }
  },

  async createInscripcion(req: Request, res: Response) {
    try {
      const input = publicSchema.parseCreateInscripcion(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )

      if (input.dniAdjuntoUrl) {
        const dniPathResult = await storageService.validateUploadedPublicPath({
          path: input.dniAdjuntoUrl,
          cohorteId: input.cohorteId,
          dni: input.dni,
          tipo: 'dni',
        })
        if ('error' in dniPathResult && dniPathResult.error) {
          return sendError(res, dniPathResult.error, dniPathResult.code ?? 400)
        }
      }

      if (input.tituloAdjuntoUrl) {
        const tituloPathResult = await storageService.validateUploadedPublicPath({
          path: input.tituloAdjuntoUrl,
          cohorteId: input.cohorteId,
          dni: input.dni,
          tipo: 'titulo',
        })
        if ('error' in tituloPathResult && tituloPathResult.error) {
          return sendError(res, tituloPathResult.error, tituloPathResult.code ?? 400)
        }
      }

      const result = await publicService.createInscripcionPublic(input)

      if ('error' in result && result.error) {
        if (result.code === 409) {
          return sendError(res, result.error, 409, {
            appCode: 'INSCRIPCION_DUPLICADA_COHORTE_DNI',
            field: 'dni',
            cohorteId: input.cohorteId,
          })
        }
        return sendError(res, result.error, result.code ?? 400)
      }

      return sendSuccess(res, 'Inscripcion recibida correctamente', result.data, null, 201)
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        Array.isArray(err.meta?.target) &&
        err.meta.target.includes('cohorteId') &&
        err.meta.target.includes('dni')
      ) {
        const cohorteId = Number(req.params.id ?? req.body?.cohorteId)
        return sendError(res, 'Ya existe una inscripcion para este DNI en la cohorte', 409, {
          appCode: 'INSCRIPCION_DUPLICADA_COHORTE_DNI',
          field: 'dni',
          cohorteId: Number.isFinite(cohorteId) ? cohorteId : null,
        })
      }

      console.error(err)
      return sendError(res, err.message || 'Error al registrar inscripcion publica', err.statusCode || 500)
    }
  },
}
