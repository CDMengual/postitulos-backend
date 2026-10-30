require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const marca = 'Datos ficticios para dashboard (seed-dashboard-v1)'
const nombres = ['Ana', 'Juan', 'Carla', 'Luis', 'Lucia', 'Pedro', 'Paula', 'Diego', 'Sofia', 'Martin', 'Marina', 'Pablo', 'Camila', 'Javier', 'Valeria', 'Nicolas', 'Julieta', 'Federico', 'Laura', 'Mateo']
const inicio = (anio) => new Date(`${anio}-03-10T00:00:00-03:00`)
const fin = (anio) => new Date(`${anio}-${[2023, 2026].includes(anio) ? '10-20' : '11-30'}T23:59:59-03:00`)

async function main() {
  await prisma.$transaction(async (tx) => {
    const aulas = await tx.aula.findMany({ include: { cohorte: { include: { postitulo: true } } } })
    if (aulas.length !== 8 || aulas.some((a) => !['EI', 'EA'].includes(a.cohorte.postitulo.codigo))) throw new Error('Se requiere el escenario reducido de ocho aulas EI/EA')
    const ids = [...new Set(aulas.map((a) => a.cohorteId))]
    for (const id of ids) {
      const c = aulas.find((a) => a.cohorteId === id).cohorte
      const anio = c.anio === 2027 ? 2024 : c.anio === 2026 ? 2023 : c.anio
      if (![2023, 2024, 2025].includes(anio)) throw new Error('Anio fuera del escenario de prueba')
      if (c.anio !== anio) {
        for (const a of aulas.filter((a) => a.cohorteId === id)) await tx.aula.update({
          where: { id: a.id }, data: { codigo: a.codigo.replace(`-${c.anio}-`, `-${anio}-`), nombre: a.nombre.replace(String(c.anio), String(anio)) },
        })
      }
      await tx.cohorte.update({ where: { id }, data: {
        nombre: `${c.postitulo.codigo}-${anio}`, anio, estado: 'FINALIZADA',
        fechaInicio: inicio(anio), fechaFin: fin(anio),
        fechaInicioInscripcion: new Date(`${anio}-02-01T00:00:00-03:00`),
        fechaFinInscripcion: new Date(`${anio}-03-01T23:59:59-03:00`),
      } })
    }
  }, { timeout: 90000 })

  const aulas = await prisma.aula.findMany({
    orderBy: { codigo: 'asc' }, include: { cohorte: true, instituto: { include: { distrito: true } } },
  })
  // Mantener la distribucion original de estados aunque se cambie el anio.
  aulas.sort((a, b) => a.codigo.replace('-2023-', '-2026-').localeCompare(b.codigo.replace('-2023-', '-2026-')))
  for (const [index, aula] of aulas.entries()) {
    const total = 20
    const finalizados = 12 + index % 5
    const bajas = 2 + index % 2
    const adeudan = total - finalizados - bajas
    const personas = Array.from({ length: total }, (_, i) => ({
      dni: String(88000000 + aula.id * 100 + i + 1),
      nombre: nombres[i], apellido: `Prueba ${aula.cohorte.anio} ${aula.numero}`,
      email: `cursante.a${aula.id}.${i + 1}@example.test`,
      titulo: 'Titulo docente ficticio', distritoId: aula.instituto.distritoId,
      regionId: aula.instituto.distrito.regionId,
    }))
    const estado = (i) => i < finalizados ? 'FINALIZADO' : i < finalizados + bajas ? 'BAJA' : 'ADEUDA'
    const documentacion = (i) => estado(i) === 'FINALIZADO' ? 'VERIFICADA' : estado(i) === 'BAJA' ? 'NO_CORRESPONDE' : 'PENDIENTE'
    const snapshots = []
    const ultimoMes = [2023, 2026].includes(aula.cohorte.anio) ? 10 : 11
    for (let mes = 3; mes <= ultimoMes; mes++) {
      const ultimo = mes === ultimoMes
      const progress = (mes - 3) / (ultimoMes - 3)
      const baja = Math.round(bajas * progress)
      const finalizado = ultimo ? finalizados : mes >= 8 ? Math.round(finalizados * progress * 0.7) : 0
      const adeuda = ultimo ? adeudan : Math.min(adeudan, Math.round(adeudan * progress))
      const activos = total - baja - finalizado - adeuda
      const fechaCorte = ultimo ? fin(aula.cohorte.anio) : new Date(Date.UTC(aula.cohorte.anio, mes, 1, 2, 59, 59))
      snapshots.push({ aulaId: aula.id, anio: aula.cohorte.anio, mes, fechaCorte, totalInicial: total,
        activos, adeuda, baja, finalizado, totalFoto: total, observaciones: marca })
    }
    await prisma.$transaction(async (tx) => {
      const existing = await tx.cursante.findMany({ where: { OR: [{ dni: { in: personas.map((p) => p.dni) } }, { email: { in: personas.map((p) => p.email) } }] } })
      if (existing.some((p) => !personas.some((d) => d.dni === p.dni && d.email === p.email))) throw new Error(`Colision de datos en ${aula.codigo}`)
      await tx.cursante.createMany({ data: personas, skipDuplicates: true })
      const saved = await tx.cursante.findMany({ where: { dni: { in: personas.map((p) => p.dni) } } })
      const byDni = new Map(saved.map((p) => [p.dni, p.id]))
      await tx.cursanteAula.createMany({ data: personas.map((p, i) => ({
        cursanteId: byDni.get(p.dni), aulaId: aula.id, estado: estado(i), documentacion: documentacion(i), observaciones: marca,
        createdAt: inicio(aula.cohorte.anio),
      })), skipDuplicates: true })
      await tx.inscripto.createMany({ data: personas.map((p, i) => ({
        cohorteId: aula.cohorteId, institutoId: aula.institutoId,
        nombre: p.nombre, apellido: p.apellido, dni: p.dni, email: p.email,
        estado: 'ASIGNADA', documentacion: documentacion(i), observaciones: marca, prioridad: i % 4,
        datosFormulario: { dni: p.dni, nombre: p.nombre, apellido: p.apellido, email: p.email, origen: marca },
        createdAt: new Date(`${aula.cohorte.anio}-02-15T12:00:00-03:00`),
      })), skipDuplicates: true })
      await tx.aulaSnapshotMensual.createMany({ data: snapshots, skipDuplicates: true })
      const [links, inscritos, fotos] = await Promise.all([
        tx.cursanteAula.findMany({ where: { aulaId: aula.id, cursanteId: { in: [...byDni.values()] } } }),
        tx.inscripto.count({ where: { cohorteId: aula.cohorteId, dni: { in: personas.map((p) => p.dni) }, estado: 'ASIGNADA', institutoId: aula.institutoId } }),
        tx.aulaSnapshotMensual.findMany({ where: { aulaId: aula.id, anio: aula.cohorte.anio } }),
      ])
      if (links.length !== total || inscritos !== total || fotos.length !== snapshots.length ||
          links.filter((p) => p.estado === 'FINALIZADO').length !== finalizados ||
          links.filter((p) => p.estado === 'BAJA').length !== bajas ||
          links.filter((p) => p.estado === 'ADEUDA').length !== adeudan ||
          fotos.some((s) => s.activos + s.adeuda + s.baja + s.finalizado !== total || s.totalInicial !== total || s.fechaCorte > new Date())) {
        throw new Error(`No coincide la verificacion en ${aula.codigo}`)
      }
    }, { timeout: 60000 })
    console.log(`${aula.codigo}: ${total} cursantes, ${finalizados} finalizados, ${adeudan} adeudan, ${bajas} bajas; ${snapshots.length} snapshots`)
  }
  console.log('Carga verificada: 8 aulas finalizadas, 160 cursantes e inscripciones asignadas, 70 snapshots mensuales ficticios.')
}
main().catch((error) => {
  console.error('No se pudo completar la carga:', error.code || error.message)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
