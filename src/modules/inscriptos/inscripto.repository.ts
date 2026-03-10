import prisma from '../../infrastructure/database/prisma'

export const inscriptoRepository = {
  findUserInstituto(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { institutoId: true },
    })
  },

  count(where: any) {
    return prisma.inscripto.count({ where })
  },

  findMany(args: { where: any; page: number; limit: number }) {
    return prisma.inscripto.findMany({
      where: args.where,
      skip: (args.page - 1) * args.limit,
      take: args.limit,
      orderBy: [{ prioridad: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        cohorteId: true,
        nombre: true,
        apellido: true,
        dni: true,
        email: true,
        celular: true,
        estado: true,
        institutoId: true,
        prioridad: true,
        condicionada: true,
        documentacion: true,
        createdAt: true,
        updatedAt: true,
        cohorte: {
          select: {
            id: true,
            nombre: true,
            anio: true,
            estado: true,
            postitulo: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        instituto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })
  },

  findById(id: number) {
    return prisma.inscripto.findUnique({
      where: { id },
      select: {
        id: true,
        cohorteId: true,
        nombre: true,
        apellido: true,
        dni: true,
        email: true,
        celular: true,
        estado: true,
        institutoId: true,
        prioridad: true,
        condicionada: true,
        observaciones: true,
        documentacion: true,
        datosFormulario: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
        createdAt: true,
        updatedAt: true,
        cohorte: {
          select: {
            id: true,
            nombre: true,
            anio: true,
            estado: true,
            fechaInicioInscripcion: true,
            fechaFinInscripcion: true,
            postitulo: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        instituto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })
  },

  updateDocumentacion(id: number, documentacion: string) {
    return prisma.inscripto.update({
      where: { id },
      data: { documentacion: documentacion as any },
      select: {
        id: true,
        documentacion: true,
        updatedAt: true,
      },
    })
  },

  update(id: number, data: Record<string, unknown>) {
    return prisma.inscripto.update({
      where: { id },
      data: data as any,
      select: {
        id: true,
        observaciones: true,
        prioridad: true,
        condicionada: true,
        updatedAt: true,
      },
    })
  },

  findInstitutoById(id: number) {
    return prisma.instituto.findUnique({
      where: { id },
      select: { id: true },
    })
  },

  assignInstituto(id: number, institutoId: number | null) {
    return prisma.inscripto.update({
      where: { id },
      data: { institutoId },
      select: {
        id: true,
        institutoId: true,
        updatedAt: true,
        instituto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })
  },

  findManyCountsForBulk(inscriptoIds: number[], institutoIds: number[]) {
    return Promise.all([
      prisma.inscripto.count({ where: { id: { in: inscriptoIds } } }),
      institutoIds.length > 0
        ? prisma.instituto.count({ where: { id: { in: institutoIds } } })
        : Promise.resolve(0),
    ])
  },

  assignInstitutosBulk(asignaciones: Array<{ inscriptoId: number; institutoId: number | null }>) {
    return prisma.$transaction(
      asignaciones.map((a) =>
        prisma.inscripto.update({
          where: { id: a.inscriptoId },
          data: { institutoId: a.institutoId },
          select: {
            id: true,
            institutoId: true,
            updatedAt: true,
          },
        }),
      ),
    )
  },

  getDocumentoPath(id: number) {
    return prisma.inscripto.findUnique({
      where: { id },
      select: {
        id: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
      },
    })
  },

  prisma,
}
