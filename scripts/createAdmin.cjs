require('dotenv').config()
const { PrismaClient, Rol } = require('@prisma/client')
const bcrypt = require('bcrypt')
const { randomBytes } = require('node:crypto')
const { createInterface } = require('node:readline/promises')

async function main() {
  const input = createInterface({ input: process.stdin, output: process.stdout })
  const prisma = new PrismaClient()
  try {
    const nombre = (await input.question('Nombre: ')).trim()
    const apellido = (await input.question('Apellido: ')).trim()
    const dni = (await input.question('DNI (unico): ')).trim()
    const email = (await input.question('Email para iniciar sesion: ')).trim().toLowerCase()
    const celular = (await input.question('Celular (opcional, Enter para omitir): ')).trim() || null
    const roles = Object.values(Rol)
    console.log('\nRoles disponibles:')
    roles.forEach((role, index) => console.log(`${index + 1}. ${role}`))
    let rol
    while (!rol) {
      const selected = (await input.question('Rol (numero o nombre): ')).trim().toUpperCase()
      rol = roles.includes(selected) ? selected : /^[1-9]\d*$/.test(selected) ? roles[Number(selected) - 1] : undefined
      if (!rol) console.log('Selecciona un rol valido de la lista.')
    }
    if (!nombre || !apellido || !dni || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Completa nombre, apellido, DNI y un email valido.')
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { dni }] } })
    if (existing) throw new Error('Ya existe un usuario con ese email o DNI. No se modifico.')

    const password = randomBytes(18).toString('base64url')
    const user = await prisma.user.create({
      data: { nombre, apellido, dni, email, celular, rol, password: await bcrypt.hash(password, 10) },
      select: { id: true, email: true, rol: true },
    })
    console.log(`\nUsuario creado (ID ${user.id}, rol ${user.rol}).`)
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${password}`)
    console.log('Guarda esta password; se muestra solo ahora. Podes cambiarla despues de iniciar sesion.')
  } finally {
    input.close()
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  if (error.code === 'P2002') console.error('Ya existe un usuario con ese email o DNI.')
  else if (error.code || error.name?.startsWith('Prisma')) console.error('No se pudo crear el usuario. Revisa la conexion y las migraciones.')
  else console.error(error.message)
  process.exitCode = 1
})
