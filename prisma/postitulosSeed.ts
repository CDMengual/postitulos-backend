import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { EXCLUYENTE_COMUN, REQUISITOS_POR_CODIGO } from './requisitosPostitulosSeed'

const prisma = new PrismaClient()

// Nombres recuperados de los seeds de formularios. No se infieren titulos,
// resoluciones, modalidad ni cargas horarias a partir de datos de prueba.
const postitulos = [
  { codigo: 'EI', nombre: 'Enseñanza con imágenes' },
  { codigo: 'EA', nombre: 'Educación ambiental. Nuevas miradas y propuestas transversales para el aula' },
]

async function main() {
  for (const postitulo of postitulos) {
    const requisitos = REQUISITOS_POR_CODIGO[postitulo.codigo]!
    const result = await prisma.postitulo.upsert({
      where: { codigo: postitulo.codigo },
      update: {}, // Conservar cualquier dato editado desde la aplicacion.
      create: {
        ...postitulo,
        requisitos: {
          excluyentes: [EXCLUYENTE_COMUN, ...requisitos.excluyentes],
          prioritarios: requisitos.prioritarios,
        },
      },
      select: { id: true, codigo: true, nombre: true },
    })
    console.log(`${result.codigo}: ${result.nombre} (ID ${result.id})`)
  }
  const creados = await prisma.postitulo.findMany({
    where: { codigo: { in: postitulos.map((p) => p.codigo) } },
    select: { codigo: true, nombre: true, requisitos: true },
  })
  console.log(`Verificados: ${creados.length} postitulos con sus datos actuales.`)
}

main()
  .catch((error) => {
    console.error('No se pudo completar el seed de postitulos:', error.code || error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
