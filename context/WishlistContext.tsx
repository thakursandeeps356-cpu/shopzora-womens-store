import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'shopzora_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        setWishlist(parsed);
      } catch (error) {
        console.error('Failed to restore wishlist', error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }
  }, [isInitialized, wishlist]);

  const value = useMemo<WishlistContextType>(
    () => ({
      wishlist,
      toggleWishlist: (productId: string) => {
        setWishlist((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId]
        );
      },
      isWishlisted: (productId: string) => wishlist.includes(productId),
      clearWishlist: () => setWishlist([]),
    }),
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }

  return context;
}
