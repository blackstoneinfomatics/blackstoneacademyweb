import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Users } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type PortalCounts = {
  total: number;
  active: number;
  inactive: number;
  archived: number;
};

type PortalCountsResponse = {
  success: boolean;
  message?: string;
  data?: PortalCounts;
};

type TenantDetails = {
  tenantName?: string;
  organizationName?: string;
  domainName?: string;
  tenantCode?: string;
  status?: string;
  plan?: string;
  createdDate?: string;
};

type TenantDetailsResponse = TenantDetails & {
  success?: boolean;
  message?: string;
  data?: TenantDetails;
};

export default function AcademyHeader() {
  const [portalCounts, setPortalCounts] = useState<PortalCounts | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadTenant = async () => {
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) {
        setTenantError("Tenant ID is not available.");
        return;
      }

      try {
        const response = await axios.get<TenantDetailsResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.GET_BY_ID(tenantId)}`,
        );
        const responseData = response.data;
        const tenantData =
          "data" in responseData && responseData.data
            ? responseData.data
            : responseData;

        if (
          "success" in responseData &&
          responseData.success === false
        ) {
          throw new Error(
            responseData.message || "Tenant details request failed.",
          );
        }

        if (
          !tenantData.tenantName &&
          !tenantData.organizationName &&
          !tenantData.tenantCode
        ) {
          throw new Error("Tenant details response is invalid.");
        }

        if (isCurrent) setTenant(tenantData);
      } catch (error) {
        console.error("Failed to load tenant details:", error);
        if (isCurrent) setTenantError("Unable to load tenant details.");
      }
    };

    const loadPortalCounts = async () => {
      try {
        const response = await axios.get<PortalCountsResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PORTAL.GET_DASHBOARD_COUNT}`,
        );
        const counts = response.data.data;

        if (
          !response.data.success ||
          !counts ||
          typeof counts.total !== "number" ||
          typeof counts.active !== "number" ||
          typeof counts.inactive !== "number" ||
          typeof counts.archived !== "number"
        ) {
          throw new Error(
            response.data.message || "Portal count response is invalid.",
          );
        }

        if (isCurrent) setPortalCounts(counts);
      } catch (error) {
        console.error("Failed to load portal usage counts:", error);
        if (isCurrent) {
          setCountsError("Unable to load portal counts.");
        }
      }
    };

    void loadTenant();
    void loadPortalCounts();
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2.2fr_0.85fr]">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#414141] dark:bg-[#303030]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <Building2 size={27} className="text-[#344b93]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white">
              {tenant?.organizationName ||
                tenant?.tenantName ||
                (tenantError ? "Tenant unavailable" : "Loading tenant...")}
            </h2>
            {tenant?.status && (
              <span
                className={`text-[13px] ${
                  tenant.status.toLowerCase() === "active"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {tenant.status}
              </span>
            )}
          </div>
          <p className="text-[15px] text-gray-500 dark:text-gray-400">
            {tenant?.domainName || tenantError || ""}
          </p>
          <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
            {tenant?.createdDate && (
              <>
                Created on:{" "}
                {new Date(tenant.createdDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
              </>
            )}
            {tenant?.tenantCode && (
              <span className="text-[#536bc5]">
                ID: {tenant.tenantCode}
              </span>
            )}
          </p>
        </div>

        <span className="self-start rounded bg-[#e9efff] px-2 py-1 text-[12px] text-[#4264bc] dark:bg-[#39476b] dark:text-[#c3d0ff]">
          {tenant?.plan || "Plan"}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#414141] dark:bg-[#303030]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-[#3678ff] dark:bg-[#293b60] dark:text-[#8bb3ff]">
          <Users size={19} />
        </div>
        <div>
          <p className="text-[15px] text-[#3778ff] dark:text-[#8bb3ff]">
            Portal Usage
          </p>
          <p
            aria-live="polite"
            className="text-[21px] font-semibold text-gray-900 dark:text-white"
          >
            {portalCounts
              ? `${portalCounts.active} / ${portalCounts.total}`
              : countsError
                ? "N/A"
                : "Loading..."}
          </p>
          <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
            {portalCounts
              ? `${portalCounts.inactive} inactive`
              : countsError || "Active portals / total portals"}
          </p>
        </div>
      </div>
    </div>
  );
}