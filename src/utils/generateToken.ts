import jwt from 'jsonwebtoken'

export function generateToken(payload: object) {
  const secret = process.env.JWT_SECRET as string
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}
