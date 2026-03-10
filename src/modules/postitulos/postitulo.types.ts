import { Prisma, TipoPostitulo } from '@prisma/client'

export type PostituloTipoInput = {
  tipo: TipoPostitulo
  titulo: string
}

export type PostituloPayload = Record<string, unknown> & {
  nombre?: unknown
  codigo?: unknown
  requisitos?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null
  resolucion?: unknown
  coordinadores?: unknown
  autores?: unknown
  descripcion?: unknown
  destinatarios?: unknown
  dictamen?: unknown
  planEstudios?: unknown
  resolucionPuntaje?: unknown
  cargaHoraria?: unknown
  horasSincronicas?: unknown
  horasVirtuales?: unknown
  modalidad?: unknown
  tipos?: PostituloTipoInput[]
}
