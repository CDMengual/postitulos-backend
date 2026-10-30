require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const originales = require('../prisma/cohortes2025_2026.json')
const targets = ['EI', 'EA'].flatMap((codigo) => [
  { codigo, anio: 2025, estado: 'FINALIZADA', cantidad: 2 },
  { codigo, anio: 2026, estado: 'ACTIVA', cantidad: 1 },
  { codigo, anio: 2027, estado: 'INSCRIPCION', cantidad: 1 },
])
const aulaCode = (c, numero) => `${c.codigo}-${c.anio}-Aula${String(numero).padStart(2, '0')}`
const wanted = targets.flatMap((c) => Array.from({ length: c.cantidad }, (_, i) => aulaCode(c, i + 1)))
const known = new Set([...wanted, ...originales.flatMap((c) => Array.from({ length: c.cupos / 60 }, (_, i) => aulaCode(c, i + 1)))])
const date = (value) => new Date(`${value}T00:00:00-03:00`)

async function main() {
  await prisma.$transaction(async (tx) => {
    const aulas = await tx.aula.findMany({ include: { _count: { select: { cursantes: true, snapshotsMensuales: true } } } })
    if (aulas.some((a) => !known.has(a.codigo))) throw new Error('Hay aulas ajenas al escenario de prueba; no se modifico nada')
    if (aulas.some((a) => a._count.cursantes || a._count.snapshotsMensuales) || await tx.inscripto.count()) {
      throw new Error('Hay datos de cursantes, inscriptos o snapshots; no se modifico nada')
    }
    const [postitulos, refs, admin, formularios] = await Promise.all([
      tx.postitulo.findMany({ where: { codigo: { in: ['EI', 'EA'] } } }),
      tx.user.findMany({ where: { email: { in: ['referente01@example.test', 'referente02@example.test'] } } }),
      tx.user.findFirst({ where: { rol: 'ADMIN' }, orderBy: { id: 'asc' } }),
      tx.formulario.findMany({ orderBy: { id: 'asc' } }),
    ])
    if (!admin || postitulos.length !== 2 || refs.length !== 2 || refs.some((r) => r.rol !== 'REFERENTE' || !r.institutoId)) {
      throw new Error('Faltan postitulos, referentes con instituto o administrador')
    }
    if (postitulos.some((p) => !formularios.some((f) => f.postituloId === p.id))) throw new Error('Faltan formularios')
    const removeIds = aulas.filter((a) => !wanted.includes(a.codigo)).map((a) => a.id)
    await tx.aula.deleteMany({ where: { id: { in: removeIds } } })

    for (const c of targets) {
      const postitulo = postitulos.find((p) => p.codigo === c.codigo)
      const ref = refs.find((r) => r.email === (c.codigo === 'EA' ? 'referente01@example.test' : 'referente02@example.test'))
      const formulario = formularios.find((f) => f.postituloId === postitulo.id)
      const nombre = `${c.codigo}-${c.anio}`
      const matches = await tx.cohorte.findMany({ where: { nombre, postituloId: postitulo.id, anio: c.anio } })
      if (matches.length > 1) throw new Error(`Cohorte duplicada: ${nombre}`)
      const data = {
        nombre, anio: c.anio, postituloId: postitulo.id, formularioId: formulario.id,
        estado: c.estado, cantidadAulas: c.cantidad, cupos: c.cantidad * 60,
        cuposListaEspera: 0, cuposTotales: c.cantidad * 60,
        fechaInicio: date(`${c.anio}-03-10`), fechaFin: new Date(`${c.anio}-11-30T23:59:59-03:00`),
        fechaInicioInscripcion: date(c.anio === 2027 ? '2026-10-01' : `${c.anio}-02-01`),
        fechaFinInscripcion: new Date(`${c.anio}-03-01T23:59:59-03:00`),
      }
      const cohorte = matches.length
        ? await tx.cohorte.update({ where: { id: matches[0].id }, data })
        : await tx.cohorte.create({ data })
      await tx.cohorteInstituto.deleteMany({ where: { cohorteId: cohorte.id, institutoId: { not: ref.institutoId } } })
      await tx.cohorteInstituto.upsert({
        where: { cohorteId_institutoId: { cohorteId: cohorte.id, institutoId: ref.institutoId } },
        create: { cohorteId: cohorte.id, institutoId: ref.institutoId }, update: {},
      })
      for (let numero = 1; numero <= c.cantidad; numero++) {
        const fields = {
          numero, nombre: `${nombre} - Aula ${numero}`, cohorteId: cohorte.id, institutoId: ref.institutoId,
        }
        await tx.aula.upsert({
          where: { codigo: aulaCode(c, numero) },
          create: { ...fields, codigo: aulaCode(c, numero), admins: { connect: { id: admin.id } }, referentes: { connect: { id: ref.id } } },
          update: { ...fields, referentes: { set: [{ id: ref.id }] } },
        })
      }
    }
    // Conservar las cohortes historicas restantes, sin aulas y fuera de actividad.
    await tx.cohorte.updateMany({
      where: { nombre: { in: originales.filter((c) => !['EI', 'EA'].includes(c.codigo)).map((c) => c.nombreCohorte) }, aulas: { none: {} } },
      data: { cantidadAulas: 0, cupos: 0, cuposTotales: 0, cuposListaEspera: 0, estado: 'INACTIVA' },
    })
    const saved = await tx.aula.findMany({ include: { cohorte: { include: { postitulo: true } }, referentes: true } })
    if (saved.length !== 8) throw new Error('La verificacion no encontro exactamente 8 aulas')
    for (const c of targets) {
      const group = saved.filter((a) => a.cohorte.postitulo.codigo === c.codigo && a.cohorte.anio === c.anio)
      const email = c.codigo === 'EA' ? 'referente01@example.test' : 'referente02@example.test'
      if (group.length !== c.cantidad || group.some((a) => a.cohorte.estado !== c.estado || a.referentes.length !== 1 || a.referentes[0].email !== email || a.institutoId !== a.referentes[0].institutoId)) {
        throw new Error(`No coinciden estados o referentes: ${c.codigo}/${c.anio}`)
      }
      if (c.estado === 'INSCRIPCION' && group.some((a) => a.cohorte.fechaInicioInscripcion > new Date() || a.cohorte.fechaFinInscripcion < new Date())) {
        throw new Error('La cohorte de prueba no esta dentro del periodo de inscripcion')
      }
    }
    console.log(`Eliminadas ${removeIds.length} aulas vacias; verificadas 8 aulas con estados, institutos y referentes correctos.`)
  }, { timeout: 180000 })
  const result = await prisma.aula.findMany({
    orderBy: { codigo: 'asc' },
    select: { codigo: true, cohorte: { select: { estado: true } }, referentes: { select: { email: true } } },
  })
  for (const a of result) console.log(`${a.codigo} | ${a.cohorte.estado} | ${a.referentes.map((r) => r.email).join(', ')}`)
}
main().catch((error) => {
  console.error('No se pudo ajustar el escenario:', error.code || error.message)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
