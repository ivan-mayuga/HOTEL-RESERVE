import mongoose from 'mongoose'
import { Room } from '../models/Room.js'
import { createHttpError } from '../utils/apiResponse.js'

export async function listRooms(filters = {}) {
  const query = {}

  if (filters.available === 'true') query.isAvailable = true
  if (filters.available === 'false') query.isAvailable = false
  if (filters.category) query.category = filters.category

  return Room.find(query).sort({ roomNumber: 1 })
}

export async function getVacantRooms() {
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
