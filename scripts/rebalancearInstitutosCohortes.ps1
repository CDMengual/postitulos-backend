$ErrorActionPreference = 'Stop'

$workspaceRoot = Get-Location
$mysqlshPath = 'C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysqlsh.exe'
$dbUri = 'root:1234@localhost:3306/postitulos'
$env:MYSQLSH_USER_CONFIG_HOME = (Resolve-Path .mysqlsh).Path

$mapping = @{
  'EI' = @(22, 23, 24, 25)
  'EA' = @(26, 27, 28, 29)
  'EyCD' = @(30, 31, 32, 33, 34, 35, 36, 37)
  'IB' = @(38, 39)
}

$sqlParts = @()

foreach ($code in $mapping.Keys) {
  $institutos = $mapping[$code]
  $institutosSql = $institutos -join ','

  $sqlParts += @"
DELETE ci
FROM cohorteinstituto ci
JOIN cohorte c ON c.id = ci.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio IN (2025, 2026)
  AND p.codigo = '$code';

INSERT INTO cohorteinstituto (cohorteId, institutoId)
SELECT c.id, data.institutoId
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
JOIN (
  SELECT $($institutos[0]) AS institutoId
  $(for ($i = 1; $i -lt $institutos.Count; $i++) { "UNION ALL SELECT $($institutos[$i])" } -join "`n")
) data
WHERE c.anio IN (2025, 2026)
  AND p.codigo = '$code';
"@

  for ($pairIndex = 0; $pairIndex -lt $institutos.Count; $pairIndex++) {
    $institutoId = $institutos[$pairIndex]
    $numero1 = ($pairIndex * 2) + 1
    $numero2 = $numero1 + 1

    $sqlParts += @"
UPDATE aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
SET a.institutoId = $institutoId,
    a.updatedAt = NOW()
WHERE c.anio IN (2025, 2026)
  AND p.codigo = '$code'
  AND a.numero IN ($numero1, $numero2);
"@
  }
}

$sqlParts += @"
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
"@

$outputPath = Join-Path $workspaceRoot 'scripts\rebalancear-institutos-cohortes.generated.sql'
[System.IO.File]::WriteAllText($outputPath, ($sqlParts -join "`n`n") + "`n")

& $mysqlshPath --sql --uri $dbUri -f $outputPath

Write-Host "SQL ejecutado: $outputPath"
