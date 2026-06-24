import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromHost } from '@/lib/tenant-resolver';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  const hostHeader = request.headers.get('host');
  const tenant = resolveTenantFromHost(hostHeader);
  const requestHeaders = new Headers(request.headers);

  if (tenant.slug) {
    requestHeaders.set('x-tenant-slug', tenant.slug);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|api).*)'],
};