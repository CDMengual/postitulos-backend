import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export const postituloSelect = {
  id: true,
  nombre: true,
  codigo: true,
  requisitos: true,
  resolucion: true,
  coordinadores: true,
  autores: true,
  descripcion: true,
  destinatarios: true,
  dictamen: true,
  planEstudios: true,
  resolucionPuntaje: true,
  cargaHoraria: true,
  horasSincronicas: true,
  horasVirtuales: true,
  modalidad: true,
  tipos: {
    select: {
      id: true,
      tipo: true,
      titulo: true,
    },
  },
} satisfies Prisma.PostituloSelect

export const postituloRepository = {
  findMany() {
    return prisma.postitulo.findMany({
      orderBy: { nombre: 'asc' },
      select: postituloSelect,
    })
  },

  findById(id: number) {
    return prisma.postitulo.findUnique({
      where: { id },
      select: postituloSelect,
    })
  },

  create(data: Prisma.PostituloCreateInput) {
    return prisma.postitulo.create({
      data,
      select: postituloSelect,
    })
  },

  update(id: number, data: Prisma.PostituloUpdateInput) {
    return prisma.postitulo.update({
      where: { id },
      data,
      select: postituloSelect,
    })
  },

  delete(id: number) {
    return prisma.postitulo.delete({
      where: { id },
    })
  },

  deleteTiposByPostituloId(postituloId: number) {
    return prisma.postituloTipo.deleteMany({
      where: { postituloId },
    })
  },

  createManyTipos(data: Prisma.PostituloTipoCreateManyInput[]) {
    return prisma.postituloTipo.createMany({ data })
  },
}
