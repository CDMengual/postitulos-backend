"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inscripcionService = void 0;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../prisma/client"));
exports.inscripcionService = {
    // 🔹 Inscribir o crear cursante en un aula
    async inscribirCursante({ aulaId, dni, nombre, apellido, email, celular, titulo, }) {
        let cursante = await client_2.default.cursante.findUnique({ where: { dni } });
        if (!cursante) {
            cursante = await client_2.default.cursante.create({
                data: { dni, nombre, apellido, email, celular, titulo },
            });
        }
        const yaInscripto = await client_2.default.cursanteAula.findUnique({
            where: { cursanteId_aulaId: { cursanteId: cursante.id, aulaId } },
        });
        if (!yaInscripto) {
            await client_2.default.cursanteAula.create({
                data: {
                    cursanteId: cursante.id,
                    aulaId,
                    estado: client_1.EstadoCursante.ACTIVO,
                    documentacion: 'PENDIENTE',
                },
            });
        }
        return cursante;
    },
    async removeFromAula(cursanteId, aulaId) {
        return client_2.default.cursanteAula.delete({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
        });
    },
    async assignExistingCursanteToAula(cursanteId, aulaId) {
        const yaInscripto = await client_2.default.cursanteAula.findUnique({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
        });
        if (yaInscripto) {
            return { created: false, inscripcion: yaInscripto };
        }
        const inscripcion = await client_2.default.cursanteAula.create({
            data: { cursanteId, aulaId, estado: client_1.EstadoCursante.ACTIVO, documentacion: 'PENDIENTE' },
        });
        return { created: true, inscripcion };
    },
    async importMany(aulaId, rows) {
        const importados = [];
        const duplicados = [];
        for (const row of rows) {
            const dni = String(row.dni || '').trim();
            if (!dni)
                continue;
            let cursante = await client_2.default.cursante.findUnique({ where: { dni } });
            if (!cursante) {
                cursante = await client_2.default.cursante.create({
                    data: {
                        dni,
                        nombre: row.nombre,
                        apellido: row.apellido,
                        email: row.email || null,
                        celular: row.celular ? String(row.celular) : null,
                        titulo: row.titulo || null,
                    },
                });
            }
            const yaInscripto = await client_2.default.cursanteAula.findUnique({
                where: { cursanteId_aulaId: { cursanteId: cursante.id, aulaId } },
            });
            if (yaInscripto) {
                duplicados.push({ dni, nombre: cursante.nombre, apellido: cursante.apellido });
                continue;
            }
            await client_2.default.cursanteAula.create({
                data: {
                    cursanteId: cursante.id,
                    aulaId,
                    estado: client_1.EstadoCursante.ACTIVO,
                    documentacion: 'PENDIENTE',
                },
            });
            importados.push(cursante);
        }
        return { importados, duplicados };
    },
    async updateEstado(cursanteId, aulaId, estado) {
        return client_2.default.cursanteAula.update({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
            data: { estado },
        });
    },
    async updateDocumentacion(cursanteId, aulaId, documentacion) {
        return client_2.default.cursanteAula.update({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
            data: { documentacion },
        });
    },
    async getDetalleCursanteEnAula(cursanteId, aulaId) {
        return client_2.default.cursanteAula.findUnique({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
            select: {
                aulaId: true,
                cursanteId: true,
                estado: true,
                documentacion: true,
                observaciones: true,
                dniAdjuntoUrl: true,
                tituloAdjuntoUrl: true,
                createdAt: true,
                updatedAt: true,
                aula: {
                    select: {
                        id: true,
                        nombre: true,
                        codigo: true,
                        numero: true,
                    },
                },
                cursante: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true,
                        celular: true,
                        titulo: true,
                        distrito: {
                            select: {
                                nombre: true,
                                regionId: true,
                            },
                        },
                    },
                },
            },
        });
    },
    async updateObservaciones(cursanteId, aulaId, observaciones) {
        return client_2.default.cursanteAula.update({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
            data: { observaciones },
            select: {
                id: true,
                aulaId: true,
                cursanteId: true,
                observaciones: true,
                updatedAt: true,
            },
        });
    },
    async getDocumentoPath(cursanteId, aulaId, tipo) {
        const inscripcion = await client_2.default.cursanteAula.findUnique({
            where: { cursanteId_aulaId: { cursanteId, aulaId } },
            select: {
                id: true,
                aulaId: true,
                cursanteId: true,
                dniAdjuntoUrl: true,
                tituloAdjuntoUrl: true,
            },
        });
        if (!inscripcion)
            return null;
        const path = tipo === 'dni' ? inscripcion.dniAdjuntoUrl : inscripcion.tituloAdjuntoUrl;
        return {
            id: inscripcion.id,
            aulaId: inscripcion.aulaId,
            cursanteId: inscripcion.cursanteId,
            path: path || null,
        };
    },
};
