"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
exports.userController = {
    async getAll(req, res) {
        try {
            const { rol } = req.query;
            const users = await user_service_1.userService.getAll(typeof rol === 'string' ? rol.toUpperCase() : undefined);
            return (0, response_1.sendSuccess)(res, 'Usuarios obtenidos correctamente', users, {
                total: users.length,
            });
        }
        catch (error) {
            console.error('Error al obtener usuarios:', error);
            return (0, response_1.sendError)(res, 'Error al obtener usuarios');
        }
    },
    async getById(req, res) {
        try {
            const id = Number(req.params.id);
            const user = await user_service_1.userService.getById(id);
            if (!user)
                return (0, response_1.sendError)(res, 'Usuario no encontrado', 404);
            return (0, response_1.sendSuccess)(res, 'Usuario obtenido correctamente', user);
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Error al obtener usuario');
        }
    },
    async create(req, res) {
        try {
            const { password, ...userData } = req.body;
            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }
            // 🔒 Hasheamos la contraseña antes de guardar
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const newUser = await user_service_1.userService.create({
                ...userData,
                password: hashedPassword,
            });
            // No devolver el hash en la respuesta
            const { password: _, ...userWithoutPassword } = newUser;
            return (0, response_1.sendSuccess)(res, 'Usuario creado correctamente', userWithoutPassword, null, 201);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al crear usuario', 400);
        }
    },
    async update(req, res) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ error: 'Invalid user ID' });
            const data = req.body;
            if (!data || Object.keys(data).length === 0)
                return res.status(400).json({ error: 'No fields provided to update' });
            const updatedUser = await user_service_1.userService.update(id, data);
            return (0, response_1.sendSuccess)(res, 'Usuario actualizado correctamente', updatedUser);
        }
        catch (error) {
            console.error(error);
            return (0, response_1.sendError)(res, error.message || 'Error al actualizar usuario', 400);
        }
    },
    async remove(req, res) {
        try {
            const id = Number(req.params.id);
            await user_service_1.userService.remove(id);
            return (0, response_1.sendSuccess)(res, 'Usuario eliminado correctamente');
        }
        catch (error) {
            console.error('Error al eliminar usuario:', error);
            return (0, response_1.sendError)(res, error.message || 'Error al eliminar usuario', 400);
        }
    },
};
