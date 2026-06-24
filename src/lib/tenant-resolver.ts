export type ResolvedTenant = {
  host: string;
  slug: string | null;
};

export function resolveTenantFromHost(hostname: string | null | undefined): ResolvedTenant {
  const host = hostname?.trim() ?? '';
  const hostWithoutPort = host.split(':')[0] ?? '';

  if (!hostWithoutPort || hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return { host: hostWithoutPort, slug: null };
  }

  const [subdomain] = hostWithoutPort.split('.');

  if (!subdomain || subdomain === 'www') {
    return { host: hostWithoutPort, slug: null };
  }

  return { host: hostWithoutPort, slug: subdomain };
}