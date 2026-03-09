"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distritoService = void 0;
const client_1 = __importDefault(require("../prisma/client"));
exports.distritoService = {
    async getAll() {
        return await client_1.default.distrito.findMany({
            select: {
                id: true,
                nombre: true,
                regionId: true,
            },
            orderBy: [{ regionId: 'asc' }, { nombre: 'asc' }],
        });
    },
};
