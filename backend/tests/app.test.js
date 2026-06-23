import bcrypt from 'bcrypt'
import { jest } from '@jest/globals'
import mongoose from 'mongoose'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../app.js'
import { Booking } from '../models/Booking.js'
import { Counter } from '../models/Counter.js'
import { Room } from '../models/Room.js'
import { User } from '../models/User.js'

let mongo
let token

jest.setTimeout(60000)

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  mongo = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 60000,
    },
  })
  await mongoose.connect(mongo.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
})

beforeEach(async () => {
  await Promise.all([
    Booking.deleteMany({}),
    Counter.deleteMany({}),
    Room.deleteMany({}),
    User.deleteMany({}),
  ])

  await User.create({
    name: 'Test Staff',
    staffId: 'frontdesk',
    passwordHash: await bcrypt.hash('staff12345', 10),
    role: 'admin',
  })

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ staffId: 'frontdesk', password: 'staff12345' })

  token = login.body.data.token
})

describe('booking logic', () => {
  test('allows non-overlapping bookings', async () => {
    const room = await Room.create({ roomNumber: 101, category: 'Classic', bedrooms: 1, pricePerNight: 2800 })

    await request(app)
      .post('/api/v1/bookings')
      .send({ guestName: 'Ada Lovelace', numberOfGuests: 1, checkIn: '2026-07-01', checkOut: '2026-07-03', roomId: room._id })
      .expect(201)

    const response = await request(app)
      .post('/api/v1/bookings')
      .send({ guestName: 'Grace Hopper', numberOfGuests: 1, checkIn: '2026-07-03', checkOut: '2026-07-05', roomId: room._id })
      .expect(201)

    expect(response.body.data.referenceNumber).toBe('B000002')
  })

  test('rejects overlapping bookings', async () => {
    const room = await Room.create({ roomNumber: 102, category: 'Classic', bedrooms: 1, pricePerNight: 3000 })

    await request(app)
      .post('/api/v1/bookings')
      .send({ guestName: 'Ada Lovelace', numberOfGuests: 1, checkIn: '2026-07-01', checkOut: '2026-07-04', roomId: room._id })
      .expect(201)

    await request(app)
      .post('/api/v1/bookings')
      .send({ guestName: 'Grace Hopper', numberOfGuests: 1, checkIn: '2026-07-03', checkOut: '2026-07-05', roomId: room._id })
      .expect(409)
  })

  test('rejects manually unavailable rooms', async () => {
    const room = await Room.create({ roomNumber: 201, category: 'De Luxe', bedrooms: 2, pricePerNight: 4600, isAvailable: false })

    await request(app)
      .get('/api/v1/rooms/vacant')
      .query({ checkIn: '2026-07-01', checkOut: '2026-07-03' })
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toHaveLength(0)
      })

    await request(app)
      .post('/api/v1/bookings')
      .send({ guestName: 'Alan Turing', numberOfGuests: 2, checkIn: '2026-07-01', checkOut: '2026-07-03', roomId: room._id })
      .expect(404)
  })
})

describe('authentication', () => {
  test('login succeeds with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ staffId: 'frontdesk', password: 'staff12345' })
      .expect(200)

    expect(response.body.data.token).toBeTruthy()
    expect(response.body.data.user.role).toBe('admin')
  })

  test('login fails with invalid credentials', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ staffId: 'frontdesk', password: 'wrong' })
      .expect(401)
  })

  test('protected routes are blocked without a token', async () => {
    const room = await Room.create({ roomNumber: 301, category: 'Suite', bedrooms: 2, pricePerNight: 7200 })

    await request(app)
      .patch(`/api/v1/rooms/${room._id}/availability`)
      .send({ isAvailable: false })
      .expect(401)
  })

  test('protected routes are accessible with a token', async () => {
    const room = await Room.create({ roomNumber: 302, category: 'Suite', bedrooms: 2, pricePerNight: 7200 })

    const response = await request(app)
      .patch(`/api/v1/rooms/${room._id}/availability`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isAvailable: false })
      .expect(200)

    expect(response.body.data.isAvailable).toBe(false)
  })
})
