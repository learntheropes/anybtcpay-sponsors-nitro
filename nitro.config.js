export default defineNitroConfig({
  runtimeConfig: {
    faunaSecret: process.env.FAUNA_SECRET,
    btcpaySecret: process.env.BTCPAY_SECRET
  },
});
