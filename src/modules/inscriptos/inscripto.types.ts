export type EstadoInscripto = 'PENDIENTE' | 'RECHAZADA' | 'ASIGNADA' | 'LISTA_ESPERA'
export type DocumentacionInscripto = 'VERIFICADA' | 'PENDIENTE' | 'NO_CORRESPONDE'
export type AsignacionInstituto = { inscriptoId: number; institutoId: number | null }
export type UpdateInscriptoData = {
  observaciones?: string | null
  prioridad?: number | null
  condicionada?: boolean
}

export type UserContext = {
  id: number
  rol: string
}

export interface ListInscriptosParams {
  cohorteId?: number
  institutoId?: number
  estado?: EstadoInscripto
  documentacion?: DocumentacionInscripto
  search?: string
  page: number
  limit: number
}
