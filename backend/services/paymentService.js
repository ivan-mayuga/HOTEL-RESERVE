import { Booking, paymentMethods } from '../models/Booking.js'
import { createHttpError } from '../utils/apiResponse.js'
import { computeTotal } from './amenityService.js'
import { generateReceipt } from './receiptService.js'

export async function processPayment(referenceNumber, payload) {
  const booking = await Booking.findOne({ referenceNumber: String(referenceNumber).toUpperCase() })
  if (!booking) throw createHttpError('Booking not found', 404)
  if (booking.isPaid) throw createHttpError('Booking is already paid', 400)
  if (booking.status !== 'Active') throw createHttpError('Only active bookings can be paid', 400)

  const paymentMethod = payload.paymentMethod
  if (!paymentMethods.includes(paymentMethod)) {
    throw createHttpError('Payment method must be Cash, Card, or GCash', 400)
  }

  const { codes, total: amenitiesTotal } = await computeTotal(payload.amenityCodes || [], booking)
  const finalAmount = booking.roomRate + amenitiesTotal
  const payment = validatePaymentDetails(paymentMethod, payload, finalAmount)

  booking.amenityCodes = codes
  booking.amenitiesTotal = amenitiesTotal
  booking.finalAmount = finalAmount
  booking.isPaid = true
  booking.paymentMethod = paymentMethod
  booking.amountReceived = payment.amountReceived
  booking.change = payment.change

  await booking.save()
  const receipt = await generateReceipt(booking)

  return { booking, receipt }
}

function validatePaymentDetails(paymentMethod, payload, finalAmount) {
  if (paymentMethod === 'Cash') {
    const amountReceived = Number(payload.amountReceived)
    if (!Number.isFinite(amountReceived) || amountReceived < finalAmount) {
      throw createHttpError('Cash amount must cover the final amount.', 400)
    }
    return {
      amountReceived,
      change: amountReceived - finalAmount,
    }
  }

  if (paymentMethod === 'Card') {
    const card = payload.card || {}
    if (!/^[A-Za-z ]{2,}$/.test(card.cardName || card.cardholderName || '')) {
      throw createHttpError('Cardholder name must contain letters and spaces only.', 400)
    }
    if (!/^\d{12,16}$/.test(card.cardNumber || '')) {
      throw createHttpError('Card number must contain 12 to 16 digits.', 400)
    }
    if (!isValidExpiry(card.expiry || '')) {
      throw createHttpError('Card expiry must be MM/YY and not expired.', 400)
    }
    if (!/^\d{3}$/.test(card.cvv || '')) {
      throw createHttpError('CVV must contain exactly 3 digits.', 400)
    }
  }

  if (paymentMethod === 'GCash') {
    const gcash = payload.gcash || {}
    if (!/^\d{11}$/.test(gcash.gcashNumber || '')) {
      throw createHttpError('GCash number must contain exactly 11 digits.', 400)
    }
    if (!/^[A-Za-z ]{2,}$/.test(gcash.gcashName || '')) {
      throw createHttpError('GCash account name must contain letters and spaces only.', 400)
    }
  }

  return {
    amountReceived: finalAmount,
    change: 0,
  }
}

function isValidExpiry(value) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  return year > currentYear || (year === currentYear && month >= currentMonth)
}
