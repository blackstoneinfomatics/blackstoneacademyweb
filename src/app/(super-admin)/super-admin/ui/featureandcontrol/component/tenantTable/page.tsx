"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { MdTune, MdCancel, MdCheckCircle } from "react-icons/md";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import ActionDropdown from "@/app/(super-admin)/super-admin/components/ActionMenu";

interface TenantConfigRow {
  tenantId: string;
  portalId: string;
  tenantName: string;
  domain: string;
  phoneNumber: string;
  email: string;
  startDate: string;
  plan: string;
  renewalDate: string;
  status: string;
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

// TODO: replace with a real tenant/portal list once a "list all tenants" API
// is available - /modules/tenant/config is scoped to a single tenant+portal.
const KNOWN_TENANT_PORTALS = [
  { tenantId: "TEN000010", portalId: "6aa002bb4afeaa160576aeec" },
];

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

  const arrow = metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "–";
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
      const rows = await Promise.all(
        KNOWN_TENANT_PORTALS.map(async ({ tenantId, portalId }) => {
          try {
            const params = new URLSearchParams({ tenantId, portalId });
            const response = await axios.get(
              `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MODULE_TENANT.GET_CONFIG}?${params.toString()}`,
            );

            if (!response.data.success) return null;

            const data = response.data.data;
            const tenantDetails = data?.tenantDetails ?? {};
            const subscriptionDetails = data?.subscriptionDetails ?? {};

            const row: TenantConfigRow = {
              tenantId: data?.tenantId ?? tenantId,
              portalId: data?.portalId ?? portalId,
              tenantName: tenantDetails.tenantName ?? "-",
              domain: tenantDetails.domainName ?? "-",
              phoneNumber: tenantDetails.phoneNumber ?? "-",
              email: tenantDetails.emailId ?? "-",
              startDate: formatDate(subscriptionDetails.startDate),
              plan: subscriptionDetails.planName ?? "-",
              renewalDate: formatDate(subscriptionDetails.nextRenewalDate),
              status: tenantDetails.status ?? "-",
            };
            return row;
          } catch (error) {
            console.error("Error fetching tenant config:", error);
            return null;
          }
        }),
      );

      setUserItems(rows.filter((row): row is TenantConfigRow => row !== null));
    };

    loadTenantConfigs();
  }, []);

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

              <span className="text-[12px] text-gray-500">
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

              <span className="text-[12px] text-gray-500">
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

              <span className="text-[12px] text-gray-500">
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
              border-y
              border-[#E7EAF3]
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
              "
            >
              <FiSearch className="text-gray-400 mr-2 text-[15px]" />

              <input
                placeholder="Search by keyword"
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
                cursor-pointer
              "
            >
              <div className="flex items-center">
                <MdTune className="text-gray-400 mr-2 text-[16px]" />

                <span className="text-[11px] text-gray-400">
                  Filter
                </span>
              </div>

              <FiChevronDown className="text-gray-400 text-[14px]" />
            </div>

            {/* Count */}
            <div className="flex items-center px-4 h-10">
              <span className="text-[11px] text-gray-400">
                Showing 10 Of 50
              </span>
            </div>
          </div>

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
                    "User",
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

                {userItems.length > 0 ? (
                  userItems.map((item, index) => (
                    <tr
                      key={index}
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
                            ${item.plan === "Standard"
                              ? "bg-[#2668EF24] text-[#2668EF]"
                              : "bg-[#585BDC24] text-[#585BDC]"
                            }
                          `}
                        >
                          {item.plan}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        -
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
                            ${item.status === "Active"
                              ? "bg-[#ECFDF3] text-[#377E36]"
                              : "bg-[#FDECEC] text-[#D34645]"
                            }
                          `}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <ActionDropdown
                          row={item}
                          items={[
                            {
                              label: "View Details",
                              onClick: (row) =>
                                router.push(
                                  `/super-admin/ui/featureandcontrol/featureandtenant?tenantId=${encodeURIComponent(
                                    row.tenantId,
                                  )}&portalId=${encodeURIComponent(
                                    row.portalId,
                                  )}`,
                                ),
                            },
                            {
                              label: "Edit",
                              onClick: () => {},
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-5 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center gap-1 px-3 py-4">

            {/* Previous */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
              "
            >
              <span className="text-[23px] color-[#999FAC]">‹</span>
            </button>

            {/* Page 1 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#203F78]
                text-[#203F78]
                bg-[#FAFAFB]
                text-[11px]
              "
            >
              1
            </button>

            {/* Page 2 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              2
            </button>

            {/* Page 3 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              3
            </button>

            {/* Dots */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              ...
            </button>

            {/* Page 10 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              10
            </button>

            {/* Next */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
              "
            >
              <span className="text-[23px] color-[#999FAC]">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usertable;
