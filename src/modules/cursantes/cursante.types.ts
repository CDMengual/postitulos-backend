import { Prisma } from '@prisma/client'

export type CreateCursanteInput = {
  nombre?: unknown
  apellido?: unknown
  dni?: unknown
  email?: unknown
  celular?: unknown
  titulo?: unknown
}

export type ListCursantesInput = {
  search?: string
  page?: number
  limit?: number
}

export type CursanteDetalleEnAula = Prisma.CursanteAulaGetPayload<{
  include: {
    aula: {
      select: {
        id: true
        nombre: true
        codigo: true
        numero: true
      }
    }
    cursante: {
      include: {
        distrito: {
          select: {
            nombre: true
            regionId: true
          }
        }
      }
    }
  }
}>
