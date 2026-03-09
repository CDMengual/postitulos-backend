"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const distrito_controller_1 = require("../controllers/distrito.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get('/', distrito_controller_1.distritoController.getAll);
exports.default = router;
