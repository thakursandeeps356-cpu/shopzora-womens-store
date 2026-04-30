import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { initialProducts } from '@/data';
import { buildApiUrl, readJson } from '@/lib/api';
import { storefrontRuntime } from '@/lib/runtime';
import type { EditableProductInput, Product } from '@/types';

interface CatalogContextType {
  products: Product[];
  isLoading: boolean;
  syncMode: 'backend' | 'local';
  addProduct: (input: EditableProductInput) => Promise<Product | null>;
  updateProduct: (productId: string, input: EditableProductInput) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const CATALOG_STORAGE_KEY = 'shopzora_catalog_v1';

function slugifyProductName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildProduct(input: EditableProductInput, existingId?: string): Product {
  const price = Number(input.price) || 0;
  const originalPrice = Number(input.originalPrice) || 0;
  const computedDiscount =
    originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100)) : 0;

  return {
    id: existingId ?? Date.now().toString(),
    slug: slugifyProductName(`${input.brand} ${input.name}`),
    brand: input.brand.trim(),
    name: input.name.trim(),
    price,
    originalPrice,
    discount: computedDiscount,
    image: input.image.trim() || '/images/products/product1.jpg',
    gallery:
      input.gallery.length > 0
        ? input.gallery.map((item) => item.trim()).filter(Boolean)
        : [input.image.trim() || '/images/products/product1.jpg'],
    sizes: input.sizes,
    category: input.category.trim(),
    description: input.description.trim(),
    inStock: input.inStock,
    color: input.color.trim(),
    rating: Number(input.rating) || 0,
    reviewCount: Number(input.reviewCount) || 0,
    badge: input.badge?.trim() || undefined,
    tags: input.tags.map((item) => item.trim()).filter(Boolean),
    features: input.features.map((item) => item.trim()).filter(Boolean),
  };
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => initialProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [syncMode, setSyncMode] = useState<'backend' | 'local'>('local');

  useEffect(() => {
    const hydrateCatalog = async () => {
      if (storefrontRuntime.backendEnabled) {
        try {
          const response = await fetch(buildApiUrl('/products'));
          const payload = await readJson<{ products?: Product[] }>(response);
          const remoteProducts = payload?.products ?? [];

          if (remoteProducts.length > 0) {
            setProducts(remoteProducts);
          } else {
            const seedResponse = await fetch(buildApiUrl('/products/seed'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ products: initialProducts }),
            });
            const seedPayload = await readJson<{ products?: Product[] }>(seedResponse);
            setProducts(seedPayload?.products?.length ? seedPayload.products : initialProducts);
          }

          setSyncMode('backend');
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Failed to restore backend catalog', error);
        }
      }

      const savedProducts = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (error) {
          console.error('Failed to restore catalog', error);
        }
      }
      setSyncMode('local');
      setIsLoading(false);
    };

    void hydrateCatalog();
  }, []);

  useEffect(() => {
    if (!isLoading && syncMode === 'local') {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products));
    }
  }, [isLoading, products, syncMode]);

  const value = useMemo<CatalogContextType>(
    () => ({
      products,
      isLoading,
      syncMode,
      addProduct: async (input) => {
        const nextProduct = buildProduct(input);

        if (syncMode === 'backend') {
          const response = await fetch(buildApiUrl('/products'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product: nextProduct }),
          });
          const payload = await readJson<{ products?: Product[] }>(response);
          if (payload?.products) {
            setProducts(payload.products);
          }
        } else {
          setProducts((current) => [nextProduct, ...current]);
        }

        return nextProduct;
      },
      updateProduct: async (productId, input) => {
        const nextProduct = buildProduct(input, productId);
        if (syncMode === 'backend') {
          const response = await fetch(buildApiUrl(`/products/${productId}`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product: nextProduct }),
          });
          const payload = await readJson<{ products?: Product[] }>(response);
          if (payload?.products) {
            setProducts(payload.products);
          }
          return;
        }

        setProducts((current) =>
          current.map((product) => (product.id === productId ? nextProduct : product))
        );
      },
      deleteProduct: async (productId) => {
        if (syncMode === 'backend') {
          const response = await fetch(buildApiUrl(`/products/${productId}`), {
            method: 'DELETE',
          });
          const payload = await readJson<{ products?: Product[] }>(response);
          if (payload?.products) {
            setProducts(payload.products);
          }
          return;
        }

        setProducts((current) => current.filter((product) => product.id !== productId));
      },
    }),
    [isLoading, products, syncMode]
  );

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider');
  }
  return context;
}
