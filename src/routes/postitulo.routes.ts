import { Router } from 'express'
import { postituloController } from '../controllers/postitulo.controller'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()

// ✅ Todas las rutas protegidas
router.use(authMiddleware)

router.get('/', postituloController.getAll)
router.get('/:id', postituloController.getById)
router.post('/', postituloController.create)
router.patch('/:id', postituloController.update)
router.delete('/:id', postituloController.remove)

export default router
