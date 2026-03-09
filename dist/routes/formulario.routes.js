"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formulario_controller_1 = require("../controllers/formulario.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// --- Formularios ---
router.get('/', formulario_controller_1.formularioController.getAll);
router.get('/:id', formulario_controller_1.formularioController.getById);
exports.default = router;
