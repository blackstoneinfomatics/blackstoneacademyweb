"use client";

import React, { useMemo, useState } from "react";

type Notification = {
  id: number;
  requestId: string;
  tenantName: string;
  category: string;
  description: string;
  receivedDate: string;
  seenDate: string;
};

const notificationData: Notification[] = [
  {
    id: 1,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Backup Request",
    description: "Tenant data backup requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "-",
  },
  {
    id: 2,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Plan Change Request",
    description: "Upgrade request to Premium plan",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 3,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Add Portal",
    description: "Teacher Portal activation requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 4,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Disable Portal",
    description: "Student Portal deactivation request",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 5,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Add Feature",
    description: "Additional user access requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 6,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Disable Feature",
    description: "Additional user access requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 7,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Purchase Update",
    description: "New product update available",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 8,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Purchase Update",
    description: "Tenant data backup requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 9,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Purchase Update",
    description: "Tenant data backup requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 10,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Purchase Update",
    description: "Tenant data backup requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
  {
    id: 11,
    requestId: "REQ-1048",
    tenantName: "Blackstone Academy",
    category: "Purchase Update",
    description: "Tenant data backup requested",
    receivedDate: "Sep 12, 2023",
    seenDate: "Sep 12, 2023",
  },
];

export default function NotificationTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] =
    useState<Notification[]>(notificationData);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterForm, setFilterForm] = useState({
    requestId: "",
    tenantName: "",
    category: "All Categories",
    description: "",
    receivedDate: "",
    seenDate: "",
  });

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const pageSize = 10;

  const categories = [
    "All Categories",
    ...Array.from(new Set(notificationData.map((item) => item.category))),
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

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <section className="flex min-w-0 flex-col rounded-[9px] bg-white p-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:bg-[#343434] dark:shadow-md">
      <h2 className="mb-3 text-[14px] font-semibold text-[#142342] dark:text-slate-100">
        All Notifications
      </h2>

      {/* Search and filter bar */}
      <div className="grid grid-cols-1 overflow-visible rounded-t-[6px] bg-[#fafafa] dark:bg-[#313131] sm:grid-cols-[1.1fr_1.05fr_1.05fr]">
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
            className="h-full w-full min-w-0 bg-transparent text-[10px] text-[#333] outline-none placeholder:text-[#999] dark:text-slate-200 dark:placeholder:text-slate-400"
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

          <span className="min-w-0 flex-1 truncate text-[10px] text-[#999] dark:text-slate-300">
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

        <div className="flex h-[29px] items-center px-3 text-[10px] text-[#999] dark:text-slate-400">
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
            <col className="w-[15%]" />
            <col className="w-[17%]" />
            <col className="w-[28%]" />
            <col className="w-[12%]" />
            <col className="w-[11%]" />
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
                  className="whitespace-nowrap px-2 text-[11px] font-medium"
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
                className={`h-[35px] border-b border-transparent ${
                  index % 2 === 0
                    ? "bg-white dark:bg-[#343434]"
                    : "bg-[#f7f7f7] dark:bg-[#3c3c3c]"
                }`}
              >
                <td className="whitespace-nowrap px-2 text-[10px] font-medium text-[#142342] dark:text-slate-100">
                  {item.requestId}
                </td>

                <td className="truncate px-2 text-[10px] font-medium text-[#142342] dark:text-slate-100">
                  {item.tenantName}
                </td>

                <td className="truncate px-2 text-[10px] text-[#263755] dark:text-slate-300">
                  {item.category}
                </td>

                <td className="truncate px-2 text-[10px] text-[#142342] dark:text-slate-200">
                  {item.description}
                </td>

                <td className="whitespace-nowrap px-2 text-[10px] text-[#426ba5] dark:text-sky-300">
                  {item.receivedDate}
                </td>

                <td className="whitespace-nowrap px-2 text-[10px] text-[#426ba5] dark:text-sky-300">
                  {item.seenDate}
                </td>

                <td className="relative px-2 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === item.id ? null : item.id)
                    }
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-[18px] leading-none text-[#646b75] hover:bg-[#e9edf5] dark:text-slate-300 dark:hover:bg-slate-700"
                    aria-label="Open notification actions"
                  >
                    ⋮
                  </button>

                  {openMenu === item.id && (
                    <div className="absolute right-10 top-6 z-50 w-full rounded-md border border-[#e5e7eb] bg-white shadow-lg dark:border-slate-700 dark:bg-[#2b2b2b]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNotification(item);
                          setShowDetailsModal(true);
                          setOpenMenu(null);
                        }}
                        className="block w-full rounded-md px-0 py-1 text-center text-[11px] text-[#263755] dark:text-slate-200"
                      >
                        View
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {currentData.length === 0 && (
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
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[#eeeeee] bg-[#f7f7f7] text-[15px] text-[#8793a5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
                    ? "border-[#426ba5] bg-white text-[#244b83] dark:border-sky-400 dark:bg-slate-700 dark:text-sky-200"
                    : "border-[#eeeeee] bg-[#f7f7f7] text-[#999] hover:bg-[#e9edf5] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
          className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[#eeeeee] bg-[#f7f7f7] text-[15px] text-[#8793a5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
            className="w-full max-w-[700px] rounded-[10px] border border-[#343b4d] bg-[#171b26] p-[18px] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-[18px] flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-white">
                Filter Notifications
              </h2>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="text-[18px] text-slate-400 transition hover:text-white"
                aria-label="Close filter dialog"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div>
                <label className="mb-[5px] block text-[12px] text-[#d5dced]">
                  Request ID
                </label>
                <input
                  type="text"
                  value={filterForm.requestId}
                  onChange={(event) =>
                    updateFilterForm("requestId", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-[#41495c] bg-[#222838] px-[10px] text-[11px] text-[#e2e8f0] outline-none"
                  placeholder="REQ-1048"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-[#d5dced]">
                  Tenant Name
                </label>
                <input
                  type="text"
                  value={filterForm.tenantName}
                  onChange={(event) =>
                    updateFilterForm("tenantName", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-[#41495c] bg-[#222838] px-[10px] text-[11px] text-[#e2e8f0] outline-none"
                  placeholder="Blackstone Academy"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-[#d5dced]">
                  Notification Category
                </label>
                <select
                  value={filterForm.category}
                  onChange={(event) =>
                    updateFilterForm("category", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-[#41495c] bg-[#222838] px-[10px] text-[11px] text-[#e2e8f0] outline-none"
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#222838] text-[#e2e8f0]"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-[#d5dced]">
                  Description
                </label>
                <input
                  type="text"
                  value={filterForm.description}
                  onChange={(event) =>
                    updateFilterForm("description", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-[#41495c] bg-[#222838] px-[10px] text-[11px] text-[#e2e8f0] outline-none"
                  placeholder="Backup requested"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-[#d5dced]">
                  Received Date
                </label>
                <input
                  type="text"
                  value={filterForm.receivedDate}
                  onChange={(event) =>
                    updateFilterForm("receivedDate", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-[#41495c] bg-[#222838] px-[10px] text-[11px] text-[#e2e8f0] outline-none"
                  placeholder="Sep 12, 2023"
                />
              </div>

              <div>
                <label className="mb-[5px] block text-[12px] text-[#d5dced]">
                  Seen Date
                </label>
                <input
                  type="text"
                  value={filterForm.seenDate}
                  onChange={(event) =>
                    updateFilterForm("seenDate", event.target.value)
                  }
                  className="h-[34px] w-full rounded-[6px] border border-[#41495c] bg-[#222838] px-[10px] text-[11px] text-[#e2e8f0] outline-none"
                  placeholder="Sep 12, 2023"
                />
              </div>
            </div>

            <div className="mt-[18px] flex justify-end gap-[12px]">
              <button
                type="button"
                onClick={clearFilters}
                className="h-[32px] min-w-[86px] rounded-[6px] border border-[#5668a9] bg-[#252c40] px-[15px] text-[11px] font-medium text-[#b9c7ff] hover:bg-[#303a54]"
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
      className="w-full max-w-[600px] rounded-[8px] border border-[#343b4d] bg-[#171b26] p-[14px] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="mb-[16px] text-[14px] font-semibold text-white">
        Notifications Details
      </h2>

      <div className="rounded-[8px] border border-[#343b4d] p-[13px]">
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
          <div>
            <label className="mb-[5px] block text-[13px] text-[#d5dced]">
              Notification Category
            </label>
            <input
              value={selectedNotification.category}
              readOnly
              className="h-[29px] w-full rounded-[4px] border border-[#41495c] bg-[#222838] px-[8px] text-[10px] text-[#e2e8f0] outline-none"
            />
          </div>

          <div>
            <label className="mb-[5px] block text-[13px] text-[#d5dced]">
              Tenant Name
            </label>
            <input
              value={selectedNotification.tenantName}
              readOnly
              className="h-[29px] w-full rounded-[4px] border border-[#41495c] bg-[#222838] px-[8px] text-[10px] text-[#e2e8f0] outline-none"
            />
          </div>

          <div>
            <label className="mb-[5px] block text-[13px] text-[#d5dced]">
              Received Date
            </label>
            <input
              value={selectedNotification.receivedDate}
              readOnly
              className="h-[29px] w-full rounded-[4px] border border-[#41495c] bg-[#222838] px-[8px] text-[10px] text-[#e2e8f0] outline-none"
            />
          </div>
        </div>

        <div className="mt-[11px] rounded-[8px] bg-[#222735] p-[11px]">
          <h3 className="mb-[10px] text-[11px] font-medium text-white">
            Requested Details
          </h3>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2">
            <div>
              <p className="mb-[6px] text-[11px] text-[#d5dced]">
                Data Range
              </p>
              <p className="text-[10px] text-[#aeb9ce]">
                Last 30 Days
              </p>
            </div>

            <div>
              <p className="mb-[6px] text-[11px] text-[#d5dced]">
                Requested By
              </p>
              <p className="text-[10px] text-[#aeb9ce]">
                Admin
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="mb-[6px] text-[11px] text-[#d5dced]">
                Description
              </p>
              <p className="text-[10px] leading-[17px] text-[#aeb9ce]">
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
          className="h-[32px] min-w-[76px] rounded-[6px] border border-[#5668a9] bg-[#252c40] px-[17px] text-[11px] font-medium text-[#b9c7ff] hover:bg-[#303a54]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            setNotifications((previous) =>
              previous.map((notification) =>
                notification.id === selectedNotification.id
                  ? {
                      ...notification,
                      seenDate: "Oct 10, 2026",
                    }
                  : notification
              )
            );
            setShowDetailsModal(false);
          }}
          className="h-[32px] min-w-[79px] rounded-[6px] bg-[#586fc3] px-[17px] text-[11px] font-medium text-white hover:bg-[#465db0]"
        >
          Process
        </button>
      </div>
    </div>
  </div>
)}
    </section>
  );
}