const paymentProvider = import.meta.env.VITE_PAYMENT_PROVIDER ?? 'demo';
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : '');
const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() ?? '';

export const storefrontRuntime = {
  apiBaseUrl,
  paymentProvider,
  razorpayKeyId,
  backendEnabled: Boolean(apiBaseUrl),
  onlinePaymentsEnabled: paymentProvider === 'razorpay' && Boolean(razorpayKeyId),
};
