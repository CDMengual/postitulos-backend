export type CohorteEstado =
  | 'ALL'
  | 'INSCRIPCION'
  | 'ACTIVA'
  | 'INACTIVA'
  | 'FINALIZADA'
  | 'CANCELADA'

export type CreateCohorteInput = {
  anio: unknown
  fechaInicio?: unknown
  fechaFin?: unknown
  fechaInicioInscripcion?: unknown
  fechaFinInscripcion?: unknown
  postituloId: unknown
  cantidadAulas?: unknown
  cupos: unknown
  cuposListaEspera: unknown
  institutoIds?: unknown
  formularioId?: unknown
}

export type UpdateCohorteInput = Record<string, unknown>

export type ParsedCreateCohorteInput = {
  anio: number
  fechaInicio: Date
  fechaFin: Date | null
  fechaInicioInscripcion: Date | null
  fechaFinInscripcion: Date | null
  postituloId: number
  cantidadAulas: number | null
  cupos: number
  cuposListaEspera: number
  institutoIds?: number[]
  formularioId?: number | null
}

export type ParsedUpdateCohorteInput = {
  anio?: number
  fechaInicio?: Date | null
  fechaFin?: Date | null
  fechaInicioInscripcion?: Date | null
  fechaFinInscripcion?: Date | null
  postituloId?: number
  cantidadAulas?: number | null
  cupos?: number
  cuposListaEspera?: number
  institutoIds?: number[]
  formularioId?: number | null
}
