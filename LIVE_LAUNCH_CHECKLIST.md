# Shopzora Live Launch Checklist

## Security

- Change the seeded admin password from `admin123` on every active browser session.
- Keep `RAZORPAY_KEY_SECRET` secret-only in Netlify.
- Remove old test credentials before public launch announcements.

## Payments

- Replace Razorpay test keys with live keys.
- Place one low-value real payment and one refund test before marketing the site.
- Confirm success, failure, and dismissal flows on mobile and desktop.

## Operations

- Make sure the admin panel can see delivered, cancelled, and packed orders.
- Confirm cancellation policy wording on the storefront footer and support pages.
- Verify all important pages load after a Netlify redeploy.

## Data

- Move orders from localStorage into a real backend webhook or database.
- Store cancellations and refunds in the same backend flow as new orders.
- Keep a daily export or dashboard for finance reconciliation.
