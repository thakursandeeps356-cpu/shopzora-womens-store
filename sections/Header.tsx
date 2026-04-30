import { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useWishlist } from '@/context/WishlistContext';
import { categories } from '@/data';

const navLinks = categories.slice(0, 6).map((category) => category.name);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { setIsCartOpen, getCartCount } = useCart();
  const {
    searchQuery,
    setSearchQuery,
    openCollection,
    openAdmin,
    openAuth,
    openHome,
    openOrders,
    openWishlist,
  } = useStorefront();
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = getCartCount();

  const submitSearch = () => {
    openCollection({ search: searchQuery || undefined });
    setIsMobileMenuOpen(false);
  };

  const openProfileDestination = () => {
    if (!currentUser) {
      openAuth();
      return;
    }
    if (isAdmin) {
      openAdmin();
      return;
    }
    openOrders();
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-[#f2dde5] bg-white/90 shadow-[0_14px_50px_rgba(15,23,42,0.06)] backdrop-blur-md'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <button
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>

          <div className="flex items-center">
            <button onClick={openHome} className="flex flex-col items-start text-left">
              <span className="text-2xl font-bold tracking-tight text-[#ff3f6c] lg:text-3xl">
                Shopzora
              </span>
              <span className="-mt-1 text-[10px] uppercase tracking-wider text-gray-500 lg:text-xs">
                The Women's Store
              </span>
            </button>
          </div>

          <nav className="hidden items-center space-x-6 lg:flex xl:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => openCollection({ category: link })}
                className="group relative text-sm font-medium text-gray-700 transition-colors hover:text-[#ff3f6c]"
              >
                {link}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#ff3f6c] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="mx-6 hidden max-w-md flex-1 md:flex lg:mx-8"
          >
            <div
              className={`relative w-full transition-all duration-300 ${
                isSearchFocused ? 'scale-[1.02]' : ''
              }`}
            >
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full rounded-full bg-[#fff5f7] py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none ring-1 ring-transparent transition-all placeholder:text-gray-400 focus:bg-white focus:ring-[#ff3f6c]"
              />
            </div>
          </form>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="rounded-full p-2 transition-colors hover:bg-gray-100 md:hidden">
              <Search className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={openProfileDestination}
              className="group hidden flex-col items-center rounded-lg p-2 transition-colors hover:bg-gray-100 sm:flex"
            >
              <User className="h-5 w-5 text-gray-700 transition-colors group-hover:text-[#ff3f6c]" />
              <span className="mt-0.5 text-[10px] text-gray-600">
                {currentUser ? currentUser.name.split(' ')[0] : 'Profile'}
              </span>
            </button>

            <button
              onClick={openWishlist}
              className="group relative hidden flex-col items-center rounded-lg p-2 transition-colors hover:bg-gray-100 sm:flex"
            >
              <div className="relative">
                <Heart className="h-5 w-5 text-gray-700 transition-colors group-hover:text-[#ff3f6c]" />
                {wishlist.length > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#20131a] px-1 text-[10px] font-bold text-white">
                    {wishlist.length}
                  </span>
                ) : null}
              </div>
              <span className="mt-0.5 text-[10px] text-gray-600">Wishlist</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative flex flex-col items-center rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-gray-700 transition-colors group-hover:text-[#ff3f6c]" />
                {cartCount > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3f6c] text-[10px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                ) : null}
              </div>
              <span className="mt-0.5 text-[10px] text-gray-600">Bag</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 top-16 z-40 bg-white transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="relative mb-6"
          >
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg bg-gray-100 py-3 pl-10 pr-4 text-sm"
            />
          </form>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => {
                  openCollection({ category: link });
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#ff3f6c]"
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="mt-6 space-y-2 border-t border-gray-200 pt-6">
            <button
              onClick={openProfileDestination}
              className="flex w-full items-center rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <User className="mr-3 h-5 w-5" />
              {currentUser ? (isAdmin ? 'Admin Panel' : 'My Orders') : 'Login / Signup'}
            </button>
            <button
              onClick={openWishlist}
              className="flex w-full items-center rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Heart className="mr-3 h-5 w-5" />
              My Wishlist
            </button>
            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ShoppingBag className="mr-3 h-5 w-5" />
              My Bag
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
