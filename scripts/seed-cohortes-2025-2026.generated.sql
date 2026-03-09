INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2025,
  'EI-2025',
  '2025-03-10 00:00:00',
  '2025-11-30 23:59:59',
  'FINALIZADA',
  '2025-02-01 00:00:00',
  '2025-03-01 23:59:59',
  p.id,
  NULL,
  8,
  480,
  0,
  480,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'EI'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2025
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'EI-2025',
    c.fechaInicio = '2025-03-10 00:00:00',
    c.fechaFin = '2025-11-30 23:59:59',
    c.estado = 'FINALIZADA',
    c.fechaInicioInscripcion = '2025-02-01 00:00:00',
    c.fechaFinInscripcion = '2025-03-01 23:59:59',
    c.cantidadAulas = 8,
    c.cupos = 480,
    c.cuposListaEspera = 0,
    c.cuposTotales = 480,
    c.updatedAt = NOW()
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2026,
  'EI-2026',
  '2026-03-10 00:00:00',
  '2026-11-30 23:59:59',
  'ACTIVA',
  '2026-02-01 00:00:00',
  '2026-03-01 23:59:59',
  p.id,
  NULL,
  8,
  480,
  0,
  480,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'EI'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2026
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'EI-2026',
    c.fechaInicio = '2026-03-10 00:00:00',
    c.fechaFin = '2026-11-30 23:59:59',
    c.estado = 'ACTIVA',
    c.fechaInicioInscripcion = '2026-02-01 00:00:00',
    c.fechaFinInscripcion = '2026-03-01 23:59:59',
    c.cantidadAulas = 8,
    c.cupos = 480,
    c.cuposListaEspera = 0,
    c.cuposTotales = 480,
    c.updatedAt = NOW()
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2025,
  'EyCD-2025',
  '2025-03-10 00:00:00',
  '2025-11-30 23:59:59',
  'FINALIZADA',
  '2025-02-01 00:00:00',
  '2025-03-01 23:59:59',
  p.id,
  NULL,
  16,
  960,
  0,
  960,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'EyCD'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2025
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'EyCD-2025',
    c.fechaInicio = '2025-03-10 00:00:00',
    c.fechaFin = '2025-11-30 23:59:59',
    c.estado = 'FINALIZADA',
    c.fechaInicioInscripcion = '2025-02-01 00:00:00',
    c.fechaFinInscripcion = '2025-03-01 23:59:59',
    c.cantidadAulas = 16,
    c.cupos = 960,
    c.cuposListaEspera = 0,
    c.cuposTotales = 960,
    c.updatedAt = NOW()
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2026,
  'EyCD-2026',
  '2026-03-10 00:00:00',
  '2026-11-30 23:59:59',
  'ACTIVA',
  '2026-02-01 00:00:00',
  '2026-03-01 23:59:59',
  p.id,
  NULL,
  16,
  960,
  0,
  960,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'EyCD'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2026
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'EyCD-2026',
    c.fechaInicio = '2026-03-10 00:00:00',
    c.fechaFin = '2026-11-30 23:59:59',
    c.estado = 'ACTIVA',
    c.fechaInicioInscripcion = '2026-02-01 00:00:00',
    c.fechaFinInscripcion = '2026-03-01 23:59:59',
    c.cantidadAulas = 16,
    c.cupos = 960,
    c.cuposListaEspera = 0,
    c.cuposTotales = 960,
    c.updatedAt = NOW()
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2025,
  'EA-2025',
  '2025-03-10 00:00:00',
  '2025-11-30 23:59:59',
  'FINALIZADA',
  '2025-02-01 00:00:00',
  '2025-03-01 23:59:59',
  p.id,
  NULL,
  8,
  480,
  0,
  480,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'EA'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2025
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'EA-2025',
    c.fechaInicio = '2025-03-10 00:00:00',
    c.fechaFin = '2025-11-30 23:59:59',
    c.estado = 'FINALIZADA',
    c.fechaInicioInscripcion = '2025-02-01 00:00:00',
    c.fechaFinInscripcion = '2025-03-01 23:59:59',
    c.cantidadAulas = 8,
    c.cupos = 480,
    c.cuposListaEspera = 0,
    c.cuposTotales = 480,
    c.updatedAt = NOW()
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2026,
  'EA-2026',
  '2026-03-10 00:00:00',
  '2026-11-30 23:59:59',
  'INSCRIPCION',
  '2026-02-01 00:00:00',
  '2026-03-15 23:59:59',
  p.id,
  NULL,
  8,
  480,
  0,
  480,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'EA'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2026
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'EA-2026',
    c.fechaInicio = '2026-03-10 00:00:00',
    c.fechaFin = '2026-11-30 23:59:59',
    c.estado = 'INSCRIPCION',
    c.fechaInicioInscripcion = '2026-02-01 00:00:00',
    c.fechaFinInscripcion = '2026-03-15 23:59:59',
    c.cantidadAulas = 8,
    c.cupos = 480,
    c.cuposListaEspera = 0,
    c.cuposTotales = 480,
    c.updatedAt = NOW()
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2025,
  'IB-2025',
  '2025-03-10 00:00:00',
  '2025-11-30 23:59:59',
  'FINALIZADA',
  '2025-02-01 00:00:00',
  '2025-03-01 23:59:59',
  p.id,
  NULL,
  4,
  240,
  0,
  240,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'IB'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2025
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'IB-2025',
    c.fechaInicio = '2025-03-10 00:00:00',
    c.fechaFin = '2025-11-30 23:59:59',
    c.estado = 'FINALIZADA',
    c.fechaInicioInscripcion = '2025-02-01 00:00:00',
    c.fechaFinInscripcion = '2025-03-01 23:59:59',
    c.cantidadAulas = 4,
    c.cupos = 240,
    c.cuposListaEspera = 0,
    c.cuposTotales = 240,
    c.updatedAt = NOW()
WHERE c.anio = 2025
  AND p.codigo = 'IB';

INSERT INTO cohorte (
  anio, nombre, fechaInicio, fechaFin, estado, fechaInicioInscripcion, fechaFinInscripcion,
  postituloId, formularioId, cantidadAulas, cupos, cuposListaEspera, cuposTotales, createdAt, updatedAt
)
SELECT
  2026,
  'IB-2026',
  '2026-03-10 00:00:00',
  '2026-11-30 23:59:59',
  'ACTIVA',
  '2026-02-01 00:00:00',
  '2026-03-01 23:59:59',
  p.id,
  NULL,
  4,
  240,
  0,
  240,
  NOW(),
  NOW()
FROM postitulo p
WHERE p.codigo = 'IB'
  AND NOT EXISTS (
    SELECT 1
    FROM cohorte c
    WHERE c.anio = 2026
      AND c.postituloId = p.id
  );

UPDATE cohorte c
JOIN postitulo p ON p.id = c.postituloId
SET c.nombre = 'IB-2026',
    c.fechaInicio = '2026-03-10 00:00:00',
    c.fechaFin = '2026-11-30 23:59:59',
    c.estado = 'ACTIVA',
    c.fechaInicioInscripcion = '2026-02-01 00:00:00',
    c.fechaFinInscripcion = '2026-03-01 23:59:59',
    c.cantidadAulas = 4,
    c.cupos = 240,
    c.cuposListaEspera = 0,
    c.cuposTotales = 240,
    c.updatedAt = NOW()
WHERE c.anio = 2026
  AND p.codigo = 'IB';


INSERT IGNORE INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, i.id
FROM cohorte c
JOIN instituto i ON i.id IN (22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 79)
JOIN postitulo p ON p.id = c.postituloId
WHERE (c.anio = 2025 OR c.anio = 2026)
  AND p.codigo IN ('EI', 'EyCD', 'EA', 'IB');



DELETE a, ra, aa
FROM aula a
LEFT JOIN _referenteaulas ra ON ra.A = a.id
LEFT JOIN _adminaulas aa ON aa.A = a.id
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo IN ('EI', 'EyCD', 'EA', 'IB');


INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'EI-2025 - Aula 1',
  'EI-2025-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'EI-2025 - Aula 2',
  'EI-2025-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'EI-2025 - Aula 3',
  'EI-2025-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'EI-2025 - Aula 4',
  'EI-2025-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  5,
  'EI-2025 - Aula 5',
  'EI-2025-Aula05',
  c.id,
  26,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula05';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula05'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  6,
  'EI-2025 - Aula 6',
  'EI-2025-Aula06',
  c.id,
  27,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula06';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula06'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  7,
  'EI-2025 - Aula 7',
  'EI-2025-Aula07',
  c.id,
  28,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula07';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula07'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  8,
  'EI-2025 - Aula 8',
  'EI-2025-Aula08',
  c.id,
  29,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2025-Aula08';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2025-Aula08'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'EI-2026 - Aula 1',
  'EI-2026-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'EI-2026 - Aula 2',
  'EI-2026-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'EI-2026 - Aula 3',
  'EI-2026-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'EI-2026 - Aula 4',
  'EI-2026-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  5,
  'EI-2026 - Aula 5',
  'EI-2026-Aula05',
  c.id,
  26,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula05';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula05'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  6,
  'EI-2026 - Aula 6',
  'EI-2026-Aula06',
  c.id,
  27,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula06';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula06'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  7,
  'EI-2026 - Aula 7',
  'EI-2026-Aula07',
  c.id,
  28,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula07';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula07'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  8,
  'EI-2026 - Aula 8',
  'EI-2026-Aula08',
  c.id,
  29,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EI';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EI-2026-Aula08';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EI-2026-Aula08'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'EyCD-2025 - Aula 1',
  'EyCD-2025-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'EyCD-2025 - Aula 2',
  'EyCD-2025-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'EyCD-2025 - Aula 3',
  'EyCD-2025-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'EyCD-2025 - Aula 4',
  'EyCD-2025-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  5,
  'EyCD-2025 - Aula 5',
  'EyCD-2025-Aula05',
  c.id,
  26,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula05';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula05'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  6,
  'EyCD-2025 - Aula 6',
  'EyCD-2025-Aula06',
  c.id,
  27,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula06';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula06'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  7,
  'EyCD-2025 - Aula 7',
  'EyCD-2025-Aula07',
  c.id,
  28,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula07';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula07'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  8,
  'EyCD-2025 - Aula 8',
  'EyCD-2025-Aula08',
  c.id,
  29,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula08';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula08'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  9,
  'EyCD-2025 - Aula 9',
  'EyCD-2025-Aula09',
  c.id,
  30,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula09';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula09'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  10,
  'EyCD-2025 - Aula 10',
  'EyCD-2025-Aula10',
  c.id,
  31,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula10';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula10'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  11,
  'EyCD-2025 - Aula 11',
  'EyCD-2025-Aula11',
  c.id,
  32,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula11';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula11'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  12,
  'EyCD-2025 - Aula 12',
  'EyCD-2025-Aula12',
  c.id,
  33,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula12';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula12'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  13,
  'EyCD-2025 - Aula 13',
  'EyCD-2025-Aula13',
  c.id,
  34,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula13';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula13'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  14,
  'EyCD-2025 - Aula 14',
  'EyCD-2025-Aula14',
  c.id,
  35,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula14';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula14'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  15,
  'EyCD-2025 - Aula 15',
  'EyCD-2025-Aula15',
  c.id,
  36,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula15';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula15'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  16,
  'EyCD-2025 - Aula 16',
  'EyCD-2025-Aula16',
  c.id,
  37,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2025-Aula16';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2025-Aula16'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'EyCD-2026 - Aula 1',
  'EyCD-2026-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'EyCD-2026 - Aula 2',
  'EyCD-2026-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'EyCD-2026 - Aula 3',
  'EyCD-2026-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'EyCD-2026 - Aula 4',
  'EyCD-2026-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  5,
  'EyCD-2026 - Aula 5',
  'EyCD-2026-Aula05',
  c.id,
  26,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula05';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula05'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  6,
  'EyCD-2026 - Aula 6',
  'EyCD-2026-Aula06',
  c.id,
  27,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula06';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula06'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  7,
  'EyCD-2026 - Aula 7',
  'EyCD-2026-Aula07',
  c.id,
  28,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula07';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula07'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  8,
  'EyCD-2026 - Aula 8',
  'EyCD-2026-Aula08',
  c.id,
  29,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula08';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula08'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  9,
  'EyCD-2026 - Aula 9',
  'EyCD-2026-Aula09',
  c.id,
  30,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula09';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula09'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  10,
  'EyCD-2026 - Aula 10',
  'EyCD-2026-Aula10',
  c.id,
  31,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula10';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula10'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  11,
  'EyCD-2026 - Aula 11',
  'EyCD-2026-Aula11',
  c.id,
  32,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula11';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula11'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  12,
  'EyCD-2026 - Aula 12',
  'EyCD-2026-Aula12',
  c.id,
  33,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula12';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula12'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  13,
  'EyCD-2026 - Aula 13',
  'EyCD-2026-Aula13',
  c.id,
  34,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula13';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula13'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  14,
  'EyCD-2026 - Aula 14',
  'EyCD-2026-Aula14',
  c.id,
  35,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula14';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula14'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  15,
  'EyCD-2026 - Aula 15',
  'EyCD-2026-Aula15',
  c.id,
  36,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula15';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula15'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  16,
  'EyCD-2026 - Aula 16',
  'EyCD-2026-Aula16',
  c.id,
  37,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EyCD';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EyCD-2026-Aula16';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EyCD-2026-Aula16'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'EA-2025 - Aula 1',
  'EA-2025-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'EA-2025 - Aula 2',
  'EA-2025-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'EA-2025 - Aula 3',
  'EA-2025-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'EA-2025 - Aula 4',
  'EA-2025-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  5,
  'EA-2025 - Aula 5',
  'EA-2025-Aula05',
  c.id,
  26,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula05';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula05'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  6,
  'EA-2025 - Aula 6',
  'EA-2025-Aula06',
  c.id,
  27,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula06';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula06'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  7,
  'EA-2025 - Aula 7',
  'EA-2025-Aula07',
  c.id,
  28,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula07';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula07'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  8,
  'EA-2025 - Aula 8',
  'EA-2025-Aula08',
  c.id,
  29,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2025-Aula08';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2025-Aula08'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'EA-2026 - Aula 1',
  'EA-2026-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'EA-2026 - Aula 2',
  'EA-2026-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'EA-2026 - Aula 3',
  'EA-2026-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'EA-2026 - Aula 4',
  'EA-2026-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  5,
  'EA-2026 - Aula 5',
  'EA-2026-Aula05',
  c.id,
  26,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula05';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula05'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  6,
  'EA-2026 - Aula 6',
  'EA-2026-Aula06',
  c.id,
  27,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula06';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula06'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  7,
  'EA-2026 - Aula 7',
  'EA-2026-Aula07',
  c.id,
  28,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula07';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula07'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  8,
  'EA-2026 - Aula 8',
  'EA-2026-Aula08',
  c.id,
  29,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'EA';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'EA-2026-Aula08';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'EA-2026-Aula08'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'IB-2025 - Aula 1',
  'IB-2025-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2025-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2025-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'IB-2025 - Aula 2',
  'IB-2025-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2025-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2025-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'IB-2025 - Aula 3',
  'IB-2025-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2025-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2025-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'IB-2025 - Aula 4',
  'IB-2025-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2025-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2025-Aula04'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  1,
  'IB-2026 - Aula 1',
  'IB-2026-Aula01',
  c.id,
  22,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2026-Aula01';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2026-Aula01'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  2,
  'IB-2026 - Aula 2',
  'IB-2026-Aula02',
  c.id,
  23,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2026-Aula02';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2026-Aula02'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  3,
  'IB-2026 - Aula 3',
  'IB-2026-Aula03',
  c.id,
  24,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2026-Aula03';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2026-Aula03'
ORDER BY u.id
LIMIT 1;

INSERT INTO aula (numero, nombre, codigo, cohorteId, institutoId, createdAt, updatedAt)
SELECT
  4,
  'IB-2026 - Aula 4',
  'IB-2026-Aula04',
  c.id,
  25,
  NOW(),
  NOW()
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2026
  AND p.codigo = 'IB';

INSERT IGNORE INTO _adminaulas (A, B)
SELECT a.id, 1
FROM aula a
WHERE a.codigo = 'IB-2026-Aula04';

INSERT IGNORE INTO _referenteaulas (A, B)
SELECT a.id, u.id
FROM aula a
JOIN user u ON u.institutoId = a.institutoId AND u.rol = 'REFERENTE'
WHERE a.codigo = 'IB-2026-Aula04'
ORDER BY u.id
LIMIT 1;
