import { Prisma } from '@prisma/client'

export type SnapshotPayload = {
  fechaCorte?: Date
  observaciones?: string
}

export type AuthUser = {
  id: number
  rol: string
}

export type CreateAulaForUserPayload = {
  cohorteId: number
  referenteId?: number | null
  currentUser?: AuthUser
}

export type CreateManyAulasPayload = {
  cohorteId: number
  total: number
  distribucion: Array<{
    referenteId: number
    cantidad: number
  }>
  currentUser?: AuthUser
}

export type AulaEstadoFiltro =
  | 'ALL'
  | 'INSCRIPCION'
  | 'ACTIVA'
  | 'INACTIVA'
  | 'FINALIZADA'
  | 'CANCELADA'

export type AulaWithDetail = Prisma.AulaGetPayload<{
  include: {
    cohorte: {
      include: {
        postitulo: {
          select: { id: true; nombre: true; codigo: true }
        }
      }
    }
    instituto: { select: { id: true; nombre: true } }
    admins: { select: { id: true; nombre: true; apellido: true } }
    referentes: { select: { id: true; nombre: true; apellido: true } }
    formadores: { select: { id: true; nombre: true; apellido: true } }
    cursantes: {
      include: {
        cursante: {
          select: {
            id: true
            nombre: true
            apellido: true
            dni: true
            email: true
            celular: true
            titulo: true
            regionId: true
            distritoId: true
          }
        }
      }
    }
  }
}>
