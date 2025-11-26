import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()

// ✅ Todas las rutas de users protegidas
router.use(authMiddleware)

router.get('/', userController.getAll)
router.get('/:id', userController.getById)
router.post('/', userController.create)
router.patch('/:id', userController.update)
router.delete('/:id', userController.remove)

export default router
