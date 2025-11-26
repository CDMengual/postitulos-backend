import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando seed de regiones y distritos...\n')

  // Mapa de regiones con sus distritos
  const regiones = [
    {
      id: 1,
      distritos: ['La Plata', 'Brandsen', 'Magdalena', 'Berisso', 'Ensenada', 'Punta Indio'],
    },
    {
      id: 2,
      distritos: ['Avellaneda', 'Lomas de Zamora', 'Lanús'],
    },
    {
      id: 3,
      distritos: ['La Matanza'],
    },
    {
      id: 4,
      distritos: ['Florencio Varela', 'Quilmes', 'Berazategui'],
    },
    {
      id: 5,
      distritos: [
        'Almirante Brown',
        'Esteban Echeverría',
        'San Vicente',
        'Presidente Perón',
        'Ezeiza',
      ],
    },
    {
      id: 6,
      distritos: ['Tigre', 'San Fernando', 'San Isidro', 'Vicente López'],
    },
    {
      id: 7,
      distritos: ['General San Martín', 'Tres de Febrero', 'Hurlingham'],
    },
    {
      id: 8,
      distritos: ['Merlo', 'Morón', 'Ituzaingó'],
    },
    {
      id: 9,
      distritos: ['Moreno', 'San Miguel', 'José C. Paz', 'Malvinas Argentinas'],
    },
    {
      id: 10,
      distritos: [
        'Cañuelas',
        'General Rodríguez',
        'Las Heras',
        'Luján',
        'Marcos Paz',
        'Mercedes',
        'Navarro',
        'San Andrés de Giles',
        'Suipacha',
      ],
    },
    {
      id: 11,
      distritos: ['Campana', 'Escobar', 'Pilar', 'Zárate', 'Exaltación de la Cruz'],
    },
    {
      id: 12,
      distritos: [
        'Baradero',
        'Arrecifes',
        'Ramallo',
        'San Nicolás',
        'San Pedro',
        'Capitán Sarmiento',
      ],
    },
    {
      id: 13,
      distritos: [
        'Carmen de Areco',
        'Colón',
        'Salto',
        'Pergamino',
        'Rojas',
        'San Antonio de Areco',
      ],
    },
    {
      id: 14,
      distritos: [
        'Junín',
        'Chacabuco',
        'General Arenales',
        'General Pinto',
        'General Viamonte',
        'Leandro N. Alem',
        'Lincoln',
        'Florentino Ameghino',
      ],
    },
    {
      id: 15,
      distritos: [
        'Alberti',
        'Bragado',
        'Carlos Casares',
        'Chivilcoy',
        'Nueve de Julio',
        'Pehuajó',
        'Hipólito Yrigoyen',
      ],
    },
    {
      id: 16,
      distritos: [
        'Carlos Tejedor',
        'General Villegas',
        'Trenque Lauquen',
        'Rivadavia',
        'Pellegrini',
        'Tres Lomas',
        'Salliquelo',
      ],
    },
    {
      id: 17,
      distritos: [
        'Chascomús',
        'General Belgrano',
        'General Paz',
        'Monte',
        'Pila',
        'Rauch',
        'Lezama',
      ],
    },
    {
      id: 18,
      distritos: [
        'Ayacucho',
        'Castelli',
        'Dolores',
        'Tordillo',
        'General Guido',
        'General Lavalle',
        'General Madariaga',
        'Maipu',
        'La Costa',
        'Pinamar',
        'Villa Gesell',
      ],
    },
    {
      id: 19,
      distritos: ['General Pueyrredón', 'Mar Chiquita', 'General Alvarado'],
    },
    {
      id: 20,
      distritos: ['Tandil', 'Balcarce', 'Lobería', 'Necochea', 'San Cayetano'],
    },
    {
      id: 21,
      distritos: [
        'Coronel Dorrego',
        'Coronel Pringles',
        'Gonzales Chaves',
        'Benito Juárez',
        'Laprida',
        'Tres Arroyos',
      ],
    },
    {
      id: 22,
      distritos: ['Bahía Blanca', 'Patagones', 'Villarino', 'Coronel Rosales', 'Monte Hermoso'],
    },
    {
      id: 23,
      distritos: [
        'Adolfo Alsina',
        'Daireaux',
        'Coronel Suárez',
        'General La Madrid',
        'Guaminí',
        'Puán',
        'Saavedra',
        'Tornquist',
      ],
    },
    {
      id: 24,
      distritos: [
        'Saladillo',
        'Lobos',
        'Roque Pérez',
        'Las Flores',
        'General Alvear',
        '25 de Mayo',
      ],
    },
    {
      id: 25,
      distritos: ['Bolívar', 'Olavarría', 'Azul', 'Tapalqué'],
    },
  ]

  let regionesCreadas = 0
  let regionesActualizadas = 0
  let distritosCreados = 0

  for (const regionData of regiones) {
    // Verificar si la región ya existe
    const regionExiste = await prisma.region.findUnique({
      where: { id: regionData.id },
      include: { distritos: true },
    })

    if (regionExiste) {
      console.log(
        `♻️  Región ${regionData.id} ya existe con ${regionExiste.distritos.length} distritos`,
      )
      regionesActualizadas++
      continue
    }

    // Crear región con sus distritos
    const region = await prisma.region.create({
      data: {
        id: regionData.id,
        distritos: {
          create: regionData.distritos.map((nombre) => ({
            nombre,
          })),
        },
      },
      include: {
        distritos: true,
      },
    })

    regionesCreadas++
    distritosCreados += region.distritos.length
    console.log(`✅ Región ${regionData.id} creada con ${region.distritos.length} distritos`)
  }

  // Resumen final
  const totalRegiones = await prisma.region.count()
  const totalDistritos = await prisma.distrito.count()

  console.log('\n📊 Resumen:')
  console.log(`   ✅ Regiones creadas: ${regionesCreadas}`)
  console.log(`   ♻️  Regiones ya existentes: ${regionesActualizadas}`)
  console.log(`   📍 Distritos creados: ${distritosCreados}`)
  console.log(`\n   📈 Total en base de datos:`)
  console.log(`      • Regiones: ${totalRegiones}`)
  console.log(`      • Distritos: ${totalDistritos}`)
  console.log('\n✅ Seed completado exitosamente')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('\n❌ Error ejecutando seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
