import axios from "axios";

function isSuperAdminRoute() {
  return window.location.pathname.startsWith("/super-admin");
}

function getTenantHeaders() {
  if (isSuperAdminRoute()) {
    return { tenantId: null, tenantCode: null };
  }

  const tenantId = localStorage.getItem("tenantId");
  const tenantCode =
    localStorage.getItem("tenantCode");

  return { tenantId, tenantCode };
}

if (typeof window !== "undefined") {
  const windowWithApiSetup = window as Window & {
    __apiSetupInitialized?: boolean;
  };

  if (!windowWithApiSetup.__apiSetupInitialized) {
    windowWithApiSetup.__apiSetupInitialized = true;

    axios.interceptors.request.use(
      (config) => {
        const { tenantId, tenantCode } = getTenantHeaders();

        if (tenantId) {
          config.headers.set("tenantId", tenantId);
        }

        if (tenantCode) {
          config.headers.set("tenantCode", tenantCode);
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    const originalFetch = window.fetch;

    window.fetch = async (input, init = {}) => {
      const { tenantId, tenantCode } = getTenantHeaders();
      const requestHeaders =
        input instanceof Request ? input.headers : undefined;
      const headers = new Headers(init.headers ?? requestHeaders);

      if (tenantId) {
        headers.set("tenantId", tenantId);
      }

      if (tenantCode) {
        headers.set("tenantCode", tenantCode);
      }

      return originalFetch(input, {
        ...init,
        headers,
      });
    };
  }
}
