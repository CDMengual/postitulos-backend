import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export const cohorteSelect = {
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
    select: { id: true, nombre: true, codigo: true },
  },
  formulario: {
    select: { id: true, nombre: true },
  },
  cohorteInstitutos: {
    select: {
      instituto: {
        select: { id: true, nombre: true, distritoId: true },
      },
    },
  },
  aulas: {
    select: {
      _count: { select: { cursantes: true } },
    },
  },
} satisfies Prisma.CohorteSelect

export const cohorteInclude = {
  postitulo: { select: { id: true, nombre: true, codigo: true } },
  formulario: { select: { id: true, nombre: true } },
  cohorteInstitutos: {
    select: {
      instituto: { select: { id: true, nombre: true, distritoId: true } },
    },
  },
  aulas: {
    select: {
      _count: { select: { cursantes: true } },
    },
  },
} satisfies Prisma.CohorteInclude

export const cohorteRepository = {
  findMany(where?: Prisma.CohorteWhereInput) {
    return prisma.cohorte.findMany({
      where,
      select: cohorteSelect,
      orderBy: { anio: 'desc' },
    })
  },

  findById(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      select: cohorteSelect,
    })
  },

  findByIdWithPostitulo(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      include: { postitulo: true },
    })
  },

  countInstitutosByIds(institutoIds: number[]) {
    return prisma.instituto.count({
      where: { id: { in: institutoIds } },
    })
  },

  findPostituloById(id: number) {
    return prisma.postitulo.findUnique({
      where: { id },
      select: { id: true, codigo: true },
    })
  },

  create(data: Prisma.CohorteCreateInput) {
    return prisma.cohorte.create({
      data,
      include: cohorteInclude,
    })
  },

  update(id: number, data: Prisma.CohorteUpdateInput) {
    return prisma.cohorte.update({
      where: { id },
      data,
      include: cohorteInclude,
    })
  },

  updateEstado(id: number, estado: string) {
    return prisma.cohorte.update({
      where: { id },
      data: { estado: estado as any },
      select: { id: true, nombre: true, estado: true },
    })
  },

  deleteAulasByCohorteId(cohorteId: number) {
    return prisma.aula.deleteMany({ where: { cohorteId } })
  },

  delete(id: number) {
    return prisma.cohorte.delete({ where: { id } })
  },
}
