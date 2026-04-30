import ProductCard from '@/components/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { useStorefront } from '@/context/StorefrontContext';

export default function Products() {
  const { openCollection } = useStorefront();
  const { products } = useCatalog();

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
              Trending now
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#20131a] lg:text-3xl">
              New-season products with a premium feel
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b5563]">
              The homepage now works as a storefront launcher, while these cards connect directly to detail pages, wishlist, and cart.
            </p>
          </div>

          <button
            onClick={() => openCollection()}
            className="rounded-full bg-[#20131a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff3f6c]"
          >
            View full collection
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
