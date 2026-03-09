function parseArgs(argv) {
  const args = {}

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i]
    if (!current.startsWith('--')) continue

    const [rawKey, inlineValue] = current.slice(2).split('=')
    const key = rawKey.trim()
    const next = argv[i + 1]

    if (inlineValue !== undefined) {
      args[key] = inlineValue
      continue
    }

    if (!next || next.startsWith('--')) {
      args[key] = 'true'
      continue
    }

    args[key] = next
    i += 1
  }

  return args
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseUbicaciones(value) {
  if (!value) {
    return [
      { regionId: 1, distritoId: 21 },
      { regionId: 3, distritoId: 30 },
      { regionId: 7, distritoId: 44 },
    ]
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [regionRaw, distritoRaw] = item.split(':')
      const regionId = toInt(regionRaw, NaN)
      const distritoId = toInt(distritoRaw, NaN)

      if (!Number.isFinite(regionId) || !Number.isFinite(distritoId)) {
        throw new Error(
          'Formato invalido en --ubicaciones. Use regionId:distritoId,regionId:distritoId',
        )
      }

      return { regionId, distritoId }
    })
}

function buildPayload(index, dni, ubicacion) {
  const variantesPrioridad = [
    {
      nivelDesempenio: 'Nivel secundario',
      antiguedad: '3',
      requisitosPrioritarios: [
        'Ser docente de nivel secundario que se desempene o pueda desempenarse en las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
        'Estar en ejercicio al momento de la inscripcion.',
        'Poseer entre 0 y 5 anos de antiguedad en la docencia.',
      ],
    },
    {
      nivelDesempenio: 'Nivel secundario',
      antiguedad: '8',
      requisitosPrioritarios: [
        'Ser docente de nivel secundario que se desempene o pueda desempenarse en las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
        'Estar en ejercicio al momento de la inscripcion.',
      ],
    },
    {
      nivelDesempenio: 'Nivel superior',
      antiguedad: '2',
      requisitosPrioritarios: [
        'Ser docente de nivel superior de las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
        'Poseer entre 0 y 5 anos de antiguedad en la docencia.',
      ],
    },
    {
      nivelDesempenio: 'Nivel primario',
      antiguedad: '12',
      requisitosPrioritarios: [],
    },
    {
      nivelDesempenio: 'Nivel secundario',
      antiguedad: '1',
      requisitosPrioritarios: ['Estar en ejercicio al momento de la inscripcion.'],
    },
    {
      nivelDesempenio: 'Nivel superior',
      antiguedad: '5',
      requisitosPrioritarios: [
        'Ser docente de nivel superior de las areas de Ciencias Sociales, Comunicacion y Cultura, Formacion Ciudadana, Practicas del Lenguaje y Educacion Artistica.',
      ],
    },
  ]
  const variante = variantesPrioridad[index % variantesPrioridad.length]

  return {
    nombre: `Test${index + 1}`,
    apellido: 'CargaEI',
    dni: String(dni),
    email: `test.ei.${dni}@example.test`,
    celular: `11${String(10000000 + index).slice(-8)}`,
    datosFormulario: {
      dni: String(dni),
      nombre: `Test${index + 1}`,
      apellido: 'CargaEI',
      email: `test.ei.${dni}@example.test`,
      celular: `11${String(10000000 + index).slice(-8)}`,
      region_residencia: ubicacion.regionId,
      distrito_residencia: ubicacion.distritoId,
      nivel_desempenio: variante.nivelDesempenio,
      antiguedad_docente: variante.antiguedad,
      titulo_docente_tramo_pedagogico: 'Profesor/a de prueba',
      posee_titulo_docente: true,
      requisitos_prioritarios: variante.requisitosPrioritarios,
    },
  }
}

async function postInscripcion(baseUrl, cohorteId, payload) {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, '')}/api/public/cohortes/${cohorteId}/inscripciones`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  let body = null
  try {
    body = await response.json()
  } catch (_) {
    body = null
  }

  return {
    status: response.status,
    ok: response.ok,
    body,
  }
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0

  async function next() {
    const current = cursor
    cursor += 1
    if (current >= items.length) return

    results[current] = await worker(items[current], current)
    await next()
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => next())
  await Promise.all(workers)
  return results
}

function summarize(results) {
  const summary = {
    total: results.length,
    created: 0,
    estadoListaEspera: 0,
    rechazadasPorCupo: 0,
    duplicadas: 0,
    badRequest: 0,
    serverError: 0,
    other: 0,
  }

  for (const result of results) {
    if (result.status === 201) {
      summary.created += 1
      if (result.body?.data?.estado === 'LISTA_ESPERA') {
        summary.estadoListaEspera += 1
      }
      continue
    }

    if (
      result.status === 400 &&
      result.body?.message === 'La cohorte no tiene cupos disponibles'
    ) {
      summary.rechazadasPorCupo += 1
      continue
    }

    if (
      result.status === 409 &&
      result.body?.details?.appCode === 'INSCRIPCION_DUPLICADA_COHORTE_DNI'
    ) {
      summary.duplicadas += 1
      continue
    }

    if (result.status === 400) {
      summary.badRequest += 1
      continue
    }

    if (result.status >= 500) {
      summary.serverError += 1
      continue
    }

    summary.other += 1
  }

  return summary
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const baseUrl = String(args['base-url'] || 'http://localhost:3000')
  const cohorteId = toInt(args['cohorte-id'], NaN)
  const total = toInt(args.total, 350)
  const concurrency = toInt(args.concurrency, 50)
  const startDni = toInt(args['start-dni'], 40000000)
  const ubicaciones = parseUbicaciones(args.ubicaciones)

  if (!Number.isFinite(cohorteId)) {
    throw new Error('Debe indicar --cohorte-id')
  }

  if (typeof fetch !== 'function') {
    throw new Error('Este script requiere una version de Node con fetch global disponible')
  }

  const items = Array.from({ length: total }, (_, index) => ({
    index,
    dni: startDni + index,
  }))

  console.log(
    `Enviando ${total} inscripciones EI a cohorte ${cohorteId} con concurrencia ${concurrency} sobre ${baseUrl}`,
  )

  const startedAt = Date.now()
  const results = await runPool(items, concurrency, async (item) => {
    const ubicacion = ubicaciones[item.index % ubicaciones.length]
    const payload = buildPayload(item.index, item.dni, ubicacion)
    const result = await postInscripcion(baseUrl, cohorteId, payload)

    const estado = result.body?.data?.estado ?? '-'
    const message = result.body?.message || result.body?.error || ''

    console.log(
      `[${item.index + 1}/${total}] dni=${item.dni} region=${ubicacion.regionId} distrito=${ubicacion.distritoId} status=${result.status} estado=${estado} ${message}`,
    )

    return {
      ...result,
      dni: item.dni,
    }
  })
  const elapsedMs = Date.now() - startedAt

  const summary = summarize(results)
  console.log('')
  console.log('Resumen')
  console.log(JSON.stringify({ ...summary, elapsedMs }, null, 2))

  const unexpected = results.filter(
    (result) =>
      !(
        result.status === 201 ||
        (result.status === 400 && result.body?.message === 'La cohorte no tiene cupos disponibles') ||
        (result.status === 409 &&
          result.body?.details?.appCode === 'INSCRIPCION_DUPLICADA_COHORTE_DNI')
      ),
  )

  if (unexpected.length > 0) {
    console.log('')
    console.log('Casos inesperados')
    for (const item of unexpected.slice(0, 20)) {
      console.log(
        JSON.stringify(
          {
            dni: item.dni,
            status: item.status,
            body: item.body,
          },
          null,
          2,
        ),
      )
    }
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
