import { Rol } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export const userSelect = {
  id: true,
  nombre: true,
  apellido: true,
  dni: true,
  email: true,
  celular: true,
  rol: true,
  institutoId: true,
  createdAt: true,
  updatedAt: true,
  instituto: {
    select: {
      id: true,
      nombre: true,
      distrito: {
        select: {
          id: true,
          nombre: true,
          region: { select: { id: true } },
        },
      },
    },
  },
}

export const userRepository = {
  findMany(rol?: Rol) {
    return prisma.user.findMany({
      where: rol ? { rol } : undefined,
      select: userSelect,
      orderBy: [
        { rol: 'desc' },
        {
          instituto: {
            distrito: {
              regionId: 'asc',
            },
          },
        },
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
    })
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    })
  },

  create(data: Record<string, unknown>) {
    return prisma.user.create({
      data: data as any,
      select: userSelect,
    })
  },

  update(id: number, data: Record<string, unknown>) {
    return prisma.user.update({
      where: { id },
      data: data as any,
      select: userSelect,
    })
  },

  delete(id: number) {
    return prisma.user.delete({
      where: { id },
    })
  },

  findAuthByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  findPasswordById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true },
    })
  },

  updatePassword(id: number, password: string) {
    return prisma.user.update({
      where: { id },
      data: { password },
    })
  },

  findCurrentUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        instituto: {
          include: {
            distrito: { include: { region: true } },
          },
        },
      },
    })
  },
}
