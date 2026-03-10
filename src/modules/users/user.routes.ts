import { Router } from 'express'
import { userController } from './user.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { requireRoles } from '../../middlewares/roleMiddleware'

const router = Router()

router.use(authMiddleware)
router.use(requireRoles('ADMIN'))

router.get('/', userController.getAll)
router.get('/:id', userController.getById)
router.post('/', userController.create)
router.patch('/:id', userController.update)
router.delete('/:id', userController.remove)

export default router
