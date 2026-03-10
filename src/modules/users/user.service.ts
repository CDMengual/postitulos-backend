import bcrypt from 'bcrypt'
import { Rol } from '@prisma/client'
import { BadRequestError, NotFoundError } from '../../errors/app-error'
import { userRepository } from './user.repository'

export const userService = {
  async getAll(rol?: Rol) {
    return userRepository.findMany(rol)
  },

  async getById(id: number) {
    return userRepository.findById(id)
  },

  async create(data: Record<string, unknown>) {
    const { password, ...rest } = data

    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new BadRequestError('Password is required')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    return userRepository.create({
      ...rest,
      password: hashedPassword,
    })
  },

  async update(id: number, data: Record<string, unknown>) {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestError('No fields provided to update')
    }

    return userRepository.update(id, data)
  },

  async remove(id: number) {
    const current = await userRepository.findById(id)
    if (!current) {
      throw new NotFoundError('Usuario no encontrado')
    }

    return userRepository.delete(id)
  },
}
