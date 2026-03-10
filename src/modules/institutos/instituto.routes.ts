import { Router } from 'express'
import { institutoController } from './instituto.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'

const router = Router()

router.use(authMiddleware)

router.get('/', institutoController.getAll)
router.get('/:id', institutoController.getById)
router.post('/', institutoController.create)
router.patch('/:id', institutoController.update)
router.delete('/:id', institutoController.remove)

export default router
