"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccess = canAccess;
const client_1 = __importDefault(require("../prisma/client"));
function canAccess(resource) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: 'No autenticado' });
            switch (resource) {
                case 'aula': {
                    const aulaIdRaw = req.params.aulaId ?? req.params.id;
                    const aulaId = Number(aulaIdRaw);
                    if (!aulaIdRaw || Number.isNaN(aulaId)) {
                        return res.status(400).json({ message: 'aulaId invalido' });
                    }
                    const aula = await client_1.default.aula.findUnique({
                        where: { id: aulaId },
                        include: {
                            admins: { select: { id: true } },
                            coordinadores: { select: { id: true } },
                            referentes: { select: { id: true } },
                            formadores: { select: { id: true } },
                        },
                    });
                    if (!aula)
                        return res.status(404).json({ message: 'Aula no encontrada' });
                    const pertenece = aula.admins.some((u) => u.id === user.id) ||
                        aula.coordinadores.some((u) => u.id === user.id) ||
                        aula.referentes.some((u) => u.id === user.id) ||
                        aula.formadores.some((u) => u.id === user.id);
                    if (!pertenece && user.rol !== 'ADMIN') {
                        return res.status(403).json({ message: 'Acceso no permitido' });
                    }
                    break;
                }
                // 👇 En el futuro se puede  extender así:
                // case 'cursante': { ... }
                // case 'postitulo': { ... }
                default:
                    return res.status(500).json({ message: 'Tipo de recurso no soportado' });
            }
            next();
        }
        catch (err) {
            console.error('Error en canAccess:', err);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };
}
