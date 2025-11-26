import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token
  if (!token) return res.status(401).json({ message: 'No autorizado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as Express.Request['user']
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}
