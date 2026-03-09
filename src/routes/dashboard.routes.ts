import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard.controller'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()

router.use(authMiddleware)

router.get('/desgranamiento', dashboardController.getDesgranamiento)
router.get('/', dashboardController.getResumen)

export default router
