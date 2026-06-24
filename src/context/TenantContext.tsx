'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type TenantContextValue = {
  tenantSlug: string | null;
  tenantHost: string | null;
  setTenantSlug: (slug: string | null) => void;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantHost, setTenantHost] = useState<string | null>(null);

  useEffect(() => {
    setTenantHost(window.location.hostname);
  }, []);

  const value = useMemo(
    () => ({ tenantSlug, tenantHost, setTenantSlug }),
    [tenantHost, tenantSlug],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}