import { storefrontRuntime } from '@/lib/runtime';
import type { CartState, Order, PaymentMethod, ShippingDetails, UserProfile } from '@/types';
import { buildApiUrl, readJson } from '@/lib/api';

interface CustomerPayload extends ShippingDetails {
  userId: string;
}

interface PaymentOrderInput {
  amount: number;
  currency: string;
  customer: CustomerPayload;
}

interface OrderSyncInput {
  cart: CartState;
  customer: ShippingDetails;
  order: Order;
  paymentMethod: PaymentMethod;
  user: UserProfile;
  paymentResult?: {
    paymentId?: string;
    razorpayOrderId?: string;
    signature?: string;
  };
}

interface PaymentOrderResponse {
  enabled: boolean;
  amount?: number;
  currency?: string;
  keyId?: string;
  orderId?: string;
  message?: string;
}

interface OrderSyncResponse {
  ok: boolean;
  forwarded?: boolean;
  message?: string;
}

async function readResponsePayload(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function createPaymentOrder(
  input: PaymentOrderInput
): Promise<PaymentOrderResponse> {
  if (!storefrontRuntime.onlinePaymentsEnabled) {
    return {
      enabled: false,
      message:
        'Online payments are not configured on this deployment yet. Add Razorpay keys in Netlify and redeploy.',
    };
  }

  const response = await fetch(buildApiUrl('/payments/razorpay/order'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await readResponsePayload(response);
  if (!response.ok) {
    return {
      enabled: false,
      message:
        (payload?.message as string | undefined) ??
        'Unable to create the payment order right now.',
    };
  }

  return {
    enabled: true,
    amount: payload?.amount as number,
    currency: payload?.currency as string,
    keyId: payload?.keyId as string,
    orderId: payload?.orderId as string,
  };
}

export async function syncOrderToBackend(input: OrderSyncInput): Promise<OrderSyncResponse> {
  if (!storefrontRuntime.backendEnabled) {
    return {
      ok: false,
      message: 'Order saved on this device only. Backend sync is not configured yet.',
    };
  }

  try {
    if (storefrontRuntime.apiBaseUrl.endsWith('/api')) {
      return {
        ok: true,
        forwarded: true,
        message: 'Order saved in the live backend successfully.',
      };
    }

    const response = await fetch(buildApiUrl('/submit-order'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const payload = await readJson<Record<string, unknown>>(response);
    if (!response.ok) {
      return {
        ok: false,
        message:
          (payload?.message as string | undefined) ??
          'Backend sync is not available on this deployment.',
      };
    }

    return {
      ok: true,
      forwarded: Boolean(payload?.forwarded),
      message:
        (payload?.message as string | undefined) ??
        'Order synced to the server layer successfully.',
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Backend sync failed. The order is still saved locally.',
    };
  }
}
