function json(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed.' }, { status: 405 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return json(
      {
        message:
          'Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Netlify.',
      },
      { status: 503 }
    );
  }

  const payload = (await request.json()) as {
    amount?: number;
    currency?: string;
    customer?: { userId?: string };
  };

  const amount = Number(payload.amount) || 0;
  if (amount <= 0) {
    return json({ message: 'A valid amount is required.' }, { status: 400 });
  }

  const currency = payload.currency?.trim() || 'INR';
  const receipt = `shopzora-${payload.customer?.userId ?? 'guest'}-${Date.now()}`;
  const authToken = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes: {
        source: 'shopzora-netlify',
      },
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    return json(
      {
        message: (data.error as { description?: string } | undefined)?.description ??
          'Unable to create a Razorpay order.',
      },
      { status: response.status }
    );
  }

  return json({
    enabled: true,
    amount: data.amount,
    currency: data.currency,
    keyId,
    orderId: data.id,
  });
};
