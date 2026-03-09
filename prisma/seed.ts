import { PrismaClient } from '@prisma/client'
import { upsertFormularioEI } from './formularioEIseed'
import { upsertFormularioEA } from './formularioEAseed'

const prisma = new PrismaClient()

async function main() {
  const formularioEI = await upsertFormularioEI(prisma)
  console.log(`Formulario EI actualizado/creado con ID: ${formularioEI.id}`)

  const formularioEA = await upsertFormularioEA(prisma)
  console.log(`Formulario EA actualizado/creado con ID: ${formularioEA.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
