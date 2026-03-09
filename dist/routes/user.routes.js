"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// ✅ Todas las rutas de users protegidas
router.use(authMiddleware_1.authMiddleware);
router.get('/', user_controller_1.userController.getAll);
router.get('/:id', user_controller_1.userController.getById);
router.post('/', user_controller_1.userController.create);
router.patch('/:id', user_controller_1.userController.update);
router.delete('/:id', user_controller_1.userController.remove);
exports.default = router;
