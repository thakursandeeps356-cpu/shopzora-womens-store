import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { banners } from '@/data';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { openCollection } = useStorefront();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      nextSlide();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[340px] sm:h-[430px] lg:h-[560px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-out ${
              index === currentSlide
                ? 'translate-x-0'
                : index < currentSlide
                  ? '-translate-x-full'
                  : 'translate-x-full'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#20131a]/80 via-[#20131a]/35 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <div
                  className={`max-w-xl transition-all duration-700 delay-200 ${
                    index === currentSlide
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-8 opacity-0'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                    Curated seasonal edit
                  </p>
                  <h2 className="mt-4 font-serif text-4xl font-semibold text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                    {banner.title}
                  </h2>
                  <p className="mb-6 mt-4 text-base leading-7 text-white/88 sm:text-lg">
                    {banner.subtitle}
                  </p>
                  <button
                    onClick={() => openCollection({ category: banner.category })}
                    className="rounded-full bg-[#ff3f6c] px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#e63961] hover:shadow-lg"
                  >
                    {banner.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all duration-300 hover:bg-white lg:h-12 lg:w-12"
          style={{ opacity: isPaused ? 1 : 0 }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 lg:h-6 lg:w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all duration-300 hover:bg-white lg:h-12 lg:w-12"
          style={{ opacity: isPaused ? 1 : 0 }}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-gray-700 lg:h-6 lg:w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
