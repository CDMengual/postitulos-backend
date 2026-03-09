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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getCurrentUser = exports.logout = exports.login = void 0;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const client_1 = __importDefault(require("../prisma/client"));
// --- LOGIN ---
const login = async (req, res) => {
    try {
        const { user, token } = await authService.login(req.body.email, req.body.password);
        // ✅ Seteamos cookie HttpOnly
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });
        return (0, response_1.sendSuccess)(res, 'Login exitoso', { user });
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Error al iniciar sesión', err.status || 500);
    }
};
exports.login = login;
// --- LOGOUT ---
const logout = async (_, res) => {
    try {
        res.clearCookie('auth_token');
        return (0, response_1.sendSuccess)(res, 'Sesión cerrada correctamente');
    }
    catch (err) {
        return (0, response_1.sendError)(res, 'Error al cerrar sesión');
    }
};
exports.logout = logout;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return (0, response_1.sendError)(res, 'No autorizado', 401);
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
            include: {
                instituto: {
                    include: {
                        distrito: { include: { region: true } },
                    },
                },
            },
        });
        if (!user)
            return (0, response_1.sendError)(res, 'Usuario no encontrado', 404);
        const { password: _, ...safeUser } = user;
        return (0, response_1.sendSuccess)(res, 'Usuario autenticado correctamente', safeUser);
    }
    catch (err) {
        console.error('Error en /auth/me:', err);
        return (0, response_1.sendError)(res, 'Error al obtener usuario autenticado', 500);
    }
};
exports.getCurrentUser = getCurrentUser;
// --- CHANGE PASSWORD (perfil) ---
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return (0, response_1.sendError)(res, 'No autorizado', 401);
        const { currentPassword, newPassword } = req.body || {};
        await authService.changePassword(userId, currentPassword, newPassword);
        return (0, response_1.sendSuccess)(res, 'Contrasena actualizada correctamente');
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message || 'Error al actualizar contrasena', err.status || 500);
    }
};
exports.changePassword = changePassword;
