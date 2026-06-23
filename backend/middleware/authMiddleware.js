import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../services/authService.js'
import { createHttpError } from '../utils/apiResponse.js'

export function requireAuth(req, _res, next) {
  const header = req.get('Authorization') || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return next(createHttpError('Authentication required', 401))
  }

  try {
    // Security-sensitive: verify signature and expiration before trusting staff identity.
    const payload = jwt.verify(token, getJwtSecret())
    req.user = {
      id: payload.id,
      staffId: payload.staffId,
      role: payload.role,
    }
    return next()
  } catch {
    return next(createHttpError('Invalid or expired token', 401))
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(createHttpError('Authentication required', 401))
    if (!roles.includes(req.user.role)) return next(createHttpError('Forbidden', 403))
    return next()
  }
}
