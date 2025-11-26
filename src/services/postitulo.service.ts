import prisma from '../prisma/client'

export const postituloService = {
  async getAll() {
    return await prisma.postitulo.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        codigo: true,
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
      },
    })
  },

  async getById(id: number) {
    return await prisma.postitulo.findUnique({
      where: { id },
      include: { tipos: true },
    })
  },

  async create(data: any) {
    const { tipos, ...rest } = data

    return await prisma.postitulo.create({
      data: {
        ...rest,
        cargaHoraria: data.cargaHoraria ? Number(data.cargaHoraria) : null,
        horasSincronicas: data.horasSincronicas ? Number(data.horasSincronicas) : null,
        horasVirtuales: data.horasVirtuales ? Number(data.horasVirtuales) : null,
        tipos: tipos
          ? {
              create: tipos.map((t: any) => ({
                tipo: t.tipo,
                titulo: t.titulo,
              })),
            }
          : undefined,
      },
      include: { tipos: true },
    })
  },

  async update(id: number, data: any) {
    const { tipos, ...rest } = data

    const updatedPostitulo = await prisma.postitulo.update({
      where: { id },
      data: {
        ...rest,
        cargaHoraria: rest.cargaHoraria ? Number(rest.cargaHoraria) : null,
        horasSincronicas: rest.horasSincronicas ? Number(rest.horasSincronicas) : null,
        horasVirtuales: rest.horasVirtuales ? Number(rest.horasVirtuales) : null,
      },
    })

    if (Array.isArray(tipos)) {
      await prisma.postituloTipo.deleteMany({ where: { postituloId: id } })

      if (tipos.length > 0) {
        await prisma.postituloTipo.createMany({
          data: tipos.map((t) => ({
            tipo: t.tipo,
            titulo: t.titulo,
            postituloId: id,
          })),
        })
      }
    }

    return prisma.postitulo.findUnique({
      where: { id },
      include: { tipos: true },
    })
  },

  async remove(id: number) {
    await prisma.postituloTipo.deleteMany({ where: { postituloId: id } })
    return await prisma.postitulo.delete({ where: { id } })
  },
}
