"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

// Interface mapping the API response fields
interface Tenant {
  _id: string;
  tenantId: string;
  tenantName: string;
  planName?: string;
  status: string;
  startDate?: string | null;
  nextRenewalDate?: string | null;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Tenant[];
}

const TenantsTable: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTenants = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(
          "http://localhost:5001/api/tenants/recent"
        );
        if (response.data?.success) {
          setTenants(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch recent tenants:", err);
        setError("Failed to load tenant data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTenants();
  }, []);

  // Format ISO dates into readable YYYY-MM-DD
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Capitalize or standardize status strings
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_6px_19px_rgba(153,153,153,0.15)] dark:bg-[#343434]">
      <h2 className="text-[16px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-5 py-3">
        Recent Tenants
      </h2>

      <div className="overflow-x-auto scrollbar-none h-full p-3">
        <div className="overflow-y-auto h-[325px] rounded-xl scrollbar-none">
          <table className="min-w-full text-xs border-collapse table-fixed">
            <thead className="text-[13px] bg-[#4C6993] text-white dark:bg-[#44699d]">
              <tr>
                {[
                  "Tenant Name",
                  "Plan",
                  "Created Date",
                  "Expiry Date",
                  "Status",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-4 px-2 font-semibold text-left border border-[#466993]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Loading tenants...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : tenants.length > 0 ? (
                tenants.map((item) => {
                  const statusFormatted = formatStatus(item.status);
                  return (
                    <tr
                      key={item._id}
                      className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                    >
                      {/* Tenant Name */}
                      <td className="py-4 px-2 truncate">{item.tenantName}</td>

                      {/* Plan Name */}
<td className="py-4 px-2">
  <span
    className={`w-[100px] text-center px-2 py-1 rounded-md text-[12px] font-medium inline-block ${
      item.planName === "Basic"
        ? "bg-[#DDF3F8] text-[#31C7E5] dark:bg-[#36737e33]"
        : "bg-[#DCDDF2] text-[#3169DE] dark:bg-[#435f9433]"
    }`}
  >
    {item.planName || "N/A"}
  </span>
</td>

                      {/* Created Date */}
                      <td className="py-4 px-2">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Expiry / Next Renewal Date */}
                      <td className="py-4 px-2">
                        {formatDate(item.nextRenewalDate)}
                      </td>

                      {/* Status */}
<td className="py-4 px-2">
  <span
    className={`w-[80px] text-center px-2 text-[12px] py-[3px] rounded-md inline-block ${
      statusFormatted === "Active"
        ? "bg-[#E4F4E8] text-[#51c36d] dark:bg-[#36477e33]"
        : statusFormatted === "Expired"
        ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
        : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
    }`}
  >
    {statusFormatted}
  </span>
</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantsTable;