"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const buildUserAulaWhere = (userId) => ({
    OR: [
        { admins: { some: { id: userId } } },
        { referentes: { some: { id: userId } } },
        { formadores: { some: { id: userId } } },
        { coordinadores: { some: { id: userId } } },
    ],
});
const getDashboardScope = async (userId, rol) => {
    if (rol === 'ADMIN') {
        return { mode: 'global' };
    }
    const aulas = await client_1.default.aula.findMany({
        where: buildUserAulaWhere(userId),
        select: {
            id: true,
            cohorteId: true,
            institutoId: true,
        },
    });
    return {
        mode: 'user',
        aulaIds: [...new Set(aulas.map((aula) => aula.id))],
        cohorteIds: [...new Set(aulas.map((aula) => aula.cohorteId))],
        institutoIds: [...new Set(aulas.map((aula) => aula.institutoId))],
    };
};
const initialEstadosCursante = () => ({
    ACTIVO: 0,
    ADEUDA: 0,
    BAJA: 0,
    FINALIZADO: 0,
});
const initialResumen = () => ({
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
});
const buildResumen = (rows, estadosCursanteResumen) => {
    const resumen = initialResumen();
    resumen.postitulos = new Set(rows.map((row) => row.postituloId)).size;
    resumen.cohortes = rows.length;
    resumen.cursantesTotales = rows.reduce((acc, row) => acc + row.cursantes, 0);
    resumen.cursantesActivos = estadosCursanteResumen.ACTIVO;
    resumen.cursantesAdeudan = estadosCursanteResumen.ADEUDA;
    resumen.cursantesBaja = estadosCursanteResumen.BAJA;
    resumen.cursantesFinalizados = estadosCursanteResumen.FINALIZADO;
    resumen.inscriptosTotales = rows.reduce((acc, row) => acc + row.inscriptos, 0);
    for (const row of rows) {
        if (row.estado === 'INSCRIPCION')
            resumen.cohortesInscripcion += 1;
        if (row.estado === 'ACTIVA')
            resumen.cohortesActivas += 1;
        if (row.estado === 'INACTIVA')
            resumen.cohortesInactivas += 1;
        if (row.estado === 'FINALIZADA')
            resumen.cohortesFinalizadas += 1;
        if (row.estado === 'CANCELADA')
            resumen.cohortesCanceladas += 1;
    }
    return resumen;
};
const buildEmptyDashboardResponse = (userId, rol, scope) => ({
    alcance: {
        scope: scope.mode === 'global' ? 'global' : 'user',
        userId,
        rol,
    },
    porAnio: [],
});
exports.dashboardService = {
    async getResumen(userId, rol) {
        const scope = await getDashboardScope(userId, rol);
        if (scope.mode === 'user' && scope.cohorteIds.length === 0) {
            return buildEmptyDashboardResponse(userId, rol, scope);
        }
        const cohortes = await client_1.default.cohorte.findMany({
            where: scope.mode === 'global'
                ? undefined
                : {
                    id: { in: scope.cohorteIds },
                },
            select: {
                id: true,
                anio: true,
                estado: true,
                postitulo: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                    },
                },
                _count: {
                    select: {
                        aulas: true,
                    },
                },
            },
            orderBy: [{ anio: 'desc' }, { id: 'desc' }],
        });
        if (cohortes.length === 0) {
            return buildEmptyDashboardResponse(userId, rol, scope);
        }
        const cohorteIds = cohortes.map((cohorte) => cohorte.id);
        const cursantesEnAula = await client_1.default.cursanteAula.findMany({
            where: scope.mode === 'global'
                ? {
                    aula: {
                        cohorteId: { in: cohorteIds },
                    },
                }
                : {
                    aulaId: { in: scope.aulaIds },
                },
            select: {
                cursanteId: true,
                estado: true,
                aula: {
                    select: {
                        cohorteId: true,
                    },
                },
            },
        });
        const inscriptos = await client_1.default.inscripto.findMany({
            where: scope.mode === 'global'
                ? {
                    cohorteId: { in: cohorteIds },
                }
                : {
                    cohorteId: { in: scope.cohorteIds },
                    institutoId: { in: scope.institutoIds },
                },
            select: {
                cohorteId: true,
            },
        });
        const cursantesPorCohorte = new Map();
        const estadosCursantePorCohorte = new Map();
        for (const item of cursantesEnAula) {
            const cohorteSet = cursantesPorCohorte.get(item.aula.cohorteId) ?? new Set();
            cohorteSet.add(item.cursanteId);
            cursantesPorCohorte.set(item.aula.cohorteId, cohorteSet);
            const estadosCohorte = estadosCursantePorCohorte.get(item.aula.cohorteId) ?? initialEstadosCursante();
            estadosCohorte[item.estado] += 1;
            estadosCursantePorCohorte.set(item.aula.cohorteId, estadosCohorte);
        }
        const inscriptosPorCohorte = new Map();
        for (const item of inscriptos) {
            inscriptosPorCohorte.set(item.cohorteId, (inscriptosPorCohorte.get(item.cohorteId) ?? 0) + 1);
        }
        const rows = cohortes.map((cohorte) => {
            const cursantes = cursantesPorCohorte.get(cohorte.id)?.size ?? 0;
            const cursantesPorEstado = estadosCursantePorCohorte.get(cohorte.id) ?? initialEstadosCursante();
            const inscriptosCount = inscriptosPorCohorte.get(cohorte.id) ?? 0;
            return {
                postituloId: cohorte.postitulo.id,
                nombre: cohorte.postitulo.nombre,
                codigo: cohorte.postitulo.codigo,
                anio: cohorte.anio,
                estado: cohorte.estado,
                aulas: cohorte._count.aulas,
                cursantes,
                cursantesActivos: cursantesPorEstado.ACTIVO,
                cursantesAdeudan: cursantesPorEstado.ADEUDA,
                cursantesBaja: cursantesPorEstado.BAJA,
                cursantesFinalizados: cursantesPorEstado.FINALIZADO,
                inscriptos: inscriptosCount,
            };
        });
        const rowsByYear = new Map();
        for (const row of rows) {
            const currentRows = rowsByYear.get(row.anio) ?? [];
            currentRows.push(row);
            rowsByYear.set(row.anio, currentRows);
        }
        const porAnio = [...rowsByYear.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([anio, yearRows]) => {
            const resumenEstados = yearRows.reduce((acc, row) => {
                acc.ACTIVO += row.cursantesActivos;
                acc.ADEUDA += row.cursantesAdeudan;
                acc.BAJA += row.cursantesBaja;
                acc.FINALIZADO += row.cursantesFinalizados;
                return acc;
            }, initialEstadosCursante());
            return {
                anio,
                resumen: buildResumen(yearRows, resumenEstados),
                porPostitulo: [...yearRows].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
            };
        });
        return {
            alcance: {
                scope: scope.mode === 'global' ? 'global' : 'user',
                userId,
                rol,
            },
            porAnio,
        };
    },
};
