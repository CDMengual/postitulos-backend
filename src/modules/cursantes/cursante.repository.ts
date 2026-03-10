import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export const cursanteRepository = {
  create(data: Prisma.CursanteCreateInput) {
    return prisma.cursante.create({ data })
  },

  findById(id: number) {
    return prisma.cursante.findUnique({
      where: { id },
      include: {
        distrito: {
          select: {
            id: true,
            nombre: true,
            regionId: true,
          },
        },
        inscripciones: {
          select: {
            id: true,
            estado: true,
            documentacion: true,
            dniAdjuntoUrl: true,
            tituloAdjuntoUrl: true,
            observaciones: true,
            aula: {
              select: {
                codigo: true,
                numero: true,
                nombre: true,
                instituto: { select: { nombre: true } },
                cohorte: {
                  select: {
                    estado: true,
                    fechaInicio: true,
                    fechaFin: true,
                    postitulo: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
  },

  update(id: number, data: Prisma.CursanteUpdateInput) {
    return prisma.cursante.update({ where: { id }, data })
  },

  delete(id: number) {
    return prisma.cursante.delete({ where: { id } })
  },

  deleteAulasByCursanteId(cursanteId: number) {
    return prisma.cursanteAula.deleteMany({ where: { cursanteId } })
  },

  findManyPaginated(args: {
    where: Prisma.CursanteWhereInput
    skip: number
    take: number
  }) {
    return prisma.cursante.findMany({
      where: args.where,
      skip: args.skip,
      take: args.take,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    })
  },

  count(where: Prisma.CursanteWhereInput) {
    return prisma.cursante.count({ where })
  },

  findByDni(dni: string) {
    return prisma.cursante.findUnique({ where: { dni } })
  },
}
