import { Prisma } from '@prisma/client'

export type InstitutoPayload = Record<string, unknown> & {
  nombre?: unknown
  distritoId?: unknown
}

export type InstitutoWithRelations = Prisma.InstitutoGetPayload<{
  include: {
    distrito: {
      include: { region: true }
    }
  }
}>

export type InstitutoListItem = {
  id: number
  nombre: string
  distritoNombre: string | null
  regionId: number | null
}

export type InstitutoDetail = InstitutoListItem & {
  distritoId: number
  regionNombre: string | null
}
