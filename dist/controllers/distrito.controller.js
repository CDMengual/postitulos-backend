"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distritoController = void 0;
const distrito_service_1 = require("../services/distrito.service");
const response_1 = require("../utils/response");
exports.distritoController = {
    async getAll(req, res) {
        try {
            const distritos = await distrito_service_1.distritoService.getAll();
            return (0, response_1.sendSuccess)(res, 'Distritos obtenidos correctamente', distritos, {
                total: distritos.length,
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener distritos');
        }
    },
};
