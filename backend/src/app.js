import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import amenityRoutes from './routes/amenityRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js'
import roomRoutes from './routes/roomRoutes.js'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'esplenin-hotel-api',
      status: 'ok',
    },
  })
})

app.use('/api/v1/rooms', roomRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/amenities', amenityRoutes)
app.use('/api/v1/receipts', receiptRoutes)

app.use(notFoundHandler)
app.use(errorHandler)
