import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '../utils/generateToken'

const prisma = new PrismaClient()

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
