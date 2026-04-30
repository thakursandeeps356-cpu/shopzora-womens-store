import { useState } from 'react';
import { Eye, EyeOff, Lock, ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStorefront } from '@/context/StorefrontContext';

type AuthMode = 'login' | 'signup';

export default function AuthView() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    identifier: '',
    email: '',
    password: '',
  });
  const { login, register, currentUser, isAdmin, users } = useAuth();
  const { openAdmin, openHome, openOrders } = useStorefront();
  const adminAccount = users.find((user) => user.role === 'admin');

  if (currentUser) {
    return (
      <section className="bg-[#fff7f8] py-16">
        <div className="mx-auto max-w-[760px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white px-6 py-14 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f4]">
              <UserRound className="h-8 w-8 text-[#ff3f6c]" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-[#20131a]">
              Welcome back, {currentUser.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#6b5563]">
              Your account is active on this device. You can continue shopping, review orders, or open the admin workspace if this is the admin account.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={openHome}
                className="rounded-full bg-[#ff3f6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e33863]"
              >
                Continue shopping
              </button>
              <button
                onClick={openOrders}
                className="rounded-full border border-[#ebd4dc] px-6 py-3 text-sm font-semibold text-[#5f4a55] transition hover:border-[#ff3f6c] hover:text-[#ff3f6c]"
              >
                View orders
              </button>
              {isAdmin ? (
                <button
                  onClick={openAdmin}
                  className="rounded-full border border-[#20131a] px-6 py-3 text-sm font-semibold text-[#20131a] transition hover:bg-[#20131a] hover:text-white"
                >
                  Open admin
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const submit = async () => {
    if (mode === 'login') {
      const result = await login(form.identifier, form.password);
      if (!result.ok) {
        setError(result.message ?? 'Unable to sign in.');
        return;
      }
      setError('');
      return;
    }

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (!result.ok) {
      setError(result.message ?? 'Unable to create account.');
      return;
    }
    setError('');
  };

  return (
    <section className="bg-[#fff7f8] py-10 lg:py-14">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-br from-[#20131a] via-[#5a2940] to-[#c54d7b] p-8 text-white shadow-[0_24px_80px_rgba(32,19,26,0.22)] sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-white/65">
            Shopzora account
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            Sign in for saved orders, faster checkout, and admin access
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/82">
            We are keeping this frontend-only for now, but the full auth shell is ready for real backend integration later.
          </p>

          <div className="mt-8 rounded-[28px] bg-white/10 p-5">
            <p className="text-sm font-semibold">Admin login</p>
            <p className="mt-2 text-sm text-white/82">
              Username: <span className="font-mono">admin</span>
            </p>
            {adminAccount?.mustChangePassword ? (
              <p className="text-sm text-white/82">
                Password: <span className="font-mono">admin123</span>
              </p>
            ) : (
              <p className="text-sm text-white/82">
                Password has been changed on this device. Use the latest admin password from the security panel.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[36px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-8 flex gap-3 rounded-full bg-[#fff2f5] p-2">
            {(['login', 'signup'] as AuthMode[]).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  setError('');
                }}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-white text-[#20131a] shadow-sm'
                    : 'text-[#8f7281]'
                }`}
              >
                {item === 'login' ? 'Login' : 'Create account'}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-[#f7cad8] bg-[#fff3f6] px-4 py-3 text-sm text-[#a33a62]">
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            {mode === 'signup' ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                  Full name
                </span>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b4919f]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] py-3 pl-12 pr-4 text-sm text-[#20131a] outline-none transition focus:border-[#ff3f6c]"
                    placeholder="Enter your name"
                  />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                {mode === 'login' ? 'Email or username' : 'Email address'}
              </span>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b4919f]" />
                <input
                  type="text"
                  value={mode === 'login' ? form.identifier : form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [mode === 'login' ? 'identifier' : 'email']: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] py-3 pl-12 pr-4 text-sm text-[#20131a] outline-none transition focus:border-[#ff3f6c]"
                  placeholder={mode === 'login' ? 'admin or you@example.com' : 'you@example.com'}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#4f3a45]">
                Password
              </span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b4919f]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#ebd4dc] bg-[#fffafb] py-3 pl-12 pr-12 text-sm text-[#20131a] outline-none transition focus:border-[#ff3f6c]"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f7281]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            <button
              onClick={() => void submit()}
              className="w-full rounded-full bg-[#ff3f6c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e33863]"
            >
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
