import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const cleanHost = hostname.split(':')[0].toLowerCase();
  const pathname = url.pathname;

  // Bypass static files and Next.js internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Advertising Platform Subdomain: ads.markatverse.com or ads.localhost
  if (cleanHost.startsWith('ads.')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-markatverse-platform', 'ads');
    requestHeaders.set('x-markatverse-host', hostname);

    if (!pathname.startsWith('/ads')) {
      url.pathname = `/ads${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders }
      });
    }
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // 2. Delivery Platform Subdomain: delivery.markatverse.com or delivery.localhost
  if (cleanHost.startsWith('delivery.')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-markatverse-platform', 'delivery');
    requestHeaders.set('x-markatverse-host', hostname);

    if (!pathname.startsWith('/delivery')) {
      url.pathname = `/delivery${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders }
      });
    }
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // 3. Main Marketplace Platform: markatverse.com or localhost
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-markatverse-platform', 'main');
  requestHeaders.set('x-markatverse-host', hostname);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

