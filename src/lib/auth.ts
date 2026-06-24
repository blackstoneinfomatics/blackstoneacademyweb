export const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function getDashboardPathForRole(role: string | null | undefined) {
  if (role === 'super-admin') {
    return '/super-admin/dashboard';
  }

  return '/dashboard';
}