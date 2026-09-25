'use client';
import React, { useEffect, useState } from 'react'
import BaseLayout3 from '../../components/BaseSuperLayout'
import SuperAdminHeader from '../../components/SuperAdminHeader'
import {
  X, ChevronDown, Search, ChevronRight, SlidersHorizontal, ChevronLeft,
} from "lucide-react";
import { BsThreeDotsVertical } from 'react-icons/bs';
import UpdateFeatureForm from './components/UpdateFeatureForm';
import UpdateDetails from './components/UpdateDetails';
import CreateUpdateForm, { UpdateFormData } from './components/CreateUpdateForm';
import type { ProductUpdate, UpdateFeaturePayload, UpdatePriority, UpdateStatus } from './types';
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const DASHBOARD_CARDS_API = "http://localhost:5001/api/updates/dashboard/cards";
const UPDATES_TABLE_API = "http://localhost:5001/api/updates/table";
const UPDATE_BY_ID_API = "http://localhost:5001/api/updates";
const TENANTS_API = "http://localhost:5001/tenant";

const LOCAL_UPDATES_KEY = "blackstone_created_updates_v1";

interface LocalUpdate {
  updateId: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  audience: string[];
  selectedTenants: string[];
  publishDate: string;
  status: string;
  attachments: string[];
  sendNotification?: { email: boolean; inApp: boolean };
  createdAt: string;
}

const loadLocalUpdates = (): LocalUpdate[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalUpdates = (rows: LocalUpdate[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_UPDATES_KEY, JSON.stringify(rows));
  } catch { }
};

const upsertLocalUpdate = (row: LocalUpdate) => {
  const rows = loadLocalUpdates();
  const filtered = rows.filter((r) => r.title !== row.title);
  filtered.unshift(row);
  saveLocalUpdates(filtered.slice(0, 100));
};

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

interface ApiUpdateRow {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority?: "Low" | "Medium" | "High";
  audience?: string[];
  selectedTenants?: string[];
  selectedTenantDetails?: { tenantCode: string; tenantName: string }[];
  planName?: string;
  publishDate: string;
  releaseDate?: string;
  status?: "Draft" | "Scheduled" | "Published" | "Archived";
  attachments?: string[];
  sendNotification?: { email: boolean; inApp: boolean };
  createdAt?: string;
}

interface UpdatesTableResponse {
  success: boolean;
  message: string;
  data: ApiUpdateRow[];
}

const CARD_ICONS = {
  totalUpdates: "/assets/images/superadmin-updates-totalupdates.svg",
  publishedUpdates: "/assets/images/superadmin-updates-publishedupdates.svg",
  scheduledUpdates: "/assets/images/superadmin-updates-scheduledupdates.svg",
  totalViews: "/assets/images/superadmin-updates-totalviews.svg",
};

const isApiRow = (row: ApiUpdateRow | LocalUpdate): row is ApiUpdateRow => {
  return (row as ApiUpdateRow)._id !== undefined;
};

const normalizeRow = (
  row: ApiUpdateRow | LocalUpdate,
  totalTenantsCount: number = 0,
): ProductUpdate => {
  const audienceArr: string[] =
    Array.isArray(row.audience) && row.audience.length > 0
      ? row.audience
      : ["All Tenants"];

  const audienceJoined = audienceArr.join(" ").toLowerCase();
  const isAllTenants = audienceJoined.includes("all tenant");
  const isSelectTenants = audienceJoined.includes("select tenant");

  const anyRow = row as any;
  let selectedNames: string[] = [];

  if (Array.isArray(anyRow.selectedTenantDetails)) {
    selectedNames = anyRow.selectedTenantDetails
      .map((t: any) => t?.tenantName ?? t?.tenantCode ?? "")
      .filter(Boolean);
  } else if (Array.isArray(anyRow.selectedTenants)) {
    selectedNames = anyRow.selectedTenants
      .map((t: any) =>
        typeof t === "string"
          ? t
          : t?.tenantName ?? t?.name ?? t?.tenantCode ?? "",
      )
      .filter(Boolean);
  }

  let audienceDisplay: string;
  if (isAllTenants) {
    audienceDisplay = `All Tenants (${totalTenantsCount})`;
  } else if (isSelectTenants) {
    audienceDisplay = `Selected Tenants (${selectedNames.length})`;
  } else {
    const planLabel = audienceArr[0] ?? anyRow.planName ?? "Plan";
    audienceDisplay = `${planLabel} (${selectedNames.length})`;
  }

  const rowId = isApiRow(row) ? row._id : row.updateId;
  const releaseDate = isApiRow(row)
    ? row.releaseDate ?? row.publishDate ?? row.createdAt ?? ""
    : row.publishDate ?? row.createdAt ?? "";

  return {
    updateId: rowId,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: (row.priority ?? "Low") as UpdatePriority,
    audience: audienceDisplay,
    releaseDate,
    status: (row.status ?? "Draft") as UpdateStatus,
    affectedTenants: isAllTenants
      ? totalTenantsCount
      : isSelectTenants
        ? selectedNames.length
        : selectedNames.length,
    rawAudience: audienceArr,
    rawSelectedTenants: selectedNames,
    attachments: row.attachments ?? [],
    sendNotification: row.sendNotification,
    publishDate: row.publishDate,
  };
};

const mergeRows = (
  apiRows: ApiUpdateRow[],
  localRows: LocalUpdate[],
  totalTenantsCount: number,
): ProductUpdate[] => {
  const localByTitle = new Map<string, LocalUpdate>();
  localRows.forEach((l) => localByTitle.set(l.title.trim().toLowerCase(), l));

  const merged: ProductUpdate[] = [];

  apiRows.forEach((api) => {
    const key = api.title.trim().toLowerCase();
    const local = localByTitle.get(key);

    const apiTenants = (() => {
      if (Array.isArray(api.selectedTenantDetails)) {
        return api.selectedTenantDetails
          .map((t) => t.tenantName ?? t.tenantCode ?? "")
          .filter(Boolean);
      }
      if (Array.isArray(api.selectedTenants)) {
        return api.selectedTenants
          .map((t: any) =>
            typeof t === "string"
              ? t
              : t?.tenantName ?? t?.name ?? t?.tenantCode ?? "",
          )
          .filter(Boolean);
      }
      return [];
    })();

    const effectiveTenants =
      apiTenants.length > 0 ? apiTenants : local?.selectedTenants ?? [];

    const enriched: ApiUpdateRow = {
      ...api,
      selectedTenants: effectiveTenants,
      audience:
        Array.isArray(api.audience) && api.audience.length > 0
          ? api.audience
          : local?.audience ?? ["All Tenants"],
      status: api.status ?? (local?.status as any) ?? "Scheduled",
    };

    merged.push(normalizeRow(enriched, totalTenantsCount));

    if (local) localByTitle.delete(key);
  });

  localByTitle.forEach((local) => {
    merged.unshift(normalizeRow(local, totalTenantsCount));
  });

  return merged;
};

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
      !filters.title ||
      item.title.toLowerCase().includes(filters.title.toLowerCase());
    const matchesCategory =
      filters.category === "All" || item.category === filters.category;
    const matchesPriority =
      filters.priority === "All" || item.priority === filters.priority;
    const matchesAudience =
      filters.audience === "All" ||
      item.audience.toLowerCase().includes(filters.audience.toLowerCase());
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

const categoryBadgeClass = (category: string) => {
  switch (category) {
    case "Feature":
    case "Feature Release":
      return "bg-[#E6EEFF] text-[#4A72E8] dark:bg-[#2F3E67] dark:text-[#8FAEFF]";
    case "Maintenance":
      return "bg-[#EFE6FF] text-[#8B5CF6] dark:bg-[#3A2F58] dark:text-[#C4A8FF]";
    case "Security":
    case "Security Update":
      return "bg-[#FFF1DC] text-[#F59E0B] dark:bg-[#4A3A1F] dark:text-[#F5C97B]";
    case "Bug Fix":
      return "bg-[#E6F0FF] text-[#3B82F6] dark:bg-[#22375A] dark:text-[#7EB0FF]";
    default:
      return "bg-[#E6EAF2] text-[#576CBC] dark:bg-[#576CBC33]";
  }
};

const page = () => {
  const [updateList, setUpdateList] = useState<ProductUpdate[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(
    INITIAL_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [editUpdate, setEditUpdate] = useState<ProductUpdate | null>(null);

  const [viewUpdateId, setViewUpdateId] = useState<string | null>(null);
  const [viewUpdateData, setViewUpdateData] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewRowFallback, setViewRowFallback] = useState<string[]>([]);

  const [cardsData, setCardsData] = useState<
    DashboardCardsResponse["data"] | null
  >(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const [totalTenantsCount, setTotalTenantsCount] = useState(0);

  const [showCreateUpdate, setShowCreateUpdate] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
    updateTitle: "",
    category: "Feature Release",
    audience: "allTenants",
    selectedTenants: [],
    selectedPlan: "",
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
  const statusOptions = Array.from(new Set(updateList.map((u) => u.status)));

  const filteredItems = applyFilters(updateList, search, appliedFilters);
  const previewFilteredItems = applyFilters(updateList, search, draftFilters);

  // Fetch tenant count
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${TENANTS_API}?limit=1000`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const items = Array.isArray(json)
          ? json
          : json?.data?.items ??
          json?.data?.tenants ??
          json?.tenants ??
          json?.data ??
          json?.items ??
          [];

        const activeItems = items.filter(
          (t: any) => (t.status ?? "").toLowerCase() === "active",
        );

        if (!cancelled) setTotalTenantsCount(activeItems.length);
      } catch (e) {
        console.error("Failed to fetch tenant count:", e);
        if (!cancelled) setTotalTenantsCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch cards
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCardsLoading(true);
      try {
        const res = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.UPDATES.GET_DASHBOARD_CARDS}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: DashboardCardsResponse = await res.json();
        if (!cancelled && json.success) setCardsData(json.data);
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

  // Fetch table
  useEffect(() => {
    if (totalTenantsCount === 0) return;

    let cancelled = false;
    const load = async () => {
      setTableLoading(true);
      try {
        const localRows = loadLocalUpdates();
        const res = await fetch(`${UPDATES_TABLE_API}?limit=1000`);
        const json: UpdatesTableResponse = await res.json();
        if (cancelled) return;
        const apiRows: ApiUpdateRow[] = json.success ? json.data ?? [] : [];
        const merged = mergeRows(apiRows, localRows, totalTenantsCount);
        setUpdateList(merged);
      } catch (e: any) {
        if (!cancelled) {
          const localRows = loadLocalUpdates();
          setUpdateList(mergeRows([], localRows, totalTenantsCount));
          setTableError(e.message ?? "Failed to load updates");
        }
      } finally {
        if (!cancelled) setTableLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [totalTenantsCount]);

  // Fetch update by ID
  useEffect(() => {
    if (!viewUpdateId) {
      setViewUpdateData(null);
      setViewError(null);
      return;
    }

    if (
      viewUpdateId.startsWith("temp-") ||
      viewUpdateId.startsWith("local-")
    ) {
      setViewLoading(false);
      setViewError(null);
      return;
    }

    let cancelled = false;
    setViewLoading(true);
    setViewError(null);
    (async () => {
      try {
        const res = await fetch(`${UPDATE_BY_ID_API}/${viewUpdateId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled && json.success) {
          setViewUpdateData((prev: any) => ({
            ...(prev ?? {}),
            ...json.data,
            status: json.data?.status ?? prev?.status,
            priority: json.data?.priority ?? prev?.priority,
          }));
        } else if (!cancelled) {
          throw new Error(json.message || "Failed");
        }
      } catch (e: any) {
        if (!cancelled) setViewError(e.message ?? "Failed to load details");
      } finally {
        if (!cancelled) setViewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewUpdateId]);

  const handleUpdateFeatureSubmit = (payload: UpdateFeaturePayload) => {
    if (!editUpdate) return;

    setUpdateList((prev) =>
      prev.map((u) => {
        if (u.updateId !== payload.updateId) return u;

        const incoming = (payload.audience ?? "").trim();
        const PLAN_LABELS = ["Standard", "Premium", "Basic"];
        const isAllTenants = incoming === "All Tenants";

        let nextSelectedNames: string[] = u.rawSelectedTenants ?? [];

        if (isAllTenants) {
          nextSelectedNames = [];
        } else if (
          incoming &&
          !incoming.toLowerCase().includes("select tenants")
        ) {
          const incomingNames = incoming
            .split(",")
            .map((s) => s.trim())
            .filter(
              (s) =>
                s &&
                !PLAN_LABELS.includes(s) &&
                !s.toLowerCase().includes("all tenant"),
            );

          if (incomingNames.length > 0) {
            nextSelectedNames = Array.from(
              new Set([...(u.rawSelectedTenants ?? []), ...incomingNames]),
            );
          }
        }

        const nextAudienceDisplay = isAllTenants
          ? `All Tenants (${totalTenantsCount})`
          : `Selected Tenants (${nextSelectedNames.length})`;

        const localRows = loadLocalUpdates();
        const existingLocal = localRows.find(
          (l) =>
            l.title.trim().toLowerCase() === u.title.trim().toLowerCase(),
        );
        if (existingLocal) {
          existingLocal.title = payload.title?.trim() || u.title;
          existingLocal.description = payload.description ?? u.description;
          existingLocal.category = payload.category ?? u.category;
          existingLocal.priority = (payload.priority ?? u.priority) as
            | "Low"
            | "Medium"
            | "High";
          existingLocal.publishDate = payload.publishDate || u.releaseDate;
          existingLocal.selectedTenants = nextSelectedNames;
          existingLocal.audience = isAllTenants
            ? ["All Tenants"]
            : ["Select Tenants"];
          saveLocalUpdates(localRows);
        }

        return {
          ...u,
          title: payload.title?.trim() || u.title,
          description: payload.description ?? u.description,
          category: payload.category ?? u.category,
          priority: payload.priority ?? u.priority,
          releaseDate: payload.publishDate || u.releaseDate,
          audience: nextAudienceDisplay,
          rawSelectedTenants: nextSelectedNames,
          affectedTenants: nextSelectedNames.length,
        };
      }),
    );

    setEditUpdate(null);
  };

  const handleUpdateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAudienceChange = (
    audience: "allTenants" | "selectTenants" | "byPlan",
  ) => {
    setUpdateFormData((prev) => ({
      ...prev,
      audience,
      selectedTenants:
        audience === "selectTenants" ? prev.selectedTenants : [],
      selectedPlan: audience === "byPlan" ? prev.selectedPlan : "",
    }));
  };

  const handleTenantToggle = (tenantName: string) => {
    setUpdateFormData((prev) => {
      const exists = prev.selectedTenants.includes(tenantName);
      return {
        ...prev,
        selectedTenants: exists
          ? prev.selectedTenants.filter((n) => n !== tenantName)
          : [...prev.selectedTenants, tenantName],
      };
    });
  };

  const handlePlanChange = (planName: string) => {
    setUpdateFormData((prev) => ({
      ...prev,
      audience: "byPlan",
      selectedPlan: planName,
      selectedTenants: [],
    }));
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
      selectedTenants: [],
      selectedPlan: "",
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

  // Create handler — resolves plan tenants too
  const handleCreateUpdateSubmit = async (
    e: React.FormEvent,
    payload: any,
    response: any,
  ) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      const categoryLabelMap: Record<string, string> = {
        Feature: "Feature Release",
        "Bug Fix": "Bug Fix",
        Maintenance: "Maintenance",
        Announcement: "Announcement",
      };

      const audienceType = Array.isArray(payload.audience)
        ? payload.audience[0]
        : "";

      const isAllTenants = audienceType.toLowerCase().includes("all tenant");
      const isSelectTenants = audienceType
        .toLowerCase()
        .includes("select tenant");
      const isByPlan = !isAllTenants && !isSelectTenants;

      // Resolve plan tenant names
      let planTenantNames: string[] = [];
      if (isByPlan && audienceType) {
        try {
          const tRes = await fetch(`${TENANTS_API}?limit=1000`);
          const tJson = await tRes.json();
          const items = Array.isArray(tJson)
            ? tJson
            : tJson?.data?.items ??
            tJson?.data?.tenants ??
            tJson?.tenants ??
            tJson?.data ??
            tJson?.items ??
            [];

          planTenantNames = items
            .filter(
              (t: any) =>
                (t.status ?? "").toLowerCase() === "active" &&
                t.plan === audienceType,
            )
            .map((t: any) => t.tenantName ?? t.name ?? "")
            .filter(Boolean);

          console.log(
            `✅ Resolved ${planTenantNames.length} tenants on "${audienceType}" plan`,
          );
        } catch (err) {
          console.warn("Failed to resolve plan tenants:", err);
        }
      }

      const selectedNames: string[] =
        isSelectTenants && Array.isArray(payload.selectedTenants)
          ? payload.selectedTenants
          : isByPlan
            ? planTenantNames
            : [];

      const localRow: LocalUpdate = {
        updateId:
          response?.data?._id ??
          response?.data?.update?._id ??
          `local-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        category: categoryLabelMap[payload.category] ?? payload.category,
        priority: payload.priority,
        audience: payload.audience,
        selectedTenants: selectedNames,
        publishDate:
          payload.publishDate || new Date().toISOString().slice(0, 10),
        status: payload.status || "Scheduled",
        attachments: payload.attachments || [],
        sendNotification: payload.sendNotification,
        createdAt: new Date().toISOString(),
      };

      upsertLocalUpdate(localRow);

      const localRows = loadLocalUpdates();
      try {
        const res = await fetch(`${UPDATES_TABLE_API}?limit=1000`);
        const json: UpdatesTableResponse = await res.json();
        const apiRows: ApiUpdateRow[] = json.success ? json.data ?? [] : [];
        setUpdateList(mergeRows(apiRows, localRows, totalTenantsCount));
      } catch {
        setUpdateList(mergeRows([], localRows, totalTenantsCount));
      }

      closeCreateUpdateModal();
    } catch (error) {
      console.error("Create failed:", error);
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

  const showingStart = filteredItems.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(
    startIndex + itemsPerPage,
    filteredItems.length,
  );

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenu(null);
  }, [search, appliedFilters]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <BaseLayout3>
      <SuperAdminHeader currentSection="Updates" />

      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F] px-4">
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
                  <p
                    className={`text-sm mt-[4px] font-medium ${card.titleColor}`}
                  >
                    {card.title}
                  </p>
                  {cardsLoading ? (
                    <div className="h-7 w-12 animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                      {card.value}
                    </h2>
                  )}
                </div>
              </div>
              <p className="text-sm mt-3 ml-[100px] flex flex-row items-center gap-2">
                {card.percentage !== undefined && card.percentage !== null ? (
                  <span
                    className={`flex flex-row items-center gap-x-1 font-medium ${card.direction === "down" ? "text-[#E53E3E] dark:text-[#FC8181]" : "text-[#40BD5F] dark:text-[#68D391]"}`}
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

        <div>
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
                Showing {showingStart}–{showingEnd} of {filteredItems.length}
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-none h-full">
              <div className="rounded-b-xl scrollbar-none">
                <table className="min-w-full text-xs border-collapse table-fixed">
                  <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d]">
                    <tr>
                      {[
                        "Update Title",
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
                    {tableLoading ? (
                      Array.from({ length: itemsPerPage }).map((_, i) => (
                        <tr
                          key={i}
                          className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                        >
                          {Array.from({ length: 8 }).map((__, j) => (
                            <td key={j} className="py-4 px-2">
                              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-[#454545]" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedItems.length > 0 ? (
                      paginatedItems.map((item) => (
                        <tr
                          key={item.updateId}
                          className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                        >
                          <td className="py-4 px-2 font-medium">
                            {item.title}
                          </td>
                          <td
                            className="py-4 px-2 truncate max-w-[220px]"
                            title={item.description}
                          >
                            {item.description}
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 text-[11px] py-[3px] rounded-md ${categoryBadgeClass(item.category)}`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 text-[12px] py-[3px] rounded-md ${priorityBadgeClass(item.priority)}`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-[11px]">
                            {item.audience}
                          </td>
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
                                setOpenMenu(
                                  openMenu === item.updateId
                                    ? null
                                    : item.updateId,
                                )
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

                                    const local = loadLocalUpdates().find(
                                      (l) =>
                                        l.title.trim().toLowerCase() ===
                                        item.title.trim().toLowerCase(),
                                    );

                                    const rowFallback =
                                      item.rawSelectedTenants ?? [];
                                    const localFallback =
                                      local?.selectedTenants ?? [];
                                    const fallback =
                                      rowFallback.length > 0
                                        ? rowFallback
                                        : localFallback;

                                    setViewRowFallback(fallback);

                                    setViewUpdateData({
                                      title: item.title,
                                      description: item.description,
                                      category: item.category,
                                      priority:
                                        item.priority ??
                                        local?.priority ??
                                        "Low",
                                      status:
                                        item.status ?? local?.status ?? "—",
                                      publishDate:
                                        item.publishDate ??
                                        local?.publishDate,
                                      releaseDate: item.releaseDate,
                                      audience:
                                        item.rawAudience ??
                                        local?.audience ?? ["All Tenants"],
                                      selectedTenants: fallback,
                                      attachments:
                                        item.attachments ??
                                        local?.attachments ??
                                        [],
                                      affectedTenants:
                                        item.affectedTenants ??
                                        totalTenantsCount,
                                    });

                                    setViewUpdateId(item.updateId);
                                  }}
                                >
                                  View Details
                                </button>
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
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPageSafe === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:opacity-50 dark:border-[#4A4A4A]"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded border font-medium ${currentPageSafe === p ? "border-[#496A96] bg-white text-[#496A96] dark:bg-[#343434]" : "border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 dark:border-[#4A4A4A]"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPageSafe === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:opacity-50 dark:border-[#4A4A4A]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {showFilterPanel && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
              <div className="w-full max-w-[360px] rounded-2xl border border-[#E6EAF2] dark:border-[#3F3F3F] bg-white dark:bg-[#2c2c2c] p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#101B41] dark:text-white">
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
                      className="h-8 w-full rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Category
                    </label>
                    <select
                      value={draftFilters.category}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs outline-none"
                    >
                      <option value="All">Select Category</option>
                      {categoryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Priority
                    </label>
                    <select
                      value={draftFilters.priority}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs outline-none"
                    >
                      <option value="All">Select Priority</option>
                      {priorityOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm leading-none text-[#101B41] dark:text-[#E2E2E2]">
                      Status
                    </label>
                    <select
                      value={draftFilters.status}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="h-8 w-full appearance-none rounded-md border border-[#d5d5d5] dark:border-[#4A4A4A] bg-white dark:bg-[#343434] px-3 pr-9 text-xs outline-none"
                    >
                      <option value="All">Select Status</option>
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
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

          {viewUpdateId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
              <div className="max-h-[95vh] w-full max-w-[560px] overflow-y-auto scrollbar-none">
                <UpdateDetails
                  updateId={viewUpdateId}
                  update={viewUpdateData}
                  loading={viewLoading}
                  error={viewError}
                  fallbackSelectedTenants={viewRowFallback}
                  totalTenantsCount={totalTenantsCount}
                  onClose={() => {
                    setViewUpdateId(null);
                    setViewUpdateData(null);
                    setViewError(null);
                    setViewRowFallback([]);
                  }}
                />
              </div>
            </div>
          )}

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

          {showCreateUpdate && (
            <CreateUpdateForm
              formData={updateFormData}
              isLoading={isPublishing}
              totalTenants={totalTenantsCount}
              onClose={closeCreateUpdateModal}
              onReset={resetUpdateForm}
              onSubmit={handleCreateUpdateSubmit}
              onInputChange={handleUpdateInputChange}
              onAudienceChange={handleAudienceChange}
              onTenantToggle={handleTenantToggle}
              onPlanChange={handlePlanChange}
              onSendEmailChange={handleSendEmailChange}
              onSendInAppChange={handleSendInAppChange}
              onFileChange={handleUpdateFileChange}
            />
          )}
        </div>
      </div>
    </BaseLayout3>
  );
};

export default page;