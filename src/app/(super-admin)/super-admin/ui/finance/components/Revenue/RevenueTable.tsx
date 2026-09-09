"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { downloadPdf } from "../downloadCsv";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface MonthlyRevenueItem {
  month: string;
  grossRevenue: number;
  tax: number;
  discount: number;
  collectedRevenue: number;
  pendingRevenue: number;
  refund: number;
  fee: number;
  netRevenue: number;
  netRevenueGrowth: number;
  trend: "up" | "down" | "neutral";
}

interface MonthlyRevenueResponse {
  success: boolean;
  data: {
    message: string;
    data: {
      items: MonthlyRevenueItem[];
      pagination: {
        page: number;
        limit: number;
        totalRecords: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
      };
    };
  };
}

const headers = [
  "Period",
  "Gross Revenue",
  "Discounts",
  "Refunds",
  "Net Revenue",
  "Collected Revenue",
  "Pending Revenue",
  "Growth",
];

const formatAmount = (amount: number) =>
  `₹ ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatPeriod = (month: string) => {
  const parsedDate = new Date(`${month} 1`);

  if (Number.isNaN(parsedDate.getTime())) {
    return month;
  }

  const previousDate = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth() - 1,
    1,
  );
  const currentMonth = parsedDate.toLocaleString("en-US", { month: "short" });
  const previousMonth = previousDate.toLocaleString("en-US", {
    month: "short",
  });

  return `${previousMonth} - ${currentMonth} ${parsedDate.getFullYear()}`;
};

const getTrendColor = (trend: MonthlyRevenueItem["trend"]) => {
  if (trend === "down") return "text-red-500";
  if (trend === "up") return "text-green-600";
  return "text-[#666]";
};

const getTrendSymbol = (trend: MonthlyRevenueItem["trend"]) => {
  if (trend === "down") return "↓";
  if (trend === "up") return "↑";
  return "";
};

const RevenueTable = () => {
  const [items, setItems] = useState<MonthlyRevenueItem[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.REVENUE.GET_MONTH_REVENUE}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch monthly revenue");
        }

        const result: MonthlyRevenueResponse = await response.json();
        if (!result.success) {
          throw new Error("Unable to load monthly revenue");
        }

        setItems(result.data.data.items);
      } catch (error) {
        console.error("Monthly revenue API error:", error);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  const filteredItems = items.filter((item) =>
    item.month.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage),
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const visibleIds = paginatedItems.map((item) => item.month);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedRows.includes(id));
  const selectedItems = items.filter((item) =>
    selectedRows.includes(item.month),
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    setSelectedRows([]);
  };

  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) return;

    await downloadPdf(
      "monthly-revenue.pdf",
      headers,
      selectedItems.map((item) => [
        formatPeriod(item.month),
        formatAmount(item.grossRevenue),
        formatAmount(item.discount),
        formatAmount(item.refund),
        formatAmount(item.netRevenue),
        formatAmount(item.collectedRevenue),
        formatAmount(item.pendingRevenue),
        `${item.netRevenueGrowth}%`,
      ]),
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-2 py-1">
        <h2 className="font-medium text-[#010E30E5]/90 dark:text-[#e6e6e6]">
          Revenue Summary
        </h2>

        <button
          type="button"
          onClick={handleDownloadSelected}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-2 rounded-md bg-[#496A96] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} />
          Download Revenue
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border-t border-[#E6EAF2] bg-white shadow-lg dark:border-[#3F3F3F] dark:bg-[#343434]">
        <div className="flex h-12 items-center justify-between border-b border-[#E6EAF2] px-4 dark:border-[#3F3F3F]">
          <div className="flex w-full max-w-md items-center">
            <Search size={17} className="text-[#A5AAB4]" />
            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by month"
              className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4] dark:text-[#E2E2E2]"
            />
          </div>
          <span className="whitespace-nowrap text-sm text-[#80848E] dark:text-[#B5B5B5]">
            Showing {filteredItems.length === 0 ? 0 : startIndex + 1} of{" "}
            {filteredItems.length}
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-[#4C6993] text-[14px] text-white dark:bg-[#44699d]">
              <tr>
                <th className="border border-[#466993] px-2 py-4 text-left font-medium">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) =>
                      setSelectedRows(
                        event.target.checked
                          ? Array.from(
                              new Set([...selectedRows, ...visibleIds]),
                            )
                          : selectedRows.filter(
                              (id) => !visibleIds.includes(id),
                            ),
                      )
                    }
                    className="h-4 w-4 accent-[#496A96]"
                  />
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="border border-[#466993] px-2 py-4 text-left font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr
                    key={item.month}
                    className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                  >
                    <td className="px-2 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.month)}
                        onChange={(event) =>
                          setSelectedRows((previous) =>
                            event.target.checked
                              ? [...previous, item.month]
                              : previous.filter((id) => id !== item.month),
                          )
                        }
                        className="h-4 w-4 accent-[#496A96]"
                      />
                    </td>
                    <td className="px-2 py-4">{formatPeriod(item.month)}</td>
                    <td className="px-2 py-4">
                      {formatAmount(item.grossRevenue)}
                    </td>
                    <td className="px-2 py-4">{formatAmount(item.discount)}</td>
                    <td className="px-2 py-4">{formatAmount(item.refund)}</td>
                    <td className="px-2 py-4">
                      {formatAmount(item.netRevenue)}
                    </td>
                    <td className="px-2 py-4">
                      {formatAmount(item.collectedRevenue)}
                    </td>
                    <td className="px-2 py-4">
                      {formatAmount(item.pendingRevenue)}
                    </td>
                    <td className="px-2 py-4">
                      <span className={getTrendColor(item.trend)}>
                        {getTrendSymbol(item.trend)}{" "}
                        {Math.abs(item.netRevenueGrowth)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} className="p-4 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#E6EAF2] px-4 py-3 dark:border-[#3F3F3F]">
        <button
          type="button"
          onClick={() =>
            setCurrentPage((previous) => Math.max(previous - 1, 1))
          }
          disabled={currentPageSafe === 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${
                currentPageSafe === page
                  ? "border-[#496A96] bg-white text-[#496A96] dark:bg-[#343434]"
                  : "border-[#E5E7EB] text-[#98A2B3]"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() =>
            setCurrentPage((previous) => Math.min(previous + 1, totalPages))
          }
          disabled={currentPageSafe === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default RevenueTable;
