import ProductCard from '@/components/ProductCard';
import { useCatalog } from '@/context/CatalogContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistView() {
  const { wishlist, clearWishlist } = useWishlist();
  const { openCollection } = useStorefront();
  const { products } = useCatalog();
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-r from-[#20131a] via-[#462738] to-[#a33a62] px-6 py-10 text-white shadow-[0_24px_80px_rgba(32,19,26,0.22)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
            Wishlist
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Saved styles for later
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
            Your wishlist is now persistent in local storage, so you can keep collecting pieces before backend sync is added.
          </p>
        </div>

        <div className="mt-8">
          {wishlistProducts.length > 0 ? (
            <>
              <div className="mb-5 flex items-center justify-between rounded-[28px] border border-[#f3dce3] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div>
                  <p className="text-sm text-[#6b5563]">
                    <span className="font-semibold text-[#20131a]">{wishlistProducts.length}</span> saved picks
                  </p>
                  <p className="mt-1 text-sm text-[#9a8190]">
                    Keep them here for the next checkout session
                  </p>
                </div>
                <button
                  onClick={clearWishlist}
                  className="text-sm font-medium text-[#a33a62] transition hover:text-[#ff3f6c]"
                >
                  Clear wishlist
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {wishlistProducts.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#f3dce3] bg-white px-6 py-14 text-center shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
              <h2 className="text-2xl font-semibold text-[#20131a]">
                Your wishlist is empty
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6b5563]">
                Tap the heart on any product card to save it here. This is a clean frontend base for future account sync.
              </p>
              <button
                onClick={() => openCollection()}
                className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
              >
                Explore collection
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
