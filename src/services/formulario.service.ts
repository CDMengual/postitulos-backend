import prisma from '../prisma/client'

export const formularioService = {
  // 🔹 Obtener todos los formularios (opcionalmente filtrados por postítulo)
  async getAll(postituloId?: number) {
    const where = postituloId ? { postituloId } : undefined

    return prisma.formulario.findMany({
      where,
      include: {
        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            descripcion: true,
            destinatarios: true,
            resolucion: true,
            tipos: {
              select: {
                id: true,
                tipo: true,
                titulo: true,
              },
            },
          },
        },
        cohortes: {
          select: {
            fechaInicioInscripcion: true,
            fechaFinInscripcion: true,
            cupos: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // 🔹 Obtener formulario por ID
  async getById(id: number) {
    return prisma.formulario.findUnique({
      where: { id },
      include: {
        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            descripcion: true,
            destinatarios: true,
            resolucion: true,
            tipos: {
              select: {
                id: true,
                tipo: true,
                titulo: true,
              },
            },
          },
        },
        cohortes: {
          select: {
            fechaInicioInscripcion: true,
            fechaFinInscripcion: true,
            cupos: true,
          },
        },
      },
    })
  },
}
