import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Buscar formulario EI
  const formulario = await prisma.formulario.findFirst({
    where: { nombre: 'Formulario - Enseñanza con imágenes' },
  })

  if (!formulario) {
    throw new Error('No se encontró el formulario EI')
  }

  // Parsear campos
  const campos = formulario.campos as any[]

  // --- 1) Actualizar requisitos_prioritarios ---
  const indexReq = campos.findIndex((c) => c.id === 'requisitos_prioritarios')

  if (indexReq === -1) {
    throw new Error('Campo "requisitos_prioritarios" no encontrado')
  }

  campos[indexReq] = {
    id: 'requisitos_prioritarios',
    type: 'select',
    label: '¿Cumple alguno de los requisitos prioritarios?',
    required: true,
    options: [
      'Ser docente de nivel secundario que se desempeñe o pueda desempeñarse en las áreas de Ciencias Sociales, Comunicación y Cultura, Formación Ciudadana, Prácticas del Lenguaje y Educación Artística.',
      'Ser docente de nivel superior de las áreas de Ciencias Sociales, Comunicación y Cultura, Formación Ciudadana, Prácticas del Lenguaje y Educación Artística.',
      'Estar en ejercicio al momento de la inscripción.',
      'Poseer entre 0 y 5 años de antigüedad en la docencia.',
      'No',
    ],
  }

  // --- 2) Agregar campos archivo (si no existen)
  const yaTieneDni = campos.some((c) => c.id === 'adjunto_dni')
  const yaTieneTitulo = campos.some((c) => c.id === 'adjunto_titulo')

  // Buscar posición después de distrito_residencia
  const indexDistrito = campos.findIndex((c) => c.id === 'distrito_residencia')
  const insertPos = indexDistrito !== -1 ? indexDistrito + 1 : campos.length

  const nuevosCampos: any[] = []

  if (!yaTieneDni) {
    nuevosCampos.push({
      id: 'adjunto_dni',
      label: 'Adjuntar DNI (PDF o JPG)',
      type: 'file',
      required: true,
    })
  }

  if (!yaTieneTitulo) {
    nuevosCampos.push({
      id: 'adjunto_titulo',
      label: 'Adjuntar título docente o tramo pedagógico (PDF o JPG)',
      type: 'file',
      required: true,
    })
  }

  // Insertar en el lugar correcto
  campos.splice(insertPos, 0, ...nuevosCampos)

  // --- 3) Guardar cambios ---
  await prisma.formulario.update({
    where: { id: formulario.id },
    data: { campos },
  })

  console.log('✅ Formulario EI actualizado correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
