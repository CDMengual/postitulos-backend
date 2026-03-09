"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inscriptoController = void 0;
const response_1 = require("../utils/response");
const inscripto_service_1 = require("../services/inscripto.service");
const storage_service_1 = require("../services/storage.service");
const client_1 = __importDefault(require("../prisma/client"));
const ESTADOS = ['PENDIENTE', 'RECHAZADA', 'ASIGNADA', 'LISTA_ESPERA'];
const DOCUMENTACIONES = ['VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE'];
exports.inscriptoController = {
    async getAll(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const cohorteIdRaw = req.query.cohorteId;
            const institutoIdRaw = req.query.institutoId;
            const estadoRaw = req.query.estado;
            const documentacionRaw = req.query.documentacion;
            const search = req.query.search ? String(req.query.search) : undefined;
            const cohorteIdText = cohorteIdRaw !== undefined && cohorteIdRaw !== null ? String(cohorteIdRaw).trim() : '';
            const cohorteId = cohorteIdText !== '' ? Number(cohorteIdText) : undefined;
            if (cohorteIdText !== '' && (cohorteId === undefined || Number.isNaN(cohorteId))) {
                return (0, response_1.sendError)(res, 'cohorteId invalido', 400);
            }
            const institutoIdText = institutoIdRaw !== undefined && institutoIdRaw !== null
                ? String(institutoIdRaw).trim()
                : '';
            const institutoIdQuery = institutoIdText !== '' ? Number(institutoIdText) : undefined;
            if (institutoIdText !== '' &&
                (institutoIdQuery === undefined || Number.isNaN(institutoIdQuery))) {
                return (0, response_1.sendError)(res, 'institutoId invalido', 400);
            }
            const estado = estadoRaw ? String(estadoRaw) : undefined;
            if (estado && !ESTADOS.includes(estado)) {
                return (0, response_1.sendError)(res, 'estado invalido', 400);
            }
            const documentacion = documentacionRaw ? String(documentacionRaw) : undefined;
            if (documentacion &&
                !DOCUMENTACIONES.includes(documentacion)) {
                return (0, response_1.sendError)(res, 'documentacion invalida', 400);
            }
            let institutoId = institutoIdQuery;
            if (req.user?.rol === 'REFERENTE') {
                const user = await client_1.default.user.findUnique({
                    where: { id: req.user.id },
                    select: { institutoId: true },
                });
                if (!user?.institutoId) {
                    return (0, response_1.sendError)(res, 'El referente no tiene instituto asignado', 403);
                }
                institutoId = user.institutoId;
            }
            const result = await inscripto_service_1.inscriptoService.list({
                cohorteId,
                institutoId,
                estado: estado,
                documentacion: documentacion,
                search,
                page,
                limit,
            });
            return (0, response_1.sendSuccess)(res, 'Inscriptos obtenidos correctamente', result);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener inscriptos', 500);
        }
    },
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id))
                return (0, response_1.sendError)(res, 'ID invalido', 400);
            const inscripto = await inscripto_service_1.inscriptoService.getById(id);
            if (!inscripto)
                return (0, response_1.sendError)(res, 'Inscripto no encontrado', 404);
            return (0, response_1.sendSuccess)(res, 'Inscripto obtenido correctamente', inscripto);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener inscripto', 500);
        }
    },
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id))
                return (0, response_1.sendError)(res, 'ID invalido', 400);
            const hasObservaciones = Object.prototype.hasOwnProperty.call(req.body, 'observaciones');
            const hasPrioridad = Object.prototype.hasOwnProperty.call(req.body, 'prioridad');
            const hasCondicionada = Object.prototype.hasOwnProperty.call(req.body, 'condicionada');
            if (!hasObservaciones && !hasPrioridad && !hasCondicionada) {
                return (0, response_1.sendError)(res, 'Debe enviar al menos un campo editable', 400);
            }
            const data = {};
            if (hasObservaciones) {
                const value = req.body.observaciones;
                if (value === null || value === undefined || String(value).trim() === '') {
                    data.observaciones = null;
                }
                else {
                    data.observaciones = String(value).trim();
                }
            }
            if (hasPrioridad) {
                const value = req.body.prioridad;
                if (value === null || value === undefined || String(value).trim() === '') {
                    data.prioridad = null;
                }
                else {
                    const parsed = Number(value);
                    if (!Number.isInteger(parsed) || parsed < 0) {
                        return (0, response_1.sendError)(res, 'prioridad invalida', 400);
                    }
                    data.prioridad = parsed;
                }
            }
            if (hasCondicionada) {
                if (typeof req.body.condicionada !== 'boolean') {
                    return (0, response_1.sendError)(res, 'condicionada debe ser boolean', 400);
                }
                data.condicionada = req.body.condicionada;
            }
            const updated = await inscripto_service_1.inscriptoService.update(id, data);
            return (0, response_1.sendSuccess)(res, 'Inscripcion actualizada correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al actualizar inscripcion', 500);
        }
    },
    async updateEstado(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id))
                return (0, response_1.sendError)(res, 'ID invalido', 400);
            const { estado } = req.body;
            if (!estado || !ESTADOS.includes(estado)) {
                return (0, response_1.sendError)(res, 'estado invalido', 400);
            }
            const updated = await inscripto_service_1.inscriptoService.updateEstado(id, estado);
            return (0, response_1.sendSuccess)(res, 'Estado de inscripcion actualizado correctamente', updated);
        }
        catch (error) {
            console.error(error);
            if (error?.message === 'Inscripto no encontrado') {
                return (0, response_1.sendError)(res, error.message, 404);
            }
            if (error?.message === 'El inscripto debe tener instituto asignado para pasar a ASIGNADA' ||
                error?.message === 'No hay aulas disponibles para la cohorte e instituto del inscripto') {
                return (0, response_1.sendError)(res, error.message, 400);
            }
            return (0, response_1.sendError)(res, 'Error al actualizar estado de inscripcion', 500);
        }
    },
    async updateDocumentacion(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id))
                return (0, response_1.sendError)(res, 'ID invalido', 400);
            const { documentacion } = req.body;
            if (!documentacion || !DOCUMENTACIONES.includes(documentacion)) {
                return (0, response_1.sendError)(res, 'documentacion invalida', 400);
            }
            const updated = await inscripto_service_1.inscriptoService.updateDocumentacion(id, documentacion);
            return (0, response_1.sendSuccess)(res, 'Documentacion de inscripcion actualizada correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al actualizar documentacion de inscripcion', 500);
        }
    },
    async getDocumentoUrl(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id))
                return (0, response_1.sendError)(res, 'ID invalido', 400);
            const tipo = String(req.params.tipo || '').trim().toLowerCase();
            if (tipo !== 'dni' && tipo !== 'titulo') {
                return (0, response_1.sendError)(res, 'tipo invalido. Valores permitidos: dni, titulo', 400);
            }
            const expiresIn = req.query.expiresIn ? Number(req.query.expiresIn) : undefined;
            const doc = await inscripto_service_1.inscriptoService.getDocumentoPath(id, tipo);
            if (!doc)
                return (0, response_1.sendError)(res, 'Inscripto no encontrado', 404);
            if (!doc.path)
                return (0, response_1.sendError)(res, 'El inscripto no tiene documento cargado', 404);
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
    async assignInstituto(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id))
                return (0, response_1.sendError)(res, 'ID invalido', 400);
            const institutoIdRaw = req.body?.institutoId;
            const institutoId = institutoIdRaw === null || institutoIdRaw === undefined || String(institutoIdRaw).trim() === ''
                ? null
                : Number(institutoIdRaw);
            if (institutoId !== null && Number.isNaN(institutoId)) {
                return (0, response_1.sendError)(res, 'institutoId invalido', 400);
            }
            if (institutoId !== null) {
                const instituto = await client_1.default.instituto.findUnique({
                    where: { id: institutoId },
                    select: { id: true },
                });
                if (!instituto)
                    return (0, response_1.sendError)(res, 'Instituto no encontrado', 404);
            }
            const updated = await inscripto_service_1.inscriptoService.assignInstituto(id, institutoId);
            return (0, response_1.sendSuccess)(res, 'Instituto asignado correctamente al inscripto', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al asignar instituto al inscripto', 500);
        }
    },
    async assignInstitutosBulk(req, res) {
        try {
            const asignacionesRaw = req.body?.asignaciones;
            if (!Array.isArray(asignacionesRaw) || asignacionesRaw.length === 0) {
                return (0, response_1.sendError)(res, 'Debe enviar un array no vacio en "asignaciones" con { inscriptoId, institutoId }', 400);
            }
            const asignaciones = asignacionesRaw.map((item, index) => {
                const inscriptoId = Number(item?.inscriptoId);
                const institutoIdRaw = item?.institutoId;
                const institutoId = institutoIdRaw === null || institutoIdRaw === undefined || String(institutoIdRaw).trim() === ''
                    ? null
                    : Number(institutoIdRaw);
                if (!Number.isInteger(inscriptoId) || inscriptoId <= 0) {
                    throw new Error(`inscriptoId invalido en posicion ${index}`);
                }
                if (institutoId !== null && (!Number.isInteger(institutoId) || institutoId <= 0)) {
                    throw new Error(`institutoId invalido en posicion ${index}`);
                }
                return { inscriptoId, institutoId };
            });
            const uniqueInscriptos = new Set(asignaciones.map((a) => a.inscriptoId));
            if (uniqueInscriptos.size !== asignaciones.length) {
                return (0, response_1.sendError)(res, 'No se permiten inscriptos repetidos en asignaciones', 400);
            }
            const updated = await inscripto_service_1.inscriptoService.assignInstitutosBulk(asignaciones);
            return (0, response_1.sendSuccess)(res, 'Institutos asignados masivamente', {
                total: updated.length,
                items: updated,
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al asignar institutos masivamente', 500);
        }
    },
};
