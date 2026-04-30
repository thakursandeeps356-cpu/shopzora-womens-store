import { useEffect, useMemo, useState } from 'react';
import { Check, Heart, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency, getProductById, getRelatedProducts } from '@/lib/catalog';

export default function ProductView({ productId }: { productId: string }) {
  const { products } = useCatalog();
  const product = getProductById(products, productId);
  const [selectedImage, setSelectedImage] = useState(product?.gallery[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? '');
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { openCollection } = useStorefront();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedImage(product.gallery[0]);
    setSelectedSize(product.sizes[0]);
  }, [product]);

  useEffect(() => {
    if (!added) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setAdded(false), 1400);
    return () => window.clearTimeout(timeoutId);
  }, [added]);

  const relatedProducts = useMemo(
    () => (product ? getRelatedProducts(products, product) : []),
    [product]
  );

  if (!product) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[1400px] px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-[#20131a]">
            Product not found
          </h1>
          <p className="mt-3 text-sm text-[#6b5563]">
            This item is not available anymore. Browse the latest collection instead.
          </p>
          <button
            onClick={() => openCollection()}
            className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
          >
            Explore collection
          </button>
        </div>
      </section>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setAdded(true);
  };

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => openCollection({ category: product.category })}
          className="mb-6 text-sm font-medium text-[#8f7281] transition hover:text-[#ff3f6c]"
        >
          Shop / {product.category}
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-4 md:grid-cols-[112px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
                {product.gallery.map((image) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-[22px] border transition ${
                      selectedImage === image
                        ? 'border-[#ff3f6c] shadow-[0_16px_40px_rgba(255,63,108,0.18)]'
                        : 'border-[#f1d9e1]'
                    }`}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-24 w-24 object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1 overflow-hidden rounded-[28px] bg-[#f8e5ea] md:order-2">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              {product.badge ? (
                <span className="rounded-full bg-[#20131a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                  {product.badge}
                </span>
              ) : null}
              <span className="rounded-full bg-[#fff1f4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9f4566]">
                {product.brand}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold text-[#20131a]">
              {product.name}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6b5563]">
              {product.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#6b5563]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4f6] px-3 py-1.5 font-semibold text-[#9f4566]">
                <Star className="h-3.5 w-3.5 fill-current" />
                {product.rating.toFixed(1)}
              </span>
              <span>{product.reviewCount} verified reviews</span>
              <span className="h-1 w-1 rounded-full bg-[#d4b6c3]" />
              <span>{product.color}</span>
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-[#20131a]">
                {formatCurrency(product.price)}
              </span>
              <span className="text-base text-[#9d8a94] line-through">
                {formatCurrency(product.originalPrice)}
              </span>
              <span className="rounded-full bg-[#e9fbf6] px-3 py-1 text-sm font-semibold text-[#0f766e]">
                You save {product.discount}%
              </span>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-[#20131a]">Select size</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedSize === size
                        ? 'border-[#ff3f6c] bg-[#ff3f6c] text-white'
                        : 'border-[#ebd4dc] text-[#5f4a55] hover:border-[#ff3f6c]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition ${
                  added
                    ? 'bg-[#0f766e] text-white'
                    : 'bg-[#ff3f6c] text-white hover:bg-[#e33863]'
                }`}
              >
                {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                <span>{added ? 'Added to bag' : 'Add to bag'}</span>
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#ebd4dc] px-6 py-3.5 text-sm font-semibold text-[#5f4a55] transition hover:border-[#ff3f6c] hover:text-[#ff3f6c]"
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted(product.id) ? 'fill-[#ff3f6c] text-[#ff3f6c]' : ''}`}
                />
                <span>{isWishlisted(product.id) ? 'Saved' : 'Save to wishlist'}</span>
              </button>
            </div>

            <div className="mt-8 grid gap-3 rounded-[28px] bg-[#fff7f9] p-5">
              {product.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3"
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#0f766e]" />
                  <p className="text-sm text-[#4f3a45]">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-[28px] border border-[#f1d9e1] p-5">
              <div className="flex items-center gap-3 text-sm text-[#4f3a45]">
                <Truck className="h-4 w-4 text-[#ff3f6c]" />
                Free delivery above Rs. 1,999
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4f3a45]">
                <ShieldCheck className="h-4 w-4 text-[#ff3f6c]" />
                Easy 14-day return with pickup support
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                You may also like
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#20131a]">
                Related edits from the collection
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
