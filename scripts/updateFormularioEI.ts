import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CAMPO_REQUISITOS_PRIORITARIOS = {
  id: 'requisitos_prioritarios',
  type: 'select',
  label: 'Seleccione uno o mas requisitos prioritarios que cumple:',
  multiple: true,
  required: true,
  options: [
    'Ser docente de nivel secundario que se desempeñe o pueda desempeñarse en las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
    'Ser docente de nivel superior de las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
    'Estar en ejercicio al momento de la inscripcion.',
    'Poseer entre 0 y 5 años de antigüedad en la docencia.',
  ],
}

async function main() {
  const postituloEI = await prisma.postitulo.findFirst({
    where: { codigo: 'EI' },
    select: { id: true },
  })

  if (!postituloEI) {
    throw new Error('No se encontro el postitulo EI')
  }

  const formularios = await prisma.formulario.findMany({
    where: { postituloId: postituloEI.id },
    select: { id: true, nombre: true, campos: true },
  })

  if (formularios.length === 0) {
    throw new Error('No se encontro formulario para EI')
  }

  for (const formulario of formularios) {
    const campos = Array.isArray(formulario.campos) ? [...(formulario.campos as any[])] : []

    const indexReq = campos.findIndex((c) => c.id === 'requisitos_prioritarios')
    if (indexReq === -1) {
      campos.push(CAMPO_REQUISITOS_PRIORITARIOS)
    } else {
      campos[indexReq] = CAMPO_REQUISITOS_PRIORITARIOS
    }

    const indexEjercicio = campos.findIndex((c) => c.id === 'ejercicio_cargo_actual')
    if (indexEjercicio !== -1) {
      campos.splice(indexEjercicio, 1)
    }

    const yaTieneDni = campos.some((c) => c.id === 'adjunto_dni')
    const yaTieneTitulo = campos.some((c) => c.id === 'adjunto_titulo')

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
        label: 'Adjuntar titulo docente o tramo pedagogico (PDF o JPG)',
        type: 'file',
        required: true,
      })
    }

    if (nuevosCampos.length > 0) {
      campos.splice(insertPos, 0, ...nuevosCampos)
    }

    await prisma.formulario.update({
      where: { id: formulario.id },
      data: { campos },
    })

    console.log(`Formulario EI actualizado: ${formulario.nombre} (id=${formulario.id})`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
