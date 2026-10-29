"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { getNotificationTypeRoute } from "@/lib/notification";

type Notification = {
  id: string;
  _id: string;
  requestId: string;
  tenantName: string;
  category: string;
  notificationType: string;
  description: string;
  receivedDate: string;
  seenDate: string;
};

type ApiRecord = Record<string, unknown>;

const SEEN_DATE_STORAGE_KEY = "SuperAdminNotificationSeenDates";

function getStoredSeenDates(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(SEEN_DATE_STORAGE_KEY) || "{}",
    );
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, string>;
    }
  } catch (error) {
    console.error("Failed to read stored notification seen dates:", error);
  }

  return {};
}

function getString(record: ApiRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function formatDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function normalizeRequest(
  item: unknown,
  index: number,
  savedSeenDates: Record<string, string>,
): Notification {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("Notification request contains an invalid item.");
  }

  const record = item as ApiRecord;
  const tenant =
    record.tenant && typeof record.tenant === "object"
      ? (record.tenant as ApiRecord)
      : {};
  const _id = getString(record, ["_id", "id"]);
  const id = _id || getString(record, ["id"], `request-${index}`);
  const isSeen =
    record.isRead === true ||
    record.notificationStatus === "Seen" ||
    record.status === "Seen";
  const seenDateValue = getString(
    record,
    ["seenDate", "seenAt", "readAt", "readDate"],
    isSeen ? getString(record, ["updatedAt", "updatedDate"]) : "",
  );
  const storedSeenDate = _id ? savedSeenDates[_id] : undefined;

  return {
    id,
    _id,
    requestId: getString(record, ["requestId", "requestCode", "ticketId"], id),
    tenantName:
      getString(record, ["tenantName", "organizationName"]) ||
      getString(tenant, ["name", "tenantName"], "-"),
    category: getString(
      record,
      ["category", "notificationCategory", "notificationType", "requestType", "type"],
      "-",
    ),
    notificationType: getString(
      record,
      ["notificationType", "eventType", "type", "requestType"],
      "",
    ),
    description: getString(
      record,
      ["description", "messages", "message", "reason"],
      "-",
    ),
    receivedDate: formatDate(
      getString(record, ["receivedDate", "createdDate", "createdAt", "requestedAt"]),
    ),
    seenDate: formatDate(seenDateValue || storedSeenDate || ""),
  };
}

function getNotificationRoute(
  notification: Pick<Notification, "notificationType" | "category">,
): string | undefined {
  return (
    getNotificationTypeRoute(notification.notificationType) ??
    getNotificationTypeRoute(notification.category)
  );
}

function getRequestRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected notification request-list response.");
  }

  const data = payload as ApiRecord;
  for (const key of ["requests", "requestList", "notifications", "items"]) {
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }

  throw new Error("Notification request-list response does not contain a list.");
}

export default function NotificationTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterForm, setFilterForm] = useState({
    requestId: "",
    tenantName: "",
    category: "All Categories",
    description: "",
    receivedDate: "",
    seenDate: "",
  });

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessingNotification, setIsProcessingNotification] = useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const pageSize = 10;

  useEffect(() => {
    const fetchRequestList = async () => {
      const token = localStorage.getItem("SuperAdminAuthToken");
      if (!token) {
        setLoadError("Super-admin authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.REQUEST_LIST}?page=1&limit=1000`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("notification request-list response", data);
        const rows = getRequestRows(data?.data);
        console.log("row record",rows);
        const savedSeenDates = getStoredSeenDates();
        setNotifications(
          rows.map((row, index) =>
            normalizeRequest(row, index, savedSeenDates),
          ),
        );
      } catch (error) {
        console.error("Failed to fetch notification request list:", error);
        setLoadError("Unable to load notification requests.");
      } finally {
        setLoading(false);
      }
    };

    void fetchRequestList();
  }, []);

  const categories = [
    "All Categories",
    ...Array.from(new Set(notifications.map((item) => item.category))),
  ];

  const openFilterModal = () => {
    setFilterForm({
      requestId: "",
      tenantName: "",
      category,
      description: "",
      receivedDate: "",
      seenDate: "",
    });
    setShowFilterModal(true);
  };

  const updateFilterForm = (
    field: keyof typeof filterForm,
    value: string
  ) => {
    setFilterForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setCategory(filterForm.category);
    setPage(1);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilterForm({
      requestId: "",
      tenantName: "",
      category: "All Categories",
      description: "",
      receivedDate: "",
      seenDate: "",
    });
    setCategory("All Categories");
    setPage(1);
    setShowFilterModal(false);
  };

  const filteredData = useMemo(() => {
    return notifications.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch = [
        item.requestId,
        item.tenantName,
        item.category,
        item.description,
        item.receivedDate,
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchesCategory =
        category === "All Categories" || item.category === category;

      const matchesRequestId =
        !filterForm.requestId ||
        item.requestId
          .toLowerCase()
          .includes(filterForm.requestId.toLowerCase());

      const matchesTenantName =
        !filterForm.tenantName ||
        item.tenantName
          .toLowerCase()
          .includes(filterForm.tenantName.toLowerCase());

      const matchesDescription =
        !filterForm.description ||
        item.description
          .toLowerCase()
          .includes(filterForm.description.toLowerCase());

      const matchesReceivedDate =
        !filterForm.receivedDate ||
        item.receivedDate
          .toLowerCase()
          .includes(filterForm.receivedDate.toLowerCase());

      const matchesSeenDate =
        !filterForm.seenDate ||
        item.seenDate.toLowerCase().includes(filterForm.seenDate.toLowerCase());

      const matchesFormCategory =
        filterForm.category === "All Categories" ||
        item.category === filterForm.category;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRequestId &&
        matchesTenantName &&
        matchesDescription &&
        matchesReceivedDate &&
        matchesSeenDate &&
        matchesFormCategory
      );
    });
  }, [notifications, search, category, filterForm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;

  const currentData = filteredData.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleViewNotification = async (notification: Notification) => {
    console.log("notification", notification);
    const seenDateTime = new Date().toISOString();
    const seenDate =
      notification.seenDate === "-" ? formatDate(seenDateTime) : notification.seenDate;
    const updatedNotification = { ...notification, seenDate };

    setSelectedNotification(notification);
    setIsProcessingNotification(false);
    setShowDetailsModal(true);
    setOpenMenu(null);
    setActionError(null);

    if (notification.seenDate !== "-") return;

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? updatedNotification : item,
      ),
    );
    setSelectedNotification(updatedNotification);

    if (!notification._id) {
      setActionError("Unable to mark notification as seen: notification ID is missing.");
      return;
    }

    const token = localStorage.getItem("SuperAdminAuthToken");
    if (!token) {
      setActionError("Unable to mark notification as seen: authentication token is missing.");
      return;
    }

    try {
      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.NOTIFICATION.UPDATE}/${notification._id}`,
        {
          isRead: true,
          notificationStatus: "Seen",
          seenDate: seenDateTime,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      try {
        const savedSeenDates = getStoredSeenDates();
        localStorage.setItem(
          SEEN_DATE_STORAGE_KEY,
          JSON.stringify({
            ...savedSeenDates,
            [notification._id]: seenDateTime,
          }),
        );
      } catch (storageError) {
        console.error("Failed to store notification seen date locally:", storageError);
      }

      const responseBody =
        response.data && typeof response.data === "object"
          ? (response.data as ApiRecord)
          : {};
      const responseData =
        responseBody.data && typeof responseBody.data === "object"
          ? (responseBody.data as ApiRecord)
          : responseBody;
      const confirmedSeenDate = formatDate(
        getString(responseData, ["seenDate", "seenAt", "readAt", "readDate", "updatedAt"], seenDate),
      );
      const confirmedNotification = {
        ...notification,
        seenDate: confirmedSeenDate,
      };
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id ? confirmedNotification : item,
        ),
      );
      setSelectedNotification(confirmedNotification);
    } catch (error) {
      console.error("Failed to mark notification as seen:", error);
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id ? notification : item,
        ),
      );
      setSelectedNotification(notification);
      const responseData =
        axios.isAxiosError(error) &&
        error.response?.data &&
        typeof error.response.data === "object"
          ? (error.response.data as ApiRecord)
          : {};
      const message = getString(responseData, ["message", "error"]);
      setActionError(
        message
          ? `Unable to mark notification as seen: ${message}`
          : "Unable to mark notification as seen. Please try again.",
      );
    }
  };

  const processSelectedNotification = () => {
    if (!selectedNotification || isProcessingNotification) return;

    const route = getNotificationRoute(selectedNotification);
    if (route) {
      setIsProcessingNotification(true);
      router.push(route);
    }
  };

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <section className="flex min-w-0 flex-col rounded-[9px] bg-white p-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#343434] dark:shadow-md">
      <h2 className="mb-2 text-[14px] font-semibold text-[#142342] dark:text-slate-100">
        All Notifications
      </h2>
      {loadError && (
        <p className="mb-3 text-[12px] text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {/* Search and filter bar */}
      <div className="grid grid-cols-1 p-1.5 overflow-visible rounded-t-[6px] bg-[#FAFAFB] dark:bg-[#313131] sm:grid-cols-[1.1fr_1.05fr_1.05fr]">
        <div className="flex h-[29px] items-center gap-1.5 border-b border-[#eeeeee] px-2 dark:border-slate-700 sm:border-b-0 sm:border-r">
          <svg
            viewBox="0 0 24 24"
            className="h-[14px] w-[14px] shrink-0 text-[#aaaaaa] dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by keyword"
            className="h-full w-full min-w-0 bg-transparent text-[11px] text-[#333] outline-none placeholder:text-[#999] dark:text-slate-200 dark:placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={openFilterModal}
          className="relative flex h-[29px] items-center gap-1.5 border-b border-[#eeeeee] px-2 text-left dark:border-slate-700 sm:border-b-0 sm:border-r"
          aria-label="Open advanced filters"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[14px] w-[14px] shrink-0 text-[#aaaaaa] dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
            <path d="M7 3v6M14 9v6M11 15v6" />
          </svg>

          <span className="min-w-0 flex-1 truncate text-[11px] text-[#8f8f8f] dark:text-slate-300">
            {category === "All Categories" ? "Filter" : category}
          </span>

          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 shrink-0 text-[#aaaaaa] dark:text-slate-400"
            fill="currentColor"
          >
            <path d="m7 10 5 5 5-5z" />
          </svg>
        </button>

        <div className="flex h-[29px] items-center px-3 text-[11px] text-[#999] dark:text-slate-400">
          Showing {filteredData.length === 0 ? 0 : startIndex + 1}–
          {Math.min(startIndex + pageSize, filteredData.length)} of{" "}
          {filteredData.length}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[8%]" />
            <col className="w-[13%]" />
            <col className="w-[21%]" />
            <col className="w-[28%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
          </colgroup>

          <thead>
            <tr className="h-[32px] bg-[#4c6992] text-white">
              {[
                "Request ID",
                "Tenant Name",
                "Notification Category",
                "Description",
                "Received Date",
                "Seen Date",
                "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-2 py-3 text-[13px] font-medium"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-transparent ${
                  index % 2 === 0
                    ? "bg-white dark:bg-[#343434]"
                    : "bg-[#f7f7f7] dark:bg-[#3c3c3c]"
                }`}
              >
                <td className="whitespace-nowrap px-2 py-4 text-[11px] font-medium text-[#142342] dark:text-slate-100">
                  {item.requestId}
                </td>

                <td className="truncate px-2 text-[11px] font-medium text-[#142342] dark:text-slate-100">
                  {item.tenantName}
                </td>

                <td className="truncate px-2 text-[11px] text-[#263755] dark:text-slate-300" title={item.category}>
                  {item.category}
                </td>

                <td className="truncate px-2 text-[11px] text-[#142342] dark:text-slate-200" title={item.description}>
                  {item.description}
                </td>

                <td className="whitespace-nowrap px-2 text-[11px] text-[#426ba5] dark:text-sky-300">
                  {item.receivedDate}
                </td>

                <td className="whitespace-nowrap px-2 text-[11px] text-[#426ba5] dark:text-sky-300">
                  {item.seenDate}
                </td>

                <td className="relative px-2 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === item.id ? null : item.id)
                    }
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-[18px] leading-none text-[#646b75] hover:bg-[#e9edf5] dark:text-slate-300 dark:hover:bg-[#414141]"
                    aria-label="Open notification actions"
                  >
                    ⋮
                  </button>

                  {openMenu === item.id && (
                    <div className="absolute right-12 top-9 z-50 w-full rounded-md border border-[#e5e7eb] bg-white shadow-lg dark:border-[#515151] dark:bg-[#4a4a4a]">
                      <button
                        type="button"
                        onClick={() => void handleViewNotification(item)}
                        className="block w-full rounded-md px-0 py-1 text-center text-[11px] text-[#263755] dark:text-slate-200"
                      >
                        View
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="h-24 text-center text-[12px] text-[#888] dark:text-slate-300"
                >
                  Loading notification requests…
                </td>
              </tr>
            )}

            {!loading && !loadError && currentData.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="h-24 text-center text-[12px] text-[#888] dark:text-slate-300"
                >
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-auto flex flex-wrap items-center justify-end gap-1.5 pt-3">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setPage((previous) => Math.max(1, previous - 1))}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[#eeeeee] bg-[#f7f7f7] text-[15px] text-[#8793a5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#4e4e4e] dark:bg-[#3c3c3c] dark:text-slate-300"
          aria-label="Previous page"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .filter(
            (number) =>
              number === 1 ||
              number === totalPages ||
              Math.abs(number - currentPage) <= 1
          )
          .reduce<(number | "...")[]>((result, number, index, array) => {
            if (index > 0 && number - array[index - 1] > 1) {
              result.push("...");
            }

            result.push(number);
            return result;
          }, [])
          .map((number, index) =>
            number === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-[26px] w-[26px] items-center justify-center text-[10px] text-[#999] dark:text-slate-400"
              >
                ...
              </span>
            ) : (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                className={`h-[26px] min-w-[26px] rounded-[5px] border px-1 text-[10px] ${
                  currentPage === number
                    ? "border-[#426ba5] bg-white text-[#244b83] dark:border-[#7c7c7c] dark:bg-[#555555] dark:text-sky-200"
                    : "border-[#eeeeee] bg-[#f7f7f7] text-[#999] hover:bg-[#e9edf5] dark:border-[#606060] dark:bg-[#414141] dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {number}
              </button>
            )
          )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setPage((previous) => Math.min(totalPages, previous + 1))
          }
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[#eeeeee] bg-[#f7f7f7] text-[15px] text-[#8793a5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#4e4e4e] dark:bg-[#3c3c3c] dark:text-slate-300"
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {showFilterModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="w-full max-w-[700px] rounded-[10px] border border-gray-200 bg-white p-[18px] shadow-2xl dark:border-[#343b4d] dark:bg-[#171b26]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-[18px] flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                Filter Notifications
              </h2>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="text-[18px] text-gray-500 transition hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                aria-label="Close filter dialog"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div>
                <label className="mb-[5px] block text-[12px] text-gray-700 dark:text-[#d5dced]">
                  Request ID
                </label>
                <input
                  type="text"
                  value={filterForm.requestId}
                  onChange={(event) =>
                    updateFilterForm("requestId", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-gray-300 bg-white px-[10px] text-[11px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#586fc3] dark:border-[#41495c] dark:bg-[#222838] dark:text-[#e2e8f0] dark:placeholder:text-slate-500"
                  placeholder="REQ-1048"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-gray-700 dark:text-[#d5dced]">
                  Tenant Name
                </label>
                <input
                  type="text"
                  value={filterForm.tenantName}
                  onChange={(event) =>
                    updateFilterForm("tenantName", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-gray-300 bg-white px-[10px] text-[11px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#586fc3] dark:border-[#41495c] dark:bg-[#222838] dark:text-[#e2e8f0] dark:placeholder:text-slate-500"
                  placeholder="Blackstone Academy"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-gray-700 dark:text-[#d5dced]">
                  Notification Category
                </label>
                <select
                  value={filterForm.category}
                  onChange={(event) =>
                    updateFilterForm("category", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-gray-300 bg-white px-[10px] text-[11px] text-gray-900 outline-none focus:border-[#586fc3] dark:border-[#41495c] dark:bg-[#222838] dark:text-[#e2e8f0]"
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-white text-gray-900 dark:bg-[#222838] dark:text-[#e2e8f0]"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-gray-700 dark:text-[#d5dced]">
                  Description
                </label>
                <input
                  type="text"
                  value={filterForm.description}
                  onChange={(event) =>
                    updateFilterForm("description", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-gray-300 bg-white px-[10px] text-[11px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#586fc3] dark:border-[#41495c] dark:bg-[#222838] dark:text-[#e2e8f0] dark:placeholder:text-slate-500"
                  placeholder="Backup requested"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-gray-700 dark:text-[#d5dced]">
                  Received Date
                </label>
                <input
                  type="text"
                  value={filterForm.receivedDate}
                  onChange={(event) =>
                    updateFilterForm("receivedDate", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-gray-300 bg-white px-[10px] text-[11px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#586fc3] dark:border-[#41495c] dark:bg-[#222838] dark:text-[#e2e8f0] dark:placeholder:text-slate-500"
                  placeholder="Sep 12, 2023"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-gray-700 dark:text-[#d5dced]">
                  Seen Date
                </label>
                <input
                  type="text"
                  value={filterForm.seenDate}
                  onChange={(event) =>
                    updateFilterForm("seenDate", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-gray-300 bg-white px-[10px] text-[11px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#586fc3] dark:border-[#41495c] dark:bg-[#222838] dark:text-[#e2e8f0] dark:placeholder:text-slate-500"
                  placeholder="Sep 12, 2023"
                />
              </div>
            </div>

            <div className="mt-[18px] flex justify-end gap-[12px]">
              <button
                type="button"
                onClick={clearFilters}
                className="h-[32px] min-w-[86px] rounded-[6px] border border-gray-300 bg-gray-100 px-[15px] text-[11px] font-medium text-gray-700 hover:bg-gray-200 dark:border-[#5668a9] dark:bg-[#252c40] dark:text-[#b9c7ff] dark:hover:bg-[#303a54]"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={applyFilters}
                className="h-[32px] min-w-[92px] rounded-[6px] bg-[#586fc3] px-[15px] text-[11px] font-medium text-white hover:bg-[#465db0]"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
    onClick={() => setShowDetailsModal(false)}
  >
    <div
      className="w-full max-w-[600px] rounded-[8px] border border-[#343b4d] dark:border-[#5d5d5d] bg-[#fff] dark:bg-[#343434] p-[14px] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="mb-[16px] text-[16px] font-semibold">
        Notifications Details
      </h2>

      {actionError && (
        <p className="mb-3 text-[12px] text-red-600" role="alert">
          {actionError}
        </p>
      )}

      <div className="rounded-[8px] border border-[#ccc] dark:border-[#5d5d5d] p-[13px]">
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
          <div>
            <label className="mb-[5px] block text-[13px] dark:text-[#d5dced] text-[#031230]">
              Notification Category
            </label>
            <input
              value={selectedNotification.category}
              readOnly
              title={selectedNotification.category}
              className="h-[29px] w-full rounded-[4px] border border-[#ccc] dark:border-[#5d5d5d] dark:bg-[#2b2b2b] px-[8px] text-[10px] dark:text-[#e2e8f0] outline-none"
            />
          </div>

          <div>
            <label className="mb-[5px] block text-[13px] dark:text-[#d5dced]">
              Tenant Name
            </label>
            <input
              value={selectedNotification.tenantName}
              readOnly
              title={selectedNotification.tenantName}
              className="h-[29px] w-full rounded-[4px] border border-[#ccc] dark:border-[#5d5d5d] dark:bg-[#2b2b2b] px-[8px] text-[10px] dark:text-[#e2e8f0] outline-none"
            />
          </div>

          <div>
            <label className="mb-[5px] block text-[13px] dark:text-[#d5dced]">
              Received Date
            </label>
            <input
              value={selectedNotification.receivedDate}
              readOnly
              className="h-[29px] w-full rounded-[4px] border border-[#ccc] dark:border-[#5d5d5d] dark:bg-[#2b2b2b] px-[8px] text-[10px] dark:text-[#e2e8f0] outline-none"
            />
          </div>
        </div>

        <div className="mt-[11px] rounded-[8px] bg-[#F4F4F4] dark:bg-[#2b2b2b] p-[11px]">
          <h3 className="mb-[10px] text-[11px] font-medium dark:text-white text-[#010e30]">
            Requested Details
          </h3>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2">
            <div>
              <p className="mb-[6px] text-[11px] dark:text-[#d5dced] text-[#010e30]">
                Data Range
              </p>
              <p className="text-[10px] text-[#323c57] dark:text-[#aeb9ce]">
                Last 30 Days
              </p>
            </div>

            <div>
              <p className="mb-[6px] text-[11px] dark:text-[#d5dced] text-[#010e30]">
                Requested By
              </p>
              <p className="text-[10px] text-[#323c57] dark:text-[#aeb9ce]">
                Admin
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="mb-[6px] text-[11px] dark:text-[#d5dced] text-[#010e30]">
                Description
              </p>
              <p className="text-[10px] leading-[17px] text-[#323c57] dark:text-[#aeb9ce]">
                {selectedNotification.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[15px] flex justify-end gap-[14px]">
        <button
          type="button"
          onClick={() => setShowDetailsModal(false)}
          className="h-[32px] min-w-[76px] rounded-[6px] border border-[#576CBC] dark:border-[#5d5d5d] bg-[#eff1f9] dark:bg-[#404040] px-[17px] text-[11px] font-medium text-[#576cdc] dark:text-[#fff]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={processSelectedNotification}
          disabled={
            isProcessingNotification ||
              !getNotificationRoute(selectedNotification)
          }
          className="h-[32px] min-w-[76px] rounded-[6px] border border-[#5668a9] bg-[#576CBC] px-[17px] text-[11px] font-medium text-[#fff] disabled:cursor-not-allowed disabled:opacity-50"
          aria-live="polite"
        >
          {isProcessingNotification ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span
                className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Processing…
            </span>
          ) : (
            "Process"
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </section>
  );
}