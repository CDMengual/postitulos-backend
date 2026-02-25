import { Router } from 'express'
import { login, logout, getCurrentUser, changePassword } from '../controllers/authController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getCurrentUser)
router.patch('/change-password', authMiddleware, changePassword)

export default router
