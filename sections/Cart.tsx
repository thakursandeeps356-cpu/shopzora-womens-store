import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { formatCurrency } from '@/lib/catalog';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    clearCart,
  } = useCart();
  const { openCheckout } = useStorefront();

  if (!isCartOpen) return null;

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full transform flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[420px]">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-800">
              Shopping Bag ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Your bag is empty
            </h3>
            <p className="mb-6 text-center text-gray-500">
              Looks like you haven&apos;t added anything to your bag yet.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg bg-[#ff3f6c] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#e63961]"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {cart.items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="animate-in slide-in-from-right-4 flex gap-4 rounded-lg bg-gray-50 p-3 duration-300"
                >
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-white">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-gray-800">
                      {item.product.brand}
                    </h4>
                    <p className="mb-1 truncate text-xs text-gray-600">
                      {item.product.name}
                    </p>
                    <p className="mb-2 text-xs text-gray-500">
                      Size: {item.size}
                    </p>

                    <div className="mb-2 flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(item.product.price)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(item.product.originalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white transition-colors hover:border-[#ff3f6c]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white transition-colors hover:border-[#ff3f6c]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="p-1.5 text-gray-400 transition-colors hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-gray-200 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#03a685]">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.discount)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  openCheckout();
                }}
                className="w-full rounded-lg bg-[#ff3f6c] py-3.5 font-semibold text-white transition-all duration-300 hover:bg-[#e63961] hover:shadow-lg"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-500 transition-colors hover:text-red-500"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
