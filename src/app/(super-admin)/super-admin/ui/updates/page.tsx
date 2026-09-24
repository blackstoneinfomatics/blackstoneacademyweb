'use client';
import React, { useEffect, useState } from 'react'
import BaseLayout3 from '../../components/BaseSuperLayout'
import SuperAdminHeader from '../../components/SuperAdminHeader'
import {
  X,
  ChevronDown,
  Search,
  ChevronRight,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";
import { BsThreeDotsVertical } from 'react-icons/bs';
import UpdateFeatureForm from './components/UpdateFeatureForm';
import UpdateDetails from './components/UpdateDetails';
import CreateUpdateForm, { UpdateFormData } from './components/CreateUpdateForm';
import type { ProductUpdate, UpdateFeaturePayload, UpdatePriority, UpdateStatus } from './types';
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// ─────────────────────────────────────────────
// Dashboard cards API
// ─────────────────────────────────────────────

interface CardMetric {
  count: number;
  percentage: number;
  direction: "up" | "down";
}

interface DashboardCardsResponse {
  success: boolean;
  message: string;
  data: {
    totalUpdates: CardMetric;
    publishedUpdates: CardMetric;
    scheduledUpdates: CardMetric;
  };
}

// ─────────────────────────────────────────────
// Card icons (images)                          
// ─────────────────────────────────────────────
const CARD_ICONS = {
  totalUpdates: "/assets/images/superadmin-updates-totalupdates.svg",
  publishedUpdates: "/assets/images/superadmin-updates-publishedupdates.svg",
  scheduledUpdates: "/assets/images/superadmin-updates-scheduledupdates.svg",
  totalViews: "/assets/images/superadmin-updates-totalviews.svg",
};

const initialUpdates: ProductUpdate[] = [
  {
    updateId: "UPD-1001",
    title: "Bulk Invoice Download",
    description: "Admins can now download all invoices for a billing cycle as a single ZIP file.",
    category: "Feature",
    priority: "Medium",
    audience: "All Tenants",
    releaseDate: "2026-09-15",
    status: "Published",
    affectedTenants: 288,
  },
  {
    updateId: "UPD-1002",
    title: "Fixed attendance sync delay",
    description: "Resolved an issue causing attendance records to lag behind by up to an hour.",
    category: "Bug Fix",
    priority: "High",
    audience: "Teachers",
    releaseDate: "2026-09-10",
    status: "Published",
    affectedTenants: 142,
  },
  {
    updateId: "UPD-1003",
    title: "Two-factor authentication",
    description: "Optional 2FA login for admin and super-admin accounts to improve account security.",
    category: "Security",
    priority: "High",
    audience: "Admins",
    releaseDate: "2026-09-25",
    status: "Scheduled",
  },
  {
    updateId: "UPD-1004",
    title: "Scheduled maintenance window",
    description: "Platform will be briefly unavailable for database upgrades.",
    category: "Maintenance",
    priority: "Medium",
    audience: "All Tenants",
    releaseDate: "2026-09-20",
    status: "Scheduled",
  },
  {
    updateId: "UPD-1005",
    title: "New fee reminder templates",
    description: "Three new customizable templates added for fee reminder notifications.",
    category: "Feature",
    priority: "Low",
    audience: "Enterprise Plan",
    releaseDate: "2026-08-28",
    status: "Published",
  },
  {
    updateId: "UPD-1006",
    title: "Mobile app performance improvements",
    description: "Reduced load time on the student mobile app dashboard by 40%.",
    category: "Feature",
    priority: "Medium",
    audience: "Students",
    releaseDate: "2026-08-18",
    status: "Published",
  },
  {
    updateId: "UPD-1007",
    title: "Upcoming: AI-assisted report cards",
    description: "Draft feature for auto-generating narrative comments on report cards.",
    category: "Feature",
    priority: "Low",
    audience: "Teachers",
    releaseDate: "2026-10-05",
    status: "Draft",
  },
  {
    updateId: "UPD-1008",
    title: "Deprecated legacy export format",
    description: "The old CSV v1 export format is no longer available; use CSV v2 instead.",
    category: "Announcement",
    priority: "Low",
    audience: "All Tenants",
    releaseDate: "2026-07-30",
    status: "Archived",
  },
  {
    updateId: "UPD-1009",
    title: "Payment gateway timeout fix",
    description: "Fixed intermittent timeout errors during checkout on the tenant billing page.",
    category: "Bug Fix",
    priority: "High",
    audience: "Admins",
    releaseDate: "2026-09-05",
    status: "Published",
  },
  {
    updateId: "UPD-1010",
    title: "Holiday support hours",
    description: "Draft announcement covering support availability over the upcoming holidays.",
    category: "Announcement",
    priority: "Low",
    audience: "All Tenants",
    releaseDate: "2026-10-12",
    status: "Draft",
  },
];

// ─────────────────────────────────────────────
// Build card data from API (with fallback)
// ─────────────────────────────────────────────
const buildCardsFromApi = (
  apiData: DashboardCardsResponse["data"] | null,
  fallbackUpdates: ProductUpdate[],
) => {
  const total = apiData?.totalUpdates?.count ?? fallbackUpdates.length;
  const published =
    apiData?.publishedUpdates?.count ??
    fallbackUpdates.filter((u) => u.status === "Published").length;
  const scheduled =
    apiData?.scheduledUpdates?.count ??
    fallbackUpdates.filter((u) => u.status === "Scheduled").length;

  return [
    {
      title: "Total Updates",
      value: total.toString(),
      percentage: apiData?.totalUpdates?.percentage ?? 14,
      direction: apiData?.totalUpdates?.direction ?? "up",
      image: CARD_ICONS.totalUpdates,
      iconBg: "bg-[#E5DFFD]",
      titleColor: "text-[#5225FC]",
      trend: "vs last Month",
    },
    {
      title: "Published Updates",
      value: published.toString(),
      percentage: apiData?.publishedUpdates?.percentage ?? 14,
      direction: apiData?.publishedUpdates?.direction ?? "up",
      image: CARD_ICONS.publishedUpdates,
      iconBg: "bg-[#E3F4E7]",
      titleColor: "text-[#40BD5F]",
      trend: "vs last Month",
    },
    {
      title: "Scheduled Updates",
      value: scheduled.toString(),
      percentage: apiData?.scheduledUpdates?.percentage ?? 14,
      direction: apiData?.scheduledUpdates?.direction ?? "up",
      image: CARD_ICONS.scheduledUpdates,
      iconBg: "bg-[#FCF0DC]",
      titleColor: "text-[#F59E0B]",
      trend: "vs last Month",
    },
    {

      title: "Total Views",
      value: "-",
      percentage: undefined,
      direction: undefined,
      image: CARD_ICONS.totalViews,
      iconBg: "bg-[#E6EAF2]",
      titleColor: "text-[#576CBC]",
      trend: "- vs last Month",
    },
  ];
};

type FilterState = {
  title: string;
  category: string;
  priority: string;
  audience: string;
  status: string;
  fromDate: string;
  toDate: string;
};

const INITIAL_FILTERS: FilterState = {
  title: "",
  category: "All",
  priority: "All",
  audience: "All",
  status: "All",
  fromDate: "",
  toDate: "",
};

const applyFilters = (
  items: ProductUpdate[],
  search: string,
  filters: FilterState,
) => {
  const term = search.toLowerCase().trim();

  return items.filter((item) => {
    const matchesSearch =
      !term ||
      [
        item.updateId,
        item.title,
        item.description,
        item.category,
        item.priority,
        item.audience,
        item.releaseDate,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

    const matchesTitle =
      !filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase());

    const matchesCategory =
      filters.category === "All" || item.category === filters.category;
    const matchesPriority =
      filters.priority === "All" || item.priority === filters.priority;
    const matchesAudience =
      filters.audience === "All" || item.audience === filters.audience;
    const matchesStatus =
      filters.status === "All" || item.status === filters.status;

    const rowDate = new Date(item.releaseDate);
    const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters.toDate ? new Date(filters.toDate) : null;

    const matchesDate =
      (!fromDate || rowDate >= fromDate) && (!toDate || rowDate <= toDate);

    return (
      matchesSearch &&
      matchesTitle &&
      matchesCategory &&
      matchesPriority &&
      matchesAudience &&
      matchesStatus &&
      matchesDate
    );
  });
};

const priorityBadgeClass = (priority: UpdatePriority) => {
  switch (priority) {
    case "High":
      return "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]";
    case "Medium":
      return "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]";
    default:
      return "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]";
  }
};

const statusBadgeClass = (status: UpdateStatus) => {
  switch (status) {
    case "Published":
      return "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]";
    case "Scheduled":
      return "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]";
    case "Archived":
      return "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]";
    default:
      return "bg-[#E6EAF2] text-[#576CBC] dark:bg-[#576CBC33]";
  }
};

const page = () => {
  const [updateList, setUpdateList] = useState<ProductUpdate[]>(initialUpdates);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewUpdateModal, setViewUpdateModal] = useState<ProductUpdate | null>(null);
  const [editUpdate, setEditUpdate] = useState<ProductUpdate | null>(null);
  const [activeTab, setActiveTab] = useState<"feature" | "tenants">("feature");

  /* ====== DASHBOARD CARDS API STATE ====== */
  const [cardsData, setCardsData] = useState<DashboardCardsResponse["data"] | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  /* ====== CREATE UPDATE STATE ====== */
  const [showCreateUpdate, setShowCreateUpdate] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
    updateTitle: "",
    category: "Feature Release",
    audience: "allTenants",
    selectedTenants: "",
    description: "",
    publishDate: "",
    priority: "Medium",
    attachments: null,
    sendEmail: false,
    sendInAppNotification: false,
  });

  const itemsPerPage = 5;

  const cards = buildCardsFromApi(cardsData, updateList);

  const categoryOptions = Array.from(new Set(updateList.map((u) => u.category)));
  const priorityOptions = Array.from(new Set(updateList.map((u) => u.priority)));
  const audienceOptions = Array.from(new Set(updateList.map((u) => u.audience)));
  const statusOptions = Array.from(new Set(updateList.map((u) => u.status)));

  const filteredItems = applyFilters(updateList, search, appliedFilters);
  const previewFilteredItems = applyFilters(updateList, search, draftFilters);

  /* ====== FETCH DASHBOARD CARDS ====== */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setCardsLoading(true);
      setCardsError(null);
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.UPDATES.GET_DASHBOARD_CARDS}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: DashboardCardsResponse = await res.json();

        if (!cancelled && json.success) {
          setCardsData(json.data);
        }
      } catch (e: any) {
        if (!cancelled) setCardsError(e.message ?? "Failed to load cards");
      } finally {
        if (!cancelled) setCardsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateFeatureSubmit = (payload: UpdateFeaturePayload) => {
    setUpdateList((prev) =>
      prev.map((u) =>
        u.updateId === payload.updateId
          ? {
            ...u,
            title: payload.title,
            category: payload.category,
            description: payload.description,
            releaseDate: payload.publishDate,
            priority: payload.priority,
            audience: payload.audience,
          }
          : u,
      ),
    );
    setEditUpdate(null);
  };

  /* ====== CREATE UPDATE HANDLERS ====== */
  const handleUpdateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAudienceChange = (audience: "allTenants" | "selectTenants") => {
    setUpdateFormData((prev) => ({ ...prev, audience }));
  };

  const handleSendEmailChange = (checked: boolean) =>
    setUpdateFormData((prev) => ({ ...prev, sendEmail: checked }));

  const handleSendInAppChange = (checked: boolean) =>
    setUpdateFormData((prev) => ({ ...prev, sendInAppNotification: checked }));

  const handleUpdateFileChange = (file: File | null) =>
    setUpdateFormData((prev) => ({ ...prev, attachments: file }));

  const resetUpdateForm = () => {
    setUpdateFormData({
      updateTitle: "",
      category: "Feature Release",
      audience: "allTenants",
      selectedTenants: "",
      description: "",
      publishDate: "",
      priority: "Medium",
      attachments: null,
      sendEmail: false,
      sendInAppNotification: false,
    });
  };

  const closeCreateUpdateModal = () => {
    setShowCreateUpdate(false);
    resetUpdateForm();
  };

  const handleCreateUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateFormData.updateTitle.trim()) {
      alert("Enter update title");
      return;
    }

    setIsPublishing(true);

    try {
      console.log("Update payload:", updateFormData);

      setUpdateList((prev) => [
        {
          updateId: `UPD-${1000 + prev.length + 1}`,
          title: updateFormData.updateTitle,
          description: updateFormData.description,
          category: updateFormData.category,
          priority: updateFormData.priority as UpdatePriority,
          audience:
            updateFormData.audience === "allTenants"
              ? "All Tenants"
              : "Select Tenants",
          releaseDate:
            updateFormData.publishDate ||
            new Date().toISOString().slice(0, 10),
          status: "Draft",
        },
        ...prev,
      ]);

      closeCreateUpdateModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) =>
      value &&
      !(
        (key === "title" && value === "") ||
        (key !== "title" && value === "All")
      ),
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenu(null);
  }, [search, appliedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <BaseLayout3>
      <SuperAdminHeader currentSection='Updates' />

      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F] px-4">
        {/* ================= HEADER WITH CREATE UPDATE ================= */}
        <div className="flex items-center justify-between mt-2 py-2">
          <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-2 py-3">
            Institute Updates
          </h2>

          <button
            onClick={() => setShowCreateUpdate(true)}
            className="bg-[#5872C5] hover:bg-[#4D66B3] text-white text-[12px] font-medium px-4 py-3 rounded-lg transition"
          >
            Create Update
          </button>
        </div>

        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-[#ffffff] to-[#F6F6FF] dark:from-[#2c2c2c] dark:to-[#343434] rounded-2xl px-4 py-3 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-full mt-2 flex items-center justify-center ${card.iconBg}`}
                >
                  {cardsLoading ? (
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300 dark:bg-[#454545]" />
                  ) : (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-14 h-14 object-contain"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <p className={`text-md mt-[4px] font-medium ${card.titleColor}`}>
                    {card.title}
                  </p>

                  {cardsLoading ? (
                    <div className="h-7 w-12 animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                  ) : (
                    <h2 className="text-[25px] font-semibold text-gray-800 dark:text-white mt-1">
                      {card.value}
                    </h2>
                  )}
                </div>
              </div>

              {/*  Trend row — arrow + % + "vs last Month" */}
              <p className="text-sm mt-3 ml-[100px] flex flex-row items-center gap-2">
                {card.percentage !== undefined && card.percentage !== null ? (
                  <span
                    className={`flex flex-row items-center gap-x-1 font-medium ${card.direction === "down"
                      ? "text-[#E53E3E] dark:text-[#FC8181]"
                      : "text-[#40BD5F] dark:text-[#68D391]"
                      }`}
                  >
                    {card.direction === "down" ? "↓" : "↑"} {card.percentage}%
                  </span>
                ) : null}

                {card.trend ? (
                  <span className="text-[#646464] dark:text-gray-400">
                    {card.trend}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </div>

        <div className="">
          <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-2 py-3">
            All Updates
          </h2>
          <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434] overflow-hidden rounded-b-xl border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
            <div className="grid grid-cols-1 border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:grid-cols-3">
              <div className="flex h-12 items-center border-b border-[#E6EAF2] px-4 dark:border-[#3F3F3F] md:border-b-0 md:border-r">
                <Search size={17} className="text-[#A5AAB4]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, description..."
                  className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4] dark:text-[#E2E2E2]"
                />
              </div>

              <div className="border-b border-[#E6EAF2] dark:border-[#3F3F3F] md:border-b-0 md:border-r">
                <button
                  onClick={() => {
                    setDraftFilters(appliedFilters);
                    setShowFilterPanel(true);
                  }}
                  className="flex h-12 w-full items-center justify-between px-4 text-sm text-[#80848E] transition hover:bg-gray-50 dark:hover:bg-[#2F2F2F]"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-[#576CBC] px-2 py-[2px] text-[11px] text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>

                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex h-12 items-center px-4 text-sm text-[#80848E] dark:text-[#B5B5B5]">
                Showing {showingStart} of {filteredItems.length}
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-none h-full">
              <div className="h-[380px] rounded-b-xl scrollbar-none">
                <table className="min-w-full text-xs border-collapse table-fixed">
                  <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d]">
                    <tr>
                      {[
                        "Title",
                        "Description",
                        "Category",
                        "Priority",
                        "Audience",
                        "Release Date",
                        "Status",
                        "Action",
                      ].map((header) => (
                        <th
                          key={header}
                          className="py-4 px-2 font-medium text-left border border-[#466993]"
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
                          key={item.updateId}
                          className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                        >
                          <td className="py-4 px-2 font-medium">{item.title}</td>
                          <td className="py-4 px-2 truncate max-w-[220px]" title={item.description}>
                            {item.description}
                          </td>
                          <td className="py-4 px-2">{item.category}</td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 text-[12px] py-[3px] rounded-md ${priorityBadgeClass(item.priority)}`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-4 px-2">{item.audience}</td>
                          <td className="py-4 px-2">{item.releaseDate}</td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 text-[12px] py-[3px] rounded-md ${statusBadgeClass(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 relative">
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === item.updateId ? null : item.updateId)
                              }
                              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <BsThreeDotsVertical size={16} />
                            </button>

                            {openMenu === item.updateId && (
                              <div className="absolute right-4 top-12 z-50 w-40 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border dark:border-gray-700">
                                <button
                                  className="w-full text-left px-4 border-b py-2 text-xs dark:border-gray-700 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    setEditUpdate(item);
                                  }}
                                >
                                  Update Feature
                                </button>

                                <button
                                  className="w-full text-left px-4 border-b py-2 text-xs dark:border-gray-700 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    setViewUpdateModal(item);
                                  }}
                                >
                                  Details
                                </button>

                                <button
                                  className="w-full text-left px-4 py-2 text-xs text-[#98A2B3] dark:hover:bg-gray-700"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-4 text-center">
                          No updates found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E6EAF2] px-4 py-3 dark:border-[#3F3F3F]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPageSafe === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${currentPageSafe === p
                  ? "border-[#496A96] bg-white text-[#496A96] dark:bg-[#343434]"
                  : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPageSafe === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#2F2F2F]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ================= FILTER PANEL ================= */}
          {showFilterPanel && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
              <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c] p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#101B41] dark:text-white font-sans">
                    Filter by
                  </h3>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-[#B8C0D3] hover:text-[#6E7891] dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Title
                    </label>
                    <input
                      value={draftFilters.title}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter update title"
                      className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none placeholder:text-[#8693AE] dark:placeholder:text-[#7A7A7A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={draftFilters.category}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                      >
                        <option value="All">Select Category</option>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        value={draftFilters.priority}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                      >
                        <option value="All">Select Priority</option>
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Audience
                    </label>
                    <div className="relative">
                      <select
                        value={draftFilters.audience}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            audience: e.target.value,
                          }))
                        }
                        className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                      >
                        <option value="All">Select Audience</option>
                        {audienceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={draftFilters.status}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                      >
                        <option value="All">Select Status</option>
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A879F] dark:text-[#B5B5B5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Release Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="date"
                          value={draftFilters.fromDate}
                          onChange={(e) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              fromDate: e.target.value,
                            }))
                          }
                          className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="date"
                          value={draftFilters.toDate}
                          onChange={(e) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              toDate: e.target.value,
                            }))
                          }
                          className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs text-[#38486A] dark:text-[#E2E2E2] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="my-5 h-px bg-[#E4E8F1] dark:bg-[#4A4A4A]" />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDraftFilters(INITIAL_FILTERS)}
                    className="h-8 rounded-lg border border-[#576CBC] text-sm font-medium text-[#576CBC]"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => {
                      setAppliedFilters(draftFilters);
                      setShowFilterPanel(false);
                    }}
                    className="h-8 rounded-lg bg-[#576CBC] text-sm font-medium text-white"
                  >
                    Show {previewFilteredItems.length} results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW DETAILS MODAL ================= */}
          {viewUpdateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
              <div className="max-h-[95vh] w-full max-w-[420px] overflow-y-auto scrollbar-none">
                <UpdateDetails
                  update={viewUpdateModal}
                  onClose={() => setViewUpdateModal(null)}
                />
              </div>
            </div>
          )}

          {/* ================= EDIT UPDATE MODAL ================= */}
          {editUpdate && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
              <div className="max-h-[95vh] w-full max-w-[660px] overflow-y-auto scrollbar-none">
                <UpdateFeatureForm
                  update={editUpdate}
                  onClose={() => setEditUpdate(null)}
                  onSubmit={handleUpdateFeatureSubmit}
                />
              </div>
            </div>
          )}

          {/* ================= CREATE UPDATE MODAL ================= */}
          {showCreateUpdate && (
            <CreateUpdateForm
              formData={updateFormData}
              isLoading={isPublishing}
              totalTenants={288}
              tenantOptions={[]}
              onClose={closeCreateUpdateModal}
              onReset={resetUpdateForm}
              onSubmit={handleCreateUpdateSubmit}
              onInputChange={handleUpdateInputChange}
              onAudienceChange={handleAudienceChange}
              onSendEmailChange={handleSendEmailChange}
              onSendInAppChange={handleSendInAppChange}
              onFileChange={handleUpdateFileChange}
            />
          )}
        </div>
      </div>
    </BaseLayout3>
  )
}

export default page