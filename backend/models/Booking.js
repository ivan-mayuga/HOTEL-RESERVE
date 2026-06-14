import mongoose from 'mongoose'
import { roomCategories } from './Room.js'

export const bookingStatuses = ['Active', 'CheckedOut', 'Cancelled']
export const paymentMethods = ['Cash', 'Card', 'GCash']

const bookingSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^B\d{4}$/,
      uppercase: true,
      trim: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      match: /^[A-Za-z ]{2,}$/,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },
    roomRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomNumber: {
      type: Number,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
      enum: roomCategories,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0.01,
    },
    roomRate: {
      type: Number,
      required: true,
      min: 0,
    },
    amenityCodes: {
      type: [String],
      default: [],
    },
    amenitiesTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: [...paymentMethods, null],
      default: null,
    },
    amountReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: bookingStatuses,
      default: 'Active',
    },
  },
  { timestamps: true },
)

export const Booking = mongoose.model('Booking', bookingSchema)
