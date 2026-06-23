import { Counter } from '../models/Counter.js'

const formats = {
  booking: { prefix: 'B', width: 6 },
  receipt: { prefix: 'OR', width: 6 },
}

export async function generate(counterName) {
  const format = formats[counterName]
  if (!format) throw new Error(`Unknown reference counter: ${counterName}`)

  // Security-sensitive/concurrency-sensitive: MongoDB applies $inc atomically per document.
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  )

  return `${format.prefix}${String(counter.seq).padStart(format.width, '0')}`
}
