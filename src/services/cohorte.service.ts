import prisma from '../prisma/client'

export const cohorteService = {
  // 🔹 Obtener todas las cohortes
  async getAll() {
    return prisma.cohorte.findMany({
      include: {
        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        formulario: {
          select: { id: true, nombre: true },
        },
        aulas: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        _count: {
          select: {
            inscriptos: true,
            aulas: true,
          },
        },
      },
      orderBy: { anio: 'desc' },
    })
  },

  // 🔹 Obtener cohorte por ID
  async getById(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      include: {
        postitulo: { select: { id: true, nombre: true, codigo: true } },
        formulario: { select: { id: true, nombre: true } },
        aulas: { select: { id: true, nombre: true, codigo: true } },
        inscriptos: true,
      },
    })
  },

  // 🔹 Crear cohorte
  async create(data: any) {
    const { postituloId, formularioId, ...rest } = data

    return prisma.cohorte.create({
      data: {
        ...rest,
        postitulo: { connect: { id: Number(postituloId) } },
        ...(formularioId && { formularioId: Number(formularioId) }),
      },
      include: {
        postitulo: {
          select: { id: true, nombre: true, codigo: true },
        },
        formulario: {
          select: { id: true, nombre: true },
        },
        aulas: true,
      },
    })
  },

  // 🔹 Actualizar cohorte
  async update(id: number, data: any) {
    const { postituloId, formularioId, ...rest } = data

    return prisma.cohorte.update({
      where: { id },
      data: {
        ...rest,
        ...(postituloId && {
          postitulo: { connect: { id: Number(postituloId) } },
        }),
        ...(formularioId && {
          formulario: { connect: { id: Number(formularioId) } },
        }),
      },
      include: {
        postitulo: {
          select: { id: true, nombre: true, codigo: true },
        },
        formulario: {
          select: { id: true, nombre: true },
        },
        aulas: true,
      },
    })
  },

  // 🔹 Eliminar cohorte (borra también aulas asociadas)
  async remove(id: number) {
    // eliminar aulas primero (por si no tienen cascade)
    await prisma.aula.deleteMany({ where: { cohorteId: id } })
    return prisma.cohorte.delete({ where: { id } })
  },
}
