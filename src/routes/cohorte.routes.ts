import { Router } from 'express'
import { cohorteController } from '../controllers/cohorte.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { canAccess } from '../middlewares/accessControl'

const router = Router()
router.use(authMiddleware)

// --- Cohortes ---
router.get('/', cohorteController.getAll)
router.get('/:id', cohorteController.getById)
router.post('/', cohorteController.create)
router.patch('/:id', cohorteController.update)
router.delete('/:id', cohorteController.remove)
router.patch('/:id/estado', cohorteController.updateEstado)

export default router
