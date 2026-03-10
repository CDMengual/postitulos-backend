import { Router } from 'express'
import { publicController } from './public.controller'
import {
  publicInscripcionRateLimit,
  publicUploadRateLimit,
} from '../../middlewares/rateLimit'

const router = Router()

router.get('/cohortes-en-inscripcion', publicController.cohortesEnInscripcion)
router.get('/cohortes/:id', publicController.getCohorte)
router.post('/cohortes/:id/uploads/sign', publicUploadRateLimit, publicController.signUpload)
router.post(
  '/cohortes/:id/inscripciones',
  publicInscripcionRateLimit,
  publicController.createInscripcion,
)

export default router
