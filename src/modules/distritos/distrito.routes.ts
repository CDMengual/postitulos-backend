import { Router } from 'express'
import { distritoController } from './distrito.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'

const router = Router()

router.use(authMiddleware)
router.get('/', distritoController.getAll)

export default router
