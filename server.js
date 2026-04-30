import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const storePath = path.join(dataDirectory, 'store.json');
const port = Number(process.env.PORT || 4000);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL?.trim() || true,
    credentials: false,
  })
);
app.use(express.json({ limit: '2mb' }));

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(
      storePath,
      JSON.stringify(
        {
          products: [],
          users: [],
          orders: [],
        },
        null,
        2
      )
    );
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, 'utf8');
  return JSON.parse(raw);
}

async function writeStore(store) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}

async function updateStore(transform) {
  const store = await readStore();
  const nextStore = await transform(store);
  await writeStore(nextStore);
  return nextStore;
}

function sendError(response, status, message) {
  response.status(status).json({ message });
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'shopzora-backend' });
});

app.get('/api/products', async (_request, response) => {
  const store = await readStore();
  response.json({ products: store.products });
});

app.post('/api/products/seed', async (request, response) => {
  const products = Array.isArray(request.body?.products) ? request.body.products : [];
  const store = await updateStore((current) => {
    if (current.products.length > 0 || products.length === 0) {
      return current;
    }
    return { ...current, products };
  });
  response.json({ products: store.products });
});

app.post('/api/products', async (request, response) => {
  const product = request.body?.product;
  if (!product?.id) {
    return sendError(response, 400, 'Product payload is missing a valid id.');
  }

  const store = await updateStore((current) => ({
    ...current,
    products: [product, ...current.products],
  }));
  response.status(201).json({ product, products: store.products });
});

app.put('/api/products/:productId', async (request, response) => {
  const product = request.body?.product;
  const { productId } = request.params;
  if (!product?.id) {
    return sendError(response, 400, 'Updated product payload is invalid.');
  }

  const store = await updateStore((current) => ({
    ...current,
    products: current.products.map((item) => (item.id === productId ? product : item)),
  }));
  response.json({ product, products: store.products });
});

app.delete('/api/products/:productId', async (request, response) => {
  const { productId } = request.params;
  const store = await updateStore((current) => ({
    ...current,
    products: current.products.filter((item) => item.id !== productId),
  }));
  response.json({ ok: true, products: store.products });
});

app.get('/api/users', async (_request, response) => {
  const store = await readStore();
  response.json({ users: store.users });
});

app.post('/api/users/seed', async (request, response) => {
  const users = Array.isArray(request.body?.users) ? request.body.users : [];
  const store = await updateStore((current) => {
    if (current.users.length > 0 || users.length === 0) {
      return current;
    }
    return { ...current, users };
  });
  response.json({ users: store.users });
});

app.post('/api/auth/register', async (request, response) => {
  const input = request.body ?? {};
  const email = String(input.email || '').trim().toLowerCase();
  const name = String(input.name || '').trim();
  const password = String(input.password || '');

  if (!name || !email || !password) {
    return sendError(response, 400, 'Please fill in all registration fields.');
  }

  const store = await readStore();
  if (store.users.some((user) => user.email.toLowerCase() === email)) {
    return sendError(response, 409, 'An account with this email already exists.');
  }

  const nextUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role: 'customer',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  };

  const nextStore = {
    ...store,
    users: [...store.users, nextUser],
  };
  await writeStore(nextStore);
  response.status(201).json({ user: nextUser, users: nextStore.users });
});

app.post('/api/auth/login', async (request, response) => {
  const identifier = String(request.body?.identifier || '').trim().toLowerCase();
  const password = String(request.body?.password || '');
  const store = await readStore();

  const matchedUser = store.users.find(
    (user) =>
      user.email.toLowerCase() === identifier || user.username?.toLowerCase() === identifier
  );

  if (!matchedUser || matchedUser.password !== password) {
    return sendError(response, 401, 'Invalid email/username or password.');
  }

  response.json({ user: matchedUser, users: store.users });
});

app.post('/api/auth/change-password', async (request, response) => {
  const userId = String(request.body?.userId || '');
  const currentPassword = String(request.body?.currentPassword || '');
  const newPassword = String(request.body?.newPassword || '');
  const confirmPassword = String(request.body?.confirmPassword || '');

  const store = await readStore();
  const targetUser = store.users.find((user) => user.id === userId);
  if (!targetUser) {
    return sendError(response, 404, 'User was not found.');
  }
  if (targetUser.password !== currentPassword) {
    return sendError(response, 400, 'Current password is incorrect.');
  }
  if (newPassword.length < 8) {
    return sendError(response, 400, 'New password must be at least 8 characters long.');
  }
  if (newPassword !== confirmPassword) {
    return sendError(response, 400, 'New password and confirm password do not match.');
  }

  const updatedUser = {
    ...targetUser,
    password: newPassword,
    mustChangePassword: false,
  };

  const nextStore = {
    ...store,
    users: store.users.map((user) => (user.id === userId ? updatedUser : user)),
  };
  await writeStore(nextStore);
  response.json({ user: updatedUser, users: nextStore.users });
});

app.get('/api/orders', async (request, response) => {
  const userId = request.query.userId ? String(request.query.userId) : '';
  const store = await readStore();
  const orders = userId ? store.orders.filter((order) => order.userId === userId) : store.orders;
  response.json({ orders });
});

app.post('/api/orders', async (request, response) => {
  const { cart, shipping, paymentMethod, user } = request.body ?? {};
  if (!cart?.items?.length || !user?.id) {
    return sendError(response, 400, 'Order payload is incomplete.');
  }

  const shippingFee = cart.total >= 1999 ? 0 : 149;
  const nextOrder = {
    id: `ORD-${Date.now().toString().slice(-8)}`,
    userId: user.id,
    items: cart.items.map((item) => ({ ...item })),
    subtotal: cart.subtotal,
    discount: cart.discount,
    shippingFee,
    total: cart.total + shippingFee,
    paymentMethod,
    status: 'confirmed',
    placedAt: new Date().toISOString(),
    shipping,
  };

  const store = await updateStore((current) => ({
    ...current,
    orders: [nextOrder, ...current.orders],
  }));
  response.status(201).json({ order: nextOrder, orders: store.orders });
});

app.post('/api/submit-order', async (_request, response) => {
  response.json({
    forwarded: true,
    message: 'Order already persisted through the backend orders API.',
  });
});

app.patch('/api/orders/:orderId/status', async (request, response) => {
  const { orderId } = request.params;
  const status = String(request.body?.status || '');
  if (!status) {
    return sendError(response, 400, 'Status is required.');
  }

  const store = await updateStore((current) => ({
    ...current,
    orders: current.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
            cancelledAt: status === 'cancelled' ? new Date().toISOString() : undefined,
          }
        : order
    ),
  }));
  response.json({ orders: store.orders });
});

app.post('/api/orders/:orderId/cancel', async (request, response) => {
  const { orderId } = request.params;
  const userId = String(request.body?.userId || '');
  const store = await readStore();
  const targetOrder = store.orders.find((order) => order.id === orderId && order.userId === userId);

  if (!targetOrder) {
    return sendError(response, 404, 'Order was not found for this account.');
  }
  if (!['confirmed', 'packed'].includes(targetOrder.status)) {
    return sendError(response, 400, 'Only confirmed or packed orders can be cancelled.');
  }

  const nextStore = {
    ...store,
    orders: store.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
          }
        : order
    ),
  };
  await writeStore(nextStore);
  response.json({ ok: true, orders: nextStore.orders, message: 'Order cancelled successfully.' });
});

app.post('/api/payments/razorpay/order', async (request, response) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return sendError(response, 503, 'Razorpay keys are missing on the backend.');
  }

  const amount = Number(request.body?.amount) || 0;
  const currency = String(request.body?.currency || 'INR');
  const customer = request.body?.customer ?? {};

  if (amount <= 0) {
    return sendError(response, 400, 'A valid amount is required.');
  }

  const authToken = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency,
      receipt: `shopzora-${customer.userId ?? 'guest'}-${Date.now()}`,
      notes: {
        source: 'shopzora-backend',
      },
    }),
  });

  const data = await razorpayResponse.json();
  if (!razorpayResponse.ok) {
    return sendError(
      response,
      razorpayResponse.status,
      data?.error?.description || 'Unable to create Razorpay order.'
    );
  }

  response.json({
    enabled: true,
    amount: data.amount,
    currency: data.currency,
    keyId,
    orderId: data.id,
  });
});

app.listen(port, () => {
  console.log(`Shopzora backend running on http://localhost:${port}`);
});
