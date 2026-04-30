import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { seedUsers } from '@/data';
import { buildApiUrl, readJson } from '@/lib/api';
import { storefrontRuntime } from '@/lib/runtime';
import type { UserProfile, UserRole } from '@/types';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  users: UserProfile[];
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  register: (input: RegisterInput) => Promise<{ ok: boolean; message?: string }>;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  changeCurrentUserPassword: (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'shopzora_users_v1';
const SESSION_STORAGE_KEY = 'shopzora_session_v1';

function normalizeRole(role: UserRole) {
  return role === 'admin' ? 'admin' : 'customer';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(seedUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateAuth = async () => {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);

      if (storefrontRuntime.backendEnabled) {
        try {
          const usersResponse = await fetch(buildApiUrl('/users'));
          const usersPayload = await readJson<{ users?: UserProfile[] }>(usersResponse);
          let remoteUsers = usersPayload?.users ?? [];

          if (remoteUsers.length === 0) {
            const seedResponse = await fetch(buildApiUrl('/users/seed'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ users: seedUsers }),
            });
            const seedPayload = await readJson<{ users?: UserProfile[] }>(seedResponse);
            remoteUsers = seedPayload?.users ?? seedUsers;
          }

          setUsers(remoteUsers);

          if (savedSession) {
            try {
              const parsedSession = JSON.parse(savedSession) as { userId: string };
              const matchedUser = remoteUsers.find((user) => user.id === parsedSession.userId);
              if (matchedUser) {
                setCurrentUser(matchedUser);
              }
            } catch (error) {
              console.error('Failed to restore backend session', error);
            }
          }

          setIsHydrated(true);
          return;
        } catch (error) {
          console.error('Failed to restore backend users', error);
        }
      }

      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        try {
          const parsedUsers = JSON.parse(savedUsers) as UserProfile[];
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            setUsers(parsedUsers);
          }
        } catch (error) {
          console.error('Failed to restore users', error);
        }
      }

      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession) as { userId: string };
          const restoredUsers = savedUsers ? (JSON.parse(savedUsers) as UserProfile[]) : seedUsers;
          const matchedUser = restoredUsers.find((user) => user.id === parsedSession.userId);
          if (matchedUser) {
            setCurrentUser(matchedUser);
          }
        } catch (error) {
          console.error('Failed to restore session', error);
        }
      }

      setIsHydrated(true);
    };

    void hydrateAuth();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [isHydrated, users]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (currentUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ userId: currentUser.id }));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [currentUser, isHydrated]);

  const value = useMemo<AuthContextType>(
    () => ({
      users,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      register: async (input) => {
        const email = input.email.trim().toLowerCase();
        if (!input.name.trim() || !email || !input.password.trim()) {
          return { ok: false, message: 'Please fill in all fields.' };
        }

        if (storefrontRuntime.backendEnabled) {
          const response = await fetch(buildApiUrl('/auth/register'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });
          const payload = await readJson<{ user?: UserProfile; users?: UserProfile[]; message?: string }>(
            response
          );
          if (!response.ok || !payload?.user) {
            return {
              ok: false,
              message: payload?.message ?? 'Unable to create account.',
            };
          }
          setUsers(payload.users ?? users);
          setCurrentUser(payload.user);
          return { ok: true };
        }

        if (users.some((user) => user.email.toLowerCase() === email)) {
          return { ok: false, message: 'An account with this email already exists.' };
        }

        const nextUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: input.name.trim(),
          email,
          password: input.password,
          role: normalizeRole('customer'),
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
        };

        setUsers((current) => [...current, nextUser]);
        setCurrentUser(nextUser);
        return { ok: true };
      },
      login: async (identifier, password) => {
        if (storefrontRuntime.backendEnabled) {
          const response = await fetch(buildApiUrl('/auth/login'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password }),
          });
          const payload = await readJson<{ user?: UserProfile; users?: UserProfile[]; message?: string }>(
            response
          );
          if (!response.ok || !payload?.user) {
            return {
              ok: false,
              message: payload?.message ?? 'Unable to sign in.',
            };
          }
          setUsers(payload.users ?? users);
          setCurrentUser(payload.user);
          return { ok: true };
        }

        const normalized = identifier.trim().toLowerCase();
        const matchedUser = users.find(
          (user) =>
            user.email.toLowerCase() === normalized ||
            user.username?.toLowerCase() === normalized
        );

        if (!matchedUser || matchedUser.password !== password) {
          return { ok: false, message: 'Invalid email/username or password.' };
        }

        setCurrentUser(matchedUser);
        return { ok: true };
      },
      changeCurrentUserPassword: async ({ currentPassword, newPassword, confirmPassword }) => {
        if (!currentUser) {
          return { ok: false, message: 'Please sign in before changing the password.' };
        }

        if (storefrontRuntime.backendEnabled) {
          const response = await fetch(buildApiUrl('/auth/change-password'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              currentPassword,
              newPassword,
              confirmPassword,
            }),
          });
          const payload = await readJson<{ user?: UserProfile; users?: UserProfile[]; message?: string }>(
            response
          );
          if (!response.ok || !payload?.user) {
            return {
              ok: false,
              message: payload?.message ?? 'Unable to update password.',
            };
          }
          setUsers(payload.users ?? users);
          setCurrentUser(payload.user);
          return { ok: true, message: 'Password updated successfully.' };
        }

        if (currentUser.password !== currentPassword) {
          return { ok: false, message: 'Current password is incorrect.' };
        }
        if (newPassword.trim().length < 8) {
          return { ok: false, message: 'New password must be at least 8 characters long.' };
        }
        if (newPassword !== confirmPassword) {
          return { ok: false, message: 'New password and confirm password do not match.' };
        }

        const nextUser: UserProfile = {
          ...currentUser,
          password: newPassword,
          mustChangePassword: false,
        };

        setUsers((current) =>
          current.map((user) => (user.id === currentUser.id ? nextUser : user))
        );
        setCurrentUser(nextUser);
        return { ok: true, message: 'Password updated successfully.' };
      },
      logout: () => setCurrentUser(null),
      isAdmin: currentUser?.role === 'admin',
    }),
    [currentUser, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
