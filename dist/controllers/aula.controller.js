"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aulaController = void 0;
const aula_service_1 = require("../services/aula.service");
const response_1 = require("../utils/response");
const client_1 = __importDefault(require("../prisma/client"));
exports.aulaController = {
    async createMonthlySnapshot(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            const fechaCorte = req.body.fechaCorte ? new Date(req.body.fechaCorte) : undefined;
            const observaciones = typeof req.body.observaciones === 'string' ? req.body.observaciones : undefined;
            if (!Number.isInteger(aulaId) || aulaId <= 0) {
                return (0, response_1.sendError)(res, 'aulaId invalido', 400);
            }
            if (fechaCorte && Number.isNaN(fechaCorte.getTime())) {
                return (0, response_1.sendError)(res, 'fechaCorte invalida', 400);
            }
            const snapshot = await aula_service_1.aulaService.createMonthlySnapshot(aulaId, {
                fechaCorte,
                observaciones,
            });
            return (0, response_1.sendSuccess)(res, 'Snapshot mensual generado correctamente', snapshot, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al generar snapshot mensual', 400);
        }
    },
    async createMonthlySnapshotsForCohorte(req, res) {
        try {
            const cohorteId = Number(req.body.cohorteId);
            const fechaCorte = req.body.fechaCorte ? new Date(req.body.fechaCorte) : undefined;
            const observaciones = typeof req.body.observaciones === 'string' ? req.body.observaciones : undefined;
            if (!Number.isInteger(cohorteId) || cohorteId <= 0) {
                return (0, response_1.sendError)(res, 'cohorteId invalido', 400);
            }
            if (fechaCorte && Number.isNaN(fechaCorte.getTime())) {
                return (0, response_1.sendError)(res, 'fechaCorte invalida', 400);
            }
            const snapshots = await aula_service_1.aulaService.createMonthlySnapshotsForCohorte(cohorteId, {
                fechaCorte,
                observaciones,
            });
            return (0, response_1.sendSuccess)(res, 'Snapshots mensuales generados correctamente', snapshots, { total: snapshots.length }, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al generar snapshots mensuales', 400);
        }
    },
    async getMonthlySnapshotsByAula(req, res) {
        try {
            const aulaId = Number(req.params.aulaId);
            if (!Number.isInteger(aulaId) || aulaId <= 0) {
                return (0, response_1.sendError)(res, 'aulaId invalido', 400);
            }
            const snapshots = await aula_service_1.aulaService.getMonthlySnapshotsByAula(aulaId);
            return (0, response_1.sendSuccess)(res, 'Snapshots mensuales obtenidos correctamente', snapshots, {
                total: snapshots.length,
            });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener snapshots mensuales', 500);
        }
    },
    async getMonthlySnapshotSeriesByCohorte(req, res) {
        try {
            const cohorteId = Number(req.query.cohorteId);
            const userId = req.user?.id;
            const rol = req.user?.rol;
            if (!Number.isInteger(cohorteId) || cohorteId <= 0) {
                return (0, response_1.sendError)(res, 'cohorteId invalido', 400);
            }
            if (!userId || !rol) {
                return (0, response_1.sendError)(res, 'No autorizado', 401);
            }
            const serie = await aula_service_1.aulaService.getMonthlySnapshotsSeriesByCohorte(userId, rol, cohorteId);
            return (0, response_1.sendSuccess)(res, 'Serie mensual obtenida correctamente', serie);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener la serie mensual', 500);
        }
    },
    // 🔹 GET /api/aulas
    async getAll(req, res) {
        try {
            const userId = req.user?.id;
            const rol = req.user?.rol;
            const estadoQuery = String(req.query.estado || '').trim().toUpperCase();
            const estado = estadoQuery || undefined;
            const postituloIdQuery = req.query.postituloId;
            const postituloId = postituloIdQuery !== undefined && postituloIdQuery !== null && String(postituloIdQuery).trim() !== ''
                ? Number(postituloIdQuery)
                : undefined;
            const estadosPermitidos = [
                'ALL',
                'INSCRIPCION',
                'ACTIVA',
                'INACTIVA',
                'FINALIZADA',
                'CANCELADA',
            ];
            if (!userId)
                return (0, response_1.sendError)(res, 'No autorizado', 401);
            if (estado && !estadosPermitidos.includes(estado)) {
                return (0, response_1.sendError)(res, 'estado invalido. Valores permitidos: ALL, INSCRIPCION, ACTIVA, INACTIVA, FINALIZADA, CANCELADA', 400);
            }
            if (postituloId !== undefined && (!Number.isInteger(postituloId) || postituloId <= 0)) {
                return (0, response_1.sendError)(res, 'postituloId invalido', 400);
            }
            const aulas = await aula_service_1.aulaService.getAllForUser(userId, rol, estado, postituloId);
            return (0, response_1.sendSuccess)(res, 'Aulas obtenidas correctamente', aulas, { total: aulas.length });
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener aulas');
        }
    },
    // 🔹 GET /api/aulas/:id
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const aula = await aula_service_1.aulaService.getById(id);
            if (!aula)
                return (0, response_1.sendError)(res, 'Aula no encontrada', 404);
            // 🔸 Mapear cursantes con su estado y documentación
            const cursantes = aula.cursantes.map((ins) => ({
                id: ins.cursante.id,
                nombre: ins.cursante.nombre,
                apellido: ins.cursante.apellido,
                dni: ins.cursante.dni,
                email: ins.cursante.email,
                celular: ins.cursante.celular,
                titulo: ins.cursante.titulo,
                regionId: ins.cursante.regionId,
                distritoId: ins.cursante.distritoId,
                estado: ins.estado,
                documentacion: ins.documentacion,
                dniAdjuntoUrl: ins.dniAdjuntoUrl,
                tituloAdjuntoUrl: ins.tituloAdjuntoUrl,
            }));
            const result = { ...aula, cursantes };
            return (0, response_1.sendSuccess)(res, 'Aula obtenida correctamente', result);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, 'Error al obtener aula');
        }
    },
    // 🔹 POST /api/aulas
    async create(req, res) {
        try {
            const cohorteId = Number(req.body.cohorteId);
            const referenteId = req.body.referenteId ? Number(req.body.referenteId) : null;
            const currentUser = req.user;
            if (!cohorteId) {
                return (0, response_1.sendError)(res, 'Debe seleccionar una cohorte', 400);
            }
            // 🔹 Obtener admins del sistema
            const admins = await client_1.default.user.findMany({
                where: { rol: 'ADMIN' },
                select: { id: true },
            });
            // 🔹 Determinar referentes
            let referentesIds = [];
            if (currentUser?.rol === 'ADMIN') {
                if (!referenteId)
                    return (0, response_1.sendError)(res, 'Debe seleccionar un referente', 400);
                referentesIds = [referenteId];
            }
            else if (currentUser?.rol === 'REFERENTE') {
                referentesIds = [currentUser.id];
            }
            else {
                return (0, response_1.sendError)(res, 'No tiene permisos para crear aulas', 403);
            }
            // 🔹 Obtener el instituto del referente principal
            const referentePrincipal = await client_1.default.user.findUnique({
                where: { id: referentesIds[0] },
                select: { institutoId: true },
            });
            if (!referentePrincipal?.institutoId) {
                return (0, response_1.sendError)(res, 'El referente seleccionado no tiene un instituto asignado', 400);
            }
            // 🔹 Crear el aula (el service se encarga de generar nombre, código y número)
            const aula = await aula_service_1.aulaService.create({
                cohorteId,
                referenteId: referentesIds[0],
                institutoId: referentePrincipal.institutoId,
            });
            // 🔹 Conectar los admins al aula recién creada
            await client_1.default.aula.update({
                where: { id: aula.id },
                data: {
                    admins: { connect: admins.map((a) => ({ id: a.id })) },
                    referentes: { connect: referentesIds.map((id) => ({ id })) },
                },
            });
            return (0, response_1.sendSuccess)(res, 'Aula creada correctamente', aula, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al crear aula', 400);
        }
    },
    async createMany(req, res) {
        try {
            const { cohorteId, total, distribucion } = req.body;
            const currentUser = req.user;
            if (!cohorteId || !total || !Array.isArray(distribucion) || distribucion.length === 0) {
                return (0, response_1.sendError)(res, 'Debe enviar cohorteId, total y distribución', 400);
            }
            if (currentUser?.rol !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'No autorizado', 403);
            }
            // 🔹 Validar suma total
            const suma = distribucion.reduce((acc, d) => acc + Number(d.cantidad || 0), 0);
            if (suma !== Number(total)) {
                return (0, response_1.sendError)(res, `La suma de aulas (${suma}) no coincide con el total (${total})`, 400);
            }
            // 🔹 Obtener admins y cohorte
            const admins = await client_1.default.user.findMany({
                where: { rol: 'ADMIN' },
                select: { id: true },
            });
            const cohorte = await client_1.default.cohorte.findUnique({
                where: { id: Number(cohorteId) },
                include: { postitulo: true },
            });
            if (!cohorte)
                return (0, response_1.sendError)(res, 'Cohorte no encontrada', 404);
            if (!cohorte.postitulo)
                return (0, response_1.sendError)(res, 'Cohorte sin postítulo', 400);
            const created = [];
            let numero = 1;
            // 🔸 Crear aulas en bloques por referente
            for (const bloque of distribucion) {
                const referente = await client_1.default.user.findUnique({
                    where: { id: bloque.referenteId },
                    select: { institutoId: true },
                });
                if (!referente?.institutoId)
                    continue;
                for (let i = 0; i < bloque.cantidad; i++) {
                    const aula = await client_1.default.aula.create({
                        data: {
                            numero,
                            cohorte: { connect: { id: Number(cohorteId) } },
                            instituto: { connect: { id: referente.institutoId } },
                            codigo: `${cohorte.postitulo.codigo}-${cohorte.anio}-Aula${String(numero).padStart(2, '0')}`,
                            nombre: `${cohorte.postitulo.nombre} - Aula ${numero} (${cohorte.nombre})`,
                            referentes: { connect: [{ id: bloque.referenteId }] },
                            admins: { connect: admins.map((a) => ({ id: a.id })) },
                        },
                        include: {
                            cohorte: { include: { postitulo: true } },
                            referentes: true,
                        },
                    });
                    created.push(aula);
                    numero++;
                }
            }
            return (0, response_1.sendSuccess)(res, `Se crearon ${created.length} aulas correctamente`, created);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al crear aulas masivas');
        }
    },
    // 🔹 PATCH /api/aulas/:id
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const aula = await aula_service_1.aulaService.update(id, data);
            return (0, response_1.sendSuccess)(res, 'Aula actualizada correctamente', aula);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al actualizar aula', 400);
        }
    },
    // 🔹 DELETE /api/aulas/:id
    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await aula_service_1.aulaService.remove(id);
            return (0, response_1.sendSuccess)(res, 'Aula eliminada correctamente');
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al eliminar aula', 400);
        }
    },
};
