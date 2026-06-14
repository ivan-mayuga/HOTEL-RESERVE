import { Amenity } from '../models/Amenity.js'
import { createHttpError } from '../utils/apiResponse.js'

export async function listAmenities(filters = {}) {
  const query = {}
  if (filters.category) query.category = filters.category
  return Amenity.find(query).sort({ category: 1, code: 1 })
}

export async function getAmenityByCode(code) {
  const amenity = await Amenity.findOne({ code: String(code).toUpperCase() })
  if (!amenity) throw createHttpError('Amenity not found', 404)
  return amenity
}

export async function createAmenity(payload) {
  const code = String(payload.code || '').toUpperCase()
  const existing = await Amenity.findOne({ code })
  if (existing) throw createHttpError('Amenity code already exists', 409)
  return Amenity.create({ ...payload, code })
}

export async function updateAmenity(code, payload) {
  const amenity = await getAmenityByCode(code)
  for (const key of ['name', 'price', 'type', 'category']) {
    if (payload[key] !== undefined) amenity[key] = payload[key]
  }
  return amenity.save()
}

export async function deleteAmenity(code) {
  const amenity = await getAmenityByCode(code)
  await amenity.deleteOne()
  return amenity
}

export async function computeTotal(amenityCodes = [], booking) {
  const normalizedCodes = [...new Set(amenityCodes.map((code) => String(code).toUpperCase()))]
  const amenities = await Amenity.find({ code: { $in: normalizedCodes } })
  const foundCodes = new Set(amenities.map((amenity) => amenity.code))
  const missing = normalizedCodes.find((code) => !foundCodes.has(code))

  if (missing) {
    throw createHttpError(`Invalid amenity code: ${missing}`, 400)
  }

  const total = amenities.reduce((sum, amenity) => sum + computeAmenityCost(amenity, booking), 0)
  return {
    codes: normalizedCodes,
    amenities,
    total,
  }
}

export function computeAmenityCost(amenity, booking) {
  if (amenity.type === 'PerNight') return amenity.price * booking.numberOfDays
  if (amenity.type === 'PerGuest') return amenity.price * booking.numberOfGuests
  return amenity.price
}
