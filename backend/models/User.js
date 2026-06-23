import mongoose from 'mongoose'

export const userRoles = ['staff', 'admin']

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    staffId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: userRoles,
      default: 'staff',
    },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
