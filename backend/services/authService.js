import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { createHttpError } from '../utils/apiResponse.js'

const tokenTtl = '8h'

export async function loginStaff({ staffId, password }) {
  const user = await User.findOne({ staffId: String(staffId || '').trim().toLowerCase() })
  if (!user) throw createHttpError('Invalid staff credentials', 401)

  const passwordMatches = await bcrypt.compare(String(password || ''), user.passwordHash)
  if (!passwordMatches) throw createHttpError('Invalid staff credentials', 401)

  return {
    token: signAuthToken(user),
    user: serializeUser(user),
  }
}

export function signAuthToken(user) {
  const secret = getJwtSecret()

  // Security-sensitive: keep the JWT payload intentionally small and non-secret.
  return jwt.sign(
    {
      id: user._id.toString(),
      staffId: user.staffId,
      role: user.role,
    },
    secret,
    { expiresIn: tokenTtl },
  )
}

export function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    staffId: user.staffId,
    role: user.role,
  }
}

export function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw createHttpError('JWT_SECRET is not configured', 500)
  }
  return process.env.JWT_SECRET
}
