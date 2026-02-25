import bcrypt from 'bcrypt'
import { generateToken } from '../utils/generateToken'
import prisma from '../prisma/client'

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { status: 401, message: 'Usuario o contraseña no válidos' }
  }

  // Generación del token si las credenciales son correctas
  const token = generateToken({ id: user.id, email: user.email, rol: user.rol })

  // Eliminamos el password del usuario antes de devolverlo
  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  if (!currentPassword || !newPassword) {
    throw { status: 400, message: 'Debe enviar contrasena actual y contrasena nueva' }
  }

  if (newPassword.length < 8) {
    throw { status: 400, message: 'La nueva contrasena debe tener al menos 8 caracteres' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  })

  if (!user) {
    throw { status: 404, message: 'Usuario no encontrado' }
  }

  const currentPasswordOk = await bcrypt.compare(currentPassword, user.password)
  if (!currentPasswordOk) {
    throw { status: 401, message: 'La contrasena actual es incorrecta' }
  }

  const sameAsCurrent = await bcrypt.compare(newPassword, user.password)
  if (sameAsCurrent) {
    throw { status: 400, message: 'La nueva contrasena no puede ser igual a la actual' }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}
