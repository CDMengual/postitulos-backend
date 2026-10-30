require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const detalles = [...require('../prisma/postitulosDetalles.json'), ...require('../prisma/postitulosAdicionales.json')]
const prisma = new PrismaClient()

async function main() {
  for (const detalle of detalles) {
    await prisma.$transaction(async (tx) => {
      const postitulo = await tx.postitulo.update({
        where: { codigo: detalle.codigo },
        data: detalle.nombre ? { nombre: detalle.nombre } : {},
        select: { id: true },
      })
      const tipos = await tx.postituloTipo.findMany({ where: { postituloId: postitulo.id } })
      if (tipos.length) {
        await tx.postituloTipo.updateMany({
          where: { postituloId: postitulo.id },
          data: { tipo: 'ESPECIALIZACION' },
        })
      } else {
        await tx.postituloTipo.create({
          data: { postituloId: postitulo.id, tipo: 'ESPECIALIZACION', titulo: detalle.titulo },
        })
      }
    }, { timeout: 30000 })
  }
  const saved = await prisma.postitulo.findMany({
    where: { codigo: { in: detalles.map((d) => d.codigo) } },
    select: { codigo: true, nombre: true, tipos: true },
  })
  if (saved.length !== detalles.length || saved.some((p) => !p.tipos.length || p.tipos.some((t) => t.tipo !== 'ESPECIALIZACION')) ||
      saved.find((p) => p.codigo === 'JA')?.nombre !== detalles.find((d) => d.codigo === 'JA').nombre) {
    throw new Error('La verificacion de tipos o nombre no coincide')
  }
  for (const p of saved) console.log(`${p.codigo}: ${p.nombre} - ESPECIALIZACION`)
}
main().catch((error) => {
  console.error('No se pudo completar la actualizacion:', error.code || error.message)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
