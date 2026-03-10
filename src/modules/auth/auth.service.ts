import bcrypt from 'bcrypt'
import { generateToken } from '../../utils/generateToken'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors/app-error'
import { authRepository } from './auth.repository'

export async function login(email: string, password: string) {
  const user = await authRepository.findByEmail(email)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError('Usuario o contrasena no validos')
  }

  const token = generateToken({ id: user.id, email: user.email, rol: user.rol })
  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}

export async function getCurrentUser(userId: number) {
  const user = await authRepository.findCurrentUserById(userId)

  if (!user) {
    throw new NotFoundError('Usuario no encontrado')
  }

  const { password: _, ...safeUser } = user
  return safeUser
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Debe enviar contrasena actual y contrasena nueva')
  }

  if (newPassword.length < 8) {
    throw new BadRequestError('La nueva contrasena debe tener al menos 8 caracteres')
  }

  const user = await authRepository.findPasswordById(userId)

  if (!user) {
    throw new NotFoundError('Usuario no encontrado')
  }

  const currentPasswordOk = await bcrypt.compare(currentPassword, user.password)
  if (!currentPasswordOk) {
    throw new UnauthorizedError('La contrasena actual es incorrecta')
  }

  const sameAsCurrent = await bcrypt.compare(newPassword, user.password)
  if (sameAsCurrent) {
    throw new BadRequestError('La nueva contrasena no puede ser igual a la actual')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await authRepository.updatePassword(userId, hashedPassword)
}
