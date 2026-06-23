import { Router } from 'express'
import { body, query } from 'express-validator'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { bookingRateLimiter } from '../middleware/rateLimiters.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { bookingStatuses, paymentMethods } from '../models/Booking.js'
import * as bookingController from '../controllers/bookingController.js'

const router = Router()

router.get(
  '/',
  [
    query('status').optional().isIn(bookingStatuses).withMessage('Invalid booking status'),
    query('guestName').optional().trim().isLength({ min: 1 }).withMessage('guestName cannot be empty'),
  ],
  validateRequest,
  asyncHandler(bookingController.listBookings),
)

router.get('/:referenceNumber', asyncHandler(bookingController.getBooking))

router.post(
  '/',
  bookingRateLimiter,
  [
    body('guestName').matches(/^[A-Za-z ]{2,}$/).withMessage('Guest name must contain letters and spaces only'),
    body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests must be greater than 0'),
    body('checkIn').isISO8601().withMessage('Check-in must be a valid ISO date'),
    body('checkOut').isISO8601().withMessage('Check-out must be a valid ISO date'),
    body('roomId').isMongoId().withMessage('roomId must be a valid MongoDB ObjectId'),
  ],
  validateRequest,
  asyncHandler(bookingController.createBooking),
)

router.patch(
  '/:referenceNumber/pay',
  [
    body('amenityCodes').optional().isArray().withMessage('amenityCodes must be an array'),
    body('amenityCodes.*').optional().isString().withMessage('Amenity codes must be strings'),
    body('paymentMethod').isIn(paymentMethods).withMessage('Payment method must be Cash, Card, or GCash'),
    body('amountReceived').optional().isFloat({ gt: 0 }).withMessage('Amount received must be greater than 0'),
    body('card.cardName').optional().matches(/^[A-Za-z ]{2,}$/).withMessage('Cardholder name must contain letters and spaces only'),
    body('card.cardholderName').optional().matches(/^[A-Za-z ]{2,}$/).withMessage('Cardholder name must contain letters and spaces only'),
    body('card.cardNumber').optional().matches(/^\d{12,16}$/).withMessage('Card number must contain 12 to 16 digits'),
    body('card.expiry').optional().matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry must be MM/YY'),
    body('card.cvv').optional().matches(/^\d{3}$/).withMessage('CVV must contain exactly 3 digits'),
    body('gcash.gcashNumber').optional().matches(/^\d{11}$/).withMessage('GCash number must contain exactly 11 digits'),
    body('gcash.gcashName').optional().matches(/^[A-Za-z ]{2,}$/).withMessage('GCash name must contain letters and spaces only'),
  ],
  validateRequest,
  asyncHandler(bookingController.payBooking),
)

router.patch('/:referenceNumber/checkout', requireAuth, requireRole('staff', 'admin'), asyncHandler(bookingController.checkoutBooking))
router.delete('/:referenceNumber', requireAuth, requireRole('staff', 'admin'), asyncHandler(bookingController.cancelBooking))

export default router
