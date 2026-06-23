import { Booking } from '../models/Booking.js'
import { Room } from '../models/Room.js'
import { createHttpError } from '../utils/apiResponse.js'
import { validateStayDates } from '../utils/dateUtils.js'
import { generate } from '../utils/referenceGenerator.js'
import { runWithTransaction } from './transactionService.js'

export async function listBookings(filters = {}) {
  const query = {}

  if (filters.status) {
    query.status = filters.status
  } else {
    query.status = { $ne: 'Cancelled' }
  }

  if (filters.guestName) {
    query.guestName = { $regex: filters.guestName, $options: 'i' }
  }

  return Booking.find(query).sort({ createdAt: -1 })
}

export async function getBookingByReference(referenceNumber) {
  const booking = await Booking.findOne({ referenceNumber: String(referenceNumber).toUpperCase() })
  if (!booking) throw createHttpError('Booking not found', 404)
  return booking
}

export async function createReservation(payload) {
  validateGuestPayload(payload)
  const stay = validateStayDates(payload.checkIn, payload.checkOut)
  const room = await Room.findOne({ _id: payload.roomId, isAvailable: true })

  if (!room) throw createHttpError('Room is not available', 404)

  const conflictingBooking = await Booking.findOne({
    roomRef: room._id,
    status: 'Active',
    checkIn: { $lt: stay.checkOut },
    checkOut: { $gt: stay.checkIn },
  })

  if (conflictingBooking) {
    throw createHttpError('Room is not available for the selected dates', 409)
  }

  const referenceNumber = await generate('booking')
  const roomRate = room.pricePerNight * stay.numberOfDays

  return runWithTransaction(async (session) => {
    const booking = new Booking({
      referenceNumber,
      guestName: payload.guestName.trim(),
      numberOfGuests: Number(payload.numberOfGuests),
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      numberOfDays: stay.numberOfDays,
      roomRef: room._id,
      roomNumber: room.roomNumber,
      roomType: room.category,
      pricePerNight: room.pricePerNight,
      roomRate,
      amenityCodes: [],
      amenitiesTotal: 0,
      finalAmount: roomRate,
      isPaid: false,
      status: 'Active',
    })

    await booking.save(session ? { session } : undefined)
    return booking
  })
}

export async function checkoutGuest(referenceNumber) {
  const booking = await getBookingByReference(referenceNumber)

  if (booking.status !== 'Active') {
    throw createHttpError('Only active bookings can be checked out', 400)
  }
  if (!booking.isPaid) {
    throw createHttpError('Booking must be paid before checkout', 400)
  }

  return runWithTransaction(async (session) => {
    booking.status = 'CheckedOut'
    await booking.save(session ? { session } : undefined)
    return booking
  })
}

export async function cancelReservation(referenceNumber) {
  const booking = await getBookingByReference(referenceNumber)

  if (booking.status === 'CheckedOut') {
    throw createHttpError('Checked out bookings cannot be cancelled', 400)
  }
  if (booking.status === 'Cancelled') {
    throw createHttpError('Booking is already cancelled', 400)
  }

  return runWithTransaction(async (session) => {
    booking.status = 'Cancelled'
    await booking.save(session ? { session } : undefined)
    return booking
  })
}

function validateGuestPayload(payload) {
  if (!/^[A-Za-z ]{2,}$/.test(payload.guestName || '')) {
    throw createHttpError('Guest name must contain letters and spaces only.', 400)
  }

  if (!Number.isInteger(Number(payload.numberOfGuests)) || Number(payload.numberOfGuests) < 1) {
    throw createHttpError('Number of guests must be an integer greater than 0.', 400)
  }
}
