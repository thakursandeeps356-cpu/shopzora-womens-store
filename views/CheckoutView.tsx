import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { createPaymentOrder, syncOrderToBackend } from '@/lib/checkoutApi';
import { useStorefront } from '@/context/StorefrontContext';
import { formatCurrency } from '@/lib/catalog';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { storefrontRuntime } from '@/lib/runtime';
import type { PaymentMethod } from '@/types';

export default function CheckoutView() {
  const { cart, clearCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const { placeOrder } = useOrders();
  const { openAuth, openCollection, openOrders } = useStorefront();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Your order was saved and is ready for the next step.'
  );
  const [customer, setCustomer] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  const shippingFee = useMemo(
    () => (cart.total >= 1999 || cart.items.length === 0 ? 0 : 149),
    [cart.items.length, cart.total]
  );
  const finalTotal = cart.total + shippingFee;
  const onlinePaymentsEnabled = storefrontRuntime.onlinePaymentsEnabled;

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setCustomer((current) => ({
      ...current,
      name: current.name || currentUser.name,
      email: current.email || currentUser.email,
    }));
  }, [currentUser]);

  if (orderPlaced) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white px-6 py-14 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9fbf6]">
              <BadgeCheck className="h-8 w-8 text-[#0f766e]" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-[#20131a]">
              Order placed successfully
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#6b5563]">
              {statusMessage}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={openOrders}
                className="rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
              >
                View orders
              </button>
              <button
                onClick={() => openCollection()}
                className="rounded-full border border-[#ebd4dc] px-6 py-3 text-sm font-semibold text-[#5f4a55] transition hover:border-[#ff3f6c] hover:text-[#ff3f6c]"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white px-6 py-14 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <h1 className="text-3xl font-semibold text-[#20131a]">
              Your checkout is empty
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#6b5563]">
              Add a few products to the bag first, then come back to continue the checkout flow.
            </p>
            <button
              onClick={() => openCollection()}
              className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
            >
              Browse products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[32px] bg-gradient-to-r from-[#20131a] via-[#462738] to-[#a33a62] px-6 py-10 text-white shadow-[0_24px_80px_rgba(32,19,26,0.22)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
            Checkout
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Finish your order flow
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
            This checkout now includes a backend-ready payment foundation for Netlify Functions and Razorpay.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="mb-6 rounded-[24px] border border-[#f5ccd8] bg-white px-5 py-4 text-sm text-[#6b5563] shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            Sign in before placing the order so it can appear in order history.
            <button
              onClick={openAuth}
              className="ml-3 font-semibold text-[#ff3f6c]"
            >
              Open login
            </button>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-semibold text-[#20131a]">
                Delivery details
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { key: 'name', label: 'Full name', type: 'text' },
                  { key: 'email', label: 'Email address', type: 'email' },
                  { key: 'phone', label: 'Phone number', type: 'tel' },
                  { key: 'city', label: 'City', type: 'text' },
                  { key: 'pincode', label: 'Pincode', type: 'text' },
                ].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      value={customer[field.key as keyof typeof customer]}
                      onChange={(event) =>
                        setCustomer((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm text-[#20131a] outline-none transition focus:border-[#ff3f6c]"
                    />
                  </label>
                ))}
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                    Address
                  </span>
                  <textarea
                    value={customer.address}
                    onChange={(event) =>
                      setCustomer((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm text-[#20131a] outline-none transition focus:border-[#ff3f6c]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-semibold text-[#20131a]">
                Payment method
              </h2>
              {!onlinePaymentsEnabled ? (
                <div className="mt-4 rounded-2xl border border-[#f2d6a0] bg-[#fff7e8] px-4 py-3 text-sm text-[#875d11]">
                  UPI and card checkout have been wired for Razorpay, but this live deployment still needs Netlify environment variables before online payments can work.
                </div>
              ) : null}
              {error ? (
                <div className="mt-4 rounded-2xl border border-[#f7cad8] bg-[#fff3f6] px-4 py-3 text-sm text-[#a33a62]">
                  {error}
                </div>
              ) : null}
              <div className="mt-5 space-y-3">
                {[
                  {
                    id: 'cod',
                    title: 'Cash on delivery',
                    description: 'Great for a frontend demo flow before gateway integration.',
                  },
                  {
                    id: 'upi',
                    title: 'UPI',
                    description: 'Ready placeholder for future Razorpay or native UPI checkout.',
                  },
                  {
                    id: 'card',
                    title: 'Card payment',
                    description: 'Perfect hook point for Stripe or Razorpay cards later.',
                  },
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-[22px] border px-4 py-4 transition ${
                      paymentMethod === option.id
                        ? 'border-[#ff3f6c] bg-[#fff1f4]'
                        : 'border-[#ebd4dc] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === option.id}
                      onChange={() => setPaymentMethod(option.id as PaymentMethod)}
                      className="mt-1 h-4 w-4 accent-[#ff3f6c]"
                    />
                    <div>
                      <p className="font-semibold text-[#20131a]">
                        {option.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6b5563]">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-semibold text-[#20131a]">
                Order summary
              </h2>
              <div className="mt-6 space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 rounded-[22px] bg-[#fff7f9] p-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-20 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#20131a]">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-[#8f7281]">
                        {item.product.brand} | Size {item.size}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-sm text-[#4f3a45]">
                        <span>Qty {item.quantity}</span>
                        <span className="font-semibold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-[#f1d9e1] pt-5 text-sm text-[#5f4a55]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#0f766e]">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#f1d9e1] pt-4 text-base font-semibold text-[#20131a]">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!currentUser) {
                    setError('Please sign in before placing the order.');
                    openAuth();
                    return;
                  }
                  if (!customer.phone || !customer.address || !customer.city || !customer.pincode) {
                    setError('Please complete the delivery details.');
                    return;
                  }

                  setIsSubmitting(true);
                  setError('');

                  try {
                    let paymentResult:
                      | {
                          paymentId?: string;
                          razorpayOrderId?: string;
                          signature?: string;
                        }
                      | undefined;

                    if (paymentMethod !== 'cod') {
                      const paymentOrder = await createPaymentOrder({
                        amount: finalTotal,
                        currency: 'INR',
                        customer: {
                          ...customer,
                          userId: currentUser.id,
                        },
                      });

                      if (!paymentOrder.enabled || !paymentOrder.orderId || !paymentOrder.keyId) {
                        setError(
                          paymentOrder.message ??
                            'Online payments are not available on this deployment yet.'
                        );
                        return;
                      }

                      const checkoutResult = await openRazorpayCheckout({
                        amount: paymentOrder.amount ?? Math.round(finalTotal * 100),
                        currency: paymentOrder.currency ?? 'INR',
                        customer,
                        keyId: paymentOrder.keyId,
                        orderId: paymentOrder.orderId,
                      });

                      if (!checkoutResult.ok) {
                        setError(
                          checkoutResult.message ?? 'Payment was not completed successfully.'
                        );
                        return;
                      }

                      paymentResult = {
                        paymentId: checkoutResult.paymentId,
                        razorpayOrderId: checkoutResult.razorpayOrderId,
                        signature: checkoutResult.signature,
                      };
                    }

                    const createdOrder = await placeOrder({
                      cart,
                      shipping: customer,
                      paymentMethod,
                      user: currentUser,
                    });

                    const syncResult = await syncOrderToBackend({
                      cart,
                      customer,
                      order: createdOrder,
                      paymentMethod,
                      user: currentUser,
                      paymentResult,
                    });

                    clearCart();
                    setStatusMessage(
                      syncResult.ok
                        ? syncResult.message ?? 'Order saved and synced successfully.'
                        : syncResult.message ??
                            'Order saved on this device. Backend sync is still pending.'
                    );
                    setOrderPlaced(true);
                  } catch (checkoutError) {
                    setError(
                      checkoutError instanceof Error
                        ? checkoutError.message
                        : 'Something went wrong while placing the order.'
                    );
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff3f6c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e33863]"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isSubmitting ? 'Processing order...' : 'Place order'}</span>
              </button>
            </div>

            <div className="rounded-[28px] border border-[#ebd4dc] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-3 text-sm text-[#4f3a45]">
                <Truck className="h-4 w-4 text-[#ff3f6c]" />
                Free shipping unlocks automatically above Rs. 1,999
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-[#4f3a45]">
                <ShieldCheck className="h-4 w-4 text-[#ff3f6c]" />
                Ready for secure gateway integration when you want to go live
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
