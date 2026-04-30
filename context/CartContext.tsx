import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, CartState } from '@/types';

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shopzora_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    discount: 0,
    subtotal: 0,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const calculateTotals = useCallback((items: CartItem[]): CartState => {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const originalTotal = items.reduce((sum, item) => {
      return sum + item.product.originalPrice * item.quantity;
    }, 0);

    const discount = originalTotal - subtotal;
    const total = subtotal;

    return {
      items,
      total,
      discount,
      subtotal,
    };
  }, []);

  const addToCart = useCallback((product: Product, size: string) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.productId === product.id && item.size === size
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        newItems = [
          ...prevCart.items,
          {
            productId: product.id,
            quantity: 1,
            size,
            product,
          },
        ];
      }

      return calculateTotals(newItems);
    });
  }, [calculateTotals]);

  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => !(item.productId === productId && item.size === size)
      );
      return calculateTotals(newItems);
    });
  }, [calculateTotals]);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      );
      return calculateTotals(newItems);
    });
  }, [calculateTotals, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
      discount: 0,
      subtotal: 0,
    });
  }, []);

  const getCartCount = useCallback(() => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
