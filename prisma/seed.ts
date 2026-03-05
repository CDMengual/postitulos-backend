import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 🔹 Buscamos el postítulo EI (podés ajustar el where según tu caso)
  const postituloEI = await prisma.postitulo.findFirst({
    where: { codigo: 'EI' },
  })

  if (!postituloEI) {
    throw new Error('No se encontró el postítulo con código EI')
  }

  // 🔹 Creamos el formulario base para el postítulo EI
  const formularioEI = await prisma.formulario.create({
    data: {
      nombre: 'Formulario - Enseñanza con imágenes',
      descripcion: 'Formulario de inscripción para el postítulo Enseñanza con imágenes',
      postituloId: postituloEI.id,
      campos: [
        // Bloque general
        { id: 'dni', label: 'DNI', type: 'text', required: true },
        { id: 'nombre', label: 'Nombre', type: 'text', required: true },
        { id: 'apellido', label: 'Apellido', type: 'text', required: true },
        {
          id: 'email',
          label: 'Correo electrónico',
          type: 'email',
          required: true,
        },
        {
          id: 'celular',
          label: 'Celular de contacto',
          type: 'text',
          required: false,
        },
        {
          id: 'region_residencia',
          label: 'Región de residencia (número del 1 al 25)',
          type: 'number',
          required: true,
        },
        {
          id: 'distrito_residencia',
          label: 'Distrito de residencia',
          type: 'select',
          required: true,
        },

        // Bloque específico del postítulo
        {
          id: 'posee_titulo_docente',
          label:
            '¿Posee título docente o tramo pedagógico que habilite para el ejercicio de la docencia en los niveles y modalidades mencionados en el ítem "Destinatarios"?',
          type: 'boolean',
          required: true,
        },
        {
          id: 'nivel_desempenio',
          label:
            '¿En qué nivel se desempeña? (Seleccione el nivel en el cual posea mayor carga horaria)',
          type: 'select',
          required: true,
        },
        {
          id: 'requisitos_prioritarios',
          label: 'Seleccione uno o más requisitos prioritarios que cumple:',
          type: 'select',
          multiple: true,
          required: true,
          options: [
            'Ser docente de nivel secundario que se desempeñe o pueda desempeñarse en las áreas de Ciencias Sociales, Comunicación y Cultura, Formación Ciudadana, Prácticas del Lenguaje y Educación Artística.',
            'Ser docente de nivel superior de las áreas de Ciencias Sociales, Comunicación y Cultura, Formación Ciudadana, Prácticas del Lenguaje y Educación Artística.',
            'Estar en ejercicio al momento de la inscripción.',
            'Poseer entre 0 y 5 años de antigüedad en la docencia.',
          ],
        },
      ],
    },
  })

  console.log(`✅ Formulario EI creado con ID: ${formularioEI.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
