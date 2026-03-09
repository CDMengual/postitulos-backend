"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formularioController = void 0;
const formulario_service_1 = require("../services/formulario.service");
const response_1 = require("../utils/response");
exports.formularioController = {
    // 🔹 GET /api/formularios
    async getAll(req, res) {
        try {
            const postituloId = req.query.postituloId ? Number(req.query.postituloId) : undefined;
            const formularios = await formulario_service_1.formularioService.getAll(postituloId);
            return (0, response_1.sendSuccess)(res, 'Formularios obtenidos correctamente', formularios, {
                total: formularios.length,
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener formularios');
        }
    },
    // 🔹 GET /api/formularios/:id
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const formulario = await formulario_service_1.formularioService.getById(id);
            if (!formulario)
                return (0, response_1.sendError)(res, 'Formulario no encontrado', 404);
            return (0, response_1.sendSuccess)(res, 'Formulario obtenido correctamente', formulario);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener formulario');
        }
    },
};
