"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cohorte_controller_1 = require("../controllers/cohorte.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// --- Cohortes ---
router.get('/', cohorte_controller_1.cohorteController.getAll);
router.get('/:id', cohorte_controller_1.cohorteController.getById);
router.post('/', cohorte_controller_1.cohorteController.create);
router.patch('/:id', cohorte_controller_1.cohorteController.update);
router.delete('/:id', cohorte_controller_1.cohorteController.remove);
router.patch('/:id/estado', cohorte_controller_1.cohorteController.updateEstado);
exports.default = router;
