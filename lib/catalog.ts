import type {
  CollectionFilters,
  Product,
  SortOption,
} from '@/types';

export const defaultSort: SortOption = 'featured';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizeFilters(filters: CollectionFilters = {}): CollectionFilters {
  const nextFilters: CollectionFilters = {
    sort: filters.sort ?? defaultSort,
  };

  if (filters.category?.trim()) {
    nextFilters.category = filters.category.trim();
  }
  if (filters.brand?.trim()) {
    nextFilters.brand = filters.brand.trim();
  }
  if (filters.search?.trim()) {
    nextFilters.search = filters.search.trim();
  }

  return nextFilters;
}

export function filterProducts(products: Product[], filters: CollectionFilters = {}) {
  const normalized = normalizeFilters(filters);
  const search = normalized.search?.toLowerCase();

  const filtered = products.filter((product) => {
    if (normalized.category && product.category !== normalized.category) {
      return false;
    }
    if (normalized.brand && product.brand !== normalized.brand) {
      return false;
    }
    if (!search) {
      return true;
    }

    const haystack = [
      product.brand,
      product.name,
      product.category,
      product.description,
      product.color,
      ...product.tags,
      ...product.features,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });

  return [...filtered].sort((left, right) => {
    switch (normalized.sort) {
      case 'price-low':
        return left.price - right.price;
      case 'price-high':
        return right.price - left.price;
      case 'rating':
        return right.rating - left.rating;
      case 'discount':
        return right.discount - left.discount;
      case 'featured':
      default:
        return Number(Boolean(right.badge)) - Number(Boolean(left.badge));
    }
  });
}

export function getProductById(products: Product[], productId: string) {
  return products.find((product) => product.id === productId);
}

export function getRelatedProducts(products: Product[], currentProduct: Product) {
  return products
    .filter((product) => product.id !== currentProduct.id)
    .sort((left, right) => {
      const leftScore =
        Number(left.category === currentProduct.category) * 2 +
        Number(left.brand === currentProduct.brand);
      const rightScore =
        Number(right.category === currentProduct.category) * 2 +
        Number(right.brand === currentProduct.brand);

      return rightScore - leftScore;
    })
    .slice(0, 4);
}
