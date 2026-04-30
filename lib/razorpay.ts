declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface OpenRazorpayCheckoutInput {
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  keyId: string;
  orderId: string;
}

interface RazorpayCheckoutResult {
  ok: boolean;
  message?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  signature?: string;
}

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export async function openRazorpayCheckout(
  input: OpenRazorpayCheckoutInput
): Promise<RazorpayCheckoutResult> {
  const isReady = await loadRazorpayScript();
  const Razorpay = window.Razorpay;

  if (!isReady || !Razorpay) {
    return {
      ok: false,
      message: 'Razorpay checkout failed to load in the browser.',
    };
  }

  return new Promise<RazorpayCheckoutResult>((resolve) => {
    let settled = false;

    const finish = (result: RazorpayCheckoutResult) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const razorpay = new Razorpay({
      key: input.keyId,
      amount: input.amount,
      currency: input.currency,
      order_id: input.orderId,
      name: 'Shopzora',
      description: 'Shopzora checkout payment',
      prefill: {
        name: input.customer.name,
        email: input.customer.email,
        contact: input.customer.phone,
      },
      theme: {
        color: '#ff3f6c',
      },
      handler: (response: Record<string, string>) => {
        finish({
          ok: true,
          paymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () =>
          finish({
            ok: false,
            message: 'Payment window was closed before the payment finished.',
          }),
      },
    });

    razorpay.open();
  });
}
