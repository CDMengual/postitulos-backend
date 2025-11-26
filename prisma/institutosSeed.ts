import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seed de Institutos (solo inserta institutos en distritos existentes)\n')

  // ⚠️ EDITAR: completa acá tus institutos por región y distrito
  const regiones = [
    {
      id: 1,
      distritos: [{ nombre: 'La Plata', institutos: [{ nombre: 'ISFD N°17' }] }],
    },
    {
      id: 2,
      distritos: [
        { nombre: 'Avellaneda', institutos: [{ nombre: 'ISFD N°1' }] },
        { nombre: 'Lomas de Zamora', institutos: [{ nombre: 'ISFDyT N°103' }] },
      ],
    },
    {
      id: 3,
      distritos: [{ nombre: 'La Matanza', institutos: [{ nombre: 'ISFDyT N°105' }] }],
    },
    {
      id: 4,
      distritos: [{ nombre: 'Quilmes', institutos: [{ nombre: 'ISFDyT N°83' }] }],
    },
    {
      id: 5,
      distritos: [{ nombre: 'Glew', institutos: [{ nombre: 'ISFDyT N°53' }] }],
    },
    {
      id: 6,
      distritos: [{ nombre: 'Vicente López', institutos: [{ nombre: 'ISFD N°39' }] }],
    },
    {
      id: 7,
      distritos: [{ nombre: 'Tres de Febrero', institutos: [{ nombre: 'ISFD N°34' }] }],
    },
    {
      id: 8,
      distritos: [{ nombre: 'Merlo', institutos: [{ nombre: 'ISFD N°29' }] }],
    },
    {
      id: 9,
      distritos: [{ nombre: 'Moreno', institutos: [{ nombre: 'ISFD N°110' }] }],
    },
    {
      id: 10,
      distritos: [{ nombre: 'Luján', institutos: [{ nombre: 'ISFD N°141' }] }],
    },
    {
      id: 11,
      distritos: [{ nombre: 'Campana', institutos: [{ nombre: 'ISFDyT N°15' }] }],
    },
    {
      id: 14,
      distritos: [{ nombre: 'Junín', institutos: [{ nombre: 'ISFD N°129' }] }],
    },
    {
      id: 15,
      distritos: [{ nombre: 'Pehuajó', institutos: [{ nombre: 'ISFDyT N°13' }] }],
    },
    {
      id: 17,
      distritos: [{ nombre: 'Chascomús', institutos: [{ nombre: 'ISFDyT N°57' }] }],
    },
    {
      id: 19,
      distritos: [{ nombre: 'General Pueyrredón', institutos: [{ nombre: 'ISFD N°19' }] }],
    },
    {
      id: 20,
      distritos: [{ nombre: 'Tandil', institutos: [{ nombre: 'ISFDyT N°166' }] }],
    },
    {
      id: 22,
      distritos: [{ nombre: 'Bahía Blanca', institutos: [{ nombre: 'ISFD N°3' }] }],
    },
    {
      id: 24,
      distritos: [{ nombre: 'Saladillo', institutos: [{ nombre: 'ISFD N°16' }] }],
    },
    {
      id: 25,
      distritos: [{ nombre: 'Bolívar', institutos: [{ nombre: 'ISFDyT N°27' }] }],
    },
  ]

  // Counters
  let creados = 0
  let saltados = 0
  let distritosNoEncontrados: Array<{ regionId: number; nombre: string }> = []

  for (const region of regiones) {
    for (const d of region.distritos) {
      // Buscar el distrito por nombre dentro de la región
      const distrito = await prisma.distrito.findFirst({
        where: { nombre: d.nombre, regionId: region.id },
        select: { id: true },
      })

      if (!distrito) {
        distritosNoEncontrados.push({ regionId: region.id, nombre: d.nombre })
        continue
      }

      for (const inst of d.institutos) {
        // Evitar duplicados: si ya existe un Instituto con mismo nombre en ese distrito, lo salteamos
        const existente = await prisma.instituto.findFirst({
          where: { nombre: inst.nombre, distritoId: distrito.id },
          select: { id: true },
        })

        if (existente) {
          saltados++
          continue
        }

        await prisma.instituto.create({
          data: {
            nombre: inst.nombre,
            distrito: { connect: { id: distrito.id } },
          },
        })
        creados++
      }
    }
  }

  console.log('✅ Seed Institutos completado')
  console.log(`   • Institutos creados: ${creados}`)
  console.log(`   • Duplicados / ya existentes: ${saltados}`)
  if (distritosNoEncontrados.length) {
    console.log('   • Distritos NO encontrados (revisar nombre/regionId):')
    for (const d of distritosNoEncontrados) {
      console.log(`     - Región ${d.regionId} / Distrito "${d.nombre}"`)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error en seed de institutos:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
