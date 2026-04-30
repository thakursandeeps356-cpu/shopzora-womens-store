import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  CollectionFilters,
  StoreRoute,
} from '@/types';
import { normalizeFilters } from '@/lib/catalog';

interface StorefrontContextType {
  route: StoreRoute;
  searchQuery: string;
  collectionFilters: CollectionFilters;
  setSearchQuery: (value: string) => void;
  openHome: () => void;
  openCollection: (filters?: CollectionFilters) => void;
  updateCollectionFilters: (filters: CollectionFilters) => void;
  openProduct: (productId: string) => void;
  openCheckout: () => void;
  openWishlist: () => void;
  openAuth: () => void;
  openOrders: () => void;
  openAdmin: () => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

function parseHash(hash: string): StoreRoute {
  const normalizedHash = hash.replace(/^#/, '') || '/';
  const [pathname, queryString] = normalizedHash.split('?');
  const searchParams = new URLSearchParams(queryString ?? '');

  if (pathname.startsWith('/product/')) {
    const productId = pathname.replace('/product/', '').trim();
    return productId ? { page: 'product', productId } : { page: 'home' };
  }

  if (pathname === '/checkout') {
    return { page: 'checkout' };
  }

  if (pathname === '/wishlist') {
    return { page: 'wishlist' };
  }

  if (pathname === '/auth') {
    return { page: 'auth' };
  }

  if (pathname === '/orders') {
    return { page: 'orders' };
  }

  if (pathname === '/admin') {
    return { page: 'admin' };
  }

  if (pathname === '/shop') {
    return {
      page: 'collection',
      filters: normalizeFilters({
        category: searchParams.get('category') ?? undefined,
        brand: searchParams.get('brand') ?? undefined,
        search: searchParams.get('search') ?? undefined,
        sort: (searchParams.get('sort') ?? undefined) as CollectionFilters['sort'],
      }),
    };
  }

  return { page: 'home' };
}

function toHash(route: StoreRoute) {
  switch (route.page) {
    case 'collection': {
      const params = new URLSearchParams();
      const filters = normalizeFilters(route.filters);

      if (filters.category) {
        params.set('category', filters.category);
      }
      if (filters.brand) {
        params.set('brand', filters.brand);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.sort && filters.sort !== 'featured') {
        params.set('sort', filters.sort);
      }

      const queryString = params.toString();
      return queryString ? `/shop?${queryString}` : '/shop';
    }
    case 'product':
      return `/product/${route.productId}`;
    case 'checkout':
      return '/checkout';
    case 'wishlist':
      return '/wishlist';
    case 'auth':
      return '/auth';
    case 'orders':
      return '/orders';
    case 'admin':
      return '/admin';
    case 'home':
    default:
      return '/';
  }
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<StoreRoute>(() => parseHash(window.location.hash));
  const [searchQuery, setSearchQuery] = useState(
    route.page === 'collection' ? route.filters.search ?? '' : ''
  );
  const [collectionFilters, setCollectionFilters] = useState<CollectionFilters>(
    route.page === 'collection' ? normalizeFilters(route.filters) : normalizeFilters()
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (route.page === 'collection') {
      const normalized = normalizeFilters(route.filters);
      setCollectionFilters(normalized);
      setSearchQuery(normalized.search ?? '');
    }
  }, [route]);

  const navigate = useCallback((nextRoute: StoreRoute) => {
    const nextHash = toHash(nextRoute);
    const currentHash = window.location.hash.replace(/^#/, '') || '/';

    if (currentHash === nextHash) {
      setRoute(nextRoute);
      return;
    }

    window.location.hash = nextHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const value = useMemo<StorefrontContextType>(
    () => ({
      route,
      searchQuery,
      collectionFilters,
      setSearchQuery,
      openHome: () => {
        setSearchQuery('');
        navigate({ page: 'home' });
      },
      openCollection: (filters = {}) => {
        const normalized = normalizeFilters(filters);
        setSearchQuery(normalized.search ?? '');
        setCollectionFilters(normalized);
        navigate({ page: 'collection', filters: normalized });
      },
      updateCollectionFilters: (filters) => {
        const nextFilters = normalizeFilters({
          ...collectionFilters,
          ...filters,
        });
        setCollectionFilters(nextFilters);
        setSearchQuery(nextFilters.search ?? '');
        navigate({ page: 'collection', filters: nextFilters });
      },
      openProduct: (productId: string) => navigate({ page: 'product', productId }),
      openCheckout: () => navigate({ page: 'checkout' }),
      openWishlist: () => navigate({ page: 'wishlist' }),
      openAuth: () => navigate({ page: 'auth' }),
      openOrders: () => navigate({ page: 'orders' }),
      openAdmin: () => navigate({ page: 'admin' }),
    }),
    [collectionFilters, navigate, route, searchQuery]
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('useStorefront must be used within StorefrontProvider');
  }

  return context;
}
