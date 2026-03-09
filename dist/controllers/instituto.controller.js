"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.institutoController = void 0;
const instituto_service_1 = require("../services/instituto.service");
const response_1 = require("../utils/response");
exports.institutoController = {
    async getAll(req, res) {
        try {
            const institutos = await instituto_service_1.institutoService.getAll();
            return (0, response_1.sendSuccess)(res, 'Institutos obtenidos correctamente', institutos, {
                total: institutos.length,
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener institutos');
        }
    },
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const instituto = await instituto_service_1.institutoService.getById(id);
            if (!instituto)
                return (0, response_1.sendError)(res, 'Instituto no encontrado', 404);
            return (0, response_1.sendSuccess)(res, 'Instituto obtenido correctamente', instituto);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener instituto');
        }
    },
    async create(req, res) {
        try {
            const data = req.body;
            if (!data.nombre || !data.distritoId) {
                return (0, response_1.sendError)(res, 'Faltan campos requeridos', 400);
            }
            const newInstituto = await instituto_service_1.institutoService.create(data);
            return (0, response_1.sendSuccess)(res, 'Instituto creado correctamente', newInstituto, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al crear instituto', 400);
        }
    },
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return (0, response_1.sendError)(res, 'ID inválido', 400);
            const data = req.body;
            const updated = await instituto_service_1.institutoService.update(id, data);
            return (0, response_1.sendSuccess)(res, 'Instituto actualizado correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al actualizar instituto', 400);
        }
    },
    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await instituto_service_1.institutoService.remove(id);
            return (0, response_1.sendSuccess)(res, 'Instituto eliminado correctamente');
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al eliminar instituto', 400);
        }
    },
};
