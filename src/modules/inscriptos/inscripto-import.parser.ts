import { BadRequestError } from '../../errors/app-error'

export type ImportRow = {
  fila: number
  dni: string
  nombre: string
  apellido: string
  email: string | null
  celular: string | null
  resultado: 'IMPORTAR' | 'DUPLICADA' | 'INVALIDA'
  mensajes: string[]
  data: {
    nombre: string
    apellido: string
    dni: string
    email: string | null
    celular: string | null
    datosFormulario: Record<string, string | number | boolean>
    dniAdjuntoUrl: string | null
    tituloAdjuntoUrl: string | null
  }
}
export const normalizeCsvKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export function parseCsv(text: string): string[][] {
  text = text.replace(/^\uFEFF/, '')
  if (text.includes('\uFFFD')) throw new BadRequestError('El CSV debe estar codificado en UTF-8')
  let quoted = false,
    commas = 0,
    semicolons = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      if (quoted && text[i + 1] === '"') i++
      else quoted = !quoted
    } else if (!quoted) {
      if (text[i] === '\n' || text[i] === '\r') break
      if (text[i] === ',') commas++
      if (text[i] === ';') semicolons++
    }
  }
  const delimiter = semicolons > commas ? ';' : ','
  const rows: string[][] = []
  let row: string[] = [],
    cell = ''
  quoted = false
  const finishRow = () => {
    row.push(cell)
    rows.push(row)
    row = []
    cell = ''
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (quoted) quoted = false
      else if (!cell.trim()) quoted = true
      else throw new BadRequestError('El CSV tiene comillas fuera de lugar')
    } else if (!quoted && char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (!quoted && (char === '\r' || char === '\n')) {
      if (char === '\r' && text[i + 1] === '\n') i++
      finishRow()
    } else cell += char
  }
  if (quoted) throw new BadRequestError('El CSV tiene comillas sin cerrar')
  if (cell || row.length) finishRow()
  return rows
}

export function analyzeCsv(
  text: string,
  existing: Set<string>,
  distritos: Array<{ id: number; nombre: string; regionId: number }>,
  regiones: number[],
): ImportRow[] {
  const table = parseCsv(text)
  const headers = (table.shift() ?? []).map((h) => h.trim())
  const keys = headers.map(normalizeCsvKey)
  if (!headers.length || new Set(keys).size !== keys.length || keys.some((k) => !k))
    throw new BadRequestError('Los encabezados estan vacios o repetidos')
  const find = (...aliases: string[]) => keys.findIndex((k) => aliases.includes(k))
  const dniIndex = find('dni', 'documento', 'numero de documento')
  const nombreIndex = find('nombre', 'nombres')
  const apellidoIndex = find('apellido', 'apellidos')
  if ([dniIndex, nombreIndex, apellidoIndex].some((i) => i < 0))
    throw new BadRequestError('El CSV debe incluir DNI, Nombre y Apellido')
  if (table.length > 5000)
    throw new BadRequestError('El CSV admite hasta 5000 filas por importacion')
  const emailIndex = find('correo electronico', 'email', 'correo')
  const automaticEmailIndex = find('direccion de correo electronico')
  const celularIndex = find('celular de contacto', 'celular', 'telefono')
  const regionIndex = find('region de residencia', 'region residencia', 'region')
  const distritoIndex = find('distrito de residencia', 'distrito residencia', 'distrito')
  const tituloIndex = find('titulo docente', 'titulo docente o tramo pedagogico', 'titulo')
  const dniDocIndex = keys.findIndex((k) => k.startsWith('adjuntar dni'))
  const tituloDocIndex = keys.findIndex((k) => k.startsWith('adjuntar titulo'))
  const seen = new Set<string>()
  const results: ImportRow[] = []
  for (let index = 0; index < table.length; index++) {
    const cells = table[index]
    if (cells.every((cell) => !cell.trim())) continue
    const read = (i: number) => (i < 0 ? '' : (cells[i] ?? '').trim())
    const mensajes: string[] = []
    const errors: string[] = []
    const rawDni = read(dniIndex)
    const dni = rawDni.replace(/[.\s-]/g, '')
    const nombre = read(nombreIndex),
      apellido = read(apellidoIndex)
    if (!/^\d{6,12}$/.test(dni)) errors.push('DNI invalido: debe contener entre 6 y 12 digitos')
    if (!nombre) errors.push('Falta nombre')
    if (!apellido) errors.push('Falta apellido')
    if (cells.length !== headers.length)
      errors.push('La cantidad de columnas no coincide con el encabezado')
    let email: string | null = read(emailIndex) || read(automaticEmailIndex) || null
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mensajes.push('Email invalido: se conserva en las respuestas, sin asignarlo al contacto')
      email = null
    }
    const datos: Record<string, string | number | boolean> = Object.fromEntries(
      headers.map((header, i) => [header, read(i)]),
    )
    if (read(tituloIndex)) datos.titulo_docente = read(tituloIndex)
    const regionText = read(regionIndex)
    const region = Number(regionText.replace(/^region\s*/i, '').trim())
    const distritoText = read(distritoIndex)
    const distrito = distritos.find(
      (d) => normalizeCsvKey(d.nombre) === normalizeCsvKey(distritoText),
    )
    if (distrito) {
      datos.distrito_residencia = distrito.id
      datos.region_residencia = distrito.regionId
    } else {
      if (regiones.includes(region)) datos.region_residencia = region
      if (distritoText) mensajes.push('Distrito no reconocido: se conserva como texto para revisar')
    }
    if (distrito && regiones.includes(region) && distrito.regionId !== region)
      mensajes.push('Region y distrito no coinciden: se usa la region del distrito')
    for (const [header, key] of [
      ['se encuentra ejerciendo algun cargo actualmente', 'ejercicio_cargo_actual'],
      [
        'en que nivel se desempena seleccione el nivel en el cual posea mayor carga horaria',
        'nivel_desempenio',
      ],
      ['cumple alguno de los requisitos prioritarios', 'requisitos_prioritarios'],
    ] as const) {
      const i = find(header)
      if (read(i)) datos[key] = read(i)
    }
    const documentUrl = (i: number) => {
      const raw = read(i)
      if (!raw) return null
      const urls = raw.split(/,\s*(?=https?:\/\/)/i)
      try {
        if (
          !/^https?:\/\//i.test(urls[0]) ||
          !['http:', 'https:'].includes(new URL(urls[0]).protocol)
        )
          throw new Error()
        if (urls.length > 1)
          mensajes.push(
            'Hay varios enlaces en un adjunto: el boton abre el primero; todos se conservan en las respuestas',
          )
        return urls[0]
      } catch {
        mensajes.push('Enlace de adjunto invalido: se conserva como texto')
        return null
      }
    }
    const dniAdjuntoUrl = documentUrl(dniDocIndex),
      tituloAdjuntoUrl = documentUrl(tituloDocIndex)
    let resultado: ImportRow['resultado'] = errors.length ? 'INVALIDA' : 'IMPORTAR'
    if (!errors.length && (existing.has(dni) || seen.has(dni))) {
      resultado = 'DUPLICADA'
      mensajes.push(
        existing.has(dni)
          ? 'Ya existe una inscripcion para este DNI en la cohorte'
          : 'DNI repetido en este archivo',
      )
    }
    if (!errors.length) seen.add(dni)
    results.push({
      fila: index + 2,
      dni,
      nombre,
      apellido,
      email,
      celular: read(celularIndex) || null,
      resultado,
      mensajes: [...errors, ...mensajes],
      data: {
        dni,
        nombre,
        apellido,
        email,
        celular: read(celularIndex) || null,
        datosFormulario: datos,
        dniAdjuntoUrl,
        tituloAdjuntoUrl,
      },
    })
  }
  if (!results.length) throw new BadRequestError('El CSV no contiene inscripciones')
  return results
}
