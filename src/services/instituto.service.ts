import prisma from '../prisma/client'
import { Prisma } from '@prisma/client'

// Tipo auto-derivado del schema Prisma
type InstitutoWithRelations = Prisma.InstitutoGetPayload<{
  include: {
    distrito: {
      include: { region: true }
    }
  }
}>

export const institutoService = {
  async getAll() {
    const institutos = await prisma.instituto.findMany({
      include: {
        distrito: {
          include: { region: true },
        },
      },
      orderBy: { distrito: { regionId: 'asc' } },
    })

    const result = institutos.map((i: InstitutoWithRelations) => ({
      id: i.id,
      nombre: i.nombre,
      distritoNombre: i.distrito?.nombre || null,
      regionId: i.distrito?.region?.id || null,
    }))

    return result
  },

  async getById(id: number) {
    const instituto = await prisma.instituto.findUnique({
      where: { id },
      include: {
        distrito: {
          include: { region: true },
        },
      },
    })

    if (!instituto) return null

    // 🔹 Formateo coherente con getAll
    return {
      id: instituto.id,
      nombre: instituto.nombre,
      distritoId: instituto.distritoId,
      distritoNombre: instituto.distrito?.nombre || null,
      regionId: instituto.distrito?.region?.id || null,
      regionNombre: instituto.distrito?.region ? `Región ${instituto.distrito.region.id}` : null,
    }
  },

  async create(data: any) {
    return await prisma.instituto.create({ data })
  },

  async update(id: number, data: any) {
    return await prisma.instituto.update({
      where: { id },
      data,
    })
  },

  async remove(id: number) {
    return await prisma.instituto.delete({
      where: { id },
    })
  },
}
