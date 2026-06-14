import { Router } from 'express'
import { body, query } from 'express-validator'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { roomCategories } from '../models/Room.js'
import * as roomController from '../controllers/roomController.js'

const router = Router()

router.get(
  '/',
  [
    query('available').optional().isIn(['true', 'false']).withMessage('available must be true or false'),
    query('category').optional().isIn(roomCategories).withMessage('Invalid room category'),
  ],
  validateRequest,
  asyncHandler(roomController.listRooms),
)

router.get('/vacant', asyncHandler(roomController.getVacantRooms))
router.get('/:id', asyncHandler(roomController.getRoom))

router.post(
  '/',
  [
    body('roomNumber').isInt({ min: 1, max: 999 }).withMessage('Room number must be an integer from 1 to 999'),
    body('category').isIn(roomCategories).withMessage('Invalid room category'),
    body('bedrooms').isInt({ min: 1 }).withMessage('Bedrooms must be an integer greater than 0'),
    body('pricePerNight').isFloat({ gt: 0 }).withMessage('Price per night must be greater than 0'),
  ],
  validateRequest,
  asyncHandler(roomController.createRoom),
)

router.patch(
  '/:id/availability',
  [body('isAvailable').isBoolean().withMessage('isAvailable must be boolean')],
  validateRequest,
  asyncHandler(roomController.updateAvailability),
)

export default router
