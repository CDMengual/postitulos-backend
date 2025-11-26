import prisma from '../prisma/client'
import { Rol } from '@prisma/client'

export const userService = {
  async getAll(rol?: string) {
    const rolFilter = rol && Object.values(Rol).includes(rol as Rol) ? (rol as Rol) : undefined

    const users = await prisma.user.findMany({
      where: rolFilter ? { rol: rolFilter } : undefined,
      select: {
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
      },
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

    return users
  },

  async getById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
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
      },
    })
  },

  async create(data: any) {
    return await prisma.user.create({ data })
  },

  async update(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    })
  },

  async remove(id: number) {
    return await prisma.user.delete({
      where: { id },
    })
  },
}
