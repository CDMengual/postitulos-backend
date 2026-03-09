"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicController = void 0;
const client_1 = require("@prisma/client");
const public_service_1 = require("../services/public.service");
const storage_service_1 = require("../services/storage.service");
const response_1 = require("../utils/response");
exports.publicController = {
    async cohortesEnInscripcion(req, res) {
        try {
            const data = await public_service_1.publicService.getCohortesEnInscripcion();
            return (0, response_1.sendSuccess)(res, 'Cohortes publicas obtenidas', data);
        }
        catch (err) {
            console.error(err);
            return (0, response_1.sendError)(res, 'Error al obtener cohortes publicas');
        }
    },
    async getCohorte(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await public_service_1.publicService.getCohortePublic(id);
            if (!data)
                return (0, response_1.sendError)(res, 'Cohorte no encontrada', 404);
            return (0, response_1.sendSuccess)(res, 'Cohorte publica obtenida', data);
        }
        catch (err) {
            console.error(err);
            return (0, response_1.sendError)(res, 'Error al obtener cohorte publica');
        }
    },
    async signUpload(req, res) {
        try {
            const cohorteId = Number(req.params.id);
            const { dni, tipo, fileName, contentType, fileSize } = req.body || {};
            const tipoDocumento = String(tipo || '');
            if (isNaN(cohorteId)) {
                return (0, response_1.sendError)(res, 'Debe enviar un cohorteId valido', 400);
            }
            if (!dni || !tipo || !fileName || !contentType || fileSize === undefined) {
                return (0, response_1.sendError)(res, 'Campos obligatorios: dni, tipo, fileName, contentType, fileSize', 400);
            }
            if (!storage_service_1.storageService.isSupportedTipo(tipoDocumento)) {
                return (0, response_1.sendError)(res, 'tipo invalido. Valores permitidos: dni, titulo', 400);
            }
            const cohorteResult = await public_service_1.publicService.validateCohorteDisponibleParaInscripcion(cohorteId);
            if ('error' in cohorteResult && cohorteResult.error) {
                return (0, response_1.sendError)(res, cohorteResult.error, cohorteResult.code ?? 400);
            }
            const uploadResult = await storage_service_1.storageService.createSignedUploadForPublicForm({
                cohorteId,
                dni: String(dni),
                tipo: tipoDocumento,
                fileName: String(fileName),
                contentType: String(contentType),
                fileSize: Number(fileSize),
            });
            if ('error' in uploadResult && uploadResult.error) {
                return (0, response_1.sendError)(res, uploadResult.error, uploadResult.code ?? 400);
            }
            return (0, response_1.sendSuccess)(res, 'URL firmada de subida generada', uploadResult.data);
        }
        catch (err) {
            console.error(err);
            return (0, response_1.sendError)(res, 'Error al generar URL firmada de subida', 500);
        }
    },
    async createInscripcion(req, res) {
        try {
            const cohorteIdRaw = req.params.id ?? req.body?.cohorteId;
            const cohorteId = Number(cohorteIdRaw);
            const { nombre, apellido, dni, email, celular, datosFormulario, dniAdjuntoPath, dniAdjuntoUrl, tituloAdjuntoPath, tituloAdjuntoUrl, } = req.body || {};
            const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
            if (!cohorteIdRaw || isNaN(cohorteId)) {
                return (0, response_1.sendError)(res, 'Debe enviar un cohorteId valido', 400);
            }
            if (isEmpty(nombre) || isEmpty(apellido) || isEmpty(dni)) {
                return (0, response_1.sendError)(res, 'Debe enviar nombre, apellido y dni', 400);
            }
            const dniNormalizado = String(dni).replace(/\D/g, '').trim();
            if (!dniNormalizado || dniNormalizado.length < 6 || dniNormalizado.length > 12) {
                return (0, response_1.sendError)(res, 'Debe enviar un dni valido', 400);
            }
            const dniPathValue = dniAdjuntoPath ?? dniAdjuntoUrl;
            const tituloPathValue = tituloAdjuntoPath ?? tituloAdjuntoUrl;
            if (dniPathValue) {
                const dniPathResult = await storage_service_1.storageService.validateUploadedPublicPath({
                    path: String(dniPathValue),
                    cohorteId,
                    dni: dniNormalizado,
                    tipo: 'dni',
                });
                if ('error' in dniPathResult && dniPathResult.error) {
                    return (0, response_1.sendError)(res, dniPathResult.error, dniPathResult.code ?? 400);
                }
            }
            if (tituloPathValue) {
                const tituloPathResult = await storage_service_1.storageService.validateUploadedPublicPath({
                    path: String(tituloPathValue),
                    cohorteId,
                    dni: dniNormalizado,
                    tipo: 'titulo',
                });
                if ('error' in tituloPathResult && tituloPathResult.error) {
                    return (0, response_1.sendError)(res, tituloPathResult.error, tituloPathResult.code ?? 400);
                }
            }
            const result = await public_service_1.publicService.createInscripcionPublic({
                cohorteId,
                nombre: String(nombre).trim(),
                apellido: String(apellido).trim(),
                dni: dniNormalizado,
                email: email ? String(email).trim() : null,
                celular: celular ? String(celular).trim() : null,
                datosFormulario: datosFormulario ?? null,
                dniAdjuntoUrl: dniPathValue ? String(dniPathValue).trim() : null,
                tituloAdjuntoUrl: tituloPathValue ? String(tituloPathValue).trim() : null,
            });
            if ('error' in result && result.error) {
                if (result.code === 409) {
                    return (0, response_1.sendError)(res, result.error, 409, {
                        appCode: 'INSCRIPCION_DUPLICADA_COHORTE_DNI',
                        field: 'dni',
                        cohorteId,
                    });
                }
                return (0, response_1.sendError)(res, result.error, result.code ?? 400);
            }
            return (0, response_1.sendSuccess)(res, 'Inscripcion recibida correctamente', result.data, null, 201);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002' &&
                Array.isArray(err.meta?.target) &&
                err.meta.target.includes('cohorteId') &&
                err.meta.target.includes('dni')) {
                const cohorteId = Number(req.params.id ?? req.body?.cohorteId);
                return (0, response_1.sendError)(res, 'Ya existe una inscripcion para este DNI en la cohorte', 409, {
                    appCode: 'INSCRIPCION_DUPLICADA_COHORTE_DNI',
                    field: 'dni',
                    cohorteId: Number.isFinite(cohorteId) ? cohorteId : null,
                });
            }
            console.error(err);
            return (0, response_1.sendError)(res, 'Error al registrar inscripcion publica', 500);
        }
    },
};
