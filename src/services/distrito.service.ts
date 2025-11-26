import prisma from '../prisma/client'

export const distritoService = {
  async getAll() {
    return await prisma.distrito.findMany({
      select: {
        id: true,
        nombre: true,
        regionId: true,
      },
      orderBy: [{ regionId: 'asc' }, { nombre: 'asc' }],
    })
  },
}
