/**
 * Unified API URL Resolver for MarkatVerse Frontend
 * Resolves NEXT_PUBLIC_API_URL safely across SSR, Vercel deployments, and local dev.
 */
export const getApiUrl = (): string => {
  // 1. Explicitly configured public API URL (Vercel Production / Staging)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Client-side browser execution: check current hostname
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3001`;
    }
    // Deployed domain fallback to Vercel backend
    return 'https://markat-test-9o1f.vercel.app';
  }

  // 3. Server-side render fallback
  return 'https://markat-test-9o1f.vercel.app';
};

// High-speed in-memory client-side cache and in-flight request deduplication
const requestCache = new Map<string, { data: any; expiry: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

export const fastFetch = async <T = any>(
  endpoint: string, 
  options?: RequestInit & { ttlMs?: number }
): Promise<T | null> => {
  const base = getApiUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const cacheKey = `${options?.method || 'GET'}:${url}:${JSON.stringify(options?.body || '')}`;
  const ttl = options?.ttlMs ?? 15000; // 15 seconds default cache

  // 1. Check in-memory cache for GET requests
  if ((!options?.method || options.method === 'GET') && ttl > 0) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }
  }

  // 2. Prevent duplicate simultaneous network requests (Request Deduplication)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return null;
      const data = await res.json();
      if ((!options?.method || options.method === 'GET') && ttl > 0) {
        requestCache.set(cacheKey, { data, expiry: Date.now() + ttl });
      }
      return data as T;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

export const API_URL = getApiUrl();
export default getApiUrl;
