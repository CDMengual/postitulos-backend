import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export const distritoSelect = {
  id: true,
  nombre: true,
  regionId: true,
} satisfies Prisma.DistritoSelect

export const distritoRepository = {
  findMany() {
    return prisma.distrito.findMany({
      select: distritoSelect,
      orderBy: [{ regionId: 'asc' }, { nombre: 'asc' }],
    })
  },
}
