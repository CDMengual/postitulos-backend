"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursanteController = void 0;
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
const response_1 = require("../utils/response");
const cursante_service_1 = require("../services/cursante.service");
const inscripcion_service_1 = require("../services/inscripcion.service");
const storage_service_1 = require("../services/storage.service");
exports.cursanteController = {
    async getAll(req, res) {
        try {
            const search = req.query.search;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await cursante_service_1.cursanteService.list({ search, page, limit });
            return (0, response_1.sendSuccess)(res, 'Cursantes obtenidos correctamente', result);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener cursantes', 500);
        }
    },
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const cursante = await cursante_service_1.cursanteService.getById(id);
            if (!cursante)
                return (0, response_1.sendError)(res, 'Cursante no encontrado', 404);
            return (0, response_1.sendSuccess)(res, 'Cursante obtenido correctamente', cursante);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener cursante', 500);
        }
    },
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const updated = await cursante_service_1.cursanteService.update(id, req.body);
            return (0, response_1.sendSuccess)(res, 'Cursante actualizado correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al actualizar cursante', 500);
        }
    },
    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await cursante_service_1.cursanteService.remove(id);
            return (0, response_1.sendSuccess)(res, 'Cursante eliminado correctamente');
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al eliminar cursante', 500);
        }
    },
    async createStandalone(req, res) {
        try {
            const { nombre, apellido, dni, email, celular, titulo } = req.body;
            const aulaRaw = req.body?.aulaId ?? req.body?.aula;
            if (!nombre || !apellido || !dni) {
                return (0, response_1.sendError)(res, 'Debe enviar nombre, apellido y dni', 400);
            }
            const existing = await cursante_service_1.cursanteService.getByDni(String(dni));
            if (existing)
                return (0, response_1.sendError)(res, 'Ya existe un cursante con ese DNI', 400);
            const cursante = await cursante_service_1.cursanteService.create({
                nombre,
                apellido,
                dni: String(dni),
                email: email || null,
                celular: celular || null,
                titulo: titulo || null,
            });
            if (aulaRaw !== undefined && aulaRaw !== null && String(aulaRaw).trim() !== '') {
                const aulaId = Number(aulaRaw);
                if (isNaN(aulaId))
                    return (0, response_1.sendError)(res, 'aulaId invalido', 400);
                await inscripcion_service_1.inscripcionService.assignExistingCursanteToAula(cursante.id, aulaId);
            }
            const withInscripciones = await cursante_service_1.cursanteService.getById(cursante.id);
            return (0, response_1.sendSuccess)(res, 'Cursante creado correctamente', withInscripciones, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al crear cursante', 500);
        }
    },
    async create(req, res) {
        try {
            const { nombre, apellido, dni, email, celular, titulo } = req.body;
            const aulaRaw = req.params.aulaId ?? req.body?.aulaId ?? req.body?.aula;
            const aulaId = Number(aulaRaw);
            if (isNaN(aulaId)) {
                return (0, response_1.sendError)(res, 'Debe enviar un aulaId valido', 400);
            }
            if (!dni) {
                return (0, response_1.sendError)(res, 'Debe enviar al menos DNI y aulaId', 400);
            }
            let cursante = await cursante_service_1.cursanteService.getByDni(String(dni));
            if (!cursante) {
                if (!nombre || !apellido) {
                    return (0, response_1.sendError)(res, 'Faltan nombre y apellido para crear cursante nuevo', 400);
                }
                cursante = await cursante_service_1.cursanteService.create({
                    nombre,
                    apellido,
                    dni: String(dni),
                    email: email || null,
                    celular: celular || null,
                    titulo: titulo || null,
                });
            }
            const inscripto = await inscripcion_service_1.inscripcionService.inscribirCursante({
                aulaId,
                dni: cursante.dni,
                nombre: cursante.nombre,
                apellido: cursante.apellido,
                email: cursante.email || undefined,
                celular: cursante.celular || undefined,
                titulo: cursante.titulo || undefined,
            });
            return (0, response_1.sendSuccess)(res, 'Cursante agregado correctamente', inscripto, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al crear cursante', 500);
        }
    },
    async assignToAula(req, res) {
        try {
            const id = Number(req.params.id);
            const aulaRaw = req.body?.aulaId ?? req.body?.aula;
            const aulaId = Number(aulaRaw);
            if (isNaN(id))
                return (0, response_1.sendError)(res, 'ID de cursante invalido', 400);
            if (isNaN(aulaId))
                return (0, response_1.sendError)(res, 'Debe enviar un aulaId valido', 400);
            const cursante = await cursante_service_1.cursanteService.getById(id);
            if (!cursante)
                return (0, response_1.sendError)(res, 'Cursante no encontrado', 404);
            const result = await inscripcion_service_1.inscripcionService.assignExistingCursanteToAula(id, aulaId);
            const updated = await cursante_service_1.cursanteService.getById(id);
            if (!result.created) {
                return (0, response_1.sendSuccess)(res, 'El cursante ya estaba asignado a esa aula', updated);
            }
            return (0, response_1.sendSuccess)(res, 'Cursante asignado al aula correctamente', updated, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al asignar cursante al aula', 500);
        }
    },
    async removeCursanteFromAula(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            const cursanteId = Number(req.params.cursanteId);
            await inscripcion_service_1.inscripcionService.removeFromAula(cursanteId, aulaId);
            return (0, response_1.sendSuccess)(res, 'Cursante desvinculado correctamente');
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al desvincular cursante', 500);
        }
    },
    async importFromFile(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            const file = req.file;
            if (!file)
                return (0, response_1.sendError)(res, 'No se adjunto archivo', 400);
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            const result = await inscripcion_service_1.inscripcionService.importMany(aulaId, rows);
            return (0, response_1.sendSuccess)(res, 'Archivo procesado correctamente', result);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al importar cursantes', 500);
        }
    },
    async updateEstado(req, res) {
        try {
            const estado = String(req.body?.estado || '').trim().toUpperCase();
            const aulaId = Number(req.params.aulaId);
            const cursanteId = Number(req.params.cursanteId);
            const estadosValidos = Object.values(client_1.EstadoCursante);
            if (!estadosValidos.includes(estado)) {
                return (0, response_1.sendError)(res, 'Estado invalido. Valores permitidos: ACTIVO, ADEUDA, BAJA, FINALIZADO', 400);
            }
            const updated = await inscripcion_service_1.inscripcionService.updateEstado(cursanteId, aulaId, estado);
            return (0, response_1.sendSuccess)(res, 'Estado actualizado correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al actualizar estado', 500);
        }
    },
    async updateDocumentacion(req, res) {
        try {
            const { documentacion } = req.body;
            const aulaId = Number(req.params.aulaId);
            const cursanteId = Number(req.params.cursanteId);
            const updated = await inscripcion_service_1.inscripcionService.updateDocumentacion(cursanteId, aulaId, documentacion);
            return (0, response_1.sendSuccess)(res, 'Documentacion actualizada correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al actualizar documentacion', 500);
        }
    },
    async getDetalleEnAula(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            const cursanteId = Number(req.params.cursanteId);
            if (Number.isNaN(aulaId) || Number.isNaN(cursanteId)) {
                return (0, response_1.sendError)(res, 'aulaId o cursanteId invalido', 400);
            }
            const detalle = await inscripcion_service_1.inscripcionService.getDetalleCursanteEnAula(cursanteId, aulaId);
            if (!detalle) {
                return (0, response_1.sendError)(res, 'Cursante no encontrado en esa aula', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Detalle de cursante en aula obtenido correctamente', {
                cursante: {
                    id: detalle.cursante.id,
                    nombre: detalle.cursante.nombre,
                    apellido: detalle.cursante.apellido,
                    dni: detalle.cursante.dni,
                    email: detalle.cursante.email,
                    celular: detalle.cursante.celular,
                    titulo: detalle.cursante.titulo,
                    distrito: detalle.cursante.distrito?.nombre || null,
                    regionId: detalle.cursante.distrito?.regionId || null,
                },
                inscripcionAula: {
                    aulaId: detalle.aulaId,
                    aula: detalle.aula
                        ? {
                            id: detalle.aula.id,
                            nombre: detalle.aula.nombre,
                            codigo: detalle.aula.codigo,
                            numero: detalle.aula.numero,
                        }
                        : null,
                    cursanteId: detalle.cursanteId,
                    estado: detalle.estado,
                    documentacion: detalle.documentacion,
                    observaciones: detalle.observaciones,
                    dniAdjuntoUrl: detalle.dniAdjuntoUrl,
                    tituloAdjuntoUrl: detalle.tituloAdjuntoUrl,
                    createdAt: detalle.createdAt,
                    updatedAt: detalle.updatedAt,
                },
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener detalle de cursante en aula', 500);
        }
    },
    async updateObservacionesEnAula(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            const cursanteId = Number(req.params.cursanteId);
            if (Number.isNaN(aulaId) || Number.isNaN(cursanteId)) {
                return (0, response_1.sendError)(res, 'aulaId o cursanteId invalido', 400);
            }
            const hasObservaciones = Object.prototype.hasOwnProperty.call(req.body, 'observaciones');
            if (!hasObservaciones) {
                return (0, response_1.sendError)(res, 'Debe enviar el campo observaciones', 400);
            }
            const value = req.body.observaciones;
            const observaciones = value === null || value === undefined || String(value).trim() === ''
                ? null
                : String(value).trim();
            const updated = await inscripcion_service_1.inscripcionService.updateObservaciones(cursanteId, aulaId, observaciones);
            return (0, response_1.sendSuccess)(res, 'Observaciones actualizadas correctamente', updated);
        }
        catch (error) {
            console.error(error);
            if (error?.code === 'P2025') {
                return (0, response_1.sendError)(res, 'Cursante no encontrado en esa aula', 404);
            }
            return (0, response_1.sendError)(res, 'Error al actualizar observaciones', 500);
        }
    },
    async getDocumentoUrlEnAula(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            const cursanteId = Number(req.params.cursanteId);
            if (Number.isNaN(aulaId) || Number.isNaN(cursanteId)) {
                return (0, response_1.sendError)(res, 'aulaId o cursanteId invalido', 400);
            }
            const tipo = String(req.params.tipo || '').trim().toLowerCase();
            if (tipo !== 'dni' && tipo !== 'titulo') {
                return (0, response_1.sendError)(res, 'tipo invalido. Valores permitidos: dni, titulo', 400);
            }
            const expiresIn = req.query.expiresIn ? Number(req.query.expiresIn) : undefined;
            const doc = await inscripcion_service_1.inscripcionService.getDocumentoPath(cursanteId, aulaId, tipo);
            if (!doc)
                return (0, response_1.sendError)(res, 'Cursante no encontrado en esa aula', 404);
            if (!doc.path)
                return (0, response_1.sendError)(res, 'El cursante no tiene documento cargado', 404);
            const signedResult = await storage_service_1.storageService.createSignedReadUrl(doc.path, expiresIn);
            if ('error' in signedResult && signedResult.error) {
                return (0, response_1.sendError)(res, signedResult.error, signedResult.code ?? 500);
            }
            return (0, response_1.sendSuccess)(res, 'URL firmada de documento generada', signedResult.data);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener URL del documento', 500);
        }
    },
};
