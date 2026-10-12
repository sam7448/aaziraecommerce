import Razorpay from 'razorpay';
import { config } from './env';

export const razorpayClient = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});
