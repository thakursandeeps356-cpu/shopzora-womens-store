# Shopzora Order Backend Roadmap

## Current state

- Orders are created in the browser and saved in localStorage.
- Netlify Functions can create Razorpay orders and forward placed orders.
- Customer-side cancellation is now supported in the UI for confirmed and packed orders.

## Best next backend

Use a small Node or Supabase backend with these endpoints:

- `POST /orders`
- `PATCH /orders/:id/status`
- `GET /orders?userId=...`
- `POST /payments/verify`

## Recommended data model

- `orders`
- `order_items`
- `payments`
- `users`
- `admin_audit_logs`

## Production rules

- Persist order placement, cancellation, and shipment state outside the browser.
- Verify Razorpay signatures on the server before marking paid orders.
- Sync refunds and cancellation approvals back into the admin dashboard.

## Integration path

1. Point `SHOPZORA_ORDER_WEBHOOK_URL` to your backend `POST /orders`.
2. Add a second webhook/function for cancellation updates.
3. Replace `getOrdersForUser()` localStorage reads with backend fetches.
4. Replace admin status updates with authenticated API mutations.
