import { PrismaClient } from '@prisma/client'
import {
  BASE_CAMPOS_COMUNES,
  Campo,
  getPostituloIdByCodigo,
  upsertFormularioPrincipalByPostitulo,
} from './formularios.shared'

export async function upsertFormularioEI(prisma: PrismaClient) {
  const postituloId = await getPostituloIdByCodigo(prisma, 'EI')

  const campos: Campo[] = [
    ...BASE_CAMPOS_COMUNES,
    {
      id: 'posee_titulo_docente',
      label:
        'Poseer titulo docente o tramo pedagogico que habilite para el ejercicio de la docencia en los niveles y modalidades mencionados en destinatarios.',
      type: 'boolean',
      required: true,
    },
    {
      id: 'requisitos_prioritarios',
      label: 'Seleccion de requisitos prioritarios',
      type: 'select',
      multiple: true,
      required: false,
      options: [
        'Ser docente de nivel secundario que se desempene o pueda desempenarse en las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
        'Ser docente de nivel superior de las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
        'Estar en ejercicio al momento de la inscripcion.',
        'Poseer entre 0 y 5 anos de antiguedad en la docencia.',
      ],
    },
  ]

  return upsertFormularioPrincipalByPostitulo(prisma, {
    postituloId,
    nombre: 'Formulario - Ensenanza con imagenes',
    descripcion: 'Formulario de inscripcion para el postitulo Ensenanza con imagenes',
    campos,
  })
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const formulario = await upsertFormularioEI(prisma)
    console.log(`Formulario EI actualizado/creado con ID: ${formulario.id}`)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
