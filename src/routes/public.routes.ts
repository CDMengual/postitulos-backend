import { Router } from 'express'
import { publicController } from '../controllers/public.controller'

const router = Router()

// 🚀 Endpoint público sin middleware
router.get('/cohortes-en-inscripcion', publicController.cohortesEnInscripcion)
router.get('/cohortes/:id', publicController.getCohorte)

export default router
