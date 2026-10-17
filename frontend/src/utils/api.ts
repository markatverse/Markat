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

export const API_URL = getApiUrl();
export default getApiUrl;
