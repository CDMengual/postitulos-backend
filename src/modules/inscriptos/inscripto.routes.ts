import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { inscriptoController } from './inscripto.controller'
import { uploadMemory } from '../../middlewares/uploadMiddleware'
import { requireRoles } from '../../middlewares/roleMiddleware'

const router = Router()

router.use(authMiddleware)
router.post('/import/preview', requireRoles('ADMIN'), uploadMemory.single('file'), inscriptoController.previewImport)
router.post('/import', requireRoles('ADMIN'), uploadMemory.single('file'), inscriptoController.commitImport)
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
