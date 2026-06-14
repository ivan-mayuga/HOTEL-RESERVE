import mongoose from 'mongoose'

export const amenityCategories = ['Convenience', 'Pool', 'Spa']
export const amenityTypes = ['PerNight', 'PerGuest', 'PerBooking']

const amenitySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true,
    maxlength: 4,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60,
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
  },
  type: {
    type: String,
    required: true,
    enum: amenityTypes,
  },
  category: {
    type: String,
    required: true,
    enum: amenityCategories,
  },
})

export const Amenity = mongoose.model('Amenity', amenitySchema)
