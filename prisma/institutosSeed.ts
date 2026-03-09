import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed de institutos')

  const regiones = [
    {
      id: 1,
      distritos: [
        { nombre: 'La Plata', institutos: [{ nombre: 'ISFD N°17' }] },
        { nombre: 'Brandsen', institutos: [{ nombre: 'ISFDyT N°49' }] },
      ],
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
      distritos: [
        {
          nombre: 'La Matanza',
          institutos: [
            { nombre: 'ISFDyT N°46' },
            { nombre: 'ISFDyT N°105' },
            { nombre: 'ISFD N°106' },
          ],
        },
      ],
    },
    {
      id: 4,
      distritos: [{ nombre: 'Quilmes', institutos: [{ nombre: 'ISFDyT N°83' }] }],
    },
    {
      id: 5,
      distritos: [
        {
          nombre: 'Almirante Brown',
          institutos: [{ nombre: 'ISFD N°41' }, { nombre: 'ISFDyT N°53' }],
        },
      ],
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
      distritos: [
        { nombre: 'San Miguel', institutos: [{ nombre: 'ISFDyT N°42' }] },
        { nombre: 'Moreno', institutos: [{ nombre: 'ISFD N°110' }] },
      ],
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
      id: 12,
      distritos: [{ nombre: 'San Pedro', institutos: [{ nombre: 'ISFD N°119' }] }],
    },
    {
      id: 13,
      distritos: [{ nombre: 'Salto', institutos: [{ nombre: 'ISFDyT N°126' }] }],
    },
    {
      id: 14,
      distritos: [
        { nombre: 'Junín', institutos: [{ nombre: 'ISFD N°129' }, { nombre: 'ISFDyT N°20' }] },
      ],
    },
    {
      id: 15,
      distritos: [{ nombre: 'Pehuajó', institutos: [{ nombre: 'ISFDyT N°13' }] }],
    },
    {
      id: 16,
      distritos: [{ nombre: 'Trenque Lauquen', institutos: [{ nombre: 'ISFDyT N°40' }] }],
    },
    {
      id: 17,
      distritos: [{ nombre: 'Chascomús', institutos: [{ nombre: 'ISFDyT N°57' }] }],
    },
    {
      id: 19,
      distritos: [
        { nombre: 'General Pueyrredón', institutos: [{ nombre: 'ISFD N°19' }] },
        { nombre: 'Mar Chiquita', institutos: [{ nombre: 'ISFDyT N°63' }] },
        { nombre: 'General Alvarado', institutos: [{ nombre: 'ISFDyT N°81' }] },
      ],
    },
    {
      id: 20,
      distritos: [
        { nombre: 'Tandil', institutos: [{ nombre: 'ISFDyT N°10' }, { nombre: 'ISFDyT N°166' }] },
      ],
    },
    {
      id: 21,
      distritos: [{ nombre: 'Tres Arroyos', institutos: [{ nombre: 'ISFDyT N°33' }] }],
    },
    {
      id: 22,
      distritos: [
        { nombre: 'Bahía Blanca', institutos: [{ nombre: 'ISFD N°3' }] },
        { nombre: 'Patagones', institutos: [{ nombre: 'ISFDyT N°25' }] },
      ],
    },
    {
      id: 23,
      distritos: [{ nombre: 'Coronel Suárez', institutos: [{ nombre: 'ISFDyT N°48' }] }],
    },
    {
      id: 24,
      distritos: [{ nombre: 'Saladillo', institutos: [{ nombre: 'ISFD N°16' }] }],
    },
    {
      id: 25,
      distritos: [
        { nombre: 'Bolívar', institutos: [{ nombre: 'ISFDyT N°27' }] },
        { nombre: 'Olavarría', institutos: [{ nombre: 'ISFD N°22' }] },
      ],
    },
  ]

  let creados = 0
  let saltados = 0
  const distritosNoEncontrados: Array<{ regionId: number; nombre: string }> = []

  for (const region of regiones) {
    for (const d of region.distritos) {
      const distrito = await prisma.distrito.findFirst({
        where: { nombre: d.nombre, regionId: region.id },
        select: { id: true },
      })

      if (!distrito) {
        distritosNoEncontrados.push({ regionId: region.id, nombre: d.nombre })
        continue
      }

      for (const inst of d.institutos) {
        const existente = await prisma.instituto.findFirst({
          where: { nombre: inst.nombre, distritoId: distrito.id },
          select: { id: true },
        })

        if (existente) {
          saltados += 1
          continue
        }

        await prisma.instituto.create({
          data: {
            nombre: inst.nombre,
            distrito: { connect: { id: distrito.id } },
          },
        })
        creados += 1
      }
    }
  }

  console.log(`Institutos creados: ${creados}`)
  console.log(`Institutos ya existentes: ${saltados}`)

  if (distritosNoEncontrados.length > 0) {
    console.log('Distritos no encontrados:')
    for (const distrito of distritosNoEncontrados) {
      console.log(`- Region ${distrito.regionId} / ${distrito.nombre}`)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('Error en seed de institutos:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
