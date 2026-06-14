import dotenv from 'dotenv'
import { app } from './app.js'
import { connectDb } from './config/db.js'

dotenv.config()

const port = process.env.PORT || 5000

async function bootstrap() {
  await connectDb(process.env.MONGODB_URI)

  app.listen(port, () => {
    console.log(`Esplenin Hotel API listening on port ${port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start API server')
  console.error(error)
  process.exit(1)
})
