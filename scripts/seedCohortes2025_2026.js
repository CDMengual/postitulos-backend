const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const workspaceRoot = process.cwd()
const mysqlshConfigHome = path.join(workspaceRoot, '.mysqlsh')
fs.mkdirSync(mysqlshConfigHome, { recursive: true })

const dbUri = 'root:1234@localhost:3306/postitulos'

const cohortes = [
  {
    codigo: 'EI',
    nombreCohorte: 'EI-2025',
    anio: 2025,
    estado: 'FINALIZADA',
    fechaInicio: '2025-03-10 00:00:00',
    fechaFin: '2025-11-30 23:59:59',
    fechaInicioInscripcion: '2025-02-01 00:00:00',
    fechaFinInscripcion: '2025-03-01 23:59:59',
    cupos: 480,
  },
  {
    codigo: 'EI',
    nombreCohorte: 'EI-2026',
    anio: 2026,
    estado: 'ACTIVA',
    fechaInicio: '2026-03-10 00:00:00',
    fechaFin: '2026-11-30 23:59:59',
    fechaInicioInscripcion: '2026-02-01 00:00:00',
    fechaFinInscripcion: '2026-03-01 23:59:59',
    cupos: 480,
  },
  {
    codigo: 'EyCD',
    nombreCohorte: 'EyCD-2025',
    anio: 2025,
    estado: 'FINALIZADA',
    fechaInicio: '2025-03-10 00:00:00',
    fechaFin: '2025-11-30 23:59:59',
    fechaInicioInscripcion: '2025-02-01 00:00:00',
    fechaFinInscripcion: '2025-03-01 23:59:59',
    cupos: 960,
  },
  {
    codigo: 'EyCD',
    nombreCohorte: 'EyCD-2026',
    anio: 2026,
    estado: 'ACTIVA',
    fechaInicio: '2026-03-10 00:00:00',
    fechaFin: '2026-11-30 23:59:59',
    fechaInicioInscripcion: '2026-02-01 00:00:00',
    fechaFinInscripcion: '2026-03-01 23:59:59',
    cupos: 960,
  },
  {
    codigo: 'EA',
    nombreCohorte: 'EA-2025',
    anio: 2025,
    estado: 'FINALIZADA',
    fechaInicio: '2025-03-10 00:00:00',
    fechaFin: '2025-11-30 23:59:59',
    fechaInicioInscripcion: '2025-02-01 00:00:00',
    fechaFinInscripcion: '2025-03-01 23:59:59',
    cupos: 480,
  },
  {
    codigo: 'EA',
    nombreCohorte: 'EA-2026',
    anio: 2026,
    estado: 'INSCRIPCION',
    fechaInicio: '2026-03-10 00:00:00',
    fechaFin: '2026-11-30 23:59:59',
    fechaInicioInscripcion: '2026-02-01 00:00:00',
    fechaFinInscripcion: '2026-03-15 23:59:59',
    cupos: 480,
  },
  {
    codigo: 'IB',
    nombreCohorte: 'IB-2025',
    anio: 2025,
    estado: 'FINALIZADA',
    fechaInicio: '2025-03-10 00:00:00',
    fechaFin: '2025-11-30 23:59:59',
    fechaInicioInscripcion: '2025-02-01 00:00:00',
    fechaFinInscripcion: '2025-03-01 23:59:59',
    cupos: 240,
  },
  {
    codigo: 'IB',
    nombreCohorte: 'IB-2026',
    anio: 2026,
    estado: 'ACTIVA',
    fechaInicio: '2026-03-10 00:00:00',
    fechaFin: '2026-11-30 23:59:59',
    fechaInicioInscripcion: '2026-02-01 00:00:00',
    fechaFinInscripcion: '2026-03-01 23:59:59',
    cupos: 240,
  },
]

const institutosConReferente = [
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 48, 49, 50, 51,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 79,
]

function sqlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

const sqlParts = []

for (const cohorte of cohortes) {
  const cantidadAulas = cohorte.cupos / 60
  sqlParts.push(`INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  ${cohorte.anio},
  '${cohorte.nombreCohorte}',
  '${cohorte.fechaInicio}',
  '${cohorte.fechaFin}',
  '${cohorte.estado}',
  '${cohorte.fechaInicioInscripcion}',
  '${cohorte.fechaFinInscripcion}',
  p.id,
  NULL,
  ${cantidadAulas},
  ${cohorte.cupos},
  0,
  ${cohorte.cupos},
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = '${cohorte.codigo}'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = ${cohorte.anio}
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = '${cohorte.nombreCohorte}',
    c.fechaInicio = '${cohorte.fechaInicio}',
    c.fechaFin = '${cohorte.fechaFin}',
    c.estado = '${cohorte.estado}',
    c.fechaInicioInscripcion = '${cohorte.fechaInicioInscripcion}',
    c.fechaFinInscripcion = '${cohorte.fechaFinInscripcion}',
    c.cantidadAulas = ${cantidadAulas},
    c.cupos = ${cohorte.cupos},
    c.cuposListaEspera = 0,
    c.cuposTotales = ${cohorte.cupos},
    c.updatedAt = NOW()
WHERE c.anio = ${cohorte.anio}
  AND p.codigo = '${cohorte.codigo}';`)
}

sqlParts.push(`
INSERT IGNORE INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, i.id
FROM cohorte c
JOIN instituto i ON i.id IN (${institutosConReferente.join(', ')})
JOIN postitulo p ON p.id = c.postituloId
WHERE (c.anio = 2025 OR c.anio = 2026)
  AND p.codigo IN ('EI', 'EyCD', 'EA', 'IB');
`)

sqlParts.push(`
DELETE a, ra, aa
FROM aula a
LEFT JOIN _referenteaulas ra ON ra.A = a.id
LEFT JOIN _adminaulas aa ON aa.A = a.id
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo IN ('EI', 'EyCD', 'EA', 'IB');
`)

for (const cohorte of cohortes) {
  const cantidadAulas = cohorte.cupos / 60
  for (let numero = 1; numero <= cantidadAulas; numero += 1) {
    const institutoId = institutosConReferente[(numero - 1) % institutosConReferente.length]
    const codigoAula = `${cohorte.codigo}-${cohorte.anio}-Aula${String(numero).padStart(2, '0')}`
    const nombreAula = `${cohorte.nombreCohorte} - Aula ${numero}`
    sqlParts.push(`INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  ${numero},
  '${sqlEscape(nombreAula)}',
  '${sqlEscape(codigoAula)}',
  c.id,
  ${institutoId},
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = ${cohorte.anio}
  AND p.codigo = '${cohorte.codigo}';`)

    sqlParts.push(`INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = '${sqlEscape(codigoAula)}';`)

    sqlParts.push(`INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = '${sqlEscape(codigoAula)}'
ORDER BY u.id
LIMIT 1;`)
  }
}

const sql = `${sqlParts.join('\n\n')}\n`
const outputPath = path.join(workspaceRoot, 'scripts', 'seed-cohortes-2025-2026.generated.sql')
fs.writeFileSync(outputPath, sql, 'utf8')

execFileSync('mysqlsh', ['--sql', '--uri', dbUri, '-f', outputPath], {
  cwd: workspaceRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    MYSQLSH_USER_CONFIG_HOME: mysqlshConfigHome,
  },
})

console.log(`SQL ejecutado: ${outputPath}`)
