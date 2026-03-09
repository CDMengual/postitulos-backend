const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const { execFileSync } = require('child_process')

const workspaceRoot = process.cwd()
const mysqlshConfigHome = path.join(workspaceRoot, '.mysqlsh')
fs.mkdirSync(mysqlshConfigHome, { recursive: true })

const dbUri = 'root:1234@localhost:3306/postitulos'

const institutos = [
  { nombre: 'ISFD N\u00B017', distritoId: 21 },
  { nombre: 'ISFDyT N\u00B049', distritoId: 22 },
  { nombre: 'ISFD N\u00B01', distritoId: 27 },
  { nombre: 'ISFDyT N\u00B0103', distritoId: 28 },
  { nombre: 'ISFDyT N\u00B046', distritoId: 30 },
  { nombre: 'ISFDyT N\u00B0105', distritoId: 30 },
  { nombre: 'ISFD N\u00B0106', distritoId: 30 },
  { nombre: 'ISFDyT N\u00B083', distritoId: 32 },
  { nombre: 'ISFD N\u00B041', distritoId: 34 },
  { nombre: 'ISFDyT N\u00B053', distritoId: 34 },
  { nombre: 'ISFD N\u00B039', distritoId: 42 },
  { nombre: 'ISFD N\u00B034', distritoId: 44 },
  { nombre: 'ISFD N\u00B029', distritoId: 46 },
  { nombre: 'ISFDyT N\u00B042', distritoId: 50 },
  { nombre: 'ISFD N\u00B0110', distritoId: 49 },
  { nombre: 'ISFD N\u00B0141', distritoId: 56 },
  { nombre: 'ISFDyT N\u00B015', distritoId: 62 },
  { nombre: 'ISFD N\u00B0119', distritoId: 148 },
  { nombre: 'ISFDyT N\u00B0126', distritoId: 152 },
  { nombre: 'ISFD N\u00B0129', distritoId: 67 },
  { nombre: 'ISFDyT N\u00B020', distritoId: 67 },
  { nombre: 'ISFDyT N\u00B013', distritoId: 80 },
  { nombre: 'ISFDyT N\u00B040', distritoId: 114 },
  { nombre: 'ISFDyT N\u00B057', distritoId: 82 },
  { nombre: 'ISFD N\u00B019', distritoId: 89 },
  { nombre: 'ISFDyT N\u00B063', distritoId: 90 },
  { nombre: 'ISFDyT N\u00B081', distritoId: 91 },
  { nombre: 'ISFDyT N\u00B010', distritoId: 92 },
  { nombre: 'ISFDyT N\u00B0166', distritoId: 92 },
  { nombre: 'ISFDyT N\u00B033', distritoId: 135 },
  { nombre: 'ISFD N\u00B03', distritoId: 97 },
  { nombre: 'ISFDyT N\u00B025', distritoId: 98 },
  { nombre: 'ISFDyT N\u00B048', distritoId: 138 },
  { nombre: 'ISFD N\u00B016', distritoId: 102 },
  { nombre: 'ISFDyT N\u00B027', distritoId: 108 },
  { nombre: 'ISFD N\u00B022', distritoId: 109 },
  { nombre: 'ISFDyT N\u00B02', distritoId: 110 },
]

const referentes = [
  ['ISFD N\u00B017', 'Ana', 'de la Torre', '2216-015394', 'postitulosisfd17@gmail.com'],
  ['ISFDyT N\u00B049', 'Silvana', 'La Haro', '2215-22437', 'postitulosisfd49@gmail.com'],
  ['ISFD N\u00B01', 'Rocio', 'Ball\u00F3n', '11-58075458 | 2310-6698', 'postitulosede2@gmail.com'],
  ['ISFDyT N\u00B0103', 'Gustavo', 'Rotela', '11-33254077', 'postitulosisfd103@gmail.com'],
  ['ISFDyT N\u00B046', 'Silvana', 'Perez', '11-57530042', 'postitulosede3@gmail.com'],
  ['ISFDyT N\u00B0105', 'Lucas', 'Peralta', '11-64850475', 'postitulosisfdyt105@gmail.com'],
  ['ISFD N\u00B0106', 'Micaela', 'Moschino', '11-61310053', 'postitulosmatanza@gmail.com'],
  ['ISFDyT N\u00B083', 'Emilio', 'Bianco', '11-55040508', 'postitulosede4@gmail.com'],
  ['ISFD N\u00B041', 'Matias', 'Startare', '11-66746604', 'postitulosede5@gmail.com'],
  ['ISFDyT N\u00B053', 'Carolina', 'Calics', '1123455300', 'instituto53fdi@gmail.com'],
  ['ISFD N\u00B039', 'Mar\u00EDa Celeste', 'Castro', '11-68886802', 'postitulosede6@gmail.com'],
  ['ISFD N\u00B034', 'Alicia', 'Prieto', '11-40601615', 'postitulossede7@gmail.com'],
  ['ISFD N\u00B029', 'Luc\u00EDa Alejandra', 'Bregant', '11-40991076', 'postitulosede8@gmail.com'],
  ['ISFDyT N\u00B042', 'Felipe', 'Guzman', '1123454200', 'postitulosede9@gmail.com'],
  ['ISFD N\u00B0110', 'Christian', 'Gauna', '11-58408136', 'isfd110moreno@abc.gob.ar'],
  ['ISFD N\u00B0141', 'Pablo', 'Canestari', '11-51127460', 'postitulosede10@gmail.com'],
  ['ISFDyT N\u00B015', 'Lucas', 'Gim\u00E9nez', '11-58291576', 'postitulosede11@gmail.com'],
  ['ISFD N\u00B0119', 'Emmanuel', 'Martinez', '3329-552571', 'postitulosede12@gmail.com'],
  ['ISFDyT N\u00B0126', 'Dami\u00E1n Nicol\u00E1s', 'Novarese', '1123451260', 'postitulos126@gmail.com'],
  ['ISFD N\u00B0129', 'Viviana', 'Qui\u00F1ones', '2342-406619', 'postitulosede20+isfd129@gmail.com'],
  ['ISFDyT N\u00B020', 'Viviana', 'Qui\u00F1ones', '1123452000', 'i20postitulos@gmail.com'],
  ['ISFDyT N\u00B013', 'Lucia', 'Llanos', '2396-600505', 'especializacionesisfdyt13@gmail.com'],
  ['ISFDyT N\u00B040', 'Hern\u00E1n', 'G\u00F3mez', '11-32430058', 'postitulosede16@gmail.com'],
  ['ISFDyT N\u00B057', 'Abril', 'Longoverde', '2214-00-6185', 'postitulosinst57@gmail.com'],
  ['ISFD N\u00B019', 'Andrea', 'Bustamante', '2235-913101', 'postitulosede19@gmail.com'],
  ['ISFDyT N\u00B063', 'Claudia', 'De Dios', '2234-49-2425', 'sede710marchiquita@gmail.com'],
  ['ISFDyT N\u00B081', 'Agustina', 'Ramajo', '1123458100', 'postitulos@isfdyt81.edu.ar'],
  ['ISFDyT N\u00B010', 'Ana Maria', 'Capel', '2494-50-7694', 'postitulosede20+isfd10@gmail.com'],
  ['ISFDyT N\u00B0166', 'Ana Maria', 'Capel', '1123451660', 'postitulosede166@gmail.com'],
  ['ISFDyT N\u00B033', 'Noelia Yanina', 'Gervasio', '1123453300', 'sede21postitulos@gmail.com'],
  ['ISFD N\u00B03', 'Isabel Elena', 'Candelo', '2914-75-9002', 'postitulosede22@gmail.com'],
  ['ISFDyT N\u00B025', 'Florencia', 'Luengo', '2214355655', 'postitulosisfdyt25@gmail.com'],
  ['ISFDyT N\u00B048', 'Sofia', 'Trobbiani', '1123454800', 'postitulosinstituto48@gmail.com'],
  ['ISFD N\u00B016', 'Adriana', 'Starnari', '1123451600', 'postitulosisfd16@gmail.com'],
  ['ISFDyT N\u00B027', 'Javier', 'Verdun', '2314-41-4258', 'postitulosede25@gmail.com'],
  ['ISFD N\u00B022', 'Franco David', 'Paroli', '2284-61-3099', 'institutosede22@gmail.com'],
  ['ISFDyT N\u00B02', 'Macarena', 'Castro', '2281552603', 'postitulossedeazul@gmail.com'],
]

function sqlEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function main() {
  const instituteSql = institutos
    .map(
      (item) =>
        `INSERT INTO instituto (nombre, distritoId)
SELECT '${sqlEscape(item.nombre)}', ${item.distritoId}
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM instituto WHERE nombre = '${sqlEscape(item.nombre)}' AND distritoId = ${item.distritoId}
);`,
    )
    .join('\n')

  const usersSqlParts = []

  for (let index = 0; index < referentes.length; index += 1) {
    const [institutoNombre, nombre, apellido, celular, email] = referentes[index]
    const instituto = institutos.find((item) => item.nombre === institutoNombre)
    if (!instituto) {
      throw new Error(`Instituto no mapeado: ${institutoNombre}`)
    }

    const dni = `4000${String(index + 1).padStart(4, '0')}`
    const passwordHash = await bcrypt.hash(apellido, 10)

    usersSqlParts.push(`INSERT INTO user (nombre, apellido, dni, email, celular, rol, password, institutoId, createdAt, updatedAt)
SELECT '${sqlEscape(nombre)}',
       '${sqlEscape(apellido)}',
       '${dni}',
       '${sqlEscape(email)}',
       '${sqlEscape(celular)}',
       'REFERENTE',
       '${sqlEscape(passwordHash)}',
       (SELECT id FROM instituto WHERE nombre = '${sqlEscape(institutoNombre)}' AND distritoId = ${instituto.distritoId} LIMIT 1),
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM user WHERE email = '${sqlEscape(email)}'
);`)
  }

  const tempSqlPath = path.join(workspaceRoot, 'scripts', 'seed-referentes-institutos.generated.sql')
  fs.writeFileSync(tempSqlPath, `${instituteSql}\n\n${usersSqlParts.join('\n\n')}\n`, 'utf8')

  execFileSync('mysqlsh', ['--sql', '--uri', dbUri, '-f', tempSqlPath], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      MYSQLSH_USER_CONFIG_HOME: mysqlshConfigHome,
    },
  })

  console.log(`SQL ejecutado: ${tempSqlPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
