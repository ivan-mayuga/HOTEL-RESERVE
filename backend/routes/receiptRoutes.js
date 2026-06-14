import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.js'
import * as receiptController from '../controllers/receiptController.js'

const router = Router()

router.get('/', asyncHandler(receiptController.listReceipts))
router.get('/:orNumber/pdf', asyncHandler(receiptController.getReceiptPdf))
router.get('/:orNumber', asyncHandler(receiptController.getReceipt))

export default router
