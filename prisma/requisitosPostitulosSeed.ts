import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const EXCLUYENTE_COMUN =
  'Presentar la documentacion respaldatoria que acredite el cumplimiento de los requisitos de admision.'

type RequisitosPayload = {
  excluyentes: string[]
  prioritarios: string[]
}

const REQUISITOS_POR_CODIGO: Record<string, RequisitosPayload> = {
  EA: {
    excluyentes: ['Poseer titulo docente habilitante para la ensenanza en Educacion Secundaria.'],
    prioritarios: [
      'Estar en ejercicio en escuelas de Educacion Secundaria de la provincia de Buenos Aires en el momento de la inscripcion.',
      'Ser integrante del equipo de gestion en escuelas de Educacion Secundaria de la provincia de Buenos Aires.',
      'Ser bibliotecario en ejercicio en las escuelas secundarias de la provincia de Buenos Aires.',
    ],
  },
  EI: {
    excluyentes: [
      'Poseer titulo docente o tramo pedagogico que habilite para el ejercicio de la docencia en los niveles y modalidades mencionados en el item Destinatarios.',
    ],
    prioritarios: [
      'Ser docente de nivel secundario que se desempene o pueda desempenarse en las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
      'Ser docente de nivel superior de las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
      'Estar en ejercicio al momento de la inscripcion.',
      'Poseer entre 0 y 5 anos de antiguedad en la docencia.',
    ],
  },
  EyCD: {
    excluyentes: ['Poseer titulo docente.'],
    prioritarios: ['Estar en ejercicio en el momento de la inscripcion.'],
  },
  IB: {
    excluyentes: [
      'Poseer titulo docente de Educacion Secundaria y/o de la Modalidad de Jovenes y Adultos.',
    ],
    prioritarios: [
      'Docentes graduados en profesorados de disciplinas de ciencias sociales o ciencias naturales en ejercicio en escuelas de Educacion Secundaria y de Jovenes y Adultos.',
      'Ser integrante del equipo de conduccion en escuelas de Educacion Secundaria de Jovenes y Adultos.',
      'Ser inspector de la Modalidad de Educacion Secundaria de Adultos.',
    ],
  },
}

const dedupe = (items: string[]) => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of items) {
    const value = String(raw || '').trim()
    if (!value) continue
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(value)
  }
  return result
}

async function main() {
  const postitulos = await prisma.postitulo.findMany({
    where: { codigo: { in: Object.keys(REQUISITOS_POR_CODIGO) } },
    select: { id: true, codigo: true, nombre: true },
  })

  const encontrados = new Set(postitulos.map((p) => String(p.codigo)))
  const faltantes = Object.keys(REQUISITOS_POR_CODIGO).filter((codigo) => !encontrados.has(codigo))
  if (faltantes.length > 0) {
    throw new Error(`No se encontraron postitulos para los codigos: ${faltantes.join(', ')}`)
  }

  for (const postitulo of postitulos) {
    const codigo = String(postitulo.codigo)
    const requisitos = REQUISITOS_POR_CODIGO[codigo]

    const payload = {
      excluyentes: dedupe([EXCLUYENTE_COMUN, ...requisitos.excluyentes]),
      prioritarios: dedupe(requisitos.prioritarios),
    }

    await prisma.postitulo.update({
      where: { id: postitulo.id },
      data: {
        requisitos: payload as unknown as Prisma.InputJsonValue,
      },
    })

    console.log(`Requisitos actualizados para ${codigo} (${postitulo.nombre})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

