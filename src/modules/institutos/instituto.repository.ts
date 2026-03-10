import prisma from '../../infrastructure/database/prisma'

export const institutoRepository = {
  findMany() {
    return prisma.instituto.findMany({
      include: {
        distrito: {
          include: { region: true },
        },
      },
      orderBy: { distrito: { regionId: 'asc' } },
    })
  },

  findById(id: number) {
    return prisma.instituto.findUnique({
      where: { id },
      include: {
        distrito: {
          include: { region: true },
        },
      },
    })
  },

  create(data: { nombre: string; distrito: { connect: { id: number } } }) {
    return prisma.instituto.create({
      data,
    })
  },

  update(id: number, data: { nombre?: string; distrito?: { connect: { id: number } } }) {
    return prisma.instituto.update({
      where: { id },
      data,
    })
  },

  delete(id: number) {
    return prisma.instituto.delete({
      where: { id },
    })
  },

  countByDistritoId(distritoId: number) {
    return prisma.distrito.count({
      where: { id: distritoId },
    })
  },
}
