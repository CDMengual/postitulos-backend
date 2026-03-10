import { Router } from 'express'
import { cohorteController } from './cohorte.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { requireRoles } from '../../middlewares/roleMiddleware'

const router = Router()
router.use(authMiddleware)

router.get('/', cohorteController.getAll)
router.get('/:id', cohorteController.getById)
router.post('/', requireRoles('ADMIN'), cohorteController.create)
router.patch('/:id', requireRoles('ADMIN'), cohorteController.update)
router.delete('/:id', requireRoles('ADMIN'), cohorteController.remove)
router.patch('/:id/estado', requireRoles('ADMIN'), cohorteController.updateEstado)

export default router
