import { PrismaClient } from '@prisma/client'

export type Campo = {
  id: string
  label: string
  type: string
  required: boolean
  multiple?: boolean
  options?: string[]
}

export const BASE_CAMPOS_COMUNES: Campo[] = [
  { id: 'dni', label: 'DNI', type: 'text', required: true },
  { id: 'nombre', label: 'Nombre', type: 'text', required: true },
  { id: 'apellido', label: 'Apellido', type: 'text', required: true },
  { id: 'email', label: 'Correo electronico', type: 'email', required: true },
  { id: 'celular', label: 'Celular de contacto', type: 'text', required: true },
  { id: 'distrito_residencia', label: 'Distrito de residencia', type: 'select', required: true },
  {
    id: 'titulo_docente_tramo_pedagogico',
    label: 'Titulo docente o tramo pedagogico',
    type: 'text',
    required: false,
  },
  {
    id: 'nivel_desempenio',
    label: 'En que nivel se desempena? Seleccione el nivel en que posee mayor carga horaria.',
    type: 'select',
    required: false,
  },
  { id: 'dni_adjunto', label: 'Carga de DNI', type: 'file', required: true },
  { id: 'titulo_adjunto', label: 'Carga de titulo', type: 'file', required: true },
]

export async function getPostituloIdByCodigo(prisma: PrismaClient, codigo: string) {
  const postitulo = await prisma.postitulo.findFirst({
    where: { codigo },
    select: { id: true },
  })

  if (!postitulo) {
    throw new Error(`No se encontro el postitulo con codigo ${codigo}`)
  }

  return postitulo.id
}

export async function upsertFormularioPrincipalByPostitulo(
  prisma: PrismaClient,
  params: {
    postituloId: number
    nombre: string
    descripcion: string
    campos: Campo[]
  },
) {
  const existente = await prisma.formulario.findFirst({
    where: { postituloId: params.postituloId },
    orderBy: { id: 'asc' },
    select: { id: true },
  })

  if (existente) {
    return prisma.formulario.update({
      where: { id: existente.id },
      data: {
        nombre: params.nombre,
        descripcion: params.descripcion,
        campos: params.campos,
      },
    })
  }

  return prisma.formulario.create({
    data: {
      postituloId: params.postituloId,
      nombre: params.nombre,
      descripcion: params.descripcion,
      campos: params.campos,
    },
  })
}
