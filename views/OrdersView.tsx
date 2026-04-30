import { PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useStorefront } from '@/context/StorefrontContext';
import { formatCurrency } from '@/lib/catalog';
import type { Order, OrderItem } from '@/types';
import { useState } from 'react';

function statusLabel(status: string) {
  switch (status) {
    case 'confirmed':
      return 'Order confirmed';
    case 'packed':
      return 'Packed';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function canCancel(status: Order['status']) {
  return status === 'confirmed' || status === 'packed';
}

export default function OrdersView() {
  const { currentUser, isAuthenticated } = useAuth();
  const { cancelOrder, getOrdersForUser } = useOrders();
  const { openAuth, openCollection } = useStorefront();
  const [actionMessage, setActionMessage] = useState('');

  if (!isAuthenticated || !currentUser) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white px-6 py-14 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <h1 className="text-3xl font-semibold text-[#20131a]">
              Sign in to view your orders
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#6b5563]">
              Your order history is tied to the signed-in customer profile on this device.
            </p>
            <button
              onClick={openAuth}
              className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
            >
              Open login
            </button>
          </div>
        </div>
      </section>
    );
  }

  const orders = getOrdersForUser(currentUser.id);

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-r from-[#20131a] via-[#462738] to-[#a33a62] px-6 py-10 text-white shadow-[0_24px_80px_rgba(32,19,26,0.22)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
            Order history
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Everything you have placed from this account
          </h1>
        </div>

        <div className="mt-8">
          {actionMessage ? (
            <div className="mb-5 rounded-2xl border border-[#f5ccd8] bg-white px-4 py-3 text-sm text-[#6b5563] shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
              {actionMessage}
            </div>
          ) : null}
          {orders.length > 0 ? (
            <div className="space-y-5">
              {orders.map((order: Order) => (
                <article
                  key={order.id}
                  className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                        {order.id}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-[#20131a]">
                        {statusLabel(order.status)}
                      </h2>
                      <p className="mt-2 text-sm text-[#6b5563]">
                        Placed on {new Date(order.placedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-full bg-[#fff2f5] px-4 py-2 text-sm font-semibold text-[#a33a62]">
                      {formatCurrency(order.total)}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[22px] bg-[#fff7f9] p-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-[#20131a]">
                        <PackageCheck className="h-4 w-4 text-[#ff3f6c]" />
                        Items
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-[#5f4a55]">
                        {order.items.map((item: OrderItem) => (
                          <p key={`${order.id}-${item.productId}-${item.size}`}>
                            {item.product.name} x {item.quantity} ({item.size})
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[22px] bg-[#fff7f9] p-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-[#20131a]">
                        <Truck className="h-4 w-4 text-[#ff3f6c]" />
                        Delivery
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-[#5f4a55]">
                        <p>{order.shipping.name}</p>
                        <p>{order.shipping.address}</p>
                        <p>
                          {order.shipping.city} - {order.shipping.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[22px] bg-[#fff7f9] p-4">
                      <div className="flex items-center gap-3 text-sm font-semibold text-[#20131a]">
                        <ShieldCheck className="h-4 w-4 text-[#ff3f6c]" />
                        Payment
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-[#5f4a55]">
                        <p className="capitalize">{order.paymentMethod}</p>
                        <p>Total: {formatCurrency(order.total)}</p>
                        <p>Status: {statusLabel(order.status)}</p>
                        {order.cancelledAt ? (
                          <p>
                            Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-IN')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {canCancel(order.status) ? (
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={async () => {
                          const result = await cancelOrder(order.id, currentUser.id);
                          setActionMessage(
                            result.message ??
                              (result.ok
                                ? 'Order cancelled successfully.'
                                : 'Unable to cancel this order.')
                          );
                        }}
                        className="rounded-full border border-[#f5ccd8] px-5 py-2.5 text-sm font-semibold text-[#a33a62] transition hover:bg-[#fff3f6]"
                      >
                        Cancel order
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <h2 className="text-2xl font-semibold text-[#20131a]">
                No orders yet
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#6b5563]">
                Once you place an order from checkout, it will appear here automatically.
              </p>
              <button
                onClick={() => openCollection()}
                className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
              >
                Explore products
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
