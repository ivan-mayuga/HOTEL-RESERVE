import { Router } from 'express'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { loginRateLimiter } from '../middleware/rateLimiters.js'
import { validateRequest } from '../middleware/validateRequest.js'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post(
  '/login',
  loginRateLimiter,
  [
    body('staffId').trim().isLength({ min: 1 }).withMessage('Staff ID is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(authController.login),
)

export default router
