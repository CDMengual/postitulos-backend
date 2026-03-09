"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postituloController = void 0;
const postitulo_service_1 = require("../services/postitulo.service");
const response_1 = require("../utils/response");
exports.postituloController = {
    async getAll(req, res) {
        try {
            const postitulos = await postitulo_service_1.postituloService.getAll();
            return (0, response_1.sendSuccess)(res, 'Postítulos obtenidos correctamente', postitulos, {
                total: postitulos.length,
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener los postítulos');
        }
    },
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return (0, response_1.sendError)(res, 'ID inválido', 400);
            const postitulo = await postitulo_service_1.postituloService.getById(id);
            if (!postitulo)
                return (0, response_1.sendError)(res, 'Postítulo no encontrado', 404);
            return (0, response_1.sendSuccess)(res, 'Postítulo obtenido correctamente', postitulo);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener postítulo');
        }
    },
    async create(req, res) {
        try {
            const data = req.body;
            if (!data.nombre) {
                return (0, response_1.sendError)(res, 'El campo "nombre" es obligatorio', 400);
            }
            const newPostitulo = await postitulo_service_1.postituloService.create(data);
            return (0, response_1.sendSuccess)(res, 'Postítulo creado correctamente', newPostitulo, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al crear postítulo', 400);
        }
    },
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return (0, response_1.sendError)(res, 'ID inválido', 400);
            const data = req.body;
            if (!data || Object.keys(data).length === 0)
                return (0, response_1.sendError)(res, 'No se proporcionaron campos para actualizar', 400);
            const updated = await postitulo_service_1.postituloService.update(id, data);
            return (0, response_1.sendSuccess)(res, 'Postítulo actualizado correctamente', updated);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al actualizar postítulo', 400);
        }
    },
    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return (0, response_1.sendError)(res, 'ID inválido', 400);
            await postitulo_service_1.postituloService.remove(id);
            return (0, response_1.sendSuccess)(res, 'Postítulo eliminado correctamente');
        }
        catch (error) {
            console.error('Error al eliminar postítulo:', error);
            return (0, response_1.sendError)(res, error.message || 'Error al eliminar postítulo', 400);
        }
    },
};
