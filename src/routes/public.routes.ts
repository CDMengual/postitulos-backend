import { Router } from 'express'
import { publicController } from '../controllers/public.controller'

const router = Router()

router.get('/cohortes-en-inscripcion', publicController.cohortesEnInscripcion)
router.get('/cohortes/:id', publicController.getCohorte)
router.post('/cohortes/:id/uploads/sign', publicController.signUpload)
router.post('/cohortes/:id/inscripciones', publicController.createInscripcion)

export default router
