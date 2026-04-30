import {
  BadgeCheck,
  Facebook,
  Instagram,
  RotateCcw,
  Smartphone,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useStorefront } from '@/context/StorefrontContext';
import { categories } from '@/data';

const onlineShoppingLinks = categories.slice(0, 6).map((category) => category.name);

const customerPolicyLinks = [
  'Contact Us',
  'FAQ',
  'T&C',
  'Terms of Use',
  'Track Orders',
  'Shipping',
  'Cancellation',
  'Privacy Policy',
];

const usefulLinks = [
  'Blog',
  'Careers',
  'Site Map',
  'Corporate Information',
];

const popularSearches = [
  'Dresses',
  'Tops',
  'Jeans',
  'Blazers',
  'Trousers',
  'Heels',
  'Handbags',
  'Jewelry',
  'Watches',
  'Sunglasses',
  'Knitwear',
  'Skincare',
];

export default function Footer() {
  const { openCollection, openWishlist } = useStorefront();

  return (
    <footer className="bg-gray-50 pb-6 pt-12 lg:pt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 border-b border-gray-200 pb-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800">
              Online Shopping
            </h3>
            <ul className="space-y-2">
              {onlineShoppingLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#/"
                    onClick={(event) => {
                      event.preventDefault();
                      openCollection({ category: link });
                    }}
                    className="text-sm text-gray-600 transition-colors hover:text-[#ff3f6c]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800">
              Customer Policies
            </h3>
            <ul className="space-y-2">
              {customerPolicyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#/"
                    onClick={(event) => {
                      event.preventDefault();
                      if (link === 'Track Orders') {
                        openWishlist();
                      }
                    }}
                    className="text-sm text-gray-600 transition-colors hover:text-[#ff3f6c]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800">
              Useful Links
            </h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#/"
                    className="text-sm text-gray-600 transition-colors hover:text-[#ff3f6c]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="mb-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800">
                Experience Shopzora App
              </h3>
              <div className="flex space-x-3">
                <a
                  href="#/"
                  className="flex items-center space-x-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity hover:opacity-90"
                >
                  <Smartphone className="h-5 w-5" />
                  <div className="text-left">
                    <span className="block text-[8px]">Get it on</span>
                    <span className="text-xs font-semibold">Google Play</span>
                  </div>
                </a>
                <a
                  href="#/"
                  className="flex items-center space-x-2 rounded-lg bg-black px-3 py-2 text-white transition-opacity hover:opacity-90"
                >
                  <Smartphone className="h-5 w-5" />
                  <div className="text-left">
                    <span className="block text-[8px]">Download on</span>
                    <span className="text-xs font-semibold">App Store</span>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-800">
                Keep in Touch
              </h3>
              <div className="flex space-x-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                  <a
                    key={index}
                    href="#/"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 transition-all duration-300 hover:bg-[#ff3f6c] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 py-6">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            <div className="flex items-center space-x-3">
              <BadgeCheck className="h-8 w-8 text-[#03a685]" />
              <div>
                <p className="text-sm font-bold text-gray-800">100% ORIGINAL</p>
                <p className="text-xs text-gray-500">guarantee for all products</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-8 w-8 text-[#03a685]" />
              <div>
                <p className="text-sm font-bold text-gray-800">Return within 14 days</p>
                <p className="text-xs text-gray-500">of receiving your order</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 py-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">
            Popular Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <span key={search}>
                <a
                  href="#/"
                  onClick={(event) => {
                    event.preventDefault();
                    openCollection({ search });
                  }}
                  className="text-xs text-gray-500 transition-colors hover:text-[#ff3f6c]"
                >
                  {search}
                </a>
                {index < popularSearches.length - 1 ? (
                  <span className="mx-2 text-gray-300">|</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-6 text-center">
          <p className="text-sm text-gray-500">
            In case of any concern,{' '}
            <a href="#/" className="text-[#ff3f6c] hover:underline">
              Contact Us
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {'\u00A9'} 2026 Shopzora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
