import { PrismaClient } from '@prisma/client'
import {
  BASE_CAMPOS_COMUNES,
  Campo,
  getPostituloIdByCodigo,
  upsertFormularioPrincipalByPostitulo,
} from './formularios.shared'

export async function upsertFormularioEA(prisma: PrismaClient) {
  const postituloId = await getPostituloIdByCodigo(prisma, 'EA')

  const campos: Campo[] = [
    ...BASE_CAMPOS_COMUNES,
    {
      id: 'posee_titulo_docente',
      label: 'Poseer titulo docente habilitante para la ensenanza en Educacion Secundaria.',
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
        'Estar en ejercicio en escuelas de Educacion Secundaria de la provincia de Buenos Aires al momento de la inscripcion.',
        'Ser integrante del equipo de gestion en escuelas de Educacion Secundaria de la provincia de Buenos Aires.',
        'Ser bibliotecario en ejercicio en escuelas secundarias de la provincia de Buenos Aires.',
      ],
    },
  ]

  return upsertFormularioPrincipalByPostitulo(prisma, {
    postituloId,
    nombre: 'Formulario - Educacion ambiental. Nuevas miradas y propuestas transversales para el aula',
    descripcion:
      'Formulario de inscripcion para el postitulo Educacion ambiental. Nuevas miradas y propuestas transversales para el aula',
    campos,
  })
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const formulario = await upsertFormularioEA(prisma)
    console.log(`Formulario EA actualizado/creado con ID: ${formulario.id}`)
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
