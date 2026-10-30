require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const fs = require('node:fs')
const path = require('node:path')
const todos = [...require('../prisma/postitulosDetalles.json'), ...require('../prisma/postitulosAdicionales.json')]
const filter = process.argv.find((arg) => arg.startsWith('--codigos='))?.slice('--codigos='.length).split(',')
if (filter?.some((code) => !todos.some((item) => item.codigo === code))) throw new Error('Codigo desconocido')
const detalles = filter ? todos.filter((item) => filter.includes(item.codigo)) : todos

const root = path.resolve(__dirname, '..')
const filename = 'Resoluciones _ Dict\u00e1menes _ Programas.xlsx'
const workbook = XLSX.readFile(path.join(root, filename))
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: true })
const documentos = detalles.map((detalle) => {
  const matches = rows.map((row, i) => ({ row, i })).filter(({ row }) =>
    detalle.ofertaExcel
      ? normalize(row[0]) === normalize(detalle.ofertaExcel)
      : normalize(row[0]).startsWith(detalle.codigo === 'EI' ? 'ensenanza con imagenes' : 'educacion ambiental.'))
  if (matches.length !== 1) throw new Error(`No se encontro una fila unica para ${detalle.codigo}`)
  const rowNumber = matches[0].i + 1
  const fields = { resolucion: 'B', resolucionPuntaje: 'C', dictamen: 'D', programa: 'E' }
  const result = { codigo: detalle.codigo, nombre: String(matches[0].row[0]) }
  for (const [field, column] of Object.entries(fields)) {
    const cell = sheet[`${column}${rowNumber}`]
    const url = cell?.l?.Target
    if (url && new URL(url).protocol !== 'https:') throw new Error(`Enlace invalido: ${detalle.codigo}/${field}`)
    result[field] = { referencia: cell?.v === undefined || cell.v === '' ? null : String(cell.v), url: url || null }
  }
  if (!result.resolucion.url || !result.programa.url) throw new Error(`Faltan documentos obligatorios: ${detalle.codigo}`)
  return result
})

const prisma = new PrismaClient()
async function main() {
  // Conservar las referencias y enlaces originales del Excel.
  const file = path.join(root, 'prisma/postitulosDocumentos.json')
  const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []
  const merged = [...previous.filter((item) => !detalles.some((d) => d.codigo === item.codigo)), ...documentos]
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n')
  for (const detalle of detalles) {
    const docs = documentos.find((item) => item.codigo === detalle.codigo)
    await prisma.$transaction(async (tx) => {
      const data = {
          ...(detalle.nombre ? { nombre: detalle.nombre } : {}),
          destinatarios: detalle.destinatarios,
          descripcion: detalle.descripcion,
          modalidad: detalle.modalidad,
          cargaHoraria: detalle.cargaHoraria,
          resolucion: docs.resolucion.url,
          resolucionNumero: docs.resolucion.referencia,
          resolucionPuntaje: docs.resolucionPuntaje.url,
          resolucionPuntajeNumero: docs.resolucionPuntaje.referencia,
          dictamen: docs.dictamen.url,
          dictamenNumero: docs.dictamen.referencia,
          programa: docs.programa.url,
          planEstudios: detalle.planEstudios || null,
        }
      const postitulo = await tx.postitulo.upsert({
        where: { codigo: detalle.codigo },
        update: data,
        create: { ...data, codigo: detalle.codigo, nombre: detalle.nombre || docs.nombre, ...(detalle.requisitos ? { requisitos: detalle.requisitos } : {}) },
        select: { id: true },
      })
      if (detalle.tipo && detalle.titulo) {
        const existing = await tx.postituloTipo.findFirst({
          where: { postituloId: postitulo.id, tipo: detalle.tipo, titulo: detalle.titulo },
        })
        if (!existing) await tx.postituloTipo.create({
          data: { postituloId: postitulo.id, tipo: detalle.tipo, titulo: detalle.titulo },
        })
      }
    }, { timeout: 30000 })
  }
  const saved = await prisma.postitulo.findMany({
    where: { codigo: { in: detalles.map((item) => item.codigo) } },
    include: { tipos: true },
  })
  for (const detalle of detalles) {
    const actual = saved.find((item) => item.codigo === detalle.codigo)
    const docs = documentos.find((item) => item.codigo === detalle.codigo)
    const expected = {
      destinatarios: detalle.destinatarios, descripcion: detalle.descripcion,
      modalidad: detalle.modalidad, cargaHoraria: detalle.cargaHoraria,
      resolucion: docs.resolucion.url, resolucionPuntaje: docs.resolucionPuntaje.url,
      resolucionNumero: docs.resolucion.referencia,
      resolucionPuntajeNumero: docs.resolucionPuntaje.referencia,
      dictamenNumero: docs.dictamen.referencia,
      programa: docs.programa.url,
      dictamen: docs.dictamen.url, planEstudios: detalle.planEstudios || null,
    }
    if (!actual || Object.entries(expected).some(([key, value]) => actual[key] !== value) ||
        (detalle.tipo && !actual.tipos.some((item) => item.tipo === detalle.tipo && item.titulo === detalle.titulo))) {
      throw new Error(`La verificacion no coincide para ${detalle.codigo}`)
    }
    console.log(`${actual.codigo}: actualizado y verificado, ${actual.cargaHoraria} horas, ${actual.tipos.length} titulo(s).`)
  }
}
main().catch((error) => {
  console.error('No se pudo completar la actualizacion:', error.code || error.message)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
