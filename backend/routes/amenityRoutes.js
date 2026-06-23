import { Router } from 'express'
import { body, query } from 'express-validator'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { amenityCategories, amenityTypes } from '../models/Amenity.js'
import * as amenityController from '../controllers/amenityController.js'

const router = Router()

const amenityBodyValidators = [
  body('code').trim().isLength({ min: 1, max: 4 }).withMessage('Amenity code is required and must be at most 4 characters'),
  body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Amenity name is required and must be at most 60 characters'),
  body('price').isFloat({ gt: 0 }).withMessage('Amenity price must be greater than 0'),
  body('type').isIn(amenityTypes).withMessage('Invalid amenity billing type'),
  body('category').isIn(amenityCategories).withMessage('Invalid amenity category'),
]

router.get(
  '/',
  [query('category').optional().isIn(amenityCategories).withMessage('Invalid amenity category')],
  validateRequest,
  asyncHandler(amenityController.listAmenities),
)
router.get('/:code', asyncHandler(amenityController.getAmenity))
router.post('/', requireAuth, requireRole('staff', 'admin'), amenityBodyValidators, validateRequest, asyncHandler(amenityController.createAmenity))
router.patch(
  '/:code',
  requireAuth,
  requireRole('staff', 'admin'),
  [
    body('name').optional().trim().isLength({ min: 1, max: 60 }).withMessage('Amenity name must be at most 60 characters'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Amenity price must be greater than 0'),
    body('type').optional().isIn(amenityTypes).withMessage('Invalid amenity billing type'),
    body('category').optional().isIn(amenityCategories).withMessage('Invalid amenity category'),
  ],
  validateRequest,
  asyncHandler(amenityController.updateAmenity),
)
router.delete('/:code', requireAuth, requireRole('staff', 'admin'), asyncHandler(amenityController.deleteAmenity))

export default router
