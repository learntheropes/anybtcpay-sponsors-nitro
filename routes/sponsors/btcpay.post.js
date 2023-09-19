import { createHmac } from 'crypto';

export default defineEventHandler(async (event) => {

  const { btcpaySecret } = useRuntimeConfig(event);

  const signature = getRequestHeader(event, 'btcpay-sig');

  if (!signature) {
    setResponseStatus(event, 403);
    return 'BTCPay-Sig header is missing!'
  };

  const rawBody = await readRawBody(event, 'utf8');

  const expectedSignature = 'sha256=' + createHmac('sha256', btcpaySecret).update(rawBody).digest('hex');

  if (signature !== expectedSignature) {
    setResponseStatus(event, 403);
    return 'Request signatures didn\'t match!'
  };

  const {
    payment: {
      value
    },
    metadata: {
      email
    }
  } = await readBody(event);

  const { q, client } = getFauna();

  await client.query(
    q.Create(
      q.Collection('sponsors'),
      {
        data: {
          donated_at: new Date().toISOString(),
          donated_amount: value,
          email: email,
        }
      }
    )
  );

  return;
});