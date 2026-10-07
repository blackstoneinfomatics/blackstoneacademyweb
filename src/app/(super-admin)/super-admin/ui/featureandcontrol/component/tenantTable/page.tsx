"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { MdTune, MdCancel, MdCheckCircle } from "react-icons/md";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";

interface TenantConfigRow {
  tenantId: string;
  tenantName: string;
  domain: string;
  phoneNumber: string;
  email: string;
  startDate: string;
  plan: string;
  renewalDate: string;
  status: string;
  startDateValue: string;
  renewalDateValue: string;
}

interface TenantAnalyticsMetric {
  currentCount: number;
  previousMonthCount: number;
  percentage: number;
  trend: "up" | "down" | "same";
}

interface TenantAnalyticsCards {
  totalTenants: TenantAnalyticsMetric;
  activeTenants: TenantAnalyticsMetric;
  trialTenants: TenantAnalyticsMetric;
  inactiveTenants: TenantAnalyticsMetric;
  expiringTenants: TenantAnalyticsMetric;
}

interface TenantAnalyticsCardsResponse {
  success: boolean;
  message: string;
  data: TenantAnalyticsCards;
}

const PAGE_LIMIT = 10;

const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) {
    return [1, "...", total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

interface TenantListItem {
  _id?: string;
  tenantCode?: string;
  tenantJobCode?: string;
  tenantId?: string;
  tenantName?: string;
  organizationName?: string;
  domainName?: string;
  domain?: string;
  website?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  emailId?: string;
  email?: string;
  createdDate?: string;
  createdAt?: string;
  startDate?: string;
  plan?: string;
  planName?: string;
  renewalDate?: string;
  status?: string;
}

interface TenantConfigurationItem {
  tenantId: string;
  portalName: string;
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const renderTrend = (metric?: TenantAnalyticsMetric) => {
  if (!metric) return null;

  const arrow =
    metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "–";
  const color =
    metric.trend === "up"
      ? "text-[#377E36]"
      : metric.trend === "down"
        ? "text-[#D34645]"
        : "text-gray-500";

  return (
    <span className={`text-[13px] font-medium ${color}`}>
      {arrow} {metric.percentage}%
    </span>
  );
};

const Usertable = () => {
  const [userItems, setUserItems] = useState<TenantConfigRow[]>([]);
  const [analyticsCards, setAnalyticsCards] =
    useState<TenantAnalyticsCards | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalyticsCards = async () => {
      try {
        const response = await axios.get<TenantAnalyticsCardsResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.GET_ANALYTICS_CARDS}`,
        );

        if (response.data.success) {
          setAnalyticsCards(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch tenant analytics cards:", error);
      }
    };

    fetchAnalyticsCards();
  }, []);

  useEffect(() => {
    const loadTenantConfigs = async () => {
      try {
        const tenantParams = new URLSearchParams({
          page: "1",
          limit: "1000",
        });
        const tenantResponse = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.GET_TENANT}?${tenantParams.toString()}`,
        );
        const tenantData = tenantResponse.data;
        if (tenantData?.success === false) {
          throw new Error(tenantData.message || "Tenant list request failed");
        }
        let tenants: TenantListItem[] = [];
        if (Array.isArray(tenantData?.tenants)) {
          tenants = tenantData.tenants;
        } else if (Array.isArray(tenantData?.data?.tenants)) {
          tenants = tenantData.data.tenants;
        } else if (Array.isArray(tenantData?.data?.items)) {
          tenants = tenantData.data.items;
        } else if (Array.isArray(tenantData)) {
          tenants = tenantData;
        } else if (Array.isArray(tenantData?.data)) {
          tenants = tenantData.data;
        } else if (tenantData?.data) {
          tenants = [tenantData.data];
        }

        const uniqueTenants = new Map<
          string,
          { tenant: TenantListItem; tenantId: string }
        >();
        tenants.forEach((tenant) => {
          const tenantId =
            tenant.tenantCode || tenant.tenantJobCode || tenant.tenantId;
          if (!tenantId) {
            console.error(
              "Skipping tenant without a tenant identifier:",
              tenant,
            );
            return;
          }

          const key = tenantId.trim().toLowerCase();
          if (!uniqueTenants.has(key)) {
            uniqueTenants.set(key, { tenant, tenantId });
          }
        });

        const rows = await Promise.all(
          Array.from(uniqueTenants.values()).map(async ({ tenant, tenantId }) => {
            try {
              const params = new URLSearchParams({ tenantId });
              const response = await axios.get<{
                success: boolean;
                message: string;
                data: TenantConfigurationItem[];
              }>(
                `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MODULE_TENANT.GET_CONFIG}?${params.toString()}`,
              );
              if (!response.data.success) {
                throw new Error(
                  response.data.message ||
                    `Tenant config request failed for ${tenantId}`,
                );
              }

              const configurations = Array.isArray(response.data.data)
                ? response.data.data
                : [];
              if (
                !configurations.some(
                  (configuration) =>
                    configuration.tenantId?.trim().toLowerCase() ===
                    tenantId.trim().toLowerCase(),
                )
              ) {
                return null;
              }

              const startDate =
                tenant.startDate ||
                tenant.createdDate ||
                tenant.createdAt ||
                "";
              const renewalDate = tenant.renewalDate || "";
              return {
                tenantId,
                tenantName: tenant.tenantName || tenant.organizationName || "-",
                domain:
                  tenant.domainName || tenant.domain || tenant.website || "-",
                phoneNumber: tenant.phoneNumber || tenant.mobileNumber || "-",
                email: tenant.emailId || tenant.email || "-",
                startDate: formatDate(startDate),
                plan: tenant.plan || tenant.planName || "-",
                renewalDate: formatDate(renewalDate),
                status: tenant.status || "-",
                startDateValue: startDate,
                renewalDateValue: renewalDate,
              } satisfies TenantConfigRow;
            } catch (error) {
              console.error(
                `Error fetching tenant config for ${tenantId}:`,
                error,
              );
              return null;
            }
          }),
        );

        setUserItems(rows.filter((row): row is TenantConfigRow => row !== null));
      } catch (error) {
        console.error("Error fetching tenant list:", error);
        setUserItems([]);
      }
    };

    loadTenantConfigs();
  }, []);

  const filteredUserItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const matchesText = (value: string, filterKey: string) =>
      !appliedFilters[filterKey] ||
      value.toLowerCase().includes(appliedFilters[filterKey].toLowerCase());
    const matchesDate = (value: string, filterKey: string) =>
      !appliedFilters[filterKey] ||
      value.slice(0, 10) === appliedFilters[filterKey];

    return userItems.filter((item) => {
      const matchesSearch =
        !search ||
        [
          item.tenantName,
          item.domain,
          item.startDate,
          item.plan,
          item.renewalDate,
          item.status,
        ].some((value) => value.toLowerCase().includes(search));

      return (
        matchesSearch &&
        matchesText(item.tenantName, "tenantName") &&
        matchesText(item.domain, "domain") &&
        matchesText(item.plan, "plan") &&
        (!appliedFilters.status || item.status === appliedFilters.status) &&
        matchesDate(item.startDateValue, "startDate") &&
        matchesDate(item.renewalDateValue, "renewalDate")
      );
    });
  }, [appliedFilters, searchTerm, userItems]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUserItems.length / PAGE_LIMIT),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedUserItems = useMemo(
    () =>
      filteredUserItems.slice(
        (safeCurrentPage - 1) * PAGE_LIMIT,
        safeCurrentPage * PAGE_LIMIT,
      ),
    [filteredUserItems, safeCurrentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appliedFilters]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const filterFields: FilterField[] = [
    {
      key: "tenantName",
      label: "Tenant Name",
      type: "text",
      placeholder: "All tenant names",
    },
    {
      key: "domain",
      label: "Domain",
      type: "text",
      placeholder: "All domains",
    },
    {
      key: "plan",
      label: "Plan",
      type: "select",
      placeholder: "All plans",
      options: Array.from(new Set(userItems.map((item) => item.plan)))
        .filter((plan) => plan !== "-")
        .map((plan) => ({ label: plan, value: plan })),
    },
    {
      key: "status",
      label: "Tenant Status",
      type: "select",
      placeholder: "All statuses",
      options: Array.from(new Set(userItems.map((item) => item.status)))
        .filter((status) => status !== "-")
        .map((status) => ({ label: status, value: status })),
    },
  ];

  const resetFilters = () => {
    setFilterValues({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] dark:bg-[#1F1F1F] p-2">
      {/* Main Container */}
      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 mt-3">
          {/* Total Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[112px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#EEE8FF]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <img
                  src="/assets/images/users.svg"
                  alt="User Icon"
                  className="text-[#7047FF]"
                />
              </div>

              <div>
                <p className="text-[14px] text-[#7047FF] font-medium">
                  Total Tenants
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {analyticsCards?.totalTenants.currentCount ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              {renderTrend(analyticsCards?.totalTenants)}

              <span className="text-[12px] text-gray-500 dark:text-gray-300">
                vs last Month
              </span>
            </div>
          </div>

          {/* Active Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#E4F7EA]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCheckCircle className="text-[#45BD67] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#45BD67] font-medium">
                  Active Tenants
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {analyticsCards?.activeTenants.currentCount ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              {renderTrend(analyticsCards?.activeTenants)}

              <span className="text-[12px] text-gray-500 dark:text-gray-300">
                vs last Month
              </span>
            </div>
          </div>

          {/* Inactive Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#FCE6E6]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCancel className="text-[#E53935] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#E53935] font-medium">
                  Inactive Tenants
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {analyticsCards?.inactiveTenants.currentCount ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              {renderTrend(analyticsCards?.inactiveTenants)}

              <span className="text-[12px] text-gray-500 dark:text-gray-300">
                vs last Month
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            bg-white
            dark:bg-[#343434]
            rounded-xl
            shadow-[0_4px_15px_rgba(0,0,0,0.05)]
            mt-3
            overflow-hidden
            mx-2
          "
        >
          {/* Section Title */}
          <div className="px-3 pt-3 pb-2">
            <h2 className="text-[16px] font-semibold text-[#24324B] dark:text-white">
              All Tenants
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              bg-[#FAFAFB]
              dark:bg-[#2E2E2E]
            "
          >
            {/* Search */}
            <div
              className="
                flex
                items-center
                px-3
                h-10
                border-r
                border-[#E7EAF3]
                dark:border-r
                dark:border-[#494b52]
              "
            >
              <FiSearch className="text-gray-400 mr-2 text-[15px]" />

              <input
                placeholder="Search by keyword"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="
                  w-full
                  outline-none
                  bg-transparent
                  text-[11px]
                  text-gray-600
                  dark:text-gray-200
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Filter */}
            <div
              className="
                flex
                items-center
                justify-between
                px-3
                h-10
                border-r
                border-[#E7EAF3]
                dark:border-r
                dark:border-[#494b52]
                cursor-pointer
              "
              onClick={() => setShowFilter(true)}
            >
              <div className="flex items-center">
                <MdTune className="text-gray-400 mr-2 text-[16px]" />

                <span className="text-[11px] text-gray-400">Filter</span>
              </div>

              <FiChevronDown className="text-gray-400 text-[14px]" />
            </div>

            {/* Count */}
            <div className="flex items-center px-4 h-10">
              <span className="text-[11px] text-gray-400">
                Showing {pagedUserItems.length} Of {filteredUserItems.length}
              </span>
            </div>
          </div>

          <FilterDrawer
            open={showFilter}
            title="Filter Tenants"
            fields={filterFields}
            values={filterValues}
            resultCount={filteredUserItems.length}
            onClose={() => setShowFilter(false)}
            onApply={(values) => {
              setFilterValues(values);
              setAppliedFilters(values);
              setCurrentPage(1);
              setShowFilter(false);
            }}
            onReset={resetFilters}
          />

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-xs border-collapse">
              {/* Table Header */}
              <thead
                className="
                  bg-[#4C6993]
                  text-white
                  text-[13px]
                  dark:bg-[#44699D]
                "
              >
                <tr>
                  {[
                    "Tenants Name",
                    "Domain",
                    "Phone Number",
                    "Email",
                    "start Date",
                    "Plan",
                    "Renewal Date",
                    "Tenant Status",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="
                        py-3
                        px-3
                        whitespace-nowrap
                        font-medium
                        text-left
                        text-[11px]
                        border-r
                        border-[#466993]
                      "
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {pagedUserItems.length > 0 ? (
                  pagedUserItems.map((item) => (
                    <tr
                      key={item.tenantId}
                      className="
                        text-[11px]
                        odd:bg-[#F8F8F8]
                        even:bg-white
                        dark:odd:bg-[#2C2C2C]
                        dark:even:bg-[#303030]
                      "
                    >
                      {/* user Name */}
                      <td className="py-3 px-3 font-medium text-[#24324B] dark:text-white whitespace-nowrap">
                        {item.tenantName}
                      </td>

                      {/* user Type */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.domain}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.phoneNumber}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.email}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.startDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-md
                            text-[9px]
                            font-medium
                            ${
                              item.plan === "Standard"
                                ? "bg-[#2668EF24] text-[#2668EF]"
                                : "bg-[#585BDC24] text-[#585BDC]"
                            }
                          `}
                        >
                          {item.plan}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.renewalDate}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-md
                            text-[9px]
                            font-medium
                            ${
                              item.status === "Active"
                                ? "bg-[#ECFDF3] dark:bg-[#4b514e] text-[#377E36] dark:text-[#8ebf8d]"
                                : "bg-[#FDECEC] text-[#D34645]"
                            }
                          `}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-2 text-center text-[10px]">
                        <ActionDropdown
                          row={item}
                          items={[
                            {
                              label: "View Details",
                              onClick: (row) =>
                                router.push(
                                  `/super-admin/ui/featureandcontrol/featureandtenant?tenantId=${encodeURIComponent(
                                    row.tenantId,
                                  )}`,
                                ),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-5 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-1 px-3 py-4">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                dark:border-gray-600
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
                dark:bg-[#3A3A3A]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <span className="text-[23px]">‹</span>
            </button>

            {getPageNumbers(safeCurrentPage, totalPages).map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-7 w-7 items-center justify-center text-[11px] text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                  className={`h-7 w-7 rounded-md border text-[11px] ${
                    page === safeCurrentPage
                      ? "border-[#203F78] bg-[#FAFAFB] text-[#203F78] dark:border-[#8296E6] dark:bg-[#3A3A3A] dark:text-[#8296E6]"
                      : "border-[#E6E7EA] bg-[#F5F5F2] text-gray-400 dark:border-gray-600 dark:bg-[#3A3A3A]"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                dark:border-gray-600
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
                dark:bg-[#3A3A3A]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <span className="text-[23px]">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usertable;
