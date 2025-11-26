import prisma from '../prisma/client'

export const aulaService = {
  // 🔹 Obtener todas las aulas según el rol del usuario
  async getAllForUser(userId: number, rol: string) {
    const baseSelect = {
      id: true,
      codigo: true,
      numero: true,
      cohorte: {
        select: {
          id: true,
          nombre: true,
          anio: true,
          estado: true,
          postitulo: { select: { id: true, nombre: true, codigo: true } },
        },
      },
      referentes: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
    }

    const orderBy = [{ cohorteId: 'desc' as const }, { numero: 'asc' as const }]

    if (rol === 'ADMIN') {
      return prisma.aula.findMany({
        select: baseSelect,
        orderBy,
      })
    }

    // 🔸 Otros roles: filtrar aulas en las que participa
    return prisma.aula.findMany({
      where: {
        OR: [
          { admins: { some: { id: userId } } },
          { referentes: { some: { id: userId } } },
          { formadores: { some: { id: userId } } },
          { coordinadores: { some: { id: userId } } },
        ],
      },
      select: baseSelect,
      orderBy,
    })
  },

  // 🔹 Obtener aula por ID (con cursantes)
  async getById(id: number) {
    return prisma.aula.findUnique({
      where: { id },
      include: {
        cohorte: {
          include: {
            postitulo: { select: { id: true, nombre: true, codigo: true } },
          },
        },
        instituto: { select: { id: true, nombre: true } },
        admins: { select: { id: true, nombre: true, apellido: true } },
        referentes: { select: { id: true, nombre: true, apellido: true } },
        formadores: { select: { id: true, nombre: true, apellido: true } },
        cursantes: {
          include: {
            cursante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                email: true,
                celular: true,
                titulo: true,
              },
            },
          },
        },
      },
    })
  },

  // 🔹 Crear aula con número autoincremental por cohorte
  async create(data: { cohorteId: number; referenteId?: number; institutoId: number }) {
    // Buscar el último número en esa cohorte
    const lastAula = await prisma.aula.findFirst({
      where: { cohorteId: data.cohorteId },
      orderBy: { numero: 'desc' },
    })

    const nextNumero = (lastAula?.numero ?? 0) + 1

    // Buscar datos de cohorte y postítulo (para generar código)
    const cohorte = await prisma.cohorte.findUnique({
      where: { id: data.cohorteId },
      include: { postitulo: true },
    })

    if (!cohorte) throw new Error('Cohorte no encontrada')
    if (!cohorte.postitulo) throw new Error('Cohorte sin postítulo asociado')

    // Generar código y nombre automáticos (ej. EI-2025-Aula01)
    const codigo = `${cohorte.postitulo.codigo}-${cohorte.anio}-Aula${String(nextNumero).padStart(
      2,
      '0',
    )}`
    const nombre = `${cohorte.postitulo.nombre} - Aula ${nextNumero} (${cohorte.nombre})`

    // Crear aula
    return prisma.aula.create({
      data: {
        numero: nextNumero,
        codigo,
        nombre,
        cohorte: { connect: { id: data.cohorteId } },
        instituto: { connect: { id: data.institutoId } },
        ...(data.referenteId && {
          referentes: { connect: [{ id: data.referenteId }] },
        }),
        // conectar admins automáticamente si lo manejás en el controller
      },
      include: {
        cohorte: {
          include: { postitulo: true },
        },
        referentes: { select: { id: true, nombre: true, apellido: true } },
      },
    })
  },

  // 🔹 Actualizar aula
  async update(id: number, data: any) {
    return prisma.aula.update({
      where: { id },
      data,
      include: {
        cohorte: { include: { postitulo: true } },
        admins: { select: { id: true, nombre: true, apellido: true } },
        referentes: { select: { id: true, nombre: true, apellido: true } },
      },
    })
  },

  // 🔹 Eliminar aula (y sus inscripciones)
  async remove(id: number) {
    await prisma.cursanteAula.deleteMany({ where: { aulaId: id } })
    return prisma.aula.delete({ where: { id } })
  },
}
