DELETE ci
FROM cohorteinstituto ci
JOIN cohorte c ON c.id = ci.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EI';

INSERT INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, data.institutoId
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
JOIN (
  SELECT 22 AS institutoId
  UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25 

) data
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EI';

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 22,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EI'
  AND a.numero IN (1, 2);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 23,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EI'
  AND a.numero IN (3, 4);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 24,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EI'
  AND a.numero IN (5, 6);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 25,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EI'
  AND a.numero IN (7, 8);

DELETE ci
FROM cohorteinstituto ci
JOIN cohorte c ON c.id = ci.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'IB';

INSERT INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, data.institutoId
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
JOIN (
  SELECT 38 AS institutoId
  UNION ALL SELECT 39 

) data
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'IB';

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 38,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'IB'
  AND a.numero IN (1, 2);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 39,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'IB'
  AND a.numero IN (3, 4);

DELETE ci
FROM cohorteinstituto ci
JOIN cohorte c ON c.id = ci.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EA';

INSERT INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, data.institutoId
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
JOIN (
  SELECT 26 AS institutoId
  UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 

) data
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EA';

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 26,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EA'
  AND a.numero IN (1, 2);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 27,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EA'
  AND a.numero IN (3, 4);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 28,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EA'
  AND a.numero IN (5, 6);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 29,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EA'
  AND a.numero IN (7, 8);

DELETE ci
FROM cohorteinstituto ci
JOIN cohorte c ON c.id = ci.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD';

INSERT INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, data.institutoId
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
JOIN (
  SELECT 30 AS institutoId
  UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36 UNION ALL SELECT 37 

) data
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD';

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 30,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (1, 2);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 31,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (3, 4);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 32,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (5, 6);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 33,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (7, 8);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 34,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (9, 10);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 35,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (11, 12);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 36,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (13, 14);

UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = 37,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = 'EyCD'
  AND a.numero IN (15, 16);

DELETE ra
FROM _referenteaulas ra
JOIN aula a ON a.id = ra.A
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo IN ('EI', 'EA', 'EyCD', 'IB');

INSERT INTO _referenteaulas (A, B)
SELECT a.id, refs.userId
FROM aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
JOIN (
  SELECT institutoId, MIN(id) AS userId
  FROM user
  WHERE rol = 'REFERENTE'
    AND institutoId IS NOT NULL
  GROUP BY institutoId
) refs ON refs.institutoId = a.institutoId
WHERE c.anio IN (2025, 2026)
  AND p.codigo IN ('EI', 'EA', 'EyCD', 'IB');
