import dotenv from 'dotenv'
import { connectDb, disconnectDb } from '../config/db.js'
import { Amenity } from '../models/Amenity.js'
import { Room } from '../models/Room.js'

dotenv.config()

const rooms = [
  { roomNumber: 101, category: 'Classic', bedrooms: 1, pricePerNight: 2800, isAvailable: true },
  { roomNumber: 102, category: 'Classic', bedrooms: 1, pricePerNight: 3000, isAvailable: true },
  { roomNumber: 201, category: 'De Luxe', bedrooms: 2, pricePerNight: 4600, isAvailable: true },
  { roomNumber: 202, category: 'De Luxe', bedrooms: 2, pricePerNight: 4800, isAvailable: false },
  { roomNumber: 301, category: 'Suite', bedrooms: 2, pricePerNight: 7200, isAvailable: true },
  { roomNumber: 302, category: 'Suite', bedrooms: 3, pricePerNight: 8200, isAvailable: true },
  { roomNumber: 401, category: 'Imperial Grand', bedrooms: 3, pricePerNight: 12800, isAvailable: false },
  { roomNumber: 402, category: 'Imperial Grand', bedrooms: 4, pricePerNight: 14800, isAvailable: true },
]

const amenities = [
  { code: 'CON1', name: 'Breakfast Tray', price: 650, type: 'PerGuest', category: 'Convenience' },
  { code: 'CON2', name: 'Laundry Service', price: 900, type: 'PerNight', category: 'Convenience' },
  { code: 'CON3', name: 'Airport Transfer', price: 1800, type: 'PerBooking', category: 'Convenience' },
  { code: 'POL1', name: 'Pool Cabana Access', price: 1200, type: 'PerNight', category: 'Pool' },
  { code: 'POL2', name: 'Private Swim Coach', price: 1600, type: 'PerGuest', category: 'Pool' },
  { code: 'SPA1', name: 'Signature Massage', price: 2200, type: 'PerGuest', category: 'Spa' },
  { code: 'SPA2', name: 'Sauna Suite Access', price: 1500, type: 'PerNight', category: 'Spa' },
]

async function seed() {
  await connectDb()
  await Room.deleteMany({})
  await Amenity.deleteMany({})
  const insertedRooms = await Room.insertMany(rooms)
  const insertedAmenities = await Amenity.insertMany(amenities)
  console.log(`Inserted ${insertedRooms.length} rooms and ${insertedAmenities.length} amenities.`)
  await disconnectDb()
}

seed().catch(async (error) => {
  console.error(error)
  await disconnectDb()
  process.exit(1)
})
