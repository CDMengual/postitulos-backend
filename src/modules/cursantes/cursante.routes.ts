import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { cursanteController } from './cursante.controller'

const router = Router()
router.use(authMiddleware)

router.post('/', cursanteController.createStandalone)
router.post('/:id/asignar-aula', cursanteController.assignToAula)
router.get('/', cursanteController.getAll)
router.get('/:id', cursanteController.getById)
router.patch('/:id', cursanteController.update)
router.delete('/:id', cursanteController.remove)

export default router
