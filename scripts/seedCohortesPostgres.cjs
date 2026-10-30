require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const cohortes = require('../prisma/cohortes2025_2026.json')
const prisma = new PrismaClient()
const toDate = (value) => new Date(value.replace(' ', 'T') + '-03:00')

async function main() {
  const [postitulos, institutos, admins, referentes, formularios] = await Promise.all([
    prisma.postitulo.findMany({ where: { codigo: { in: [...new Set(cohortes.map((c) => c.codigo))] } } }),
    prisma.instituto.findMany({ orderBy: [{ distritoId: 'asc' }, { nombre: 'asc' }, { id: 'asc' }] }),
    prisma.user.findMany({ where: { rol: 'ADMIN' }, orderBy: { id: 'asc' }, select: { id: true } }),
    prisma.user.findMany({ where: { rol: 'REFERENTE' }, orderBy: { id: 'asc' }, select: { id: true, institutoId: true } }),
    prisma.formulario.findMany({ orderBy: { id: 'asc' }, select: { id: true, postituloId: true } }),
  ])
  if (!institutos.length || !admins.length) throw new Error('Se necesitan institutos y un usuario ADMIN')
  for (const c of cohortes) {
    const p = postitulos.find((p) => p.codigo === c.codigo)
    if (!p) throw new Error(`Falta el postitulo ${c.codigo}`)
    if (['EI', 'EA'].includes(c.codigo) && !formularios.some((f) => f.postituloId === p.id)) {
      throw new Error(`Falta formulario de ${c.codigo}; ejecutar npm run seed:formularios`)
    }
    if (!Number.isInteger(c.cupos / 60)) throw new Error(`Cupos invalidos: ${c.nombreCohorte}`)
  }

  for (const c of cohortes) {
    const postitulo = postitulos.find((p) => p.codigo === c.codigo)
    const formulario = formularios.find((f) => f.postituloId === postitulo.id)
    const cantidadAulas = c.cupos / 60
    await prisma.$transaction(async (tx) => {
      const existentes = await tx.cohorte.findMany({ where: { postituloId: postitulo.id, anio: c.anio, nombre: c.nombreCohorte } })
      if (existentes.length > 1) throw new Error(`Cohorte duplicada: ${c.nombreCohorte}`)
      let cohorte = existentes[0]
      if (!cohorte) cohorte = await tx.cohorte.create({ data: {
        nombre: c.nombreCohorte, anio: c.anio, estado: c.estado,
        fechaInicio: toDate(c.fechaInicio), fechaFin: toDate(c.fechaFin),
        fechaInicioInscripcion: toDate(c.fechaInicioInscripcion),
        fechaFinInscripcion: toDate(c.fechaFinInscripcion),
        postituloId: postitulo.id, formularioId: formulario?.id || null,
        cantidadAulas, cupos: c.cupos, cuposListaEspera: 0, cuposTotales: c.cupos,
      } })
      else if (!cohorte.formularioId && formulario) await tx.cohorte.update({
        where: { id: cohorte.id }, data: { formularioId: formulario.id },
      })

      await tx.cohorteInstituto.createMany({
        data: institutos.map((i) => ({ cohorteId: cohorte.id, institutoId: i.id })), skipDuplicates: true,
      })
      // No borrar ni reasignar aulas existentes ni sus cursantes/equipos.
      const aulas = await tx.aula.findMany({ where: { cohorteId: cohorte.id }, select: { codigo: true } })
      const existentesPorCodigo = new Set(aulas.map((a) => a.codigo))
      for (let numero = 1; numero <= cantidadAulas; numero++) {
        const codigo = `${c.codigo}-${c.anio}-Aula${String(numero).padStart(2, '0')}`
        if (existentesPorCodigo.has(codigo)) continue
        const instituto = institutos[(numero - 1) % institutos.length]
        const referente = referentes.find((r) => r.institutoId === instituto.id)
        await tx.aula.create({ data: {
          numero, nombre: `${c.nombreCohorte} - Aula ${numero}`, codigo,
          cohorteId: cohorte.id, institutoId: instituto.id,
          admins: { connect: { id: admins[0].id } },
          ...(referente ? { referentes: { connect: { id: referente.id } } } : {}),
        } })
      }
    }, { timeout: 60000 })
    console.log(`${c.nombreCohorte}: cohorte y ${cantidadAulas} aulas procesadas`)
  }

  const saved = await prisma.cohorte.findMany({
    where: { nombre: { in: cohortes.map((c) => c.nombreCohorte) }, postituloId: { in: postitulos.map((p) => p.id) } },
    include: { aulas: { include: { admins: { select: { id: true } } } }, cohorteInstitutos: true, formulario: true, postitulo: true },
  })
  let totalAulas = 0
  for (const c of cohortes) {
    const actual = saved.find((p) => p.nombre === c.nombreCohorte && p.postitulo.codigo === c.codigo)
    if (!actual || actual.aulas.length !== c.cupos / 60 || actual.cohorteInstitutos.length < institutos.length ||
        (['EI', 'EA'].includes(c.codigo) && actual.formulario?.postituloId !== actual.postituloId)) {
      throw new Error(`No coincide la verificacion de ${c.nombreCohorte}`)
    }
    for (let numero = 1; numero <= c.cupos / 60; numero++) {
      const aula = actual.aulas.find((a) => a.codigo === `${c.codigo}-${c.anio}-Aula${String(numero).padStart(2, '0')}`)
      if (!aula || !aula.admins.length || !institutos.some((i) => i.id === aula.institutoId)) {
        throw new Error(`Aula o relaciones incompletas: ${c.nombreCohorte}/${numero}`)
      }
    }
    totalAulas += actual.aulas.length
  }
  console.log(`Verificado: ${saved.length} cohortes, ${totalAulas} aulas, formularios EI/EA vinculados.`)
  console.log('Las fechas historicas se conservaron. No hay inscripciones abiertas hoy con estas fechas.')
}
main().catch((error) => {
  console.error('No se pudo completar la carga:', error.code || error.message)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
