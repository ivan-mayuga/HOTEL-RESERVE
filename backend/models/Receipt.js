import mongoose from 'mongoose'
import { paymentMethods } from './Booking.js'

const receiptSchema = new mongoose.Schema({
  orNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: /^RCPT-\d{4}$/,
    uppercase: true,
    trim: true,
  },
  bookingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  referenceNumber: {
    type: String,
    required: true,
  },
  guestName: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  roomRate: {
    type: Number,
    required: true,
  },
  amenitiesTotal: {
    type: Number,
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  amountReceived: {
    type: Number,
    required: true,
  },
  change: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: paymentMethods,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
})

export const Receipt = mongoose.model('Receipt', receiptSchema)
