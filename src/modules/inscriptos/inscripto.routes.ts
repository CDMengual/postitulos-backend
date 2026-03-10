import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { inscriptoController } from './inscripto.controller'
import { requireRoles } from '../../middlewares/roleMiddleware'

const router = Router()

router.use(authMiddleware)
router.patch('/institutos/asignacion-masiva', requireRoles('ADMIN'), inscriptoController.assignInstitutosBulk)
router.get('/', inscriptoController.getAll)
router.get('/:id', inscriptoController.getById)
router.get('/:id/documentos/:tipo/url', inscriptoController.getDocumentoUrl)
router.patch('/:id', requireRoles('ADMIN', 'REFERENTE'), inscriptoController.update)
router.patch('/:id/estado', requireRoles('ADMIN', 'REFERENTE'), inscriptoController.updateEstado)
router.patch(
  '/:id/documentacion',
  requireRoles('ADMIN', 'REFERENTE'),
  inscriptoController.updateDocumentacion,
)
router.patch('/:id/instituto', requireRoles('ADMIN', 'REFERENTE'), inscriptoController.assignInstituto)

export default router
