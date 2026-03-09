"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postituloService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.postituloService = {
    async getAll() {
        return await client_1.default.postitulo.findMany({
            orderBy: { nombre: 'asc' },
            select: {
                id: true,
                nombre: true,
                codigo: true,
                requisitos: true,
                resolucion: true,
                coordinadores: true,
                autores: true,
                descripcion: true,
                destinatarios: true,
                dictamen: true,
                planEstudios: true,
                resolucionPuntaje: true,
                cargaHoraria: true,
                horasSincronicas: true,
                horasVirtuales: true,
                modalidad: true,
                tipos: {
                    select: {
                        id: true,
                        tipo: true,
                        titulo: true,
                    },
                },
            },
        });
    },
    async getById(id) {
        return await client_1.default.postitulo.findUnique({
            where: { id },
            include: { tipos: true },
        });
    },
    async create(data) {
        const { tipos, ...rest } = data;
        return await client_1.default.postitulo.create({
            data: {
                ...rest,
                cargaHoraria: data.cargaHoraria ? Number(data.cargaHoraria) : null,
                horasSincronicas: data.horasSincronicas ? Number(data.horasSincronicas) : null,
                horasVirtuales: data.horasVirtuales ? Number(data.horasVirtuales) : null,
                tipos: tipos
                    ? {
                        create: tipos.map((t) => ({
                            tipo: t.tipo,
                            titulo: t.titulo,
                        })),
                    }
                    : undefined,
            },
            include: { tipos: true },
        });
    },
    async update(id, data) {
        const { tipos, ...rest } = data;
        const updatedPostitulo = await client_1.default.postitulo.update({
            where: { id },
            data: {
                ...rest,
                cargaHoraria: rest.cargaHoraria ? Number(rest.cargaHoraria) : null,
                horasSincronicas: rest.horasSincronicas ? Number(rest.horasSincronicas) : null,
                horasVirtuales: rest.horasVirtuales ? Number(rest.horasVirtuales) : null,
            },
        });
        if (Array.isArray(tipos)) {
            await client_1.default.postituloTipo.deleteMany({ where: { postituloId: id } });
            if (tipos.length > 0) {
                await client_1.default.postituloTipo.createMany({
                    data: tipos.map((t) => ({
                        tipo: t.tipo,
                        titulo: t.titulo,
                        postituloId: id,
                    })),
                });
            }
        }
        return client_1.default.postitulo.findUnique({
            where: { id },
            include: { tipos: true },
        });
    },
    async remove(id) {
        await client_1.default.postituloTipo.deleteMany({ where: { postituloId: id } });
        return await client_1.default.postitulo.delete({ where: { id } });
    },
};
