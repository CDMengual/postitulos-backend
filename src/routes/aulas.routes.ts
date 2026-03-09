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
router.get('/snapshots-mensuales', aulaController.getMonthlySnapshotSeriesByCohorte)
router.post('/snapshots-mensuales', aulaController.createMonthlySnapshotsForCohorte)
router.get('/:id', canAccess('aula'), aulaController.getById)
router.post('/', aulaController.create)
router.post('/massive', aulaController.createMany)
router.patch('/:id', canAccess('aula'), aulaController.update)
router.delete('/:id', canAccess('aula'), aulaController.remove)
router.get('/:aulaId/snapshots-mensuales', canAccess('aula'), aulaController.getMonthlySnapshotsByAula)
router.post('/:aulaId/snapshots-mensuales', canAccess('aula'), aulaController.createMonthlySnapshot)

// --- Cursantes dentro de Aula ---
router.post('/:aulaId/cursantes', cursanteController.create)
router.post(
  '/:aulaId/cursantes/import',
  uploadMemory.single('file'),
  cursanteController.importFromFile,
)
router.delete('/:aulaId/cursantes/:cursanteId', cursanteController.removeCursanteFromAula)
router.get(
  '/:aulaId/cursantes/:cursanteId',
  canAccess('aula'),
  cursanteController.getDetalleEnAula,
)
router.get(
  '/:aulaId/cursantes/:cursanteId/documentos/:tipo/url',
  canAccess('aula'),
  cursanteController.getDocumentoUrlEnAula,
)
router.patch(
  '/:aulaId/cursantes/:cursanteId',
  canAccess('aula'),
  cursanteController.updateObservacionesEnAula,
)
router.patch('/:aulaId/cursantes/:cursanteId/estado', cursanteController.updateEstado)
router.patch('/:aulaId/cursantes/:cursanteId/documentacion', cursanteController.updateDocumentacion)

export default router
