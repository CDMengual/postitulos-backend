import { Router } from 'express'
import { formularioController } from './formulario.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'

const router = Router()
router.use(authMiddleware)

router.get('/', formularioController.getAll)
router.get('/:id', formularioController.getById)

export default router
