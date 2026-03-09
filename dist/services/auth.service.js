"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.changePassword = changePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateToken_1 = require("../utils/generateToken");
const client_1 = __importDefault(require("../prisma/client"));
async function login(email, password) {
    const user = await client_1.default.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        throw { status: 401, message: 'Usuario o contraseña no válidos' };
    }
    // Generación del token si las credenciales son correctas
    const token = (0, generateToken_1.generateToken)({ id: user.id, email: user.email, rol: user.rol });
    // Eliminamos el password del usuario antes de devolverlo
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
}
async function changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
        throw { status: 400, message: 'Debe enviar contrasena actual y contrasena nueva' };
    }
    if (newPassword.length < 8) {
        throw { status: 400, message: 'La nueva contrasena debe tener al menos 8 caracteres' };
    }
    const user = await client_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
    });
    if (!user) {
        throw { status: 404, message: 'Usuario no encontrado' };
    }
    const currentPasswordOk = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!currentPasswordOk) {
        throw { status: 401, message: 'La contrasena actual es incorrecta' };
    }
    const sameAsCurrent = await bcrypt_1.default.compare(newPassword, user.password);
    if (sameAsCurrent) {
        throw { status: 400, message: 'La nueva contrasena no puede ser igual a la actual' };
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await client_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
}
