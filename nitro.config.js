export default defineNitroConfig({
  runtimeConfig: {
    mongoUri: process.env.MONGODB_URI,
    btcpaySecret: process.env.BTCPAY_SECRET
  },
});
