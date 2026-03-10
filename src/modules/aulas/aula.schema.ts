import {
  parseEnumQuery,
  parseOptionalDate,
  parseOptionalPositiveInt,
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
  requireAuthUser,
} from '../../shared/validation/common'
import { BadRequestError } from '../../errors/app-error'
import { AulaEstadoFiltro } from './aula.types'

const AULA_ESTADOS = [
  'ALL',
  'INSCRIPCION',
  'ACTIVA',
  'INACTIVA',
  'FINALIZADA',
  'CANCELADA',
] as const

export const aulaSchema = {
  parseSnapshotParams(params: Record<string, unknown>, body: Record<string, unknown>) {
    return {
      aulaId: parseRequiredPositiveInt(params.aulaId, 'aulaId'),
      fechaCorte: parseOptionalDate(body.fechaCorte, 'fechaCorte'),
      observaciones: parseOptionalTrimmedString(body.observaciones),
    }
  },

  parseSnapshotByCohorte(body: Record<string, unknown>) {
    return {
      cohorteId: parseRequiredPositiveInt(body.cohorteId, 'cohorteId'),
      fechaCorte: parseOptionalDate(body.fechaCorte, 'fechaCorte'),
      observaciones: parseOptionalTrimmedString(body.observaciones),
    }
  },

  parseListQuery(query: Record<string, unknown>, user: { id?: number; rol?: string } | undefined) {
    const auth = requireAuthUser(user)
    return {
      ...auth,
      estado: parseEnumQuery(query.estado, 'estado', AULA_ESTADOS) as AulaEstadoFiltro | undefined,
      postituloId: parseOptionalPositiveInt(query.postituloId, 'postituloId'),
    }
  },

  parseRouteId(params: Record<string, unknown>, field = 'id') {
    return parseRequiredPositiveInt(params[field], field)
  },

  parseCreate(body: Record<string, unknown>, user: { id?: number; rol?: string } | undefined) {
    const auth = requireAuthUser(user)
    return {
      cohorteId: parseRequiredPositiveInt(body.cohorteId, 'cohorteId'),
      referenteId:
        body.referenteId === undefined || body.referenteId === null || String(body.referenteId).trim() === ''
          ? null
          : parseRequiredPositiveInt(body.referenteId, 'referenteId'),
      currentUser: { id: auth.userId, rol: auth.rol },
    }
  },

  parseCreateMany(body: Record<string, unknown>, user: { id?: number; rol?: string } | undefined) {
    const auth = requireAuthUser(user)
    const cohorteId = parseRequiredPositiveInt(body.cohorteId, 'cohorteId')
    const total = parseRequiredPositiveInt(body.total, 'total')

    if (!Array.isArray(body.distribucion) || body.distribucion.length === 0) {
      throw new BadRequestError('Debe enviar distribucion valida')
    }

    const distribucion = body.distribucion.map((bloque, index) => {
      const item = (bloque || {}) as Record<string, unknown>
      try {
        return {
          referenteId: parseRequiredPositiveInt(item.referenteId, `referenteId en distribucion[${index}]`),
          cantidad: parseRequiredPositiveInt(item.cantidad, `cantidad en distribucion[${index}]`),
        }
      } catch (error: any) {
        throw error
      }
    })

    return {
      cohorteId,
      total,
      distribucion,
      currentUser: { id: auth.userId, rol: auth.rol },
    }
  },
}
