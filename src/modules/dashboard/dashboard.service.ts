import { dashboardRepository } from './dashboard.repository'

type DashboardScope =
  | { mode: 'global' }
  | { mode: 'user'; aulaIds: number[]; cohorteIds: number[]; institutoIds: number[] }

type DashboardResumen = {
  postitulos: number
  cohortes: number
  cohortesInscripcion: number
  cohortesActivas: number
  cohortesInactivas: number
  cohortesFinalizadas: number
  cohortesCanceladas: number
  cursantesTotales: number
  cursantesActivos: number
  cursantesAdeudan: number
  cursantesBaja: number
  cursantesFinalizados: number
  inscriptosTotales: number
}

type EstadoCursanteResumen = ReturnType<typeof initialEstadosCursante>

type DashboardPostituloRow = {
  postituloId: number
  nombre: string
  codigo: string | null
  anio: number
  estado: string
  aulas: number
  cursantes: number
  cursantesActivos: number
  cursantesAdeudan: number
  cursantesBaja: number
  cursantesFinalizados: number
  inscriptos: number
}

type DashboardYearBlock = {
  anio: number
  resumen: DashboardResumen
  porPostitulo: DashboardPostituloRow[]
}

type DashboardDesgranamientoRow = {
  postituloId: number
  postitulo: string
  codigo: string | null
  anio: number
  mes: number
  fechaCorte: Date
  totalInicial: number
  activos: number
  adeuda: number
  baja: number
  finalizado: number
  totalFoto: number
  desgranamientoPct: number
}

const getDashboardScope = async (userId: number, rol: string): Promise<DashboardScope> => {
  if (rol === 'ADMIN') return { mode: 'global' }

  const aulas = await dashboardRepository.findUserAulas(userId)
  return {
    mode: 'user',
    aulaIds: [...new Set(aulas.map((aula: any) => aula.id))] as number[],
    cohorteIds: [...new Set(aulas.map((aula: any) => aula.cohorteId))] as number[],
    institutoIds: [...new Set(aulas.map((aula: any) => aula.institutoId))] as number[],
  }
}

const initialEstadosCursante = () => ({ ACTIVO: 0, ADEUDA: 0, BAJA: 0, FINALIZADO: 0 })

const initialResumen = (): DashboardResumen => ({
  postitulos: 0,
  cohortes: 0,
  cohortesInscripcion: 0,
  cohortesActivas: 0,
  cohortesInactivas: 0,
  cohortesFinalizadas: 0,
  cohortesCanceladas: 0,
  cursantesTotales: 0,
  cursantesActivos: 0,
  cursantesAdeudan: 0,
  cursantesBaja: 0,
  cursantesFinalizados: 0,
  inscriptosTotales: 0,
})

const buildResumen = (rows: DashboardPostituloRow[], estados: EstadoCursanteResumen): DashboardResumen => {
  const resumen = initialResumen()
  resumen.postitulos = new Set(rows.map((row) => row.postituloId)).size
  resumen.cohortes = rows.length
  resumen.cursantesTotales = rows.reduce((acc, row) => acc + row.cursantes, 0)
  resumen.cursantesActivos = estados.ACTIVO
  resumen.cursantesAdeudan = estados.ADEUDA
  resumen.cursantesBaja = estados.BAJA
  resumen.cursantesFinalizados = estados.FINALIZADO
  resumen.inscriptosTotales = rows.reduce((acc, row) => acc + row.inscriptos, 0)

  for (const row of rows) {
    if (row.estado === 'INSCRIPCION') resumen.cohortesInscripcion += 1
    if (row.estado === 'ACTIVA') resumen.cohortesActivas += 1
    if (row.estado === 'INACTIVA') resumen.cohortesInactivas += 1
    if (row.estado === 'FINALIZADA') resumen.cohortesFinalizadas += 1
    if (row.estado === 'CANCELADA') resumen.cohortesCanceladas += 1
  }

  return resumen
}

const buildEmptyDashboardResponse = (userId: number, rol: string, scope: DashboardScope) => ({
  alcance: {
    scope: scope.mode === 'global' ? 'global' : 'user',
    userId,
    rol,
  },
  porAnio: [] as DashboardYearBlock[],
})

export const dashboardService = {
  async getResumen(userId: number, rol: string) {
    const scope = await getDashboardScope(userId, rol)
    if (scope.mode === 'user' && scope.cohorteIds.length === 0) {
      return buildEmptyDashboardResponse(userId, rol, scope)
    }

    const cohortes = await dashboardRepository.findCohortesByScope(
      scope.mode === 'global' ? undefined : scope.cohorteIds,
    )
    if (cohortes.length === 0) {
      return buildEmptyDashboardResponse(userId, rol, scope)
    }

    const cohorteIds = cohortes.map((cohorte: any) => cohorte.id)
    const cursantesEnAula = await dashboardRepository.findCursantesEnAulaByScope({
      mode: scope.mode,
      cohorteIds,
      aulaIds: scope.mode === 'global' ? [] : scope.aulaIds,
    })
    const inscriptos = await dashboardRepository.findInscriptosByScope({
      mode: scope.mode,
      cohorteIds,
      institutoIds: scope.mode === 'global' ? [] : scope.institutoIds,
    })

    const cursantesPorCohorte = new Map<number, Set<number>>()
    const estadosPorCohorte = new Map<number, EstadoCursanteResumen>()

    for (const item of cursantesEnAula) {
      const cohorteSet = cursantesPorCohorte.get(item.aula.cohorteId) ?? new Set<number>()
      cohorteSet.add(item.cursanteId)
      cursantesPorCohorte.set(item.aula.cohorteId, cohorteSet)

      const estados = estadosPorCohorte.get(item.aula.cohorteId) ?? initialEstadosCursante()
      estados[item.estado as keyof EstadoCursanteResumen] += 1
      estadosPorCohorte.set(item.aula.cohorteId, estados)
    }

    const inscriptosPorCohorte = new Map<number, number>()
    for (const item of inscriptos) {
      inscriptosPorCohorte.set(item.cohorteId, (inscriptosPorCohorte.get(item.cohorteId) ?? 0) + 1)
    }

    const rows: DashboardPostituloRow[] = cohortes.map((cohorte: any) => {
      const cursantes = cursantesPorCohorte.get(cohorte.id)?.size ?? 0
      const estados = estadosPorCohorte.get(cohorte.id) ?? initialEstadosCursante()
      const inscriptosCount = inscriptosPorCohorte.get(cohorte.id) ?? 0

      return {
        postituloId: cohorte.postitulo.id,
        nombre: cohorte.postitulo.nombre,
        codigo: cohorte.postitulo.codigo,
        anio: cohorte.anio,
        estado: cohorte.estado,
        aulas: cohorte._count.aulas,
        cursantes,
        cursantesActivos: estados.ACTIVO,
        cursantesAdeudan: estados.ADEUDA,
        cursantesBaja: estados.BAJA,
        cursantesFinalizados: estados.FINALIZADO,
        inscriptos: inscriptosCount,
      }
    })

    const rowsByYear = new Map<number, DashboardPostituloRow[]>()
    for (const row of rows) {
      const current = rowsByYear.get(row.anio) ?? []
      current.push(row)
      rowsByYear.set(row.anio, current)
    }

    const porAnio: DashboardYearBlock[] = [...rowsByYear.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([anio, yearRows]) => {
        const resumenEstados = yearRows.reduce(
          (acc, row) => {
            acc.ACTIVO += row.cursantesActivos
            acc.ADEUDA += row.cursantesAdeudan
            acc.BAJA += row.cursantesBaja
            acc.FINALIZADO += row.cursantesFinalizados
            return acc
          },
          initialEstadosCursante(),
        )

        return {
          anio,
          resumen: buildResumen(yearRows, resumenEstados),
          porPostitulo: [...yearRows].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        }
      })

    return {
      alcance: {
        scope: scope.mode === 'global' ? 'global' : 'user',
        userId,
        rol,
      },
      porAnio,
    }
  },

  async getDesgranamiento(userId: number, rol: string) {
    const scope = await getDashboardScope(userId, rol)
    if (scope.mode === 'user' && scope.aulaIds.length === 0) {
      return {
        alcance: { scope: 'user', userId, rol },
        series: [] as DashboardDesgranamientoRow[],
      }
    }

    const snapshots = await dashboardRepository.findSnapshotsByScope({
      mode: scope.mode,
      aulaIds: scope.mode === 'global' ? [] : scope.aulaIds,
    })

    const grouped = new Map<string, DashboardDesgranamientoRow>()
    for (const snapshot of snapshots) {
      const postitulo = snapshot.aula.cohorte.postitulo
      const key = `${postitulo.id}-${snapshot.anio}-${snapshot.mes}`
      const current = grouped.get(key) ?? {
        postituloId: postitulo.id,
        postitulo: postitulo.nombre,
        codigo: postitulo.codigo,
        anio: snapshot.anio,
        mes: snapshot.mes,
        fechaCorte: snapshot.fechaCorte,
        totalInicial: 0,
        activos: 0,
        adeuda: 0,
        baja: 0,
        finalizado: 0,
        totalFoto: 0,
        desgranamientoPct: 0,
      }

      current.totalInicial += snapshot.totalInicial
      current.activos += snapshot.activos
      current.adeuda += snapshot.adeuda
      current.baja += snapshot.baja
      current.finalizado += snapshot.finalizado
      current.totalFoto += snapshot.totalFoto
      grouped.set(key, current)
    }

    const series = [...grouped.values()]
      .map((item) => ({
        ...item,
        desgranamientoPct:
          item.totalInicial > 0 ? Number(((item.baja / item.totalInicial) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio
        if (a.postitulo !== b.postitulo) return a.postitulo.localeCompare(b.postitulo, 'es')
        return a.mes - b.mes
      })

    return {
      alcance: {
        scope: scope.mode === 'global' ? 'global' : 'user',
        userId,
        rol,
      },
      series,
    }
  },
}
