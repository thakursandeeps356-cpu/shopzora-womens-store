# Shopzora Backend

## Start locally

```bash
npm install
npm run dev
```

## Environment variables

- `PORT=4000`
- `FRONTEND_URL=http://localhost:5173`
- `RAZORPAY_KEY_ID=rzp_test_...`
- `RAZORPAY_KEY_SECRET=...`

## Main API routes

- `GET /api/health`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/products/seed`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/change-password`
- `GET /api/users`
- `POST /api/users/seed`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `POST /api/orders/:id/cancel`
- `POST /api/payments/razorpay/order`
