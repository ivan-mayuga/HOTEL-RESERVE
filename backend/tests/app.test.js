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

function authed(requestBuilder) {
  return requestBuilder.set('Authorization', `Bearer ${token}`)
}

describe('booking logic', () => {
  test('allows non-overlapping bookings', async () => {
    const room = await Room.create({ roomNumber: 101, category: 'Classic', bedrooms: 1, pricePerNight: 2800 })

    await authed(request(app).post('/api/v1/bookings'))
      .send({ guestName: 'Ada Lovelace', numberOfGuests: 1, checkIn: '2026-07-01', checkOut: '2026-07-03', roomId: room._id })
      .expect(201)

    const response = await authed(request(app).post('/api/v1/bookings'))
      .send({ guestName: 'Grace Hopper', numberOfGuests: 1, checkIn: '2026-07-03', checkOut: '2026-07-05', roomId: room._id })
      .expect(201)

    expect(response.body.data.referenceNumber).toBe('B000002')
  })

  test('rejects overlapping bookings', async () => {
    const room = await Room.create({ roomNumber: 102, category: 'Classic', bedrooms: 1, pricePerNight: 3000 })

    await authed(request(app).post('/api/v1/bookings'))
      .send({ guestName: 'Ada Lovelace', numberOfGuests: 1, checkIn: '2026-07-01', checkOut: '2026-07-04', roomId: room._id })
      .expect(201)

    await authed(request(app).post('/api/v1/bookings'))
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

    await authed(request(app).post('/api/v1/bookings'))
      .send({ guestName: 'Alan Turing', numberOfGuests: 2, checkIn: '2026-07-01', checkOut: '2026-07-03', roomId: room._id })
      .expect(404)
  })

  test('requires authentication to create bookings', async () => {
    const room = await Room.create({ roomNumber: 202, category: 'De Luxe', bedrooms: 2, pricePerNight: 4600 })

    await request(app)
      .post('/api/v1/bookings')
      .send({ guestName: 'Katherine Johnson', numberOfGuests: 2, checkIn: '2026-07-01', checkOut: '2026-07-03', roomId: room._id })
      .expect(401)
  })

  test('generates unique sequential reference numbers for concurrent booking requests', async () => {
    const guestNames = ['Ada Alpha', 'Grace Beta', 'Mary Gamma', 'Katherine Delta', 'Dorothy Epsilon']
    const rooms = await Room.insertMany(
      Array.from({ length: 5 }, (_, index) => ({
        roomNumber: 410 + index,
        category: 'Classic',
        bedrooms: 1,
        pricePerNight: 2500,
      })),
    )

    const responses = await Promise.all(rooms.map((room, index) => (
      authed(request(app).post('/api/v1/bookings'))
        .send({
          guestName: guestNames[index],
          numberOfGuests: 1,
          checkIn: '2026-08-01',
          checkOut: '2026-08-03',
          roomId: room._id,
        })
        .expect(201)
    )))

    const references = responses.map((response) => response.body.data.referenceNumber).sort()
    expect(references).toEqual(['B000001', 'B000002', 'B000003', 'B000004', 'B000005'])
  })

  test('requires authentication and validates payment details before taking payment', async () => {
    const room = await Room.create({ roomNumber: 203, category: 'De Luxe', bedrooms: 2, pricePerNight: 4600 })
    const bookingResponse = await authed(request(app).post('/api/v1/bookings'))
      .send({ guestName: 'Mary Jackson', numberOfGuests: 2, checkIn: '2026-07-01', checkOut: '2026-07-03', roomId: room._id })
      .expect(201)

    const referenceNumber = bookingResponse.body.data.referenceNumber

    await request(app)
      .patch(`/api/v1/bookings/${referenceNumber}/pay`)
      .send({ paymentMethod: 'Cash', amountReceived: 9200 })
      .expect(401)

    await authed(request(app).patch(`/api/v1/bookings/${referenceNumber}/pay`))
      .send({ paymentMethod: 'Cash', amountReceived: 100 })
      .expect(400)

    const paymentResponse = await authed(request(app).patch(`/api/v1/bookings/${referenceNumber}/pay`))
      .send({ paymentMethod: 'Cash', amountReceived: 10000 })
      .expect(200)

    expect(paymentResponse.body.data.booking.isPaid).toBe(true)
    expect(paymentResponse.body.data.receipt.orNumber).toMatch(/^OR\d{6}$/)
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
