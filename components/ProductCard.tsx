import { useEffect, useState } from 'react';
import { Check, Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency } from '@/lib/catalog';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({
  product,
  compact = false,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { openProduct } = useStorefront();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!addedToCart) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setAddedToCart(false), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [addedToCart]);

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setAddedToCart(true);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f8e5ea]">
        <button
          onClick={() => openProduct(product.id)}
          className="absolute inset-0 z-10"
          aria-label={`Open ${product.name}`}
        />

        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#20131a]/45 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          {product.badge ? (
            <span className="rounded-full bg-[#20131a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
              {product.badge}
            </span>
          ) : null}
          <span className="rounded-full bg-[#0f766e] px-3 py-1 text-[11px] font-semibold text-white">
            {product.discount}% off
          </span>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#20131a] shadow-md transition hover:scale-105 hover:bg-white"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? 'fill-[#ff3f6c] text-[#ff3f6c]' : ''}`}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full bg-white/90 px-4 py-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 sm:block">
          <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedSize === size
                    ? 'border-[#ff3f6c] bg-[#ff3f6c] text-white'
                    : 'border-[#e7d6dc] bg-white text-[#5f4a55]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            onClick={(event) => {
              event.stopPropagation();
              handleAddToCart();
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
              addedToCart
                ? 'bg-[#0f766e] text-white'
                : 'bg-[#ff3f6c] text-white hover:bg-[#e33863]'
            }`}
          >
            {addedToCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            <span>{addedToCart ? 'Added to bag' : 'Add to bag'}</span>
          </button>
        </div>
      </div>

      <div className={`${compact ? 'p-4' : 'p-5'}`}>
        <button
          onClick={() => openProduct(product.id)}
          className="text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
            {product.brand}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#20131a]">
            {product.name}
          </h3>
        </button>

        <p className="mt-2 line-clamp-2 text-sm text-[#6b5563]">
          {product.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-[#6b5563]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4f6] px-2.5 py-1 font-medium text-[#9f4566]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {product.rating.toFixed(1)}
          </span>
          <span>{product.reviewCount} reviews</span>
          <span className="h-1 w-1 rounded-full bg-[#d4b6c3]" />
          <span>{product.color}</span>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="text-xl font-bold text-[#20131a]">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-[#9d8a94] line-through">
            {formatCurrency(product.originalPrice)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#f1d4de] bg-[#fff7f9] px-4 py-3 text-sm font-semibold text-[#a33a62] transition hover:border-[#ff3f6c] hover:text-[#ff3f6c] sm:hidden"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Add to bag</span>
        </button>
      </div>
    </article>
  );
}
