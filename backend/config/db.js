import mongoose from 'mongoose'

export async function connectDb(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is required. Copy backend/.env.example to backend/.env and set a MongoDB connection string.')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

export async function disconnectDb() {
  await mongoose.disconnect()
}
