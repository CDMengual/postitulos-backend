import prisma from '../../infrastructure/database/prisma'

const formularioInclude = {
  postitulo: {
    select: {
      id: true,
      nombre: true,
      codigo: true,
      requisitos: true,
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
      id: true,
      nombre: true,
      estado: true,
      fechaInicioInscripcion: true,
      fechaFinInscripcion: true,
      cupos: true,
    },
  },
} as const

export const formularioRepository = {
  findMany(postituloId?: number) {
    return prisma.formulario.findMany({
      where: postituloId ? { postituloId } : undefined,
      include: formularioInclude,
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: number) {
    return prisma.formulario.findUnique({
      where: { id },
      include: formularioInclude,
    })
  },
}
