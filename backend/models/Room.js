import mongoose from 'mongoose'

export const roomCategories = ['Classic', 'De Luxe', 'Suite', 'Imperial Grand']

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1,
      max: 999,
      validate: Number.isInteger,
    },
    category: {
      type: String,
      required: true,
      enum: roomCategories,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0.01,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export const Room = mongoose.model('Room', roomSchema)
