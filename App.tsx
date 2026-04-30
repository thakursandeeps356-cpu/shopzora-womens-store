import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { CatalogProvider } from '@/context/CatalogContext';
import { OrderProvider } from '@/context/OrderContext';
import { StorefrontProvider, useStorefront } from '@/context/StorefrontContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Header from '@/sections/Header';
import Hero from '@/sections/Hero';
import Brands from '@/sections/Brands';
import Categories from '@/sections/Categories';
import Products from '@/sections/Products';
import Cart from '@/sections/Cart';
import Footer from '@/sections/Footer';
import CollectionView from '@/views/CollectionView';
import ProductView from '@/views/ProductView';
import CheckoutView from '@/views/CheckoutView';
import WishlistView from '@/views/WishlistView';
import AuthView from '@/views/AuthView';
import OrdersView from '@/views/OrdersView';
import AdminView from '@/views/AdminView';
import './App.css';

function AppShell() {
  const { route } = useStorefront();

  return (
    <div className="min-h-screen bg-[#fff7f8]">
      <Header />

      <main className="pt-16 lg:pt-20">
        {route.page === 'home' ? (
          <>
            <Hero />
            <Brands />
            <Categories />
            <Products />
          </>
        ) : null}
        {route.page === 'collection' ? <CollectionView /> : null}
        {route.page === 'product' ? <ProductView productId={route.productId} /> : null}
        {route.page === 'checkout' ? <CheckoutView /> : null}
        {route.page === 'wishlist' ? <WishlistView /> : null}
        {route.page === 'auth' ? <AuthView /> : null}
        {route.page === 'orders' ? <OrdersView /> : null}
        {route.page === 'admin' ? <AdminView /> : null}
      </main>

      <Footer />
      <Cart />
    </div>
  );
}

function App() {
  return (
    <StorefrontProvider>
      <AuthProvider>
        <CatalogProvider>
          <WishlistProvider>
            <OrderProvider>
              <CartProvider>
                <AppShell />
              </CartProvider>
            </OrderProvider>
          </WishlistProvider>
        </CatalogProvider>
      </AuthProvider>
    </StorefrontProvider>
  );
}

export default App;
