import { formularioRepository } from './formulario.repository'

const CAMPO_TITULO_DOCENTE = {
  id: 'titulo_docente_tramo_pedagogico',
  label: 'Titulo docente o tramo pedagogico',
  type: 'text',
  required: false,
}

const normalizeKey = (key: string) => key.trim().toLowerCase()

const ensureCampoTituloDocente = (camposRaw: unknown) => {
  if (!Array.isArray(camposRaw)) return camposRaw

  const idsPermitidos = new Set([
    'titulo_docente_tramo_pedagogico',
    'titulo_docente_o_tramo_pedagogico',
    'titulo_docente',
    'titulo_tramo_pedagogico',
  ])

  const camposSinTitulo = camposRaw.filter((campo) => {
    if (!campo || typeof campo !== 'object' || Array.isArray(campo)) return false
    const id = (campo as Record<string, unknown>).id
    return !(typeof id === 'string' && idsPermitidos.has(normalizeKey(id)))
  })

  const indexDistrito = camposSinTitulo.findIndex((campo) => {
    if (!campo || typeof campo !== 'object' || Array.isArray(campo)) return false
    const id = (campo as Record<string, unknown>).id
    return typeof id === 'string' && normalizeKey(id) === 'distrito_residencia'
  })

  if (indexDistrito >= 0) {
    return [
      ...camposSinTitulo.slice(0, indexDistrito + 1),
      CAMPO_TITULO_DOCENTE,
      ...camposSinTitulo.slice(indexDistrito + 1),
    ]
  }

  return [...camposSinTitulo, CAMPO_TITULO_DOCENTE]
}

const extractRequisitos = (camposRaw: unknown) => {
  if (!Array.isArray(camposRaw)) {
    return { excluyentes: [] as string[], prioritarios: [] as string[] }
  }

  const byId = (id: string) =>
    camposRaw.find((campo) => {
      if (!campo || typeof campo !== 'object' || Array.isArray(campo)) return false
      const value = (campo as Record<string, unknown>).id
      return typeof value === 'string' && normalizeKey(value) === normalizeKey(id)
    }) as Record<string, unknown> | undefined

  const campoExcluyente = byId('posee_titulo_docente')
  const excluyenteLabel =
    campoExcluyente && typeof campoExcluyente.label === 'string'
      ? campoExcluyente.label.trim()
      : ''

  const campoPrioritarios = byId('requisitos_prioritarios')
  const prioritarios = Array.isArray(campoPrioritarios?.options)
    ? campoPrioritarios.options
        .map((item) => String(item || '').trim())
        .filter((item) => item.length > 0)
    : []

  return {
    excluyentes: excluyenteLabel ? [excluyenteLabel] : [],
    prioritarios,
  }
}

export const formularioService = {
  async getAll(postituloId?: number) {
    const formularios = await formularioRepository.findMany(postituloId)

    return formularios.map((formulario: any) => {
      const campos = ensureCampoTituloDocente(formulario.campos)
      return {
        ...formulario,
        campos,
        requisitos: extractRequisitos(campos),
      }
    })
  },

  async getById(id: number) {
    const formulario = await formularioRepository.findById(id)

    if (!formulario) return null

    const campos = ensureCampoTituloDocente(formulario.campos)

    return {
      ...formulario,
      campos,
      requisitos: extractRequisitos(campos),
    }
  },
}
