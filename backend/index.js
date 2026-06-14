import dotenv from 'dotenv'
import { app } from './app.js'
import { connectDb } from './config/db.js'

dotenv.config({ path: new URL('../.env', import.meta.url).pathname })

const port = process.env.PORT || 5000

async function bootstrap() {
  await connectDb()

  app.listen(port, () => {
    console.log(`Esplenin Hotel API listening on port ${port}`)
  })
}

bootstrap().catch((error) => {
  console.error(error.message)
  process.exit(1)
})