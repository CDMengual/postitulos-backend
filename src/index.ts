import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
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
import { buildCorsOptions } from './shared/http/cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// --- Middlewares ---
app.use(helmet())
app.use(cors(buildCorsOptions()))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// --- Rutas ---
app.get('/', (_, res) => res.send('API Postitulos funcionando'))
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
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
