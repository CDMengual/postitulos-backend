"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const supabase_1 = require("../lib/supabase");
const MIME_TO_EXT = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
const EXT_TO_MIME = {
    pdf: ['application/pdf'],
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
    webp: ['image/webp'],
};
const DEFAULT_MAX_FILE_SIZE = 8 * 1024 * 1024;
const normalizeDni = (dni) => String(dni || '').replace(/\D/g, '');
const parseMaxFileSize = () => {
    const raw = process.env.PUBLIC_UPLOAD_MAX_BYTES;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_FILE_SIZE;
};
const extractExtension = (fileName) => {
    const clean = String(fileName || '').trim().toLowerCase();
    const parts = clean.split('.');
    if (parts.length < 2)
        return null;
    return parts.pop() || null;
};
const buildStoragePath = (cohorteId, dni, tipo, extension) => {
    const fileId = crypto_1.default.randomBytes(16).toString('hex');
    return `inscripciones/${cohorteId}/${dni}/${tipo}/${fileId}.${extension}`;
};
const getAllowedMimeTypes = () => Object.keys(MIME_TO_EXT);
const isSupportedTipo = (value) => value === 'dni' || value === 'titulo';
exports.storageService = {
    getAllowedMimeTypes,
    isSupportedTipo,
    async createSignedUploadForPublicForm(params) {
        const dni = normalizeDni(params.dni);
        if (!dni || dni.length < 6 || dni.length > 12) {
            return { error: 'DNI invalido para generar la subida', code: 400 };
        }
        const maxFileSize = parseMaxFileSize();
        if (!Number.isFinite(params.fileSize) || params.fileSize <= 0) {
            return { error: 'Debe enviar fileSize valido', code: 400 };
        }
        if (params.fileSize > maxFileSize) {
            return { error: `El archivo excede el maximo permitido (${maxFileSize} bytes)`, code: 400 };
        }
        const contentType = String(params.contentType || '').toLowerCase().trim();
        if (!MIME_TO_EXT[contentType]) {
            return {
                error: `Tipo de archivo no permitido. Permitidos: ${getAllowedMimeTypes().join(', ')}`,
                code: 400,
            };
        }
        const extensionFromName = extractExtension(params.fileName || '');
        if (extensionFromName && EXT_TO_MIME[extensionFromName]) {
            const allowedMimes = EXT_TO_MIME[extensionFromName];
            if (!allowedMimes.includes(contentType)) {
                return { error: 'La extension del archivo no coincide con su contentType', code: 400 };
            }
        }
        const extension = MIME_TO_EXT[contentType];
        const path = buildStoragePath(params.cohorteId, dni, params.tipo, extension);
        const supabase = (0, supabase_1.getSupabaseAdmin)();
        const bucket = (0, supabase_1.getSupabaseBucket)();
        const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
        if (error || !data) {
            return { error: 'No se pudo generar URL firmada de subida', code: 500 };
        }
        return {
            data: {
                bucket,
                path: data.path,
                token: data.token,
                signedUrl: data.signedUrl,
                contentType,
                maxFileSize,
            },
        };
    },
    async validateUploadedPublicPath(params) {
        const path = String(params.path || '').trim();
        const dni = normalizeDni(params.dni);
        if (!path)
            return { error: 'Ruta de archivo vacia', code: 400 };
        if (!dni || dni.length < 6 || dni.length > 12) {
            return { error: 'DNI invalido', code: 400 };
        }
        const pathMatch = path.match(/^inscripciones\/(\d+)\/(\d{6,12})\/(dni|titulo)\/([a-f0-9]{32})\.(pdf|jpg|png|webp)$/i);
        if (!pathMatch) {
            return { error: 'Ruta de archivo invalida', code: 400 };
        }
        const [, cohorteIdStr, dniPath, tipoPath] = pathMatch;
        if (Number(cohorteIdStr) !== params.cohorteId) {
            return { error: 'El archivo no corresponde a la cohorte enviada', code: 400 };
        }
        if (dniPath !== dni) {
            return { error: 'El archivo no corresponde al DNI enviado', code: 400 };
        }
        if (tipoPath !== params.tipo) {
            return { error: `El archivo no corresponde al tipo ${params.tipo}`, code: 400 };
        }
        const parts = path.split('/');
        const fileName = parts.pop();
        const folder = parts.join('/');
        const supabase = (0, supabase_1.getSupabaseAdmin)();
        const bucket = (0, supabase_1.getSupabaseBucket)();
        const { data, error } = await supabase.storage.from(bucket).list(folder, {
            limit: 100,
            offset: 0,
            search: fileName,
        });
        if (error) {
            return { error: 'No se pudo verificar el archivo en storage', code: 500 };
        }
        const exists = !!data?.some((item) => item.name === fileName);
        if (!exists) {
            return { error: 'El archivo no existe en storage', code: 400 };
        }
        return { data: { path } };
    },
    async createSignedReadUrl(path, expiresIn = 60 * 10) {
        const cleanPath = String(path || '').trim();
        if (!cleanPath) {
            return { error: 'Ruta de archivo vacia', code: 400 };
        }
        const supabase = (0, supabase_1.getSupabaseAdmin)();
        const bucket = (0, supabase_1.getSupabaseBucket)();
        const seconds = Number.isFinite(expiresIn) && expiresIn > 0 ? Math.floor(expiresIn) : 600;
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, seconds);
        if (error || !data?.signedUrl) {
            return { error: 'No se pudo generar URL firmada de lectura', code: 500 };
        }
        return {
            data: {
                bucket,
                path: cleanPath,
                signedUrl: data.signedUrl,
                expiresIn: seconds,
            },
        };
    },
};
