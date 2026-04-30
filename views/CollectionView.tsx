import ProductCard from '@/components/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { useStorefront } from '@/context/StorefrontContext';
import { brands, categories } from '@/data';
import { filterProducts } from '@/lib/catalog';
import type { SortOption } from '@/types';

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Best Discount', value: 'discount' },
];

export default function CollectionView() {
  const { collectionFilters, updateCollectionFilters, openHome } = useStorefront();
  const { products } = useCatalog();
  const filteredProducts = filterProducts(products, collectionFilters);

  return (
    <section className="bg-[#fff7f8] pb-16 pt-10 lg:pt-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#20131a] via-[#462738] to-[#a33a62] px-6 py-10 text-white shadow-[0_24px_80px_rgba(32,19,26,0.22)] sm:px-8 lg:flex lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
              Shopzora catalogue
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
              {collectionFilters.category ?? collectionFilters.search ?? 'Curated fashion drops'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 sm:text-base">
              Filter by category, brand, and sort preference to move through the collection like a real storefront.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
            {collectionFilters.category ? (
              <button
                onClick={() => updateCollectionFilters({ category: undefined })}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Category: {collectionFilters.category}
              </button>
            ) : null}
            {collectionFilters.brand ? (
              <button
                onClick={() => updateCollectionFilters({ brand: undefined })}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Brand: {collectionFilters.brand}
              </button>
            ) : null}
            {collectionFilters.search ? (
              <button
                onClick={() => updateCollectionFilters({ search: undefined })}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Search: {collectionFilters.search}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#f3dce3] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                  Filters
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#20131a]">
                  Refine the edit
                </h2>
              </div>
              <button
                onClick={() =>
                  updateCollectionFilters({
                    category: undefined,
                    brand: undefined,
                    search: undefined,
                    sort: 'featured',
                  })
                }
                className="text-sm font-medium text-[#a33a62] transition hover:text-[#ff3f6c]"
              >
                Reset
              </button>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-[#20131a]">Categories</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      updateCollectionFilters({
                        category:
                          collectionFilters.category === category.name
                            ? undefined
                            : category.name,
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      collectionFilters.category === category.name
                        ? 'bg-[#20131a] text-white'
                        : 'bg-[#fff2f5] text-[#6c5563] hover:bg-[#ffe3eb]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-[#20131a]">Brands</p>
              <div className="mt-4 space-y-3">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#f3dce3] px-4 py-3 transition hover:border-[#ffb7ca]"
                  >
                    <span className="text-sm font-medium text-[#4f3a45]">
                      {brand.name}
                    </span>
                    <input
                      type="radio"
                      name="brand"
                      checked={collectionFilters.brand === brand.name}
                      onChange={() =>
                        updateCollectionFilters({
                          brand:
                            collectionFilters.brand === brand.name
                              ? undefined
                              : brand.name,
                        })
                      }
                      className="h-4 w-4 accent-[#ff3f6c]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-4 rounded-[28px] border border-[#f3dce3] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#6b5563]">
                  Showing <span className="font-semibold text-[#20131a]">{filteredProducts.length}</span> products
                </p>
                <p className="mt-1 text-sm text-[#9a8190]">
                  Curated picks from elevated fashion labels
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-[#4f3a45]">
                Sort by
                <select
                  value={collectionFilters.sort ?? 'featured'}
                  onChange={(event) =>
                    updateCollectionFilters({
                      sort: event.target.value as SortOption,
                    })
                  }
                  className="rounded-full border border-[#ebd4dc] bg-[#fff7f9] px-4 py-2 text-sm text-[#20131a] outline-none transition focus:border-[#ff3f6c]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#f3dce3] bg-white px-6 py-14 text-center shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                  No products found
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-[#20131a]">
                  Try widening the selection
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6b5563]">
                  Change the category, remove the search query, or head back to the home page to explore the highlighted edits.
                </p>
                <button
                  onClick={openHome}
                  className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
                >
                  Back to home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
