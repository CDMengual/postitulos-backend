import {
  parseEnumQuery,
  parseOptionalDate,
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
} from '../../shared/validation/common'
import { BadRequestError } from '../../errors/app-error'
import { CohorteEstado } from './cohorte.types'
import { ParsedCreateCohorteInput, ParsedUpdateCohorteInput } from './cohorte.types'

const COHORTE_ESTADOS = [
  'ALL',
  'INSCRIPCION',
  'ACTIVA',
  'INACTIVA',
  'FINALIZADA',
  'CANCELADA',
] as const

export const cohorteSchema = {
  parseListQuery(query: Record<string, unknown>) {
    return {
      estado: parseEnumQuery(query.estado, 'estado', COHORTE_ESTADOS) as CohorteEstado | undefined,
    }
  },

  parseId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'ID')
  },

  parseUpdateEstado(input: { params: Record<string, unknown>; body: Record<string, unknown> }) {
    return {
      id: parseRequiredPositiveInt(input.params.id, 'ID'),
      estado: parseOptionalTrimmedString(input.body.estado) || '',
    }
  },

  parseCreate(body: Record<string, unknown>): ParsedCreateCohorteInput {
    const institutoIds = this.parseInstitutoIds(body.institutoIds)

    return {
      anio: parseRequiredPositiveInt(body.anio, 'anio'),
      fechaInicio: this.parseRequiredDate(body.fechaInicio, 'fechaInicio'),
      fechaFin: parseOptionalDate(body.fechaFin, 'fechaFin') ?? null,
      fechaInicioInscripcion:
        parseOptionalDate(body.fechaInicioInscripcion, 'fechaInicioInscripcion') ?? null,
      fechaFinInscripcion:
        parseOptionalDate(body.fechaFinInscripcion, 'fechaFinInscripcion') ?? null,
      postituloId: parseRequiredPositiveInt(body.postituloId, 'postituloId'),
      cantidadAulas:
        body.cantidadAulas === undefined || body.cantidadAulas === null || String(body.cantidadAulas).trim() === ''
          ? null
          : parseRequiredPositiveInt(body.cantidadAulas, 'cantidadAulas'),
      cupos: parseRequiredPositiveInt(body.cupos, 'cupos'),
      cuposListaEspera: parseRequiredPositiveInt(body.cuposListaEspera, 'cuposListaEspera'),
      institutoIds,
      formularioId:
        body.formularioId === undefined || body.formularioId === null || String(body.formularioId).trim() === ''
          ? null
          : parseRequiredPositiveInt(body.formularioId, 'formularioId'),
    }
  },

  parseUpdate(body: Record<string, unknown>): ParsedUpdateCohorteInput {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError('No se proporcionaron campos para actualizar')
    }

    return {
      ...(Object.prototype.hasOwnProperty.call(body, 'anio') && {
        anio: parseRequiredPositiveInt(body.anio, 'anio'),
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'fechaInicio') && {
        fechaInicio:
          body.fechaInicio === null || String(body.fechaInicio).trim() === ''
            ? null
            : this.parseRequiredDate(body.fechaInicio, 'fechaInicio'),
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'fechaFin') && {
        fechaFin: parseOptionalDate(body.fechaFin, 'fechaFin') ?? null,
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'fechaInicioInscripcion') && {
        fechaInicioInscripcion:
          parseOptionalDate(body.fechaInicioInscripcion, 'fechaInicioInscripcion') ?? null,
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'fechaFinInscripcion') && {
        fechaFinInscripcion:
          parseOptionalDate(body.fechaFinInscripcion, 'fechaFinInscripcion') ?? null,
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'postituloId') && {
        postituloId: parseRequiredPositiveInt(body.postituloId, 'postituloId'),
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'cantidadAulas') && {
        cantidadAulas:
          body.cantidadAulas === null || String(body.cantidadAulas).trim() === ''
            ? null
            : parseRequiredPositiveInt(body.cantidadAulas, 'cantidadAulas'),
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'cupos') && {
        cupos: parseRequiredPositiveInt(body.cupos, 'cupos'),
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'cuposListaEspera') && {
        cuposListaEspera: parseRequiredPositiveInt(body.cuposListaEspera, 'cuposListaEspera'),
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'institutoIds') && {
        institutoIds: this.parseInstitutoIds(body.institutoIds) ?? [],
      }),
      ...(Object.prototype.hasOwnProperty.call(body, 'formularioId') && {
        formularioId:
          body.formularioId === null || String(body.formularioId).trim() === ''
            ? null
            : parseRequiredPositiveInt(body.formularioId, 'formularioId'),
      }),
    }
  },

  parseRequiredDate(value: unknown, field: string) {
    const parsed = parseOptionalDate(value, field)
    if (!parsed) {
      throw new BadRequestError(`El campo ${field} es obligatorio`)
    }

    return parsed
  },

  parseInstitutoIds(value: unknown) {
    if (value === undefined) return undefined
    if (!Array.isArray(value)) {
      throw new BadRequestError('El campo institutoIds debe ser un array de IDs')
    }

    const ids = value.map((item) => Number(item))
    if (ids.some((item) => !Number.isInteger(item) || item <= 0)) {
      throw new BadRequestError('El campo institutoIds debe contener solo IDs validos')
    }

    return ids
  },
}
