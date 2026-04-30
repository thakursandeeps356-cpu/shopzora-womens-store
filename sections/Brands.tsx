import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { brands } from '@/data';

export default function Brands() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openCollection } = useStorefront();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between lg:mb-8">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-[#20131a] lg:text-2xl">
            Rising Stars
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100 lg:h-10 lg:w-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100 lg:h-10 lg:w-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4 lg:space-x-6"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => openCollection({ brand: brand.name })}
              className="group w-[240px] flex-shrink-0 cursor-pointer sm:w-[260px] lg:w-[280px]"
            >
              <div className="relative overflow-hidden rounded-[28px] bg-gray-100 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-gray-800 backdrop-blur-sm">
                    {brand.name}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-white p-5 text-left">
                  <p className="mb-1 text-sm text-gray-600">{brand.tagline}</p>
                  <p className="text-base font-semibold text-[#03a685]">
                    {brand.discount}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
