import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

const buildUserAulaWhere = (userId: number) => ({
  OR: [
    { admins: { some: { id: userId } } },
    { referentes: { some: { id: userId } } },
    { formadores: { some: { id: userId } } },
    { coordinadores: { some: { id: userId } } },
  ],
})

export const aulaRepository = {
  countCursantesByEstado(aulaId: number, estado: 'ACTIVO' | 'ADEUDA' | 'BAJA' | 'FINALIZADO') {
    return prisma.cursanteAula.count({ where: { aulaId, estado } })
  },

  countCursantes(aulaId: number) {
    return prisma.cursanteAula.count({ where: { aulaId } })
  },

  findManyForUser(args: {
    userId: number
    rol: string
    cohorteWhere: Prisma.CohorteWhereInput
    orderBy: Prisma.AulaOrderByWithRelationInput[]
    select: Prisma.AulaSelect
  }) {
    if (args.rol === 'ADMIN') {
      return prisma.aula.findMany({
        where: { cohorte: args.cohorteWhere },
        select: args.select,
        orderBy: args.orderBy,
      })
    }

    return prisma.aula.findMany({
      where: {
        cohorte: args.cohorteWhere,
        ...buildUserAulaWhere(args.userId),
      },
      select: args.select,
      orderBy: args.orderBy,
    })
  },

  findById(id: number) {
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
                regionId: true,
                distritoId: true,
              },
            },
          },
        },
      },
    })
  },

  findAdmins() {
    return prisma.user.findMany({
      where: { rol: 'ADMIN' },
      select: { id: true },
    })
  },

  findReferenteById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: { institutoId: true },
    })
  },

  findCohorteById(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      include: { postitulo: true },
    })
  },

  findLastAulaByCohorte(cohorteId: number, tx: Prisma.TransactionClient = prisma) {
    return tx.aula.findFirst({
      where: { cohorteId },
      orderBy: { numero: 'desc' },
    })
  },

  create(data: Prisma.AulaCreateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.aula.create({
      data,
      include: {
        cohorte: { include: { postitulo: true } },
        referentes: { select: { id: true, nombre: true, apellido: true } },
        admins: { select: { id: true, nombre: true, apellido: true } },
      },
    })
  },

  update(id: number, data: Prisma.AulaUpdateInput) {
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

  delete(id: number) {
    return prisma.aula.delete({ where: { id } })
  },

  deleteCursantesByAulaId(aulaId: number) {
    return prisma.cursanteAula.deleteMany({ where: { aulaId } })
  },

  findBaseSnapshot(aulaId: number) {
    return prisma.aulaSnapshotMensual.findFirst({
      where: { aulaId },
      orderBy: [{ anio: 'asc' }, { mes: 'asc' }],
      select: { totalInicial: true },
    })
  },

  findSnapshotAula(aulaId: number) {
    return prisma.aula.findUnique({
      where: { id: aulaId },
      select: { id: true, nombre: true, codigo: true, cohorteId: true },
    })
  },

  upsertSnapshot(
    aulaId: number,
    anio: number,
    mes: number,
    data: {
      fechaCorte: Date
      totalInicial: number
      activos: number
      adeuda: number
      baja: number
      finalizado: number
      totalFoto: number
      observaciones: string | null
    },
  ) {
    return prisma.aulaSnapshotMensual.upsert({
      where: { aulaId_anio_mes: { aulaId, anio, mes } },
      update: data,
      create: { aulaId, anio, mes, ...data },
      include: {
        aula: {
          select: { id: true, nombre: true, codigo: true, cohorteId: true },
        },
      },
    })
  },

  findAulasByCohorte(cohorteId: number) {
    return prisma.aula.findMany({
      where: { cohorteId },
      select: { id: true },
      orderBy: [{ numero: 'asc' }],
    })
  },

  findSnapshotsByAula(aulaId: number) {
    return prisma.aulaSnapshotMensual.findMany({
      where: { aulaId },
      orderBy: [{ anio: 'asc' }, { mes: 'asc' }],
      include: {
        aula: {
          select: { id: true, nombre: true, codigo: true, cohorteId: true },
        },
      },
    })
  },

  findAccessibleAulasByCohorte(userId: number, rol: string, cohorteId: number) {
    return prisma.aula.findMany({
      where:
        rol === 'ADMIN'
          ? { cohorteId }
          : {
              cohorteId,
              ...buildUserAulaWhere(userId),
            },
      select: { id: true, nombre: true, codigo: true, numero: true },
      orderBy: [{ numero: 'asc' }],
    })
  },

  findSnapshotsByAulaIds(aulaIds: number[]) {
    return prisma.aulaSnapshotMensual.findMany({
      where: { aulaId: { in: aulaIds } },
      orderBy: [{ anio: 'asc' }, { mes: 'asc' }, { aulaId: 'asc' }],
      include: {
        aula: {
          select: { id: true, nombre: true, codigo: true, numero: true },
        },
      },
    })
  },

  transaction<T>(fn: Parameters<typeof prisma.$transaction>[0]) {
    return prisma.$transaction(fn as any) as Promise<T>
  },
}
