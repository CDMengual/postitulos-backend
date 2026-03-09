"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postitulo_controller_1 = require("../controllers/postitulo.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// ✅ Todas las rutas protegidas
router.use(authMiddleware_1.authMiddleware);
router.get('/', postitulo_controller_1.postituloController.getAll);
router.get('/:id', postitulo_controller_1.postituloController.getById);
router.post('/', postitulo_controller_1.postituloController.create);
router.patch('/:id', postitulo_controller_1.postituloController.update);
router.delete('/:id', postitulo_controller_1.postituloController.remove);
exports.default = router;
