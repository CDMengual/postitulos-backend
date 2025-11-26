import prisma from '../prisma/client'

export const publicService = {
  // 🔹 Cohortes en inscripción (solo datos públicos)
  async getCohortesEnInscripcion() {
    const ahora = new Date()

    return prisma.cohorte.findMany({
      where: {
        estado: 'INSCRIPCION',
      },
      select: {
        id: true,
        nombre: true,
        anio: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,

        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            destinatarios: true,
          },
        },

        formulario: {
          select: {
            id: true,
            nombre: true,
            campos: true, // solo los campos publicables
          },
        },
      },
      orderBy: {
        anio: 'desc',
      },
    })
  },

  // 🔹 Obtener cohorte pública por ID
  async getCohortePublic(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        anio: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,

        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            destinatarios: true,
            planEstudios: true,
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

        formulario: {
          select: {
            id: true,
            nombre: true,
            campos: true,
          },
        },
      },
    })
  },
}
