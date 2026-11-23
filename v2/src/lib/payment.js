import { paymentApi } from '../api/services.js';
import { USE_MOCK } from '../api/http.js';

/**
 * Online payment hook. Flow:
 *   1. POST /orders            -> order (paymentStatus PENDING)
 *   2. POST /payments/create   -> gateway order details from YOUR backend
 *   3. open the gateway's checkout here (Razorpay / Cashfree / PayU / UPI link)
 *   4. POST /payments/verify   -> backend verifies the signature and marks the order PAID
 * Never collect or send raw card details from this app; the gateway's hosted checkout handles that.
 */
export async function payForOrder(order) {
  const intent = await paymentApi.create(order.id);
  let result;
  if (USE_MOCK) {
    result = { gatewayPaymentId: `mock_pay_${Date.now()}` };
  } else {
    // TODO: open your gateway checkout using `intent`, e.g. for Razorpay:
    //   await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    //   result = await new Promise((resolve, reject) => new window.Razorpay({
    //     key: intent.key, order_id: intent.gatewayOrderId, amount: intent.amount * 100, currency: 'INR',
    //     handler: (r) => resolve({ gatewayPaymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
    //     modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    //   }).open());
    throw new Error('Payment gateway is not connected yet. See src/lib/payment.js');
  }
  return paymentApi.verify({ orderId: order.id, ...result });
}
