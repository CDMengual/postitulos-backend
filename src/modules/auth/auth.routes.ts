import { Router } from 'express'
import { authController } from './auth.controller'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { authLoginRateLimit } from '../../middlewares/rateLimit'

const router = Router()

router.post('/login', authLoginRateLimit, authController.login)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware, authController.getCurrentUser)
router.patch('/change-password', authMiddleware, authController.changePassword)

export default router
