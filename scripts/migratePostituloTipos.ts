import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const postitulos = await prisma.postitulo.findMany({
    select: { id: true, tipo: true, titulo: true },
  })

  for (const p of postitulos) {
    if (!p.tipo || !p.titulo) continue

    await prisma.postituloTipo.create({
      data: {
        tipo: p.tipo,
        titulo: p.titulo,
        postituloId: p.id,
      },
    })
  }

  console.log('✅ Migración de tipos completada')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
