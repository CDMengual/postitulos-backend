"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const response_1 = require("../utils/response");
exports.dashboardController = {
    async getResumen(req, res) {
        try {
            const userId = req.user?.id;
            const rol = req.user?.rol;
            if (!userId || !rol) {
                return (0, response_1.sendError)(res, 'No autorizado', 401);
            }
            const dashboard = await dashboard_service_1.dashboardService.getResumen(userId, rol);
            return (0, response_1.sendSuccess)(res, 'Dashboard obtenido correctamente', dashboard);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener dashboard', 500);
        }
    },
};
