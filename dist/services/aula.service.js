"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aulaService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getDefaultFechaCorte = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
};
const normalizeFechaCorte = (fechaCorte) => {
    const baseDate = fechaCorte ?? getDefaultFechaCorte();
    return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);
};
const countEstados = async (aulaId) => {
    const [activos, adeuda, baja, finalizado] = await Promise.all([
        client_1.default.cursanteAula.count({ where: { aulaId, estado: 'ACTIVO' } }),
        client_1.default.cursanteAula.count({ where: { aulaId, estado: 'ADEUDA' } }),
        client_1.default.cursanteAula.count({ where: { aulaId, estado: 'BAJA' } }),
        client_1.default.cursanteAula.count({ where: { aulaId, estado: 'FINALIZADO' } }),
    ]);
    return {
        activos,
        adeuda,
        baja,
        finalizado,
        totalFoto: activos + adeuda + baja + finalizado,
    };
};
exports.aulaService = {
    // 🔹 Obtener todas las aulas según el rol del usuario
    async getAllForUser(userId, rol, estado, postituloId) {
        const baseSelect = {
            id: true,
            codigo: true,
            numero: true,
            cohorte: {
                select: {
                    id: true,
                    nombre: true,
                    anio: true,
                    estado: true,
                    postitulo: { select: { id: true, nombre: true, codigo: true } },
                },
            },
            referentes: {
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                },
            },
        };
        const orderBy = [{ cohorteId: 'desc' }, { numero: 'asc' }];
        const cohorteEstadoWhere = !estado || estado === 'ALL'
            ? estado === 'ALL'
                ? {}
                : { estado: { in: ['INSCRIPCION', 'ACTIVA'] } }
            : { estado };
        const cohorteWhere = {
            ...cohorteEstadoWhere,
            ...(postituloId ? { postituloId } : {}),
        };
        if (rol === 'ADMIN') {
            return client_1.default.aula.findMany({
                where: {
                    cohorte: cohorteWhere,
                },
                select: baseSelect,
                orderBy,
            });
        }
        // 🔸 Otros roles: filtrar aulas en las que participa
        return client_1.default.aula.findMany({
            where: {
                cohorte: cohorteWhere,
                OR: [
                    { admins: { some: { id: userId } } },
                    { referentes: { some: { id: userId } } },
                    { formadores: { some: { id: userId } } },
                    { coordinadores: { some: { id: userId } } },
                ],
            },
            select: baseSelect,
            orderBy,
        });
    },
    // 🔹 Obtener aula por ID (con cursantes)
    async getById(id) {
        return client_1.default.aula.findUnique({
            where: { id },
            include: {
                cohorte: {
                    include: {
                        postitulo: { select: { id: true, nombre: true, codigo: true } },
                    },
                },
                instituto: { select: { id: true, nombre: true } },
                admins: { select: { id: true, nombre: true, apellido: true } },
                referentes: { select: { id: true, nombre: true, apellido: true } },
                formadores: { select: { id: true, nombre: true, apellido: true } },
                cursantes: {
                    include: {
                        cursante: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                dni: true,
                                email: true,
                                celular: true,
                                titulo: true,
                                regionId: true,
                                distritoId: true,
                            },
                        },
                    },
                },
            },
        });
    },
    // 🔹 Crear aula con número autoincremental por cohorte
    async create(data) {
        // Buscar el último número en esa cohorte
        const lastAula = await client_1.default.aula.findFirst({
            where: { cohorteId: data.cohorteId },
            orderBy: { numero: 'desc' },
        });
        const nextNumero = (lastAula?.numero ?? 0) + 1;
        // Buscar datos de cohorte y postítulo (para generar código)
        const cohorte = await client_1.default.cohorte.findUnique({
            where: { id: data.cohorteId },
            include: { postitulo: true },
        });
        if (!cohorte)
            throw new Error('Cohorte no encontrada');
        if (!cohorte.postitulo)
            throw new Error('Cohorte sin postítulo asociado');
        // Generar código y nombre automáticos (ej. EI-2025-Aula01)
        const codigo = `${cohorte.postitulo.codigo}-${cohorte.anio}-Aula${String(nextNumero).padStart(2, '0')}`;
        const nombre = `${cohorte.postitulo.nombre} - Aula ${nextNumero} (${cohorte.nombre})`;
        // Crear aula
        return client_1.default.aula.create({
            data: {
                numero: nextNumero,
                codigo,
                nombre,
                cohorte: { connect: { id: data.cohorteId } },
                instituto: { connect: { id: data.institutoId } },
                ...(data.referenteId && {
                    referentes: { connect: [{ id: data.referenteId }] },
                }),
                // conectar admins automáticamente si lo manejás en el controller
            },
            include: {
                cohorte: {
                    include: { postitulo: true },
                },
                referentes: { select: { id: true, nombre: true, apellido: true } },
            },
        });
    },
    // 🔹 Actualizar aula
    async update(id, data) {
        return client_1.default.aula.update({
            where: { id },
            data,
            include: {
                cohorte: { include: { postitulo: true } },
                admins: { select: { id: true, nombre: true, apellido: true } },
                referentes: { select: { id: true, nombre: true, apellido: true } },
            },
        });
    },
    // 🔹 Eliminar aula (y sus inscripciones)
    async remove(id) {
        await client_1.default.cursanteAula.deleteMany({ where: { aulaId: id } });
        return client_1.default.aula.delete({ where: { id } });
    },
    async createMonthlySnapshot(aulaId, payload = {}) {
        const aula = await client_1.default.aula.findUnique({
            where: { id: aulaId },
            select: {
                id: true,
                nombre: true,
                codigo: true,
                cohorteId: true,
            },
        });
        if (!aula)
            throw new Error('Aula no encontrada');
        const fechaCorte = normalizeFechaCorte(payload.fechaCorte);
        const anio = fechaCorte.getFullYear();
        const mes = fechaCorte.getMonth() + 1;
        const existingBaseSnapshot = await client_1.default.aulaSnapshotMensual.findFirst({
            where: { aulaId },
            orderBy: [{ anio: 'asc' }, { mes: 'asc' }],
            select: { totalInicial: true },
        });
        const estadoActual = await countEstados(aulaId);
        const totalInicial = existingBaseSnapshot?.totalInicial ??
            (await client_1.default.cursanteAula.count({
                where: { aulaId },
            }));
        const snapshot = await client_1.default.aulaSnapshotMensual.upsert({
            where: {
                aulaId_anio_mes: {
                    aulaId,
                    anio,
                    mes,
                },
            },
            update: {
                fechaCorte,
                totalInicial,
                activos: estadoActual.activos,
                adeuda: estadoActual.adeuda,
                baja: estadoActual.baja,
                finalizado: estadoActual.finalizado,
                totalFoto: estadoActual.totalFoto,
                observaciones: payload.observaciones?.trim() || null,
            },
            create: {
                aulaId,
                fechaCorte,
                anio,
                mes,
                totalInicial,
                activos: estadoActual.activos,
                adeuda: estadoActual.adeuda,
                baja: estadoActual.baja,
                finalizado: estadoActual.finalizado,
                totalFoto: estadoActual.totalFoto,
                observaciones: payload.observaciones?.trim() || null,
            },
            include: {
                aula: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        cohorteId: true,
                    },
                },
            },
        });
        return {
            ...snapshot,
            aula,
        };
    },
    async createMonthlySnapshotsForCohorte(cohorteId, payload = {}) {
        const aulas = await client_1.default.aula.findMany({
            where: { cohorteId },
            select: { id: true },
            orderBy: [{ numero: 'asc' }],
        });
        if (aulas.length === 0)
            throw new Error('La cohorte no tiene aulas');
        const snapshots = [];
        for (const aula of aulas) {
            const snapshot = await this.createMonthlySnapshot(aula.id, payload);
            snapshots.push(snapshot);
        }
        return snapshots;
    },
    async getMonthlySnapshotsByAula(aulaId) {
        return client_1.default.aulaSnapshotMensual.findMany({
            where: { aulaId },
            orderBy: [{ anio: 'asc' }, { mes: 'asc' }],
            include: {
                aula: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        cohorteId: true,
                    },
                },
            },
        });
    },
    async getMonthlySnapshotsSeriesByCohorte(userId, rol, cohorteId) {
        const aulaWhere = rol === 'ADMIN'
            ? { cohorteId }
            : {
                cohorteId,
                OR: [
                    { admins: { some: { id: userId } } },
                    { referentes: { some: { id: userId } } },
                    { formadores: { some: { id: userId } } },
                    { coordinadores: { some: { id: userId } } },
                ],
            };
        const aulas = await client_1.default.aula.findMany({
            where: aulaWhere,
            select: { id: true, nombre: true, codigo: true, numero: true },
            orderBy: [{ numero: 'asc' }],
        });
        if (aulas.length === 0) {
            return {
                cohorteId,
                aulas: [],
                serie: [],
            };
        }
        const aulaIds = aulas.map((aula) => aula.id);
        const snapshots = await client_1.default.aulaSnapshotMensual.findMany({
            where: { aulaId: { in: aulaIds } },
            orderBy: [{ anio: 'asc' }, { mes: 'asc' }, { aulaId: 'asc' }],
            include: {
                aula: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        numero: true,
                    },
                },
            },
        });
        const serieMap = new Map();
        for (const snapshot of snapshots) {
            const key = `${snapshot.anio}-${String(snapshot.mes).padStart(2, '0')}`;
            const current = serieMap.get(key) ?? {
                fechaCorte: snapshot.fechaCorte,
                anio: snapshot.anio,
                mes: snapshot.mes,
                totalInicial: 0,
                activos: 0,
                adeuda: 0,
                baja: 0,
                finalizado: 0,
                totalFoto: 0,
            };
            current.totalInicial += snapshot.totalInicial;
            current.activos += snapshot.activos;
            current.adeuda += snapshot.adeuda;
            current.baja += snapshot.baja;
            current.finalizado += snapshot.finalizado;
            current.totalFoto += snapshot.totalFoto;
            serieMap.set(key, current);
        }
        return {
            cohorteId,
            aulas,
            serie: [...serieMap.values()],
            snapshots,
        };
    },
};
