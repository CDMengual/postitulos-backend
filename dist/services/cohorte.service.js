"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cohorteService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.cohorteService = {
    async getAll() {
        const cohortes = await client_1.default.cohorte.findMany({
            select: {
                id: true,
                anio: true,
                nombre: true,
                fechaInicio: true,
                fechaFin: true,
                estado: true,
                fechaInicioInscripcion: true,
                fechaFinInscripcion: true,
                postituloId: true,
                formularioId: true,
                cantidadAulas: true,
                cupos: true,
                cuposListaEspera: true,
                cuposTotales: true,
                createdAt: true,
                updatedAt: true,
                postitulo: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                    },
                },
                formulario: {
                    select: { id: true, nombre: true },
                },
                cohorteInstitutos: {
                    select: {
                        instituto: {
                            select: {
                                id: true,
                                nombre: true,
                                distritoId: true,
                            },
                        },
                    },
                },
                aulas: {
                    select: {
                        _count: { select: { cursantes: true } },
                    },
                },
            },
            orderBy: { anio: 'desc' },
        });
        return cohortes.map((cohorte) => {
            const { aulas, cohorteInstitutos, ...cohorteBase } = cohorte;
            const cantidadAulas = cohorte.cantidadAulas ?? cohorte.aulas.length;
            const cantidadCursantes = cohorte.aulas.reduce((acc, aula) => acc + aula._count.cursantes, 0);
            return {
                ...cohorteBase,
                institutos: cohorteInstitutos.map((ci) => ci.instituto),
                cantidadAulas,
                cantidadCursantes,
            };
        });
    },
    async getById(id) {
        const cohorte = await client_1.default.cohorte.findUnique({
            where: { id },
            select: {
                id: true,
                anio: true,
                nombre: true,
                fechaInicio: true,
                fechaFin: true,
                estado: true,
                fechaInicioInscripcion: true,
                fechaFinInscripcion: true,
                postituloId: true,
                formularioId: true,
                cantidadAulas: true,
                cupos: true,
                cuposListaEspera: true,
                cuposTotales: true,
                createdAt: true,
                updatedAt: true,
                postitulo: { select: { id: true, nombre: true, codigo: true } },
                formulario: { select: { id: true, nombre: true } },
                cohorteInstitutos: {
                    select: {
                        instituto: {
                            select: {
                                id: true,
                                nombre: true,
                                distritoId: true,
                            },
                        },
                    },
                },
                aulas: {
                    select: {
                        _count: { select: { cursantes: true } },
                    },
                },
            },
        });
        if (!cohorte)
            return null;
        const cantidadCursantes = cohorte.aulas.reduce((acc, aula) => acc + aula._count.cursantes, 0);
        const { aulas, cohorteInstitutos, ...cohorteBase } = cohorte;
        return {
            ...cohorteBase,
            institutos: cohorteInstitutos.map((ci) => ci.instituto),
            cantidadAulas: cohorte.cantidadAulas ?? cohorte.aulas.length,
            cantidadCursantes,
        };
    },
    async create(data) {
        const { postituloId, formularioId, institutoIds, ...rest } = data;
        return client_1.default.cohorte.create({
            data: {
                ...rest,
                postitulo: { connect: { id: Number(postituloId) } },
                ...(formularioId && { formularioId: Number(formularioId) }),
                ...(Array.isArray(institutoIds) &&
                    institutoIds.length > 0 && {
                    cohorteInstitutos: {
                        create: institutoIds.map((institutoId) => ({
                            instituto: { connect: { id: institutoId } },
                        })),
                    },
                }),
            },
            include: {
                postitulo: {
                    select: { id: true, nombre: true, codigo: true },
                },
                formulario: {
                    select: { id: true, nombre: true },
                },
                cohorteInstitutos: {
                    select: {
                        instituto: {
                            select: { id: true, nombre: true, distritoId: true },
                        },
                    },
                },
                aulas: true,
            },
        });
    },
    async update(id, data) {
        const { postituloId, formularioId, institutoIds, ...rest } = data;
        return client_1.default.cohorte.update({
            where: { id },
            data: {
                ...rest,
                ...(postituloId && {
                    postitulo: { connect: { id: Number(postituloId) } },
                }),
                ...(formularioId && {
                    formulario: { connect: { id: Number(formularioId) } },
                }),
                ...(Array.isArray(institutoIds) && {
                    cohorteInstitutos: {
                        deleteMany: {},
                        ...(institutoIds.length > 0
                            ? {
                                create: institutoIds.map((institutoId) => ({
                                    instituto: { connect: { id: institutoId } },
                                })),
                            }
                            : {}),
                    },
                }),
            },
            include: {
                postitulo: {
                    select: { id: true, nombre: true, codigo: true },
                },
                formulario: {
                    select: { id: true, nombre: true },
                },
                cohorteInstitutos: {
                    select: {
                        instituto: {
                            select: { id: true, nombre: true, distritoId: true },
                        },
                    },
                },
                aulas: true,
            },
        });
    },
    async remove(id) {
        await client_1.default.aula.deleteMany({ where: { cohorteId: id } });
        return client_1.default.cohorte.delete({ where: { id } });
    },
};
