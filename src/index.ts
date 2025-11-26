import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import institutoRoutes from './routes/instituto.routes'
import distritoRoutes from './routes/distrito.routes'
import postituloRoutes from './routes/postitulo.routes'
import aulaRoutes from './routes/aulas.routes'
import cursanteRoutes from './routes/cursante.routes'
import cohorteRoutes from './routes/cohorte.routes'
import formularioRoutes from './routes/formulario.routes'
import publicRoutes from './routes/public.routes'

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

// --- Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
