$ErrorActionPreference = 'Stop'

$workspaceRoot = Get-Location
$mysqlshPath = 'C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysqlsh.exe'
$dbUri = 'root:1234@localhost:3306/postitulos'
$env:MYSQLSH_USER_CONFIG_HOME = (Resolve-Path .mysqlsh).Path

$targetCodes = @('EI', 'EyCD', 'EA', 'IB')
$targetYears = @(2025, 2026)

$firstNames = @(
  'Ana', 'Juan', 'Maria', 'Luis', 'Carla', 'Pedro', 'Lucia', 'Martin', 'Paula', 'Diego',
  'Sofia', 'Javier', 'Marina', 'Nicolas', 'Camila', 'Pablo', 'Valeria', 'Leandro', 'Julieta', 'Federico'
)

$lastNames = @(
  'Gomez', 'Perez', 'Rodriguez', 'Fernandez', 'Lopez', 'Diaz', 'Sosa', 'Romero', 'Torres', 'Suarez',
  'Acosta', 'Herrera', 'Castro', 'Dominguez', 'Molina', 'Ramos', 'Silva', 'Vega', 'Benitez', 'Ibarra'
)

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

function Escape-Sql {
  param([AllowNull()][string]$Value)
  if ($null -eq $Value) { return $null }
  return $Value.Replace('\', '\\').Replace("'", "\'")
}

function Get-PersonName {
  param([int]$Index)

  $nombre = $firstNames[$Index % $firstNames.Count]
  $apellido = '{0}{1}' -f $lastNames[$Index % $lastNames.Count], [math]::Floor($Index / $lastNames.Count)
  return [pscustomobject]@{
    Nombre = $nombre
    Apellido = $apellido
  }
}

function Get-EstadoInscripto {
  param($Cohorte, [int]$Order, [int]$AssignedCount)

  if ($Order -lt $AssignedCount) {
    return 'ASIGNADA'
  }

  $extraOrder = $Order - $AssignedCount

  if ($Cohorte.anio -eq 2025) {
    $listaEsperaCount = [int][math]::Round($Cohorte.cupos * 0.15)
    if ($extraOrder -lt $listaEsperaCount) { return 'LISTA_ESPERA' }
    return 'RECHAZADA'
  }

  $pendienteCount = [int][math]::Round($Cohorte.cupos * 0.1)
  $listaEsperaCount = [int][math]::Round($Cohorte.cupos * 0.1)
  if ($extraOrder -lt $pendienteCount) { return 'PENDIENTE' }
  if ($extraOrder -lt ($pendienteCount + $listaEsperaCount)) { return 'LISTA_ESPERA' }
  return 'RECHAZADA'
}

function Get-EstadoCursante {
  param($Cohorte, [int]$AssignedIndex, [int]$TotalAssigned)

  $ratio = $AssignedIndex / $TotalAssigned

  if ($Cohorte.anio -eq 2025) {
    if ($ratio -lt 0.78) { return 'FINALIZADO' }
    return 'BAJA'
  }

  if ($ratio -lt 0.72) { return 'ACTIVO' }
  if ($ratio -lt 0.94) { return 'ADEUDA' }
  return 'BAJA'
}

function Get-DocInscripto {
  param([string]$Estado)
  if ($Estado -eq 'ASIGNADA') { return 'VERIFICADA' }
  if ($Estado -eq 'RECHAZADA') { return 'NO_CORRESPONDE' }
  return 'PENDIENTE'
}

function Get-DocCursante {
  param($Cohorte, [string]$Estado)
  if ($Cohorte.anio -eq 2025) { return 'VERIFICADA' }
  if ($Estado -eq 'ACTIVO') { return 'VERIFICADA' }
  if ($Estado -eq 'ADEUDA') { return 'PENDIENTE' }
  return 'VERIFICADA'
}

function Get-ObsInscripto {
  param([string]$Estado)
  if ($Estado -eq 'LISTA_ESPERA') { return 'Inscripto en lista de espera' }
  if ($Estado -eq 'RECHAZADA') { return 'Inscripcion rechazada por cupo' }
  if ($Estado -eq 'PENDIENTE') { return 'Inscripcion pendiente de confirmacion' }
  return $null
}

function Get-ObsCursante {
  param($Cohorte, [string]$Estado)
  if ($Cohorte.anio -eq 2025 -and $Estado -eq 'BAJA') { return 'Baja durante la cursada' }
  if ($Cohorte.anio -eq 2026 -and $Estado -eq 'ADEUDA') { return 'Adeuda entregas parciales' }
  if ($Cohorte.anio -eq 2026 -and $Estado -eq 'BAJA') { return 'Baja registrada en curso' }
  return $null
}

function Chunk-Array {
  param($Array, [int]$Size)
  $result = @()
  for ($i = 0; $i -lt $Array.Count; $i += $Size) {
    $result += ,@($Array[$i..([Math]::Min($i + $Size - 1, $Array.Count - 1))])
  }
  return $result
}

$codesSql = ($targetCodes | ForEach-Object { "'$_'" }) -join ','
$yearsSql = $targetYears -join ','

$cohortes = Invoke-MySqlQuery @"
SELECT c.id, c.anio, c.cupos, p.codigo
FROM cohorte c
JOIN postitulo p ON p.id = c.postituloId
WHERE p.codigo IN ($codesSql)
  AND c.anio IN ($yearsSql)
ORDER BY c.id;
"@ | ForEach-Object {
  [pscustomobject]@{
    id = [int]$_.id
    anio = [int]$_.anio
    cupos = [int]$_.cupos
    codigo = $_.codigo
  }
}

$aulas = Invoke-MySqlQuery @"
SELECT a.id, a.numero, a.cohorteId, a.institutoId
FROM aula a
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE p.codigo IN ($codesSql)
  AND c.anio IN ($yearsSql)
ORDER BY a.cohorteId, a.numero;
"@ | ForEach-Object {
  [pscustomobject]@{
    id = [int]$_.id
    numero = [int]$_.numero
    cohorteId = [int]$_.cohorteId
    institutoId = [int]$_.institutoId
  }
}

$cohorteInstitutos = Invoke-MySqlQuery @"
SELECT cohorteId, institutoId
FROM cohorteinstituto
WHERE cohorteId IN ($((($cohortes | ForEach-Object { $_.id }) -join ',')))
ORDER BY cohorteId, institutoId;
"@ | ForEach-Object {
  [pscustomobject]@{
    cohorteId = [int]$_.cohorteId
    institutoId = [int]$_.institutoId
  }
}

$aulasByCohorte = @{}
foreach ($aula in $aulas) {
  if (-not $aulasByCohorte.ContainsKey($aula.cohorteId)) {
    $aulasByCohorte[$aula.cohorteId] = @()
  }
  $aulasByCohorte[$aula.cohorteId] += $aula
}

$institutosByCohorte = @{}
foreach ($item in $cohorteInstitutos) {
  if (-not $institutosByCohorte.ContainsKey($item.cohorteId)) {
    $institutosByCohorte[$item.cohorteId] = @()
  }
  $institutosByCohorte[$item.cohorteId] += $item.institutoId
}

$inscriptos = @()
$cursantes = @()
$cursantesAula = @()
$globalIndex = 0

foreach ($cohorte in $cohortes) {
  $aulasCohorte = $aulasByCohorte[$cohorte.id]
  $institutosCohorte = $institutosByCohorte[$cohorte.id]
  $assignedCount = $cohorte.cupos
  $totalInscriptos = [int][math]::Round($cohorte.cupos * 1.25)

  for ($order = 0; $order -lt $totalInscriptos; $order++) {
    $personIndex = $globalIndex + $order
    $person = Get-PersonName -Index $personIndex
    $dni = '77{0}{1}' -f $cohorte.id.ToString('00'), ($order + 1).ToString('00000')
    $email = '{0}{1}.{2}@test.postitulos.local' -f $cohorte.codigo.ToLower(), $cohorte.anio, ($order + 1)
    $celular = '11{0}' -f (70000000 + $personIndex).ToString().Substring(((70000000 + $personIndex).ToString().Length - 8))
    if ($order -lt $assignedCount) {
      $aula = $aulasCohorte[[math]::Floor($order / 60)]
      $institutoId = $aula.institutoId
    } else {
      $institutoId = $institutosCohorte[$order % $institutosCohorte.Count]
    }

    $estadoInscripto = Get-EstadoInscripto -Cohorte $cohorte -Order $order -AssignedCount $assignedCount
    $observacionesInscripto = Get-ObsInscripto -Estado $estadoInscripto

    $modalidadPreferida = if ($cohorte.codigo -eq 'EyCD') { 'Virtual' } else { 'Mixta' }
    $datosFormulario = "{`"experienciaDocente`":`"$((2 + ($order % 18))) anios`",`"modalidadPreferida`":`"$modalidadPreferida`",`"institutoId`":$institutoId}"

    $inscriptos += [pscustomobject]@{
      cohorteId = $cohorte.id
      institutoId = $institutoId
      nombre = $person.Nombre
      apellido = $person.Apellido
      dni = $dni
      email = $email
      celular = $celular
      datosFormulario = $datosFormulario
      estado = $estadoInscripto
      prioridad = $order + 1
      condicionada = 0
      observaciones = $observacionesInscripto
      documentacion = Get-DocInscripto -Estado $estadoInscripto
    }

    if ($estadoInscripto -eq 'ASIGNADA') {
      $estadoCursante = Get-EstadoCursante -Cohorte $cohorte -AssignedIndex $order -TotalAssigned $assignedCount
      $observacionesCursante = Get-ObsCursante -Cohorte $cohorte -Estado $estadoCursante
      $aula = $aulasCohorte[[math]::Floor($order / 60)]

      $cursantes += [pscustomobject]@{
        nombre = $person.Nombre
        apellido = $person.Apellido
        dni = $dni
        email = $email
        celular = $celular
        titulo = 'Profesor/a'
      }

      $cursantesAula += [pscustomobject]@{
        dni = $dni
        aulaId = $aula.id
        estado = $estadoCursante
        documentacion = Get-DocCursante -Cohorte $cohorte -Estado $estadoCursante
        observaciones = $observacionesCursante
      }
    }
  }

  $globalIndex += $totalInscriptos
}

$sqlParts = @()
$cohorteIdsSql = ($cohortes | ForEach-Object { $_.id }) -join ','

$sqlParts += @"
DELETE ca
FROM cursanteaula ca
JOIN aula a ON a.id = ca.aulaId
JOIN cohorte c ON c.id = a.cohorteId
JOIN postitulo p ON p.id = c.postituloId
WHERE p.codigo IN ($codesSql)
  AND c.anio IN ($yearsSql);
"@

$sqlParts += "DELETE FROM inscripto WHERE cohorteId IN ($cohorteIdsSql);"
$sqlParts += "DELETE FROM cursante WHERE dni LIKE '77%';"

foreach ($group in (Chunk-Array -Array $cursantes -Size 300)) {
  $values = $group | ForEach-Object {
    "('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', NULL, NULL, NOW(), NOW())" -f `
      (Escape-Sql $_.nombre),
      (Escape-Sql $_.apellido),
      $_.dni,
      (Escape-Sql $_.email),
      (Escape-Sql $_.celular),
      (Escape-Sql $_.titulo)
  }
  $sqlParts += "INSERT INTO cursante (nombre, apellido, dni, email, celular, titulo, regionId, distritoId, createdAt, updatedAt)`nVALUES`n$($values -join ",`n");"
}

foreach ($group in (Chunk-Array -Array $inscriptos -Size 300)) {
  $values = $group | ForEach-Object {
    "({0}, {1}, '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', NULL, NULL, '{8}', {9}, {10}, {11}, '{12}', NOW(), NOW())" -f `
      $_.cohorteId,
      $_.institutoId,
      (Escape-Sql $_.nombre),
      (Escape-Sql $_.apellido),
      $_.dni,
      (Escape-Sql $_.email),
      (Escape-Sql $_.celular),
      (Escape-Sql $_.datosFormulario),
      $_.estado,
      $_.prioridad,
      $_.condicionada,
      ($(if ($_.observaciones) { "'$(Escape-Sql $_.observaciones)'" } else { 'NULL' })),
      $_.documentacion
  }
  $sqlParts += @"
INSERT INTO inscripto (
  cohorteId, institutoId, nombre, apellido, dni, email, celular, datosFormulario,
  dniAdjuntoUrl, tituloAdjuntoUrl, estado, prioridad, condicionada, observaciones,
  documentacion, createdAt, updatedAt
)
VALUES
$($values -join ",`n");
"@
}

foreach ($group in (Chunk-Array -Array $cursantesAula -Size 300)) {
  $selects = for ($i = 0; $i -lt $group.Count; $i++) {
    $item = $group[$i]
    "{0} '{1}' AS dni, {2} AS aulaId, '{3}' AS estado, '{4}' AS documentacion, {5} AS observaciones" -f `
      $(if ($i -eq 0) { 'SELECT' } else { 'UNION ALL SELECT' }),
      $item.dni,
      $item.aulaId,
      $item.estado,
      $item.documentacion,
      $(if ($item.observaciones) { "'$(Escape-Sql $item.observaciones)'" } else { 'NULL' })
  }

  $sqlParts += @"
INSERT INTO cursanteaula (
  cursanteId, aulaId, estado, documentacion, dniAdjuntoUrl, tituloAdjuntoUrl, observaciones, createdAt, updatedAt
)
SELECT c.id, data.aulaId, data.estado, data.documentacion, NULL, NULL, data.observaciones, NOW(), NOW()
FROM (
$($selects -join "`n")
) data
JOIN cursante c ON c.dni = data.dni;
"@
}

$outputPath = Join-Path $workspaceRoot 'scripts\seed-inscriptos-cursantes-2025-2026.generated.sql'
[System.IO.File]::WriteAllText($outputPath, ($sqlParts -join "`n`n") + "`n")

& $mysqlshPath --sql --uri $dbUri -f $outputPath

Write-Host "SQL ejecutado: $outputPath"
Write-Host "Inscriptos generados: $($inscriptos.Count)"
Write-Host "Cursantes generados: $($cursantes.Count)"
Write-Host "Relaciones cursante-aula generadas: $($cursantesAula.Count)"
