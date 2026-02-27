import prisma from '../prisma/client'

export const cohorteService = {
  async getAll() {
    const cohortes = await prisma.cohorte.findMany({
      select: {
        id: true,
        anio: true,
        nombre: true,
        fechaInicio: true,
        fechaFin: true,
        estado: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        postituloId: true,
        formularioId: true,
        cantidadAulas: true,
        cupos: true,
        cuposListaEspera: true,
        cuposTotales: true,
        createdAt: true,
        updatedAt: true,
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
            _count: { select: { cursantes: true } },
          },
        },
      },
      orderBy: { anio: 'desc' },
    })

    return cohortes.map((cohorte) => {
      const { aulas, ...cohorteBase } = cohorte
      const cantidadAulas = cohorte.cantidadAulas ?? cohorte.aulas.length
      const cantidadCursantes = cohorte.aulas.reduce((acc, aula) => acc + aula._count.cursantes, 0)

      return {
        ...cohorteBase,
        cantidadAulas,
        cantidadCursantes,
      }
    })
  },

  async getById(id: number) {
    const cohorte = await prisma.cohorte.findUnique({
      where: { id },
      select: {
        id: true,
        anio: true,
        nombre: true,
        fechaInicio: true,
        fechaFin: true,
        estado: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        postituloId: true,
        formularioId: true,
        cantidadAulas: true,
        cupos: true,
        cuposListaEspera: true,
        cuposTotales: true,
        createdAt: true,
        updatedAt: true,
        postitulo: { select: { id: true, nombre: true, codigo: true } },
        formulario: { select: { id: true, nombre: true } },
        aulas: {
          select: {
            _count: { select: { cursantes: true } },
          },
        },
      },
    })

    if (!cohorte) return null

    const cantidadCursantes = cohorte.aulas.reduce((acc, aula) => acc + aula._count.cursantes, 0)
    const { aulas, ...cohorteBase } = cohorte

    return {
      ...cohorteBase,
      cantidadAulas: cohorte.cantidadAulas ?? cohorte.aulas.length,
      cantidadCursantes,
    }
  },

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

  async remove(id: number) {
    await prisma.aula.deleteMany({ where: { cohorteId: id } })
    return prisma.cohorte.delete({ where: { id } })
  },
}
