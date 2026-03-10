import prisma from '../../infrastructure/database/prisma'

const buildUserAulaWhere = (userId: number) => ({
  OR: [
    { admins: { some: { id: userId } } },
    { referentes: { some: { id: userId } } },
    { formadores: { some: { id: userId } } },
    { coordinadores: { some: { id: userId } } },
  ],
})

export const dashboardRepository = {
  findUserAulas(userId: number) {
    return prisma.aula.findMany({
      where: buildUserAulaWhere(userId),
      select: {
        id: true,
        cohorteId: true,
        institutoId: true,
      },
    })
  },

  findCohortesByScope(cohorteIds?: number[]) {
    return prisma.cohorte.findMany({
      where: cohorteIds ? { id: { in: cohorteIds } } : undefined,
      select: {
        id: true,
        anio: true,
        estado: true,
        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        _count: {
          select: {
            aulas: true,
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { id: 'desc' }],
    })
  },

  findCursantesEnAulaByScope(args: { mode: 'global' | 'user'; cohorteIds: number[]; aulaIds: number[] }) {
    return prisma.cursanteAula.findMany({
      where:
        args.mode === 'global'
          ? {
              aula: {
                cohorteId: { in: args.cohorteIds },
              },
            }
          : {
              aulaId: { in: args.aulaIds },
            },
      select: {
        cursanteId: true,
        estado: true,
        aula: {
          select: {
            cohorteId: true,
          },
        },
      },
    })
  },

  findInscriptosByScope(args: {
    mode: 'global' | 'user'
    cohorteIds: number[]
    institutoIds: number[]
  }) {
    return prisma.inscripto.findMany({
      where:
        args.mode === 'global'
          ? {
              cohorteId: { in: args.cohorteIds },
            }
          : {
              cohorteId: { in: args.cohorteIds },
              institutoId: { in: args.institutoIds },
            },
      select: {
        cohorteId: true,
      },
    })
  },

  findSnapshotsByScope(args: { mode: 'global' | 'user'; aulaIds: number[] }) {
    return prisma.aulaSnapshotMensual.findMany({
      where:
        args.mode === 'global'
          ? undefined
          : {
              aulaId: { in: args.aulaIds },
            },
      select: {
        anio: true,
        mes: true,
        fechaCorte: true,
        totalInicial: true,
        activos: true,
        adeuda: true,
        baja: true,
        finalizado: true,
        totalFoto: true,
        aula: {
          select: {
            cohorte: {
              select: {
                anio: true,
                postitulo: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ anio: 'asc' }, { mes: 'asc' }, { aulaId: 'asc' }],
    })
  },
}
