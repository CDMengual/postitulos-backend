require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()
const password = 'ReferentePrueba2026!'
const cuentas = Array.from({ length: 4 }, (_, i) => {
  const numero = String(i + 1).padStart(2, '0')
  return { nombre: 'Referente', apellido: `Prueba ${numero}`, email: `referente${numero}@example.test`, dni: String(99000001 + i) }
})

async function main() {
  const institutos = await prisma.instituto.findMany({
    where: { aulas: { some: { cohorte: { estado: 'ACTIVA' } } } },
    include: { aulas: { select: { id: true } }, _count: { select: { aulas: true } } },
  })
  institutos.sort((a, b) => b._count.aulas - a._count.aulas || a.id - b.id)
  if (institutos.length < cuentas.length) throw new Error('Se necesitan cuatro institutos con aulas activas')
  // Validar colisiones antes de crear cuentas; no modificar usuarios ajenos al seed.
  const previos = await prisma.user.findMany({
    where: { OR: [{ email: { in: cuentas.map((c) => c.email) } }, { dni: { in: cuentas.map((c) => c.dni) } }] },
  })
  for (const c of cuentas) {
    const coincidencias = previos.filter((p) => p.email === c.email || p.dni === c.dni)
    if (coincidencias.some((p) => p.email !== c.email || p.dni !== c.dni || p.rol !== 'REFERENTE' || p.nombre !== c.nombre || p.apellido !== c.apellido)) {
      throw new Error(`Email o DNI ocupado por otra cuenta: ${c.email}`)
    }
  }
  const selected = cuentas.map((c, i) => {
    const previo = previos.find((p) => p.email === c.email)
    const instituto = previo?.institutoId ? institutos.find((it) => it.id === previo.institutoId) : institutos[i]
    if (!instituto) throw new Error(`El instituto actual de ${c.email} no tiene aulas activas`)
    return { cuenta: c, instituto }
  })
  if (new Set(selected.map((item) => item.instituto.id)).size !== cuentas.length) throw new Error('Las cuentas deben usar institutos distintos')
  const hash = await bcrypt.hash(password, 10)
  for (const { cuenta, instituto } of selected) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: cuenta.email },
        create: { ...cuenta, rol: 'REFERENTE', institutoId: instituto.id, password: hash },
        update: {}, // No restablecer contrasenas de cuentas ya creadas.
        select: { id: true },
      })
      await tx.user.update({
        where: { id: user.id },
        data: { aulasReferente: { connect: instituto.aulas.map((a) => ({ id: a.id })) } },
      })
    }, { timeout: 30000 })
  }
  const saved = await prisma.user.findMany({
    where: { email: { in: cuentas.map((c) => c.email) } },
    include: { instituto: true, aulasReferente: { select: { id: true, institutoId: true } } },
    orderBy: { email: 'asc' },
  })
  for (const { cuenta, instituto } of selected) {
    const user = saved.find((u) => u.email === cuenta.email)
    if (!user || user.rol !== 'REFERENTE' || user.institutoId !== instituto.id ||
        instituto.aulas.some((a) => !user.aulasReferente.some((b) => b.id === a.id))) {
      throw new Error(`No coincide la verificacion de ${cuenta.email}`)
    }
    if (!previos.some((p) => p.email === cuenta.email) && !(await bcrypt.compare(password, user.password))) {
      throw new Error(`No coincide el hash de ${cuenta.email}`)
    }
    console.log(`${user.nombre} ${user.apellido} | ${user.email} | ${user.instituto.nombre} | ${user.aulasReferente.length} aulas`)
  }
  console.log('Verificados: 4 referentes con instituto y aulas. Las cuentas existentes conservan su password.')
}
main().catch((error) => {
  console.error('No se pudo completar la carga:', error.code || error.message)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
