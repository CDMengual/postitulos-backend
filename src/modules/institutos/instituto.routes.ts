import { Router } from 'express'
import { institutoController } from './instituto.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { requireRoles } from '../../middlewares/roleMiddleware'

const router = Router()

router.use(authMiddleware)

router.get('/', institutoController.getAll)
router.get('/:id', institutoController.getById)
router.post('/', requireRoles('ADMIN'), institutoController.create)
router.patch('/:id', requireRoles('ADMIN'), institutoController.update)
router.delete('/:id', requireRoles('ADMIN'), institutoController.remove)

export default router
