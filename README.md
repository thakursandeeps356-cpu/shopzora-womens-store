# Shopzora Frontend

Frontend app for the Shopzora storefront and admin dashboard.

## Start locally

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` and point the frontend at your backend:

```text
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PAYMENT_PROVIDER=razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_your_public_key
```

## Deploy recommendation

- Deploy this folder to Netlify
- Set the backend URL in `VITE_API_BASE_URL`
- Keep the Razorpay secret only on the backend
