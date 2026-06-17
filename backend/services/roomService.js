import mongoose from 'mongoose'
import { Booking } from '../models/Booking.js'
import { Room } from '../models/Room.js'
import { createHttpError } from '../utils/apiResponse.js'

export async function listRooms(filters = {}) {
  const query = {}

  if (filters.checkIn && filters.checkOut) {
    const conflictingRoomIds = await getConflictingRoomIds(filters.checkIn, filters.checkOut)
    query._id = { $nin: conflictingRoomIds }
  } else {
    if (filters.available === 'true') query.isAvailable = true
    if (filters.available === 'false') query.isAvailable = false
  }

  if (filters.category) query.category = filters.category

  return Room.find(query).sort({ roomNumber: 1 })
}

export async function getVacantRooms(checkIn, checkOut) {
  if (checkIn && checkOut) {
    const conflictingRoomIds = await getConflictingRoomIds(checkIn, checkOut)
    return Room.find({ _id: { $nin: conflictingRoomIds } }).sort({ roomNumber: 1 })
  }

  return Room.find({ isAvailable: true }).sort({ roomNumber: 1 })
}

export async function getRoomById(idOrRoomNumber) {
  const query = mongoose.Types.ObjectId.isValid(idOrRoomNumber)
    ? { _id: idOrRoomNumber }
    : { roomNumber: Number(idOrRoomNumber) }

  const room = await Room.findOne(query)
  if (!room) throw createHttpError('Room not found', 404)
  return room
}

export async function createRoom(payload) {
  const existing = await Room.findOne({ roomNumber: payload.roomNumber })
  if (existing) throw createHttpError('Room number already exists', 409)
  return Room.create(payload)
}

export async function updateAvailability(idOrRoomNumber, isAvailable) {
  const room = await getRoomById(idOrRoomNumber)
  room.isAvailable = isAvailable
  return room.save()
}

export async function getRatesByCategory(category) {
  return Room.find({ category }).sort({ bedrooms: 1, pricePerNight: 1 })
}

async function getConflictingRoomIds(checkIn, checkOut) {
  const conflictingBookings = await Booking.find({
    status: 'Active',
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  }).select('roomRef')

  return conflictingBookings.map((booking) => booking.roomRef)
}
