import { Router } from 'express'
import { formularioController } from '../controllers/formulario.controller'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
router.use(authMiddleware)

// --- Formularios ---
router.get('/', formularioController.getAll)
router.get('/:id', formularioController.getById)

export default router
