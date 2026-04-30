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

  const payload = (await request.json()) as {
    order?: { id?: string; total?: number };
  };

  if (!payload.order?.id) {
    return json({ message: 'Order id is required.' }, { status: 400 });
  }

  const webhookUrl = process.env.SHOPZORA_ORDER_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({
      forwarded: false,
      message:
        'Order received by the server layer, but no central webhook is configured yet.',
    });
  }

  const webhookResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!webhookResponse.ok) {
    return json(
      {
        forwarded: false,
        message: 'The central order webhook rejected the payload.',
      },
      { status: 502 }
    );
  }

  return json({
    forwarded: true,
    message: 'Order forwarded to the central backend webhook.',
  });
};
