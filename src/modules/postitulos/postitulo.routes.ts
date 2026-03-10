import { Router } from 'express'
import { postituloController } from './postitulo.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { requireRoles } from '../../middlewares/roleMiddleware'

const router = Router()

router.use(authMiddleware)

router.get('/', postituloController.getAll)
router.get('/:id', postituloController.getById)
router.post('/', requireRoles('ADMIN'), postituloController.create)
router.patch('/:id', requireRoles('ADMIN'), postituloController.update)
router.delete('/:id', requireRoles('ADMIN'), postituloController.remove)

export default router
