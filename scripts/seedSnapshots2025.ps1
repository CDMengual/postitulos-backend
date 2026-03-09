$ErrorActionPreference = 'Stop'

$workspaceRoot = Get-Location
$mysqlshPath = 'C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysqlsh.exe'
$dbUri = 'root:1234@localhost:3306/postitulos'
$env:MYSQLSH_USER_CONFIG_HOME = (Resolve-Path .mysqlsh).Path

function Invoke-MySqlQuery {
  param([string]$Sql)

  $output = & $mysqlshPath --sql --uri $dbUri -e $Sql
  $lines = $output | Where-Object { $_ -and ($_ -notlike 'WARNING:*') }
  if ($lines.Count -lt 2) {
    return @()
  }

  $headers = $lines[0] -split "`t"
  $rows = @()
  foreach ($line in $lines[1..($lines.Count - 1)]) {
    $parts = $line -split "`t"
    $obj = [ordered]@{}
    for ($i = 0; $i -lt $headers.Count; $i++) {
      $obj[$headers[$i]] = if ($i -lt $parts.Count) { $parts[$i] } else { '' }
    }
    $rows += [pscustomobject]$obj
  }
  return $rows
}

$aulas2025 = Invoke-MySqlQuery @"
SELECT
  a.id AS aulaId,
  a.codigo,
  COUNT(*) AS totalInicial,
  SUM(CASE WHEN ca.estado = 'FINALIZADO' THEN 1 ELSE 0 END) AS finalizadosFinales,
  SUM(CASE WHEN ca.estado = 'BAJA' THEN 1 ELSE 0 END) AS bajasFinales
FROM aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
JOIN cursanteaula ca ON ca.aulaId = a.id
WHERE c.anio = 2025
  AND p.codigo IN ('EI', 'EyCD', 'EA', 'IB')
GROUP BY a.id, a.codigo
ORDER BY a.id;
"@ | ForEach-Object {
  [pscustomobject]@{
    aulaId = [int]$_.aulaId
    codigo = $_.codigo
    totalInicial = [int]$_.totalInicial
    finalizadosFinales = [int]$_.finalizadosFinales
    bajasFinales = [int]$_.bajasFinales
  }
}

$months = @(
  [pscustomobject]@{ Mes = 3; Fecha = '2025-03-31 23:59:59'; FactorBaja = 0.10; FactorFinalizado = 0.00; AdeudaRate = 0.00 },
  [pscustomobject]@{ Mes = 4; Fecha = '2025-04-30 23:59:59'; FactorBaja = 0.20; FactorFinalizado = 0.00; AdeudaRate = 0.00 },
  [pscustomobject]@{ Mes = 5; Fecha = '2025-05-31 23:59:59'; FactorBaja = 0.35; FactorFinalizado = 0.00; AdeudaRate = 0.03 },
  [pscustomobject]@{ Mes = 6; Fecha = '2025-06-30 23:59:59'; FactorBaja = 0.50; FactorFinalizado = 0.00; AdeudaRate = 0.08 },
  [pscustomobject]@{ Mes = 7; Fecha = '2025-07-31 23:59:59'; FactorBaja = 0.65; FactorFinalizado = 0.00; AdeudaRate = 0.12 },
  [pscustomobject]@{ Mes = 8; Fecha = '2025-08-31 23:59:59'; FactorBaja = 0.80; FactorFinalizado = 0.20; AdeudaRate = 0.10 },
  [pscustomobject]@{ Mes = 9; Fecha = '2025-09-30 23:59:59'; FactorBaja = 0.90; FactorFinalizado = 0.55; AdeudaRate = 0.08 },
  [pscustomobject]@{ Mes = 10; Fecha = '2025-10-31 23:59:59'; FactorBaja = 0.97; FactorFinalizado = 0.85; AdeudaRate = 0.03 },
  [pscustomobject]@{ Mes = 11; Fecha = '2025-11-30 23:59:59'; FactorBaja = 1.00; FactorFinalizado = 1.00; AdeudaRate = 0.00 }
)

$sqlParts = @()

$sqlParts += @"
DELETE asm
FROM aulasnapshotmensual asm
JOIN aula a ON a.id = asm.aulaId
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE c.anio = 2025
  AND p.codigo IN ('EI', 'EyCD', 'EA', 'IB');
"@

$values = @()

foreach ($aula in $aulas2025) {
  foreach ($month in $months) {
    if ($month.Mes -eq 11) {
      $baja = $aula.bajasFinales
      $finalizado = $aula.finalizadosFinales
      $adeuda = 0
      $activos = 0
    } else {
      $baja = [Math]::Min([int][Math]::Round($aula.bajasFinales * $month.FactorBaja), $aula.bajasFinales)
      $finalizado = [Math]::Min([int][Math]::Round($aula.finalizadosFinales * $month.FactorFinalizado), $aula.finalizadosFinales)
      $restantes = $aula.totalInicial - $baja - $finalizado
      $adeuda = [Math]::Min([int][Math]::Round($aula.totalInicial * $month.AdeudaRate), $restantes)
      $activos = $restantes - $adeuda
    }

    $values += "($($aula.aulaId), '$($month.Fecha)', 2025, $($month.Mes), $($aula.totalInicial), $activos, $adeuda, $baja, $finalizado, $($aula.totalInicial), NULL, NOW(), NOW())"
  }
}

$sqlParts += @"
INSERT INTO aulasnapshotmensual (
  aulaId, fechaCorte, anio, mes, totalInicial, activos, adeuda, baja, finalizado, totalFoto, observaciones, createdAt, updatedAt
)
VALUES
$($values -join ",`n");
"@

$outputPath = Join-Path $workspaceRoot 'scripts\seed-snapshots-2025.generated.sql'
[System.IO.File]::WriteAllText($outputPath, ($sqlParts -join "`n`n") + "`n")

& $mysqlshPath --sql --uri $dbUri -f $outputPath

Write-Host "SQL ejecutado: $outputPath"
Write-Host "Snapshots 2025 generados: $($values.Count)"
