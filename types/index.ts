export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  gallery: string[];
  sizes: string[];
  category: string;
  description: string;
  inStock: boolean;
  color: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  tags: string[];
  features: string[];
}

export interface EditableProductInput {
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  gallery: string[];
  sizes: string[];
  category: string;
  description: string;
  inStock: boolean;
  color: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  tags: string[];
  features: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  product: Product;
}

export interface CartState {
  items: CartItem[];
  total: number;
  discount: number;
  subtotal: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  discount: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  discount: string;
  image: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  category: string;
}

export type SortOption =
  | 'featured'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'discount';

export interface CollectionFilters {
  category?: string;
  brand?: string;
  search?: string;
  sort?: SortOption;
}

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  password: string;
  role: UserRole;
  mustChangePassword?: boolean;
  createdAt: string;
}

export type PaymentMethod = 'cod' | 'upi' | 'card';

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  size: string;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  placedAt: string;
  cancelledAt?: string;
  shipping: ShippingDetails;
}

export type StoreRoute =
  | { page: 'home' }
  | { page: 'collection'; filters: CollectionFilters }
  | { page: 'product'; productId: string }
  | { page: 'checkout' }
  | { page: 'wishlist' }
  | { page: 'auth' }
  | { page: 'orders' }
  | { page: 'admin' };
