import mongoose from 'mongoose'

export async function runWithTransaction(work) {
  const session = await mongoose.startSession()

  try {
    let result
    await session.withTransaction(async () => {
      result = await work(session)
    })
    return result
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      console.warn('MongoDB transactions unavailable; falling back to sequential writes.')
      return work(null)
    }
    throw error
  } finally {
    await session.endSession()
  }
}

function isTransactionUnsupported(error) {
  const message = String(error?.message || '')
  return message.includes('Transaction numbers are only allowed') || message.includes('replica set member or mongos')
}
