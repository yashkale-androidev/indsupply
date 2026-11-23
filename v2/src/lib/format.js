export const cn = (...c) => c.filter(Boolean).join(' ');
export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n ?? 0);
export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fmtDay = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

export const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export const ORDER_STATUS = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};
export const PAYMENT_STATUS = { PENDING: 'Pending', PAID: 'Paid', FAILED: 'Failed', REFUNDED: 'Refunded' };
export const PAYMENT_METHODS = [
  { id: 'UPI_ONLINE', label: 'UPI / Online payment', hint: 'Pay securely with UPI, GPay, PhonePe or Paytm' },
  { id: 'NETBANKING_CARD', label: 'Net banking / Card / Wallet', hint: 'Visa, Mastercard, RuPay and net banking' },
  { id: 'COD', label: 'Cash / UPI on delivery', hint: 'Pay when your order arrives' },
];
