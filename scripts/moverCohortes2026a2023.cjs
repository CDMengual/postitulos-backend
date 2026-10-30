require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const shift = (value) => {
  if (!value) return null
  const result = new Date(value)
  result.setUTCFullYear(result.getUTCFullYear() - 3)
  return result
}
async function main() {
  await prisma.$transaction(async (tx) => {
    const cohortes = await tx.cohorte.findMany({ where: { anio: 2026 }, include: { aulas: true } })
    for (const c of cohortes) {
      const conflict = await tx.cohorte.findFirst({ where: { postituloId: c.postituloId, anio: 2023 } })
      if (conflict) throw new Error(`Ya existe una cohorte 2023 para el postitulo ${c.postituloId}`)
      await tx.cohorte.update({ where: { id: c.id }, data: {
        anio: 2023, nombre: c.nombre?.replace('2026', '2023'),
        fechaInicio: shift(c.fechaInicio), fechaFin: shift(c.fechaFin),
        fechaInicioInscripcion: shift(c.fechaInicioInscripcion), fechaFinInscripcion: shift(c.fechaFinInscripcion),
      } })
      for (const a of c.aulas) {
        await tx.aula.update({ where: { id: a.id }, data: {
          codigo: a.codigo.replace('-2026-', '-2023-'), nombre: a.nombre.replace('2026', '2023'),
        } })
        const snapshots = await tx.aulaSnapshotMensual.findMany({ where: { aulaId: a.id, anio: 2026 } })
        for (const s of snapshots) await tx.aulaSnapshotMensual.update({
          where: { id: s.id }, data: { anio: 2023, fechaCorte: shift(s.fechaCorte) },
        })
        const links = await tx.cursanteAula.findMany({ where: { aulaId: a.id, observaciones: 'Datos ficticios para dashboard (seed-dashboard-v1)' }, select: { cursanteId: true } })
        await tx.cursanteAula.updateMany({ where: { aulaId: a.id, observaciones: 'Datos ficticios para dashboard (seed-dashboard-v1)' }, data: { createdAt: new Date('2023-03-10T00:00:00-03:00') } })
        await tx.cursante.updateMany({ where: { id: { in: links.map((l) => l.cursanteId) }, apellido: { contains: 'Prueba 2026' } }, data: { apellido: `Prueba 2023 ${a.numero}` } })
      }
      await tx.inscripto.updateMany({ where: { cohorteId: c.id, observaciones: 'Datos ficticios para dashboard (seed-dashboard-v1)' }, data: {
        createdAt: new Date('2023-02-15T12:00:00-03:00'), apellido: 'Prueba 2023 1',
      } })
    }
    if (await tx.cohorte.count({ where: { anio: { gte: 2026 } } })) throw new Error('Quedan cohortes del anio actual o futuras')
  }, { timeout: 90000 })
  console.log(JSON.stringify({
    cohortes: await prisma.cohorte.findMany({ select: { nombre: true, anio: true, estado: true }, orderBy: { anio: 'asc' } }),
    aulas: await prisma.aula.count(), cursantes: await prisma.cursante.count(), inscripciones: await prisma.inscripto.count(),
    snapshotsPorAnio: await prisma.aulaSnapshotMensual.groupBy({ by: ['anio'], _count: true }),
  }))
}
main().catch((e) => { console.error(e.code || e.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
