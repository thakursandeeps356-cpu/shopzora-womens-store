import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';
import { useOrders } from '@/context/OrderContext';
import { useStorefront } from '@/context/StorefrontContext';
import { formatCurrency } from '@/lib/catalog';
import type { EditableProductInput, Order, Product } from '@/types';

type AdminTab = 'overview' | 'products' | 'orders';

function getDraftProduct(): EditableProductInput {
  return {
    brand: '',
    name: '',
    price: 0,
    originalPrice: 0,
    image: '/images/products/product1.jpg',
    gallery: ['/images/products/product1.jpg'],
    sizes: ['S', 'M', 'L'],
    category: 'Dresses',
    description: '',
    inStock: true,
    color: '',
    rating: 4.5,
    reviewCount: 0,
    badge: '',
    tags: [],
    features: [''],
  };
}

function toEditableProduct(product: Product): EditableProductInput {
  return {
    brand: product.brand,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    gallery: product.gallery,
    sizes: product.sizes,
    category: product.category,
    description: product.description,
    inStock: product.inStock,
    color: product.color,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge ?? '',
    tags: product.tags,
    features: product.features,
  };
}

export default function AdminView() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState<EditableProductInput>(getDraftProduct());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { changeCurrentUserPassword, currentUser, isAdmin, logout } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useCatalog();
  const { orders, updateOrderStatus } = useOrders();
  const { openAuth, openHome } = useStorefront();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        [product.name, product.brand, product.category]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  if (!currentUser) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white px-6 py-14 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <h1 className="text-3xl font-semibold text-[#20131a]">
              Admin access requires login
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#6b5563]">
              Sign in with the admin account to manage products and orders.
            </p>
            <button
              onClick={openAuth}
              className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
            >
              Open admin login
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white px-6 py-14 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <h1 className="text-3xl font-semibold text-[#20131a]">
              This account is not an admin
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#6b5563]">
              Use the admin credentials shown on the auth screen if you want to manage the storefront.
            </p>
            <button
              onClick={openHome}
              className="mt-6 rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
            >
              Back to website
            </button>
          </div>
        </div>
      </section>
    );
  }

  const resetDraft = () => {
    setDraft(getDraftProduct());
    setEditingProductId(null);
  };

  const submitDraft = async () => {
    if (!draft.brand.trim() || !draft.name.trim()) {
      return;
    }

    if (editingProductId) {
      await updateProduct(editingProductId, draft);
    } else {
      await addProduct(draft);
    }
    resetDraft();
  };

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <section className="bg-[#fff7f8] py-8 lg:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[32px] bg-[#20131a] p-6 text-white shadow-[0_24px_80px_rgba(32,19,26,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              Shopzora admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              Control room
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Manage the storefront, track orders, and keep content up to date from one place.
            </p>

            <div className="mt-8 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      tab === item.id
                        ? 'bg-white text-[#20131a]'
                        : 'bg-white/5 text-white/82 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                logout();
                openAuth();
              }}
              className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-white/82 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </aside>

          <div className="space-y-6">
            {tab === 'overview' ? (
              <>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                      Products
                    </p>
                    <h2 className="mt-4 text-4xl font-semibold text-[#20131a]">
                      {products.length}
                    </h2>
                  </div>
                  <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                      Orders
                    </p>
                    <h2 className="mt-4 text-4xl font-semibold text-[#20131a]">
                      {orders.length}
                    </h2>
                  </div>
                  <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                      Revenue
                    </p>
                    <h2 className="mt-4 text-4xl font-semibold text-[#20131a]">
                      {formatCurrency(
                        orders.reduce((sum: number, order: Order) => sum + order.total, 0)
                      )}
                    </h2>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f4]">
                        <ShieldCheck className="h-6 w-6 text-[#ff3f6c]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-[#20131a]">
                          Admin security
                        </h2>
                        <p className="mt-1 text-sm text-[#6b5563]">
                          Change the seeded admin password and stop using the default login for daily access.
                        </p>
                      </div>
                    </div>

                    {currentUser.mustChangePassword ? (
                      <div className="mt-5 rounded-[22px] border border-[#f5ccd8] bg-[#fff3f6] px-4 py-3 text-sm text-[#a33a62]">
                        Default admin password is still active on this device. Change it before sharing admin access with anyone else.
                      </div>
                    ) : null}

                    {passwordError ? (
                      <div className="mt-5 rounded-[22px] border border-[#f5ccd8] bg-[#fff3f6] px-4 py-3 text-sm text-[#a33a62]">
                        {passwordError}
                      </div>
                    ) : null}

                    {passwordMessage ? (
                      <div className="mt-5 rounded-[22px] border border-[#cceede] bg-[#edfdf5] px-4 py-3 text-sm text-[#0f766e]">
                        {passwordMessage}
                      </div>
                    ) : null}

                    <div className="mt-5 space-y-4">
                      {[
                        ['Current password', 'currentPassword'],
                        ['New password', 'newPassword'],
                        ['Confirm new password', 'confirmPassword'],
                      ].map(([label, key]) => (
                        <label key={key} className="block">
                          <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                            {label}
                          </span>
                          <input
                            type="password"
                            value={passwordForm[key as keyof typeof passwordForm]}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                          />
                        </label>
                      ))}

                      <button
                        onClick={async () => {
                          const result = await changeCurrentUserPassword(passwordForm);
                          if (!result.ok) {
                            setPasswordError(result.message ?? 'Unable to update password.');
                            setPasswordMessage('');
                            return;
                          }
                          setPasswordError('');
                          setPasswordMessage(result.message ?? 'Password updated successfully.');
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="w-full rounded-full bg-[#20131a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2530]"
                      >
                        Update admin password
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <h2 className="text-2xl font-semibold text-[#20131a]">
                      Launch checklist
                    </h2>
                    <div className="mt-5 space-y-4 text-sm text-[#5f4a55]">
                      <div className="rounded-[22px] bg-[#fff7f9] p-4">
                        <div className="flex items-center gap-2 font-semibold text-[#20131a]">
                          <CheckCircle2 className="h-4 w-4 text-[#0f766e]" />
                          Ready now
                        </div>
                        <p className="mt-2">Netlify deploy, Razorpay gateway, admin dashboard, and customer checkout are all working.</p>
                      </div>
                      <div className="rounded-[22px] bg-[#fff7f9] p-4">
                        <div className="flex items-center gap-2 font-semibold text-[#20131a]">
                          <AlertTriangle className="h-4 w-4 text-[#d97706]" />
                          Before live launch
                        </div>
                        <p className="mt-2">Switch Razorpay from test keys to live keys, review return and cancellation policy, and change admin password on every active browser.</p>
                      </div>
                      <div className="rounded-[22px] bg-[#fff7f9] p-4">
                        <div className="flex items-center gap-2 font-semibold text-[#20131a]">
                          <ShieldCheck className="h-4 w-4 text-[#ff3f6c]" />
                          Backend next step
                        </div>
                        <p className="mt-2">Connect `SHOPZORA_ORDER_WEBHOOK_URL` to a real API so orders and cancellations stop living only in localStorage.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {tab === 'products' ? (
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#20131a]">
                        Product management
                      </h2>
                      <p className="mt-1 text-sm text-[#6b5563]">
                        Search, edit, and remove products from the live storefront.
                      </p>
                    </div>
                    <div className="relative sm:w-72">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7281]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search products"
                        className="w-full rounded-full border border-[#ebd4dc] bg-[#fffafb] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#ff3f6c]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <article
                        key={product.id}
                        className="flex flex-col gap-4 rounded-[22px] border border-[#f1d9e1] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-16 rounded-2xl object-cover"
                          />
                          <div>
                            <p className="text-lg font-semibold text-[#20131a]">
                              {product.name}
                            </p>
                            <p className="text-sm text-[#6b5563]">
                              {product.brand} | {product.category}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#20131a]">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setEditingProductId(product.id);
                              setDraft(toEditableProduct(product));
                            }}
                            className="rounded-full border border-[#ebd4dc] px-4 py-2 text-sm font-semibold text-[#5f4a55] transition hover:border-[#ff3f6c] hover:text-[#ff3f6c]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void deleteProduct(product.id)}
                            className="rounded-full border border-[#f7cad8] px-4 py-2 text-sm font-semibold text-[#a33a62] transition hover:bg-[#fff3f6]"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#20131a]">
                        {editingProductId ? 'Edit product' : 'Add product'}
                      </h2>
                      <p className="mt-1 text-sm text-[#6b5563]">
                        This updates the live client-side catalog immediately.
                      </p>
                    </div>
                    {editingProductId ? (
                      <button
                        onClick={resetDraft}
                        className="text-sm font-semibold text-[#a33a62]"
                      >
                        Reset
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      ['Brand', draft.brand, 'brand'],
                      ['Name', draft.name, 'name'],
                      ['Category', draft.category, 'category'],
                      ['Color', draft.color, 'color'],
                      ['Badge', draft.badge ?? '', 'badge'],
                      ['Image URL', draft.image, 'image'],
                    ].map(([label, value, key]) => (
                      <label key={key} className="block">
                        <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                          {label}
                        </span>
                        <input
                          type="text"
                          value={value}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                        />
                      </label>
                    ))}

                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        ['Price', draft.price, 'price'],
                        ['Original Price', draft.originalPrice, 'originalPrice'],
                        ['Rating', draft.rating, 'rating'],
                      ].map(([label, value, key]) => (
                        <label key={key} className="block">
                          <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                            {label}
                          </span>
                          <input
                            type="number"
                            value={value}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                [key]: Number(event.target.value),
                              }))
                            }
                            className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                          />
                        </label>
                        ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                          Review count
                        </span>
                        <input
                          type="number"
                          value={draft.reviewCount}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              reviewCount: Number(event.target.value),
                            }))
                          }
                          className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-[22px] border border-[#ebd4dc] bg-[#fffafb] px-4 py-3">
                        <span className="text-sm font-medium text-[#4f3a45]">
                          In stock
                        </span>
                        <input
                          type="checkbox"
                          checked={draft.inStock}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              inStock: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 accent-[#ff3f6c]"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                        Description
                      </span>
                      <textarea
                        rows={4}
                        value={draft.description}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, description: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                        Sizes (comma separated)
                      </span>
                      <input
                        type="text"
                        value={draft.sizes.join(', ')}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            sizes: event.target.value
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                        Gallery URLs (one per line)
                      </span>
                      <textarea
                        rows={4}
                        value={draft.gallery.join('\n')}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            gallery: event.target.value
                              .split('\n')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                        Tags (comma separated)
                      </span>
                      <input
                        type="text"
                        value={draft.tags.join(', ')}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            tags: event.target.value
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                        Features (one per line)
                      </span>
                      <textarea
                        rows={4}
                        value={draft.features.join('\n')}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            features: event.target.value.split('\n').map((item) => item.trim()),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm outline-none transition focus:border-[#ff3f6c]"
                      />
                    </label>

                    <button
                      onClick={() => void submitDraft()}
                      className="w-full rounded-full bg-[#ff3f6c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e33863]"
                    >
                      {editingProductId ? 'Update product' : 'Add product'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 'orders' ? (
              <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-semibold text-[#20131a]">
                  Order management
                </h2>
                <p className="mt-1 text-sm text-[#6b5563]">
                  Update the current order status for this device-local storefront.
                </p>

                <div className="mt-6 space-y-4">
                  {orders.map((order: Order) => (
                    <article
                      key={order.id}
                      className="rounded-[22px] border border-[#f1d9e1] p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7281]">
                            {order.id}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-[#20131a]">
                            {order.shipping.name}
                          </h3>
                          <p className="mt-2 text-sm text-[#6b5563]">
                            {order.items.length} items | {formatCurrency(order.total)}
                          </p>
                        </div>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            void updateOrderStatus(order.id, event.target.value as Order['status'])
                          }
                          className="rounded-full border border-[#ebd4dc] bg-[#fffafb] px-4 py-3 text-sm font-semibold text-[#20131a] outline-none"
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="packed">packed</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </div>
                    </article>
                  ))}
                  {orders.length === 0 ? (
                    <p className="rounded-[22px] bg-[#fff7f9] px-4 py-8 text-center text-sm text-[#6b5563]">
                      Orders will show up here after checkout.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
