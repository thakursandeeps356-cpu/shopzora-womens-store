# Shopzora Netlify Backend Setup

This project now includes a Netlify-friendly backend starter for payments and order syncing.

## What is included

- `netlify/functions/create-razorpay-order.ts`
- `netlify/functions/submit-order.ts`
- frontend runtime config in `src/lib/runtime.ts`
- payment helpers in `src/lib/checkoutApi.ts` and `src/lib/razorpay.ts`

## Netlify environment variables

Add these in the Netlify UI for your project and redeploy:

- `VITE_API_BASE_URL=/.netlify/functions`
- `VITE_PAYMENT_PROVIDER=razorpay`
- `VITE_RAZORPAY_KEY_ID=rzp_test_your_public_key`
- `RAZORPAY_KEY_ID=rzp_test_your_public_key`
- `RAZORPAY_KEY_SECRET=your_private_secret`
- `SHOPZORA_ORDER_WEBHOOK_URL=https://your-backend.example.com/api/orders`

## Notes

- `VITE_*` variables are exposed to the browser.
- `RAZORPAY_KEY_SECRET` must stay server-side only.
- `submit-order` can forward orders to any backend you choose later:
  Firebase Function, Supabase Edge Function, Node API, Google Sheets webhook, etc.

## Recommended next production step

1. Connect the Netlify site to a Git repo instead of drag-and-drop deploys.
2. Add the environment variables in the Netlify dashboard.
3. Redeploy from Netlify so the Functions folder is included.
4. Test COD first, then enable Razorpay test keys.
