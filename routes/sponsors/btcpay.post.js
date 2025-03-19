import { createHmac } from 'crypto'
import { MongoClient } from 'mongodb'

export default defineEventHandler(async (event) => {
  const { btcpaySecret, mongoUri } = useRuntimeConfig(event)

  const signature = getRequestHeader(event, 'btcpay-sig')
  if (!signature) {
    setResponseStatus(event, 403)
    return 'BTCPay-Sig header is missing!'
  }

  const rawBody = await readRawBody(event, 'utf8')
  const expectedSignature = 'sha256=' + createHmac('sha256', btcpaySecret)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    setResponseStatus(event, 403)
    return "Request signatures didn't match!"
  }

  const {
    payment: { value },
    metadata: { email }
  } = await readBody(event)

  let client
  try {
    client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    await client.connect()

    const db = client.db('anybtcpay-sponsors-nitro')
    const sponsorsCollection = db.collection('sponsors')

    await sponsorsCollection.insertOne({
      donated_at: new Date().toISOString(),
      donated_amount: value,
      email: email
    })
  } catch (error) {
    console.error('Error writing to MongoDB:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
    }
  }

  return
})
