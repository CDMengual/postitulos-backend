const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const workspaceRoot = process.cwd()
const mysqlshConfigHome = path.join(workspaceRoot, '.mysqlsh')
fs.mkdirSync(mysqlshConfigHome, { recursive: true })

const dbUri = 'root:1234@localhost:3306/postitulos'
const mysqlshPath = 'C:\\Program Files\\MySQL\\MySQL Shell 8.0\\bin\\mysqlsh.exe'
const targetCodes = ['EI', 'EyCD', 'EA', 'IB']
const targetYears = [2025, 2026]

const firstNames = [
  'Ana',
  'Juan',
  'Maria',
  'Luis',
  'Carla',
  'Pedro',
  'Lucia',
  'Martin',
  'Paula',
  'Diego',
  'Sofia',
  'Javier',
  'Marina',
  'Nicolas',
  'Camila',
  'Pablo',
  'Valeria',
  'Leandro',
  'Julieta',
  'Federico',
]

const lastNames = [
  'Gomez',
  'Perez',
  'Rodriguez',
  'Fernandez',
  'Lopez',
  'Diaz',
  'Sosa',
  'Romero',
  'Torres',
  'Suarez',
  'Acosta',
  'Herrera',
  'Castro',
  'Dominguez',
  'Molina',
  'Ramos',
  'Silva',
  'Vega',
  'Benitez',
  'Ibarra',
]

function runMysql(sql) {
  return execFileSync(mysqlshPath, ['--sql', '--uri', dbUri, '-e', sql], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      MYSQLSH_USER_CONFIG_HOME: mysqlshConfigHome,
    },
    encoding: 'utf8',
  })
}

function parseTabbed(output) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line && !line.startsWith('WARNING:'))

  if (lines.length < 2) return []

  const headers = lines[0].split('\t')
  return lines.slice(1).map((line) => {
    const values = line.split('\t')
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index]
      return acc
    }, {})
  })
}

function sqlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function getName(index) {
  return {
    nombre: firstNames[index % firstNames.length],
    apellido: `${lastNames[index % lastNames.length]}${Math.floor(index / lastNames.length)}`,
  }
}

function getEstadoInscripto(cohorte, order, assignedCount, extraCount) {
  if (order < assignedCount) return 'ASIGNADA'

  const extraOrder = order - assignedCount

  if (cohorte.anio === 2025) {
    const listaEsperaCount = Math.round(cohorte.cupos * 0.15)
    return extraOrder < listaEsperaCount ? 'LISTA_ESPERA' : 'RECHAZADA'
  }

  const pendienteCount = Math.round(cohorte.cupos * 0.1)
  const listaEsperaCount = Math.round(cohorte.cupos * 0.1)
  if (extraOrder < pendienteCount) return 'PENDIENTE'
  if (extraOrder < pendienteCount + listaEsperaCount) return 'LISTA_ESPERA'
  return 'RECHAZADA'
}

function getEstadoCursante(cohorte, assignedIndex, totalAssigned) {
  const ratio = assignedIndex / totalAssigned

  if (cohorte.anio === 2025) {
    return ratio < 0.78 ? 'FINALIZADO' : 'BAJA'
  }

  if (ratio < 0.72) return 'ACTIVO'
  if (ratio < 0.94) return 'ADEUDA'
  return 'BAJA'
}

function getDocumentacionForInscripto(estado) {
  if (estado === 'ASIGNADA') return 'VERIFICADA'
  if (estado === 'RECHAZADA') return 'NO_CORRESPONDE'
  return 'PENDIENTE'
}

function getDocumentacionForCursante(cohorte, estado) {
  if (cohorte.anio === 2025) return 'VERIFICADA'
  if (estado === 'ACTIVO') return 'VERIFICADA'
  if (estado === 'ADEUDA') return 'PENDIENTE'
  return 'VERIFICADA'
}

function getObservacionesInscripto(estado) {
  if (estado === 'LISTA_ESPERA') return 'Incripto en lista de espera'
  if (estado === 'RECHAZADA') return 'Inscripcion rechazada por cupo'
  if (estado === 'PENDIENTE') return 'Inscripcion pendiente de confirmacion'
  return null
}

function getObservacionesCursante(cohorte, estado) {
  if (cohorte.anio === 2025 && estado === 'BAJA') return 'Baja durante la cursada'
  if (cohorte.anio === 2026 && estado === 'ADEUDA') return 'Adeuda entregas parciales'
  if (cohorte.anio === 2026 && estado === 'BAJA') return 'Baja registrada en curso'
  return null
}

function buildDatosFormulario(cohorte, institutoId, order) {
  return JSON.stringify({
    experienciaDocente: `${2 + (order % 18)} anios`,
    modalidadPreferida: cohorte.codigo === 'EyCD' ? 'Virtual' : 'Mixta',
    institutoId,
  })
}

function generateData(cohortes, aulasByCohorte, instituteIdsByCohorte) {
  const inscriptos = []
  const cursantes = []
  const cursantesAula = []

  let globalIndex = 0

  for (const cohorte of cohortes) {
    const aulas = aulasByCohorte.get(cohorte.id) || []
    const instituteIds = instituteIdsByCohorte.get(cohorte.id) || []
    const assignedCount = cohorte.cupos
    const totalInscriptos = Math.round(cohorte.cupos * 1.25)

    for (let order = 0; order < totalInscriptos; order += 1) {
      const personIndex = globalIndex + order
      const { nombre, apellido } = getName(personIndex)
      const dni = `77${String(cohorte.id).padStart(2, '0')}${String(order + 1).padStart(5, '0')}`
      const email = `${cohorte.codigo.toLowerCase()}${cohorte.anio}.${order + 1}@test.postitulos.local`
      const celular = `11${String(70000000 + personIndex).slice(-8)}`
      const institutoId =
        order < assignedCount
          ? aulas[Math.floor(order / 60)].institutoId
          : instituteIds[order % instituteIds.length]
      const estadoInscripto = getEstadoInscripto(
        cohorte,
        order,
        assignedCount,
        totalInscriptos - assignedCount,
      )

      inscriptos.push({
        cohorteId: cohorte.id,
        institutoId,
        nombre,
        apellido,
        dni,
        email,
        celular,
        datosFormulario: buildDatosFormulario(cohorte, institutoId, order),
        estado: estadoInscripto,
        prioridad: order + 1,
        condicionada: 0,
        observaciones: getObservacionesInscripto(estadoInscripto),
        documentacion: getDocumentacionForInscripto(estadoInscripto),
      })

      if (estadoInscripto === 'ASIGNADA') {
        const aula = aulas[Math.floor(order / 60)]
        const estadoCursante = getEstadoCursante(cohorte, order, assignedCount)

        cursantes.push({
          dni,
          nombre,
          apellido,
          email,
          celular,
          titulo: 'Profesor/a',
        })

        cursantesAula.push({
          dni,
          aulaId: aula.id,
          estado: estadoCursante,
          documentacion: getDocumentacionForCursante(cohorte, estadoCursante),
          observaciones: getObservacionesCursante(cohorte, estadoCursante),
        })
      }
    }

    globalIndex += totalInscriptos
  }

  return { inscriptos, cursantes, cursantesAula }
}

function main() {
  const cohortes = parseTabbed(
    runMysql(`SELECT c.id, c.anio, c.cupos, p.codigo
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE p.codigo IN ('${targetCodes.join("','")}')
  AND c.anio IN (${targetYears.join(', ')})
ORDER BY c.id;`),
  ).map((row) => ({
    id: Number(row.id),
    anio: Number(row.anio),
    cupos: Number(row.cupos),
    codigo: row.codigo,
  }))

  const aulas = parseTabbed(
    runMysql(`SELECT a.id, a.numero, a.cohorteId, a.institutoId
FROM aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE p.codigo IN ('${targetCodes.join("','")}')
  AND c.anio IN (${targetYears.join(', ')})
ORDER BY a.cohorteId, a.numero;`),
  ).map((row) => ({
    id: Number(row.id),
    numero: Number(row.numero),
    cohorteId: Number(row.cohorteId),
    institutoId: Number(row.institutoId),
  }))

  const cohortInstitutes = parseTabbed(
    runMysql(`SELECT cohorteId, institutoId
FROM cohorteinstituto
WHERE cohorteId IN (${cohortes.map((item) => item.id).join(', ')})
ORDER BY cohorteId, institutoId;`),
  ).map((row) => ({
    cohorteId: Number(row.cohorteId),
    institutoId: Number(row.institutoId),
  }))

  const aulasByCohorte = new Map()
  for (const aula of aulas) {
    const current = aulasByCohorte.get(aula.cohorteId) || []
    current.push(aula)
    aulasByCohorte.set(aula.cohorteId, current)
  }

  const instituteIdsByCohorte = new Map()
  for (const item of cohortInstitutes) {
    const current = instituteIdsByCohorte.get(item.cohorteId) || []
    current.push(item.institutoId)
    instituteIdsByCohorte.set(item.cohorteId, current)
  }

  const { inscriptos, cursantes, cursantesAula } = generateData(
    cohortes,
    aulasByCohorte,
    instituteIdsByCohorte,
  )

  const sqlParts = []

  sqlParts.push(`DELETE ca
FROM cursanteaula ca
JOIN aula a ON a.id = ca.aulaId
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE p.codigo IN ('${targetCodes.join("','")}')
  AND c.anio IN (${targetYears.join(', ')});`)

  sqlParts.push(`DELETE i
FROM inscripto i
WHERE i.cohorteId IN (${cohortes.map((item) => item.id).join(', ')});`)

  sqlParts.push(`DELETE FROM cursante
WHERE dni LIKE '77%';`)

  for (const group of chunk(cursantes, 300)) {
    sqlParts.push(`INSERT INTO cursante (nombre, apellido, dni, email, celular, titulo, regionId, distritoId, createdAt, updatedAt)
VALUES
${group
  .map(
    (item) =>
      `('${sqlEscape(item.nombre)}', '${sqlEscape(item.apellido)}', '${item.dni}', '${sqlEscape(
        item.email,
      )}', '${sqlEscape(item.celular)}', '${sqlEscape(item.titulo)}', NULL, NULL, NOW(), NOW())`,
  )
  .join(',\n')};`)
  }

  for (const group of chunk(inscriptos, 300)) {
    sqlParts.push(`INSERT INTO inscripto (
  cohorteId, institutoId, nombre, apellido, dni, email, celular, datosFormulario,
  dniAdjuntoUrl, tituloAdjuntoUrl, estado, prioridad, condicionada, observaciones,
  documentacion, createdAt, updatedAt
)
VALUES
${group
  .map(
    (item) =>
      `(${item.cohorteId}, ${item.institutoId}, '${sqlEscape(item.nombre)}', '${sqlEscape(
        item.apellido,
      )}', '${item.dni}', '${sqlEscape(item.email)}', '${sqlEscape(item.celular)}',
       '${sqlEscape(item.datosFormulario)}', NULL, NULL, '${item.estado}', ${item.prioridad},
       ${item.condicionada}, ${
         item.observaciones ? `'${sqlEscape(item.observaciones)}'` : 'NULL'
       }, '${item.documentacion}', NOW(), NOW())`,
  )
  .join(',\n')};`)
  }

  for (const group of chunk(cursantesAula, 300)) {
    sqlParts.push(`INSERT INTO cursanteaula (
  cursanteId, aulaId, estado, documentacion, dniAdjuntoUrl, tituloAdjuntoUrl, observaciones, createdAt, updatedAt
)
SELECT c.id, data.aulaId, data.estado, data.documentacion, NULL, NULL, data.observaciones, NOW(), NOW()
FROM (
${group
  .map(
    (item, index) =>
      `${index === 0 ? 'SELECT' : 'UNION ALL SELECT'} '${item.dni}' AS dni, ${item.aulaId} AS aulaId, '${
        item.estado
      }' AS estado, '${item.documentacion}' AS documentacion, ${
        item.observaciones ? `'${sqlEscape(item.observaciones)}'` : 'NULL'
      } AS observaciones`,
  )
  .join('\n')}
) data
JOIN cursante c ON c.dni = data.dni;`)
  }

  const outputPath = path.join(workspaceRoot, 'scripts', 'seed-inscriptos-cursantes-2025-2026.generated.sql')
  fs.writeFileSync(outputPath, `${sqlParts.join('\n\n')}\n`, 'utf8')

  execFileSync(mysqlshPath, ['--sql', '--uri', dbUri, '-f', outputPath], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      MYSQLSH_USER_CONFIG_HOME: mysqlshConfigHome,
    },
  })

  console.log(`SQL ejecutado: ${outputPath}`)
  console.log(`Inscriptos generados: ${inscriptos.length}`)
  console.log(`Cursantes generados: ${cursantes.length}`)
  console.log(`Relaciones cursante-aula generadas: ${cursantesAula.length}`)
}

main()
