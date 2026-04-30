import { storefrontRuntime } from '@/lib/runtime';

function cleanPath(pathname: string) {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function buildApiUrl(pathname: string) {
  return `${storefrontRuntime.apiBaseUrl}${cleanPath(pathname)}`;
}

export async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchJson<T>(pathname: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(buildApiUrl(pathname), init);
  return readJson<T>(response);
}
