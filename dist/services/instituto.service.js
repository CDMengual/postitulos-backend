"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.institutoService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.institutoService = {
    async getAll() {
        const institutos = await client_1.default.instituto.findMany({
            include: {
                distrito: {
                    include: { region: true },
                },
            },
            orderBy: { distrito: { regionId: 'asc' } },
        });
        const result = institutos.map((i) => ({
            id: i.id,
            nombre: i.nombre,
            distritoNombre: i.distrito?.nombre || null,
            regionId: i.distrito?.region?.id || null,
        }));
        return result;
    },
    async getById(id) {
        const instituto = await client_1.default.instituto.findUnique({
            where: { id },
            include: {
                distrito: {
                    include: { region: true },
                },
            },
        });
        if (!instituto)
            return null;
        // 🔹 Formateo coherente con getAll
        return {
            id: instituto.id,
            nombre: instituto.nombre,
            distritoId: instituto.distritoId,
            distritoNombre: instituto.distrito?.nombre || null,
            regionId: instituto.distrito?.region?.id || null,
            regionNombre: instituto.distrito?.region ? `Región ${instituto.distrito.region.id}` : null,
        };
    },
    async create(data) {
        return await client_1.default.instituto.create({ data });
    },
    async update(id, data) {
        return await client_1.default.instituto.update({
            where: { id },
            data,
        });
    },
    async remove(id) {
        return await client_1.default.instituto.delete({
            where: { id },
        });
    },
};
