const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
require('ts-node').register({ transpileOnly: true })
const { analyzeCsv, parseCsv } = require('../src/modules/inscriptos/inscripto-import.parser')

const header =
  'DNI,Nombre,Apellido,Correo electr\u00f3nico,Direcci\u00f3n de correo electr\u00f3nico,Celular de contacto,Regi\u00f3n de residencia,Distrito de residencia,T\u00edtulo docente,Adjuntar DNI (PDF),Adjuntar t\u00edtulo (PDF),Otra pregunta'
const row =
  '00123456,Ana,Perez,ana@example.com,cuenta@example.com,0112345678,1,Distrito Test,Profesora,https://drive.google.com/file/d/dni,https://drive.google.com/file/d/titulo,"Respuesta, con coma"'
const csv = header + '\n' + row
const distritos = [{ id: 9, nombre: 'Distrito Test', regionId: 1 }]

test('Google Forms headers, accents, zeroes, contact email, geographic IDs and external docs', () => {
  const [r] = analyzeCsv(csv, new Set(), distritos, [1])
  assert.equal(r.resultado, 'IMPORTAR')
  assert.equal(r.dni, '00123456')
  assert.equal(r.celular, '0112345678')
  assert.equal(r.email, 'ana@example.com')
  assert.equal(r.data.datosFormulario.distrito_residencia, 9)
  assert.equal(r.data.datosFormulario.region_residencia, 1)
  assert.equal(r.data.datosFormulario.titulo_docente, 'Profesora')
  assert.equal(r.data.datosFormulario['Otra pregunta'], 'Respuesta, con coma')
  assert.equal(r.data.dniAdjuntoUrl, 'https://drive.google.com/file/d/dni')
})

test('BOM, semicolons, quoted newlines and escaped quotes', () => {
  assert.deepEqual(
    parseCsv('\uFEFFDNI;Nombre;Apellido\r\n00123456;"Ana\nMaria";"Perez ""Lopez"""'),
    [
      ['DNI', 'Nombre', 'Apellido'],
      ['00123456', 'Ana\nMaria', 'Perez "Lopez"'],
    ],
  )
  assert.throws(() => parseCsv('DNI,Nombre\n"sin cierre'), /comillas/)
})

test('duplicate headers and missing required columns fail before import', () => {
  assert.throws(
    () => analyzeCsv('DNI,dni,Nombre,Apellido\n1,1,A,B', new Set(), [], []),
    /repetidos/,
  )
  assert.throws(() => analyzeCsv('Nombre,Apellido\nA,B', new Set(), [], []), /DNI/)
})

test('duplicates in file and cohort skipped; bad rows do not block valid ones', () => {
  const rows = analyzeCsv(
    'DNI,Nombre,Apellido\n12345678,A,B\n12.345.678,A,B\n87654321,C,D\ntexto,E,F\n98765432,,G',
    new Set(['87654321']),
    [],
    [],
  )
  assert.deepEqual(
    rows.map((r) => r.resultado),
    ['IMPORTAR', 'DUPLICADA', 'DUPLICADA', 'INVALIDA', 'INVALIDA'],
  )
})

test('email fallback, unknown geography and invalid attachment do not lose original responses', () => {
  const [r] = analyzeCsv(
    csv
      .replace('ana@example.com,', ',')
      .replace('Distrito Test', 'Otro distrito')
      .replace('https://drive.google.com/file/d/dni', 'javascript:alert(1)'),
    new Set(),
    [],
    [1],
  )
  assert.equal(r.email, 'cuenta@example.com')
  assert.equal(r.data.dniAdjuntoUrl, null)
  assert.equal(r.data.datosFormulario['Distrito de residencia'], 'Otro distrito')
  assert.ok(r.mensajes.length >= 2)
  assert.equal(r.resultado, 'IMPORTAR')
})

function importService(prisma) {
  const module = { exports: {} }
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(
        require.resolve('../src/modules/inscriptos/inscripto-import.service.ts'),
        'utf8',
      ),
      { compilerOptions: { module: ts.ModuleKind.CommonJS } },
    ).outputText,
    {
      module,
      exports: module.exports,
      require: (name) =>
        name === 'crypto'
          ? require('node:crypto')
          : name.includes('parser')
            ? { analyzeCsv }
            : name.includes('repository')
              ? { inscriptoRepository: { prisma } }
              : { BadRequestError: Error, NotFoundError: Error },
    },
  )
  return module.exports.inscriptoImportService
}

test('preview is read-only; commit pending records only; second import preserves existing states', async () => {
  const saved = []
  let writes = 0
  const prisma = {
    cohorte: { findUnique: async () => ({ id: 5, nombre: 'EA-2026', anio: 2026 }) },
    distrito: { findMany: async () => distritos },
    region: { findMany: async () => [{ id: 1 }] },
    inscripto: { findMany: async () => saved.map((r) => ({ dni: r.dni })) },
    $transaction: async (fn) =>
      fn({
        inscripto: {
          createMany: async ({ data, skipDuplicates }) => {
            assert.equal(skipDuplicates, true)
            writes++
            for (const r of data) saved.push(r)
            return { count: data.length }
          },
        },
      }),
  }
  const service = importService(prisma)
  const file = { originalname: 'modelo.csv', buffer: Buffer.from(csv) }
  const preview = await service.preview(file, 5)
  assert.equal(writes, 0)
  assert.equal(preview.validas, 1)
  await assert.rejects(service.commit(file, 5, 'hash incorrecto', 10))
  assert.equal(writes, 0)
  const result = await service.commit(file, 5, preview.hash, 10)
  assert.equal(result.creadas, 1)
  assert.equal(saved[0].estado, 'PENDIENTE')
  assert.equal(saved[0].documentacion, 'PENDIENTE')
  assert.equal(saved[0].institutoId, undefined)
  assert.equal(saved[0].aulaId, undefined)
  assert.equal(saved[0].datosFormulario.origen_registro, 'CSV')
  saved[0].estado = 'ASIGNADA'
  saved[0].documentacion = 'VERIFICADA'
  const second = await service.preview(file, 5)
  assert.equal(second.duplicadas, 1)
  assert.equal(second.validas, 0)
  await assert.rejects(service.commit(file, 5, second.hash, 10))
  assert.equal(writes, 1)
  assert.equal(saved[0].estado, 'ASIGNADA')
  assert.equal(saved[0].documentacion, 'VERIFICADA')
})

test('concurrent duplicates are excluded by createMany without overwriting', async () => {
  const prisma = {
    cohorte: { findUnique: async () => ({ id: 5, nombre: 'EA-2026', anio: 2026 }) },
    distrito: { findMany: async () => [] },
    region: { findMany: async () => [] },
    inscripto: { findMany: async () => [] },
    $transaction: async (fn) => fn({ inscripto: { createMany: async () => ({ count: 0 }) } }),
  }
  const service = importService(prisma),
    file = { originalname: 'modelo.csv', buffer: Buffer.from(csv) }
  const preview = await service.preview(file, 5),
    result = await service.commit(file, 5, preview.hash, 10)
  assert.equal(result.creadas, 0)
  assert.equal(result.omitidas, 1)
})


test('external documents return the original URL without accessing Supabase', async () => {
  const module = {exports: {}}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../src/shared/storage/storage.service.ts'), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, esModuleInterop: true}}).outputText, {
    module, exports: module.exports, URL,
    require: name => name === 'crypto' ? require('node:crypto') : {getSupabaseAdmin: () => {throw new Error('Must not access storage for external links')}}
  })
  const service = module.exports.storageService
  const result = await service.createSignedReadUrl('https://drive.google.com/file/d/documento')
  assert.equal(result.data.signedUrl,'https://drive.google.com/file/d/documento')
  assert.equal(result.data.bucket,'external')
  const invalid = await service.createSignedReadUrl('https://')
  assert.equal(invalid.code,400)
})


test('CSV endpoints require authentication and ADMIN before handling an upload', () => {
  const posts=[];let authenticated=false
  const router={use:middleware=>{authenticated=middleware==='auth'},post:(path,...handlers)=>posts.push({path,handlers}),get:()=>{},patch:()=>{}}
  const module={exports:{}}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../src/modules/inscriptos/inscripto.routes.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
    module,exports:module.exports,require:name=>name==='express'?{Router:()=>router}:name.includes('authMiddleware')?{authMiddleware:'auth'}:name.includes('roleMiddleware')?{requireRoles:role=>'role:'+role}:name.includes('uploadMiddleware')?{uploadMemory:{single:field=>'upload:'+field}}:{inscriptoController:{previewImport:'preview',commitImport:'commit'}}
  })
  assert.equal(authenticated,true)
  assert.deepEqual(posts.map(route=>route.path),['/import/preview','/import'])
  for(const route of posts){assert.equal(route.handlers[0],'role:ADMIN');assert.equal(route.handlers[1],'upload:file')}
})
