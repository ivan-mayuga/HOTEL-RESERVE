import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import morgan from 'morgan'
import amenityRoutes from './routes/amenityRoutes.js'
import authRoutes from './routes/authRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiRateLimiter } from './middleware/rateLimiters.js'

dotenv.config()

export const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
// Security-sensitive: strips MongoDB operator keys such as $ne/$where from client input.
app.use(mongoSanitize())
app.use('/api/v1', apiRateLimiter)

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'esplenin-hotel-api',
      status: 'ok',
    },
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/rooms', roomRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/amenities', amenityRoutes)
app.use('/api/v1/receipts', receiptRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

app.use(errorHandler)
