import { Router } from 'express'
import { aulaController } from '../controllers/aula.controller'
import { cursanteController } from '../controllers/cursante.controller'
import { uploadMemory } from '../middlewares/uploadMiddleware'
import { authMiddleware } from '../middlewares/authMiddleware'
import { canAccess } from '../middlewares/accessControl'

const router = Router()
router.use(authMiddleware)

// --- Aulas ---
router.get('/', aulaController.getAll)
router.get('/:id', canAccess('aula'), aulaController.getById)
router.post('/', aulaController.create)
router.post('/massive', aulaController.createMany)
router.patch('/:id', canAccess('aula'), aulaController.update)
router.delete('/:id', canAccess('aula'), aulaController.remove)

// --- Cursantes dentro de Aula ---
router.post('/:aulaId/cursantes', cursanteController.create)
router.post(
  '/:aulaId/cursantes/import',
  uploadMemory.single('file'),
  cursanteController.importFromFile,
)
router.delete('/:aulaId/cursantes/:cursanteId', cursanteController.removeCursanteFromAula)
router.patch('/:aulaId/cursantes/:cursanteId/estado', cursanteController.updateEstado)
router.patch('/:aulaId/cursantes/:cursanteId/documentacion', cursanteController.updateDocumentacion)

export default router
