"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inscriptoService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.inscriptoService = {
    async list(params) {
        const { cohorteId, institutoId, estado, documentacion, search, page, limit } = params;
        const where = {
            ...(cohorteId ? { cohorteId } : {}),
            ...(institutoId ? { institutoId } : {}),
            ...(estado ? { estado } : {}),
            ...(documentacion ? { documentacion } : {}),
            ...(search
                ? {
                    OR: [
                        { nombre: { contains: search } },
                        { apellido: { contains: search } },
                        { dni: { contains: search } },
                        { email: { contains: search } },
                    ],
                }
                : {}),
        };
        const [total, inscriptos] = await Promise.all([
            client_1.default.inscripto.count({ where }),
            client_1.default.inscripto.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ prioridad: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    cohorteId: true,
                    nombre: true,
                    apellido: true,
                    dni: true,
                    email: true,
                    celular: true,
                    estado: true,
                    institutoId: true,
                    prioridad: true,
                    condicionada: true,
                    documentacion: true,
                    createdAt: true,
                    updatedAt: true,
                    cohorte: {
                        select: {
                            id: true,
                            nombre: true,
                            anio: true,
                            estado: true,
                            postitulo: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    codigo: true,
                                },
                            },
                        },
                    },
                    instituto: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                },
            }),
        ]);
        return {
            inscriptos,
            total,
            page,
            limit,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        };
    },
    async getById(id) {
        return client_1.default.inscripto.findUnique({
            where: { id },
            select: {
                id: true,
                cohorteId: true,
                nombre: true,
                apellido: true,
                dni: true,
                email: true,
                celular: true,
                estado: true,
                institutoId: true,
                prioridad: true,
                condicionada: true,
                observaciones: true,
                documentacion: true,
                datosFormulario: true,
                dniAdjuntoUrl: true,
                tituloAdjuntoUrl: true,
                createdAt: true,
                updatedAt: true,
                cohorte: {
                    select: {
                        id: true,
                        nombre: true,
                        anio: true,
                        estado: true,
                        fechaInicioInscripcion: true,
                        fechaFinInscripcion: true,
                        postitulo: {
                            select: {
                                id: true,
                                nombre: true,
                                codigo: true,
                            },
                        },
                    },
                },
                instituto: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        });
    },
    async updateEstado(id, estado) {
        return client_1.default.$transaction(async (tx) => {
            const toPositiveIntOrNull = (value) => {
                if (typeof value === 'number' && Number.isInteger(value) && value > 0)
                    return value;
                if (typeof value === 'string') {
                    const parsed = Number(value.trim());
                    if (Number.isInteger(parsed) && parsed > 0)
                        return parsed;
                }
                return null;
            };
            const getValueByKeys = (source, keys) => {
                if (!source)
                    return null;
                for (const key of keys) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        return source[key];
                    }
                }
                return null;
            };
            const inscripto = await tx.inscripto.findUnique({
                where: { id },
                select: {
                    id: true,
                    cohorteId: true,
                    institutoId: true,
                    datosFormulario: true,
                    dni: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    celular: true,
                    dniAdjuntoUrl: true,
                    tituloAdjuntoUrl: true,
                    instituto: {
                        select: {
                            distritoId: true,
                            distrito: {
                                select: {
                                    regionId: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!inscripto) {
                throw new Error('Inscripto no encontrado');
            }
            if (estado !== 'ASIGNADA') {
                return tx.inscripto.update({
                    where: { id },
                    data: {
                        estado,
                    },
                    select: {
                        id: true,
                        estado: true,
                        updatedAt: true,
                    },
                });
            }
            if (!inscripto.institutoId) {
                throw new Error('El inscripto debe tener instituto asignado para pasar a ASIGNADA');
            }
            const datosFormularioRecord = inscripto.datosFormulario && typeof inscripto.datosFormulario === 'object'
                ? inscripto.datosFormulario
                : null;
            const tituloDocenteRaw = getValueByKeys(datosFormularioRecord, [
                'titulo_docente_tramo_pedagogico',
                'titulo_docente_o_tramo_pedagogico',
                'titulo_docente',
                'titulo_tramo_pedagogico',
            ]);
            const tituloDocente = typeof tituloDocenteRaw === 'string' && tituloDocenteRaw.trim().length > 0
                ? tituloDocenteRaw.trim()
                : null;
            const regionFormulario = toPositiveIntOrNull(getValueByKeys(datosFormularioRecord, ['region_residencia']));
            const distritoFormulario = toPositiveIntOrNull(getValueByKeys(datosFormularioRecord, ['distrito_residencia']));
            let distritoId = inscripto.instituto?.distritoId ?? null;
            let regionId = inscripto.instituto?.distrito?.regionId ?? regionFormulario;
            if (distritoFormulario) {
                const distrito = await tx.distrito.findUnique({
                    where: { id: distritoFormulario },
                    select: { id: true, regionId: true },
                });
                if (distrito) {
                    distritoId = distrito.id;
                    regionId = distrito.regionId;
                }
            }
            let cursante = await tx.cursante.findUnique({
                where: { dni: inscripto.dni },
                select: { id: true, titulo: true, regionId: true, distritoId: true },
            });
            if (!cursante) {
                cursante = await tx.cursante.create({
                    data: {
                        dni: inscripto.dni,
                        nombre: inscripto.nombre,
                        apellido: inscripto.apellido,
                        email: inscripto.email,
                        celular: inscripto.celular,
                        titulo: tituloDocente,
                        regionId,
                        distritoId,
                    },
                    select: { id: true, titulo: true, regionId: true, distritoId: true },
                });
            }
            else if ((!cursante.titulo && tituloDocente) ||
                (!cursante.regionId && regionId) ||
                (!cursante.distritoId && distritoId)) {
                cursante = await tx.cursante.update({
                    where: { id: cursante.id },
                    data: {
                        ...(cursante.titulo ? {} : { titulo: tituloDocente }),
                        regionId: cursante.regionId || regionId,
                        distritoId: cursante.distritoId || distritoId,
                    },
                    select: { id: true, titulo: true, regionId: true, distritoId: true },
                });
            }
            const existenteEnCohorte = await tx.cursanteAula.findFirst({
                where: {
                    cursanteId: cursante.id,
                    aula: { cohorteId: inscripto.cohorteId },
                },
                select: {
                    id: true,
                    aulaId: true,
                },
            });
            let asignacion;
            if (existenteEnCohorte) {
                await tx.cursanteAula.update({
                    where: { id: existenteEnCohorte.id },
                    data: {
                        documentacion: 'VERIFICADA',
                        dniAdjuntoUrl: inscripto.dniAdjuntoUrl || null,
                        tituloAdjuntoUrl: inscripto.tituloAdjuntoUrl || null,
                    },
                });
                asignacion = {
                    created: false,
                    cursanteAulaId: existenteEnCohorte.id,
                    aulaId: existenteEnCohorte.aulaId,
                };
            }
            else {
                const aulas = await tx.aula.findMany({
                    where: {
                        cohorteId: inscripto.cohorteId,
                        institutoId: inscripto.institutoId,
                    },
                    select: {
                        id: true,
                        _count: { select: { cursantes: true } },
                    },
                });
                if (aulas.length === 0) {
                    throw new Error('No hay aulas disponibles para la cohorte e instituto del inscripto');
                }
                const aulaElegida = [...aulas].sort((a, b) => {
                    if (a._count.cursantes !== b._count.cursantes) {
                        return a._count.cursantes - b._count.cursantes;
                    }
                    return a.id - b.id;
                })[0];
                const cursanteAula = await tx.cursanteAula.create({
                    data: {
                        cursanteId: cursante.id,
                        aulaId: aulaElegida.id,
                        estado: 'ACTIVO',
                        documentacion: 'VERIFICADA',
                        dniAdjuntoUrl: inscripto.dniAdjuntoUrl || null,
                        tituloAdjuntoUrl: inscripto.tituloAdjuntoUrl || null,
                    },
                    select: {
                        id: true,
                        aulaId: true,
                    },
                });
                asignacion = {
                    created: true,
                    cursanteAulaId: cursanteAula.id,
                    aulaId: cursanteAula.aulaId,
                };
            }
            const updated = await tx.inscripto.update({
                where: { id },
                data: {
                    estado: 'ASIGNADA',
                },
                select: {
                    id: true,
                    estado: true,
                    updatedAt: true,
                },
            });
            return {
                ...updated,
                cursanteId: cursante.id,
                asignacion,
            };
        });
    },
    async updateDocumentacion(id, documentacion) {
        return client_1.default.inscripto.update({
            where: { id },
            data: { documentacion },
            select: {
                id: true,
                documentacion: true,
                updatedAt: true,
            },
        });
    },
    async update(id, data) {
        return client_1.default.inscripto.update({
            where: { id },
            data,
            select: {
                id: true,
                observaciones: true,
                prioridad: true,
                condicionada: true,
                updatedAt: true,
            },
        });
    },
    async assignInstituto(id, institutoId) {
        return client_1.default.inscripto.update({
            where: { id },
            data: { institutoId },
            select: {
                id: true,
                institutoId: true,
                updatedAt: true,
                instituto: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        });
    },
    async assignInstitutosBulk(asignaciones) {
        return client_1.default.$transaction(async (tx) => {
            const inscriptoIds = [...new Set(asignaciones.map((a) => a.inscriptoId))];
            const institutoIds = [
                ...new Set(asignaciones
                    .map((a) => a.institutoId)
                    .filter((id) => typeof id === 'number' && Number.isInteger(id))),
            ];
            const [inscriptosCount, institutosCount] = await Promise.all([
                tx.inscripto.count({ where: { id: { in: inscriptoIds } } }),
                institutoIds.length > 0
                    ? tx.instituto.count({ where: { id: { in: institutoIds } } })
                    : Promise.resolve(0),
            ]);
            if (inscriptosCount !== inscriptoIds.length) {
                throw new Error('Uno o mas inscriptos no existen');
            }
            if (institutoIds.length > 0 && institutosCount !== institutoIds.length) {
                throw new Error('Uno o mas institutos no existen');
            }
            const updates = await Promise.all(asignaciones.map((a) => tx.inscripto.update({
                where: { id: a.inscriptoId },
                data: { institutoId: a.institutoId },
                select: {
                    id: true,
                    institutoId: true,
                    updatedAt: true,
                },
            })));
            return updates;
        });
    },
    async getDocumentoPath(id, tipo) {
        const inscripto = await client_1.default.inscripto.findUnique({
            where: { id },
            select: {
                id: true,
                dniAdjuntoUrl: true,
                tituloAdjuntoUrl: true,
            },
        });
        if (!inscripto)
            return null;
        const path = tipo === 'dni' ? inscripto.dniAdjuntoUrl : inscripto.tituloAdjuntoUrl;
        return { id: inscripto.id, path: path || null };
    },
};
