"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursanteService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.cursanteService = {
    // 🔹 Crear cursante (sin aula)
    async create(data) {
        return client_1.default.cursante.create({ data });
    },
    async getById(id) {
        return client_1.default.cursante.findUnique({
            where: { id },
            include: {
                distrito: {
                    select: {
                        id: true,
                        nombre: true,
                        regionId: true,
                    },
                },
                inscripciones: {
                    select: {
                        id: true,
                        estado: true,
                        documentacion: true,
                        dniAdjuntoUrl: true,
                        tituloAdjuntoUrl: true,
                        observaciones: true,
                        aula: {
                            select: {
                                codigo: true,
                                numero: true,
                                nombre: true,
                                instituto: { select: { nombre: true } },
                                cohorte: {
                                    select: {
                                        estado: true,
                                        fechaInicio: true,
                                        fechaFin: true,
                                        postitulo: { select: { nombre: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    },
    async update(id, data) {
        return client_1.default.cursante.update({ where: { id }, data });
    },
    async remove(id) {
        await client_1.default.cursanteAula.deleteMany({ where: { cursanteId: id } });
        return client_1.default.cursante.delete({ where: { id } });
    },
    async list({ search, page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { nombre: { contains: search } },
                    { apellido: { contains: search } },
                    { dni: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {};
        const [cursantes, total] = await Promise.all([
            client_1.default.cursante.findMany({ where, skip, take: limit, orderBy: { apellido: 'asc' } }),
            client_1.default.cursante.count({ where }),
        ]);
        return { cursantes, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
    async getByDni(dni) {
        return client_1.default.cursante.findUnique({ where: { dni } });
    },
};
