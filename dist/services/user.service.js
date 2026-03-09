"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const client_2 = require("@prisma/client");
exports.userService = {
    async getAll(rol) {
        const rolFilter = rol && Object.values(client_2.Rol).includes(rol) ? rol : undefined;
        const users = await client_1.default.user.findMany({
            where: rolFilter ? { rol: rolFilter } : undefined,
            select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                email: true,
                celular: true,
                rol: true,
                institutoId: true,
                createdAt: true,
                updatedAt: true,
                instituto: {
                    select: {
                        id: true,
                        nombre: true,
                        distrito: {
                            select: {
                                id: true,
                                nombre: true,
                                region: { select: { id: true } },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { rol: 'desc' },
                {
                    instituto: {
                        distrito: {
                            regionId: 'asc',
                        },
                    },
                },
                { apellido: 'asc' },
                { nombre: 'asc' },
            ],
        });
        return users;
    },
    async getById(id) {
        return await client_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                email: true,
                celular: true,
                rol: true,
                institutoId: true,
                createdAt: true,
                updatedAt: true,
                instituto: {
                    select: {
                        id: true,
                        nombre: true,
                        distrito: {
                            select: {
                                id: true,
                                nombre: true,
                                region: { select: { id: true } },
                            },
                        },
                    },
                },
            },
        });
    },
    async create(data) {
        return await client_1.default.user.create({ data });
    },
    async update(id, data) {
        return await client_1.default.user.update({
            where: { id },
            data,
        });
    },
    async remove(id) {
        return await client_1.default.user.delete({
            where: { id },
        });
    },
};
