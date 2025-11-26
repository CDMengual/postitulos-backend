import prisma from '../prisma/client'
import { Prisma } from '@prisma/client'

export const cursanteService = {
  // 🔹 Crear cursante (sin aula)
  async create(data: Prisma.CursanteCreateInput) {
    return prisma.cursante.create({ data })
  },

  async getById(id: number) {
    return prisma.cursante.findUnique({
      where: { id },
      include: {
        inscripciones: {
          select: {
            id: true,
            estado: true,
            documentacion: true,
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

  async update(id: number, data: Prisma.CursanteUpdateInput) {
    return prisma.cursante.update({ where: { id }, data })
  },

  async remove(id: number) {
    await prisma.cursanteAula.deleteMany({ where: { cursanteId: id } })
    return prisma.cursante.delete({ where: { id } })
  },

  async list({ search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number }) {
    const skip = (page - 1) * limit
    const where: Prisma.CursanteWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search } },
            { apellido: { contains: search } },
            { dni: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}

    const [cursantes, total] = await Promise.all([
      prisma.cursante.findMany({ where, skip, take: limit, orderBy: { apellido: 'asc' } }),
      prisma.cursante.count({ where }),
    ])

    return { cursantes, total, page, limit, totalPages: Math.ceil(total / limit) }
  },
  async getByDni(dni: string) {
    return prisma.cursante.findUnique({ where: { dni } })
  },
}
