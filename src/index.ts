import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRoutes } from './modules/auth'
import { userRoutes } from './modules/users'
import { cursanteRoutes } from './modules/cursantes'
import { dashboardRoutes } from './modules/dashboard'
import { distritoRoutes } from './modules/distritos'
import { formularioRoutes } from './modules/formularios'
import { institutoRoutes } from './modules/institutos'
import { inscriptoRoutes } from './modules/inscriptos'
import { postituloRoutes } from './modules/postitulos'
import { publicRoutes } from './modules/public'
import { aulaRoutes } from './modules/aulas'
import { cohorteRoutes } from './modules/cohortes'
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// --- Middlewares ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // ✅ permite cookies
  }),
)
app.use(express.json())
app.use(cookieParser()) // ✅ debe ir antes de las rutas

// --- Rutas ---
app.get('/', (_, res) => res.send('✅ API Postítulos funcionando'))
app.use('/api/public', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/institutos', institutoRoutes)
app.use('/api/distritos', distritoRoutes)
app.use('/api/postitulos', postituloRoutes)
app.use('/api/aulas', aulaRoutes)
app.use('/api/cursantes', cursanteRoutes)
app.use('/api/cohortes', cohorteRoutes)
app.use('/api/formularios', formularioRoutes)
app.use('/api/inscripciones', inscriptoRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use(notFoundMiddleware)
app.use(errorMiddleware)

// --- Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
