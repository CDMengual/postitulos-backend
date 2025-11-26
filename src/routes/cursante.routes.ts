import { Router } from 'express'
import { cursanteController } from '../controllers/cursante.controller'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
router.use(authMiddleware)

router.get('/', cursanteController.getAll)
router.get('/:id', cursanteController.getById)
router.patch('/:id', cursanteController.update)
router.delete('/:id', cursanteController.remove)

export default router
