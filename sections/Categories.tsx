import { useStorefront } from '@/context/StorefrontContext';
import { categories } from '@/data';

export default function Categories() {
  const { openCollection } = useStorefront();

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold uppercase tracking-wide text-[#20131a] lg:mb-8 lg:text-2xl">
          Shop By Category
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 xl:gap-5">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className="group cursor-pointer"
              onClick={() => openCollection({ category: category.name })}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative aspect-[0.9] overflow-hidden rounded-[28px] shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#20131a]/85 via-[#20131a]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 text-left transition-transform duration-300 group-hover:-translate-y-1 lg:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
                    Category
                  </p>
                  <h3 className="mb-1 mt-2 text-base font-semibold text-white lg:text-xl">
                    {category.name}
                  </h3>
                  <p className="text-xs font-medium text-white/90 lg:text-sm">
                    {category.discount}
                  </p>
                  <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.24em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Shop now
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
