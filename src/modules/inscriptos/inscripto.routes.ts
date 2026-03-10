import { Router } from 'express'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { inscriptoController } from './inscripto.controller'

const router = Router()

router.use(authMiddleware)
router.patch('/institutos/asignacion-masiva', inscriptoController.assignInstitutosBulk)
router.get('/', inscriptoController.getAll)
router.get('/:id', inscriptoController.getById)
router.get('/:id/documentos/:tipo/url', inscriptoController.getDocumentoUrl)
router.patch('/:id', inscriptoController.update)
router.patch('/:id/estado', inscriptoController.updateEstado)
router.patch('/:id/documentacion', inscriptoController.updateDocumentacion)
router.patch('/:id/instituto', inscriptoController.assignInstituto)

export default router
