import { Router } from 'express'
import { body, query } from 'express-validator'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { roomCategories } from '../models/Room.js'
import * as roomController from '../controllers/roomController.js'

const router = Router()

router.get(
  '/',
  [
    query('available').optional().isIn(['true', 'false']).withMessage('available must be true or false'),
    query('category').optional().isIn(roomCategories).withMessage('Invalid room category'),
    query('checkIn').optional().isISO8601().withMessage('checkIn must be a valid ISO date'),
    query('checkOut').optional().isISO8601().withMessage('checkOut must be a valid ISO date'),
  ],
  validateRequest,
  asyncHandler(roomController.listRooms),
)

router.get(
  '/vacant',
  [
    query('checkIn').optional().isISO8601().withMessage('checkIn must be a valid ISO date'),
    query('checkOut').optional().isISO8601().withMessage('checkOut must be a valid ISO date'),
  ],
  validateRequest,
  asyncHandler(roomController.getVacantRooms),
)
router.get('/:id', asyncHandler(roomController.getRoom))

router.post(
  '/',
  requireAuth,
  requireRole('staff', 'admin'),
  [
    body('roomNumber').isInt({ min: 1, max: 999 }).withMessage('Room number must be an integer from 1 to 999'),
    body('category').isIn(roomCategories).withMessage('Invalid room category'),
    body('bedrooms').isInt({ min: 1 }).withMessage('Bedrooms must be an integer greater than 0'),
    body('pricePerNight').isFloat({ gt: 0 }).withMessage('Price per night must be greater than 0'),
  ],
  validateRequest,
  asyncHandler(roomController.createRoom),
)

router.put(
  '/:id',
  requireAuth,
  requireRole('staff', 'admin'),
  [
    body('roomNumber').optional().isInt({ min: 1, max: 999 }).withMessage('Room number must be an integer from 1 to 999'),
    body('category').optional().isIn(roomCategories).withMessage('Invalid room category'),
    body('bedrooms').optional().isInt({ min: 1 }).withMessage('Bedrooms must be an integer greater than 0'),
    body('pricePerNight').optional().isFloat({ gt: 0 }).withMessage('Price per night must be greater than 0'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
  ],
  validateRequest,
  asyncHandler(roomController.updateRoom),
)

router.patch(
  '/:id/availability',
  requireAuth,
  requireRole('staff', 'admin'),
  [body('isAvailable').isBoolean().withMessage('isAvailable must be boolean')],
  validateRequest,
  asyncHandler(roomController.updateAvailability),
)

router.delete('/:id', requireAuth, requireRole('staff', 'admin'), asyncHandler(roomController.deleteRoom))

export default router
