import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { buildApiUrl, readJson } from '@/lib/api';
import { storefrontRuntime } from '@/lib/runtime';
import type { CartState, Order, PaymentMethod, ShippingDetails, UserProfile } from '@/types';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (input: {
    cart: CartState;
    shipping: ShippingDetails;
    paymentMethod: PaymentMethod;
    user: UserProfile;
  }) => Promise<Order>;
  getOrdersForUser: (userId: string) => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  cancelOrder: (orderId: string, userId: string) => Promise<{ ok: boolean; message?: string }>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDER_STORAGE_KEY = 'shopzora_orders_v1';

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrateOrders = async () => {
      if (storefrontRuntime.backendEnabled) {
        try {
          const response = await fetch(buildApiUrl('/orders'));
          const payload = await readJson<{ orders?: Order[] }>(response);
          setOrders(payload?.orders ?? []);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Failed to restore backend orders', error);
        }
      }

      const savedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders) as Order[];
          if (Array.isArray(parsedOrders)) {
            setOrders(parsedOrders);
          }
        } catch (error) {
          console.error('Failed to restore orders', error);
        }
      }
      setIsLoading(false);
    };

    void hydrateOrders();
  }, []);

  useEffect(() => {
    if (!isLoading && !storefrontRuntime.backendEnabled) {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    }
  }, [isLoading, orders]);

  const value = useMemo<OrderContextType>(
    () => ({
      orders,
      isLoading,
      placeOrder: async ({ cart, shipping, paymentMethod, user }) => {
        const shippingFee = cart.total >= 1999 ? 0 : 149;
        const nextOrder: Order = {
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

        if (storefrontRuntime.backendEnabled) {
          const response = await fetch(buildApiUrl('/orders'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart, shipping, paymentMethod, user }),
          });
          const payload = await readJson<{ order?: Order; orders?: Order[] }>(response);
          if (payload?.orders) {
            setOrders(payload.orders);
          }
          return payload?.order ?? nextOrder;
        }

        setOrders((current) => [nextOrder, ...current]);
        return nextOrder;
      },
      getOrdersForUser: (userId) => orders.filter((order) => order.userId === userId),
      updateOrderStatus: async (orderId, status) => {
        if (storefrontRuntime.backendEnabled) {
          const response = await fetch(buildApiUrl(`/orders/${orderId}/status`), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });
          const payload = await readJson<{ orders?: Order[] }>(response);
          if (payload?.orders) {
            setOrders(payload.orders);
          }
          return;
        }

        setOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  cancelledAt: status === 'cancelled' ? new Date().toISOString() : undefined,
                }
              : order
          )
        );
      },
      cancelOrder: async (orderId, userId) => {
        if (storefrontRuntime.backendEnabled) {
          const response = await fetch(buildApiUrl(`/orders/${orderId}/cancel`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });
          const payload = await readJson<{ orders?: Order[]; message?: string }>(response);
          if (!response.ok) {
            return {
              ok: false,
              message: payload?.message ?? 'Unable to cancel this order.',
            };
          }
          if (payload?.orders) {
            setOrders(payload.orders);
          }
          return { ok: true, message: payload?.message ?? 'Order cancelled successfully.' };
        }

        const targetOrder = orders.find((order) => order.id === orderId && order.userId === userId);
        if (!targetOrder) {
          return { ok: false, message: 'Order could not be found for this account.' };
        }
        if (!['confirmed', 'packed'].includes(targetOrder.status)) {
          return {
            ok: false,
            message: 'Only confirmed or packed orders can be cancelled right now.',
          };
        }

        setOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: 'cancelled',
                  cancelledAt: new Date().toISOString(),
                }
              : order
          )
        );
        return { ok: true, message: 'Order cancelled successfully.' };
      },
    }),
    [isLoading, orders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
