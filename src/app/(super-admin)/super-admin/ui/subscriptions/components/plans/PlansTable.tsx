"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import {
  AppFailureToastMessages,
  AppSuccessToastMessages,
} from "@/app/_components/contents/toast_message";

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`group relative justify-start h-5 w-9 rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#576CBC]/40 ${
        checked
          ? "border-[#576CBC] bg-gradient-to-r from-[#576CBC] to-[#6F85D6]"
          : "border-[#D6DCEB] bg-[#EFF2F8]"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[15px] w-[15px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          checked ? "left-[18px]" : "left-[2px]"
        }`}
      />
    </button>
  );
};

// Backend stores features/allowedRoles keyed by these uppercase role codes.
const roleCodeMap: Record<string, string> = {
  Admin: "ADMIN",
  Teacher: "TEACHER",
  Student: "STUDENT",
};

const roleLabelMap: Record<string, string> = Object.fromEntries(
  Object.entries(roleCodeMap).map(([label, code]) => [code, label]),
);

const PlansTable = () => {
  type FilterState = {
    planName: string;
    billingCycle: string;
    status: string;
    fromDate: string;
    toDate: string;
  };

  const INITIAL_FILTERS: FilterState = {
    planName: "",
    billingCycle: "All",
    status: "All",
    fromDate: "",
    toDate: "",
  };

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [selectedBillingPeriodByPlan, setSelectedBillingPeriodByPlan] = useState<
    Record<string, string>
  >({});
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const plansList = Array.isArray(plans) ? plans : [];

  const billingOptions = Array.from(
    new Set(plansList.map((plan) => plan.billingCycle)),
  ).filter(Boolean);

  const statusOptions = Array.from(
    new Set(plansList.map((plan) => plan.status)),
  ).filter(Boolean);

  const applyFilters = (
    items: any[],
    searchText: string,
    filters: FilterState,
  ) => {
    const term = searchText.toLowerCase().trim();

    return items.filter((item) => {
      const planName = item.planName || "";
      const billingCycle = item.billingCycle || "";
      const status = item.status || "";
      const createdDate = item.createdDate ? new Date(item.createdDate) : null;

      const matchesSearch =
        !term ||
        [planName, billingCycle, status, item.monthlyPrice, item.yearlyPrice]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesPlanName =
        !filters.planName ||
        planName.toLowerCase().includes(filters.planName.toLowerCase());

      const matchesBillingCycle =
        filters.billingCycle === "All" || billingCycle === filters.billingCycle;

      const matchesStatus =
        filters.status === "All" || status === filters.status;

      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const matchesDate =
        (!fromDate || (createdDate && createdDate >= fromDate)) &&
        (!toDate || (createdDate && createdDate <= toDate));

      return (
        matchesSearch &&
        matchesPlanName &&
        matchesBillingCycle &&
        matchesStatus &&
        matchesDate
      );
    });
  };

  const filteredPlans = applyFilters(plansList, search, appliedFilters);
  const previewFilteredPlans = applyFilters(plansList, search, draftFilters);

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([key, value]) =>
      value &&
      !(
        (key === "planName" && value === "") ||
        ((key === "billingCycle" || key === "status") && value === "All")
      ),
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / itemsPerPage),
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPlans.length);
  const paginatedPlans = filteredPlans.slice(startIndex, endIndex);
  const showingStart = filteredPlans.length === 0 ? 0 : startIndex + 1;
  const showingEnd = filteredPlans.length === 0 ? 0 : endIndex;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, appliedFilters]);

  const getBadgeStyle = (planName: string) => {
    const name = planName.toLowerCase();

    if (name.includes("basic")) {
      return "bg-[#DEF5FA] text-[#18BCDC]";
    }

    if (name.includes("standard")) {
      return "bg-[#DAE4F6] text-[#2668EF]";
    }

    if (name.includes("premium")) {
      return "bg-[#E7E8FA] text-[#585BDC]";
    }

    return "bg-gray-100 text-gray-600";
  };

  const formatTableDate = (value?: string) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadgeStyle = (status?: string) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "ACTIVE") {
      return "bg-[#EAF8EC] text-[#34A853]";
    }

    if (normalized === "EXPIRED") {
      return "bg-[#FDEAEA] text-[#E35D5D]";
    }

    if (normalized === "EXPIRED_SOON" || normalized === "INACTIVE") {
      return "bg-[#FFF7E8] text-[#F4A429]";
    }

    return "bg-[#EEF3FF] text-[#4D74AE]";
  };

  const formatStatusLabel = (status?: string) => {
    if (!status) {
      return "-";
    }

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.PLAN_TABLE}`);

      const responseData = response.data?.data ?? response.data;

      const plansArray = Array.isArray(responseData)
        ? responseData
        : responseData?.plans ?? responseData?.items ?? [];

      setPlans(plansArray);
      const payload =
        response.data?.data?.items ??
        response.data?.items ??
        response.data?.data ??
        response.data;

      setPlans(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = async (planId: string) => {
    try {
      const res = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.GET_PLAN_BY_ID}`.replace("${planId}", planId));

      setSelectedPlan(res.data.data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const modules = selectedPlan
    ? Object.values(selectedPlan.features as Record<string, string[]>).flat()
    : [];

  const [formData, setFormData] = useState({
    planName: "",
    planTag: "Most Popular",
    billingCycle: "MONTHLY",
    planDescription: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    studentLimit: 0,
    userLimit: 0,
    storageLimit: 0,
    gstAndTax: 18,
    allowedRoles: [] as string[],
    features: {} as Record<string, string[]>,
    canCreateCustomRole: false,
    customDomain: false,
    backup: false,
    planStatus: "Active",
    status: "Active",
  });
  const [pricingRows, setPricingRows] = useState<
    Array<{
      billingPeriodId?: string;
      period: string;
      duration: number;
      price: number;
      discount: number;
      gstRate?: number;
      taxAmount?: number;
      totalAmount?: number;
    }>
  >([]);

  const selectedModules: string[] = Object.values(
    formData.features || {},
  ).flat();
  const roleTabs = ["Admin", "Teacher", "Student"] as const;
  const [activeRoleTab, setActiveRoleTab] = useState<(typeof roleTabs)[number]>("Admin");

  const activeRoleModules =
    formData.features && Array.isArray(formData.features[activeRoleTab])
      ? formData.features[activeRoleTab]
      : [];

  const pricingRowsForTable =
    pricingRows.length > 0
      ? pricingRows
      : [
          {
            period: String(formData.billingCycle || "Custom"),
            duration: 0,
            price: Number(formData.monthlyPrice || 0),
            discount: 0,
          },
        ];

  useEffect(() => {
    if (showUpdateModal && selectedPlan?.planId) {
      getPlanById(selectedPlan.planId);
    }
  }, [showUpdateModal, selectedPlan]);

  const getPlanById = async (planId: string) => {
    try {
      const res = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.GET_PLAN_BY_ID}`.replace("${planId}", planId));

      const plan = res.data.data;

      // Backend's `planStatus` field is actually the display tag (MOST_POPULAR/
      // NEW/FEATURED) and `status` is Active/Inactive — map them to the local
      // fields the "Plan Tag" and "Status" dropdowns actually read from.
      const normalizedFeatures: Record<string, string[]> = Object.fromEntries(
        Object.entries(plan.features || {}).map(([role, modules]) => [
          roleLabelMap[role] || role,
          modules as string[],
        ]),
      );

      setFormData({
        planName: plan.planName,
        planTag: plan.planStatus || "Most Popular",
        billingCycle: plan.billingCycle,
        planDescription: plan.planDescription,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        studentLimit: plan.studentLimit,
        userLimit: plan.userLimit || 0,
        storageLimit: plan.storageLimit || 0,
        gstAndTax: plan.gstAndTax || 18,
        allowedRoles: plan.allowedRoles || [],
        features: normalizedFeatures,
        canCreateCustomRole: plan.canCreateCustomRole,
        customDomain: plan.customDomain,
        backup: plan.backup,
        planStatus: plan.status || "Active",
        status: plan.status,
      });

      const pricingSource =
        plan.pricingConfiguration ??
        plan.pricingConfigurations ??
        plan.billingPeriods ??
        plan.billingOptions ??
        plan.pricing ??
        [];

      if (Array.isArray(pricingSource)) {
        setPricingRows(
          pricingSource
            .map((row: any) => {
              // Some responses nest the record under its own `billingPeriod` key
              // instead of returning it flat — unwrap that case if present.
              const record =
                row?.billingPeriod &&
                typeof row.billingPeriod === "object"
                  ? row.billingPeriod
                  : row;

              const months = Number(
                record.durationInMonths ?? record.months ?? record.durationMonths ?? 0,
              );
              const rawDuration = record.duration ?? record.durationLabel;
              let duration = months;

              if (duration <= 0 && typeof rawDuration === "number") {
                duration = rawDuration;
              }

              if (duration <= 0 && typeof rawDuration === "string") {
                const matched = rawDuration.match(/\d+/);
                duration = matched ? Number(matched[0]) : 0;
              }

              const periodLabel =
                typeof record.billingPeriod === "string"
                  ? record.billingPeriod
                  : record.period ?? record.billingCycle ?? "Custom";

              return {
                billingPeriodId:
                  record.billingPeriodId ?? record.id ?? record._id,
                period: String(periodLabel),
                duration,
                price: Number(record.price ?? record.amount ?? record.monthlyPrice ?? 0),
                discount: Number(record.discount ?? record.discountPercent ?? 0),
                gstRate: Number(record.gstRate ?? plan.gstAndTax ?? 0),
                taxAmount: Number(record.taxAmount ?? 0),
                totalAmount: Number(record.totalAmount ?? 0),
              };
            })
            .filter((row) => row.period),
        );
      } else {
        setPricingRows([]);
      }

      setFeatures((prev) => ({
        ...prev,
        customDomain: Boolean(plan.customDomain),
        backup: Boolean(plan.backup),
        canCreateCustomRole: Boolean(plan.canCreateCustomRole),
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handlePricingRowChange = (
    billingPeriodId: string | undefined,
    field: "price" | "discount",
    rawValue: string,
  ) => {
    setPricingRows((prev) =>
      prev.map((row) => {
        if (!billingPeriodId || row.billingPeriodId !== billingPeriodId) {
          return row;
        }

        const numericValue = rawValue === "" ? 0 : Number(rawValue);

        if (Number.isNaN(numericValue) || numericValue < 0) {
          return row;
        }

        if (field === "discount" && numericValue > 100) {
          return row;
        }

        const nextPrice = field === "price" ? numericValue : row.price;
        const nextDiscount = field === "discount" ? numericValue : row.discount;
        const gstRate = Number(formData.gstAndTax) || row.gstRate || 0;

        const discounted = nextPrice - (nextPrice * nextDiscount) / 100;
        const taxAmount = Number(((discounted * gstRate) / 100).toFixed(2));
        const totalAmount = Number((discounted + taxAmount).toFixed(2));

        return {
          ...row,
          [field]: numericValue,
          gstRate,
          taxAmount,
          totalAmount,
        };
      }),
    );
  };

  const handlePricingRowBlur = async (billingPeriodId: string | undefined) => {
    if (!billingPeriodId || !selectedPlan?.planId) {
      return;
    }

    const row = pricingRows.find(
      (item) => item.billingPeriodId === billingPeriodId,
    );

    if (!row) {
      return;
    }

    try {
      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.UPDATE_BILLING_PERIOD}`
          .replace("${planId}", selectedPlan.planId)
          .replace("${billingPeriodId}", billingPeriodId),
        {
          price: row.price ?? 0,
          discount: row.discount ?? 0,
          gstRate: row.gstRate ?? Number(formData.gstAndTax) ?? 0,
          taxAmount: row.taxAmount ?? 0,
          totalAmount: row.totalAmount ?? 0,
        },
      );

      toast.success(AppSuccessToastMessages.BILLING_PERIOD_UPDATED);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        AppFailureToastMessages.UPDATE_BILLING_PERIOD_FAILED;

      toast.error(message);
    }
  };

  const [showAddBillingPeriodModal, setShowAddBillingPeriodModal] = useState(false);
  const [isSavingBillingPeriod, setIsSavingBillingPeriod] = useState(false);
  const [billingPeriodForm, setBillingPeriodForm] = useState({
    billingPeriod: "",
    duration: 0,
  });
  const [billingPeriodFormErrors, setBillingPeriodFormErrors] = useState<{
    billingPeriod?: string;
    duration?: string;
  }>({});

  const resetBillingPeriodForm = () => {
    setBillingPeriodForm({ billingPeriod: "", duration: 0 });
    setBillingPeriodFormErrors({});
  };

  const handleCancelAddBillingPeriod = () => {
    setShowAddBillingPeriodModal(false);
    resetBillingPeriodForm();
  };

  const normalizeBillingPeriodLabel = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    return trimmed
      .toLowerCase()
      .replace(/(^|\s)([a-z])/g, (_, prefix: string, char: string) =>
        prefix + char.toUpperCase(),
      );
  };

  const normalizeDuration = (value: number) => {
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  const handleAddBillingPeriod = async () => {
    const billingPeriod = normalizeBillingPeriodLabel(billingPeriodForm.billingPeriod);
    const duration = normalizeDuration(billingPeriodForm.duration);
    const errors: { billingPeriod?: string; duration?: string } = {};

    if (!billingPeriod) {
      errors.billingPeriod = "Billing period is required";
    }

    if (duration <= 0) {
      errors.duration = "Duration is required";
    }

    if (Object.keys(errors).length > 0) {
      setBillingPeriodFormErrors(errors);
      return;
    }

    if (!selectedPlan?.planId) {
      toast.error(AppFailureToastMessages.ADD_BILLING_PERIOD_FAILED);
      return;
    }

    try {
      setIsSavingBillingPeriod(true);

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.ADD_BILLING_PERIOD}`.replace(
          "${planId}",
          selectedPlan.planId,
        ),
        { billingPeriod, duration },
      );

      const saved = response.data?.data ?? response.data;

      // The API sometimes wraps the created record under a `billingPeriod` key
      // instead of returning it flat — unwrap that case, same as CreatePlan.
      const record =
        saved && typeof saved.billingPeriod === "object" && saved.billingPeriod !== null
          ? saved.billingPeriod
          : saved;

      const billingPeriodId = record?.billingPeriodId ?? record?.id ?? record?._id;

      if (!billingPeriodId) {
        toast.error(AppFailureToastMessages.ADD_BILLING_PERIOD_FAILED);
        return;
      }

      setPricingRows((prev) => [
        ...prev,
        {
          billingPeriodId,
          period: billingPeriod,
          duration,
          price: Number(record?.price ?? 0),
          discount: Number(record?.discount ?? 0),
          gstRate: Number(record?.gstRate ?? formData.gstAndTax ?? 0),
          taxAmount: Number(record?.taxAmount ?? 0),
          totalAmount: Number(record?.totalAmount ?? 0),
        },
      ]);

      setShowAddBillingPeriodModal(false);
      resetBillingPeriodForm();
      toast.success(AppSuccessToastMessages.BILLING_PERIOD_ADDED);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        AppFailureToastMessages.ADD_BILLING_PERIOD_FAILED;

      toast.error(message);
    } finally {
      setIsSavingBillingPeriod(false);
    }
  };

  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const handleSaveChanges = async () => {
    if (!selectedPlan?.planId) {
      return;
    }

    const rolesFromFeatures = Object.keys(formData.features || {})
      .filter((role) => (formData.features[role] || []).length > 0)
      .map((role) => roleCodeMap[role] || role.toUpperCase());

    const allowedRoles =
      rolesFromFeatures.length > 0 ? rolesFromFeatures : formData.allowedRoles;

    const featuresForPayload = Object.fromEntries(
      Object.entries(formData.features || {})
        .filter(([, modules]) => (modules || []).length > 0)
        .map(([role, modules]) => [roleCodeMap[role] || role.toUpperCase(), modules]),
    );

    // Pricing is already saved per-row via handlePricingRowBlur — only resend the
    // billingPeriods array here if every row has a real id, so a still-loading /
    // placeholder row can't trip the backend's required billingPeriodId check.
    const billingPeriodsForPayload =
      pricingRows.length > 0 && pricingRows.every((row) => row.billingPeriodId)
        ? pricingRows.map((row) => ({
            billingPeriodId: row.billingPeriodId,
            billingPeriod: row.period,
            duration: row.duration,
            price: row.price ?? 0,
            discount: row.discount ?? 0,
            gstRate: row.gstRate ?? Number(formData.gstAndTax) ?? 0,
            taxAmount: row.taxAmount ?? 0,
            totalAmount: row.totalAmount ?? 0,
          }))
        : undefined;

    const payload: Record<string, unknown> = {
      planName: formData.planName,
      studentLimit: Number(formData.studentLimit),
      billingCycle: formData.billingCycle,
      planDescription: formData.planDescription,
      // The "Plan Tag" field (Most Popular / Recommended / Best Value) is the
      // backend's `planStatus`; the "Status" field (Active/Inactive) is `status`.
      planStatus: formData.planTag,
      status: formData.planStatus,

      monthlyPrice: Number(formData.monthlyPrice),
      yearlyPrice: Number(formData.yearlyPrice),
      setupFee: Number(selectedPlan.setupFee ?? 0),
      trialDays: Number(selectedPlan.trialDays ?? 0),
      gstAndTax: Number(formData.gstAndTax),
      totalPrice: Number(selectedPlan.totalPrice ?? 0),

      allowedRoles,
      features: featuresForPayload,

      canCreateCustomRole: allowedRoles.includes("ADMIN"),

      lastUpdatedBy: "SUPER_ADMIN",
    };

    if (billingPeriodsForPayload) {
      payload.billingPeriods = billingPeriodsForPayload;
    }

    try {
      setIsSavingPlan(true);

      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.UPDATE_PLAN}`.replace(
          "${planId}",
          selectedPlan.planId,
        ),
        payload,
      );

      toast.success(AppSuccessToastMessages.PLAN_UPDATED);
      setShowUpdateModal(false);
      fetchPlans();
    } catch (err: any) {
      const message =
        err.response?.data?.message || AppFailureToastMessages.UPDATE_PLAN_FAILED;

      toast.error(message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const featureItems = [
    { key: "customDomain", label: "Custom Domain" },
    { key: "backup", label: "Backup" },
    { key: "apiAccess", label: "API Access" },
    { key: "whiteLabel", label: "White Label" },
    { key: "prioritySupport", label: "Priority Support" },
  ];
  const [features, setFeatures] = useState({
    customDomain: true,
    backup: true,
    apiAccess: true,
    whiteLabel: true,
    prioritySupport: true,
    canCreateCustomRole: false,
  });

  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="mb-0 text-[22px] p-2 font-semibold text-[#1F2A44]">
        Plan
      </h2>

      {/* Card */}
      <div className="overflow-hidden rounded-lg border border-[#E6EAF2] bg-white">
        {/* Top Bar */}
        <div className="grid grid-cols-3 border-b border-[#E6EAF2]">
          {/* Search */}
          <div className="flex h-12 items-center border-r border-[#E6EAF2] px-4">
            <Search size={17} className="text-[#A5AAB4]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword"
              className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4]"
            />
          </div>

          {/* Filter */}
          <button
            onClick={() => {
              setDraftFilters(appliedFilters);
              setShowFilterPanel(true);
            }}
            className="flex h-12 items-center justify-between border-r border-[#E6EAF2] px-4 text-sm text-[#80848E] hover:bg-gray-50"
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

          {/* Count */}
          <div className="flex h-12 items-center px-4 text-sm text-[#80848E]">
            Showing {showingStart} - {showingEnd} of {filteredPlans.length}
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="h-10 bg-[#496A96] text-left text-[14px] text-white">
                <th className="px-4 font-medium">Plan Name</th>
                <th className="px-4 font-medium">Billing Cycle</th>
                <th className="px-4 font-medium">Price</th>
                <th className="px-4 font-medium">Created Date</th>
                <th className="px-4 font-medium">Features</th>
                <th className="px-4 font-medium">Subscribed Tenants</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280]">
                    No plans found.
                  </td>
                </tr>
              ) : (
                paginatedPlans.map((item, index) => {
                  const billingPeriods: any[] = Array.isArray(item.billingPeriods)
                    ? item.billingPeriods
                    : [];
                  const rowKey = item.planId ?? String(index);
                  const selectedBillingPeriodId =
                    selectedBillingPeriodByPlan[rowKey] ??
                    billingPeriods[0]?.billingPeriodId ??
                    billingPeriods[0]?.billingPeriod;
                  const selectedBillingPeriod = billingPeriods.find(
                    (bp) =>
                      (bp.billingPeriodId ?? bp.billingPeriod) ===
                      selectedBillingPeriodId,
                  );

                  return (
                  <tr
                    key={index}
                    className={`text-[12px] ${
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C] "
                        : "bg-[#F8F8F8] dark:bg-[#303030]"
                    }`}
                  >
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 font-medium rounded-md ${getBadgeStyle(
                          item.planName,
                        )}`}
                      >
                        {item.planName}
                      </span>
                    </td>

                    <td className="px-4">
                      {billingPeriods.length > 0 ? (
                        <select
                          value={selectedBillingPeriodId ?? ""}
                          onChange={(e) =>
                            setSelectedBillingPeriodByPlan((prev) => ({
                              ...prev,
                              [rowKey]: e.target.value,
                            }))
                          }
                          className="h-7 rounded border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#344054] outline-none focus:border-[#576CBC]"
                        >
                          {billingPeriods.map((bp: any, bpIndex: number) => (
                            <option
                              key={bp.billingPeriodId ?? bpIndex}
                              value={bp.billingPeriodId ?? bp.billingPeriod}
                            >
                              {bp.billingPeriod} - {Number(bp.duration) > 0
                                ? `${Number(bp.duration)} Month`
                                : "-"}
                            </option>
                          ))}
                        </select>
                      ) : (
                        item.billingCycle || "-"
                      )}
                    </td>

                    <td className="px-4">
                      ₹
                      {selectedBillingPeriod
                        ? (selectedBillingPeriod.totalAmount ??
                          selectedBillingPeriod.price ??
                          0)
                        : item.monthlyPrice ?? 0}
                    </td>

                    <td className="px-4 text-[#4D74AE]">
                      {formatTableDate(item.createdDate)}
                    </td>

                    <td className="px-4">
                      {Object.values(item.features || {}).flat().length}
                    </td>

                    <td className="px-4">{item.subscribedTenants || 0}</td>

                    <td className="px-4">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(
                          item.status,
                        )}`}
                      >
                        {formatStatusLabel(item.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 relative">
                      <div className="flex justify-center">
                        <button
                          className="rounded-md p-1 hover:bg-gray-100"
                          onClick={() =>
                            setOpenMenu(openMenu === index ? null : index)
                          }
                        >
                          <MoreVertical size={18} className="text-[#6B7280]" />
                        </button>

                        {openMenu === index && (
                          <div className="absolute right-4 top-12 z-50 w-36 bg-white rounded-lg shadow-lg border">
                            <button
                              className="w-full border-b text-left px-4 py-2 text-xs hover:bg-gray-100"
                              onClick={() => {
                                handleViewPlan(item.planId);
                                setSelectedPlan(item);
                                setShowModal(true);
                                setOpenMenu(null);
                              }}
                            >
                              View Details
                            </button>

                            <button
                              className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                              onClick={() => {
                                setSelectedPlan(item);
                                setShowUpdateModal(true);
                                setOpenMenu(null);
                              }}
                            >
                              Update
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showFilterPanel && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EAF2] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold font-sans text-[#111827]">
                  Filter by
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterPanel(false)}
                className="rounded-md p-2 text-[#6B7280] hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-1">
                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828]">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={draftFilters.planName}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        planName: e.target.value,
                      }))
                    }
                    placeholder="Search plan name"
                    className="h-8 w-full rounded border border-[#d5d5d5] px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828]">
                    Billing Cycle
                  </label>
                  <select
                    value={draftFilters.billingCycle}
                    onChange={(e) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        billingCycle: e.target.value,
                      }))
                    }
                    className="h-8 w-full rounded border border-[#d5d5d5] px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="All">All</option>
                    {billingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828]">
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
                    className="h-8 w-full rounded border border-[#d5d5d5] px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="All">All</option>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828]">
                    Created From
                  </label>
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
                      className="h-8 w-full rounded border border-[#d5d5d5] px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828]">
                    Created To
                  </label>
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
                      className="h-8 w-full rounded border border-[#d5d5d5] px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E6EAF2] px-5 py-4 bg-[#F9FAFB]">
              <button
                type="button"
                onClick={() => setDraftFilters(INITIAL_FILTERS)}
                className="rounded-md border border-[#d5d5d5] px-4 py-2 text-xs text-[#4B5563] hover:bg-gray-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setAppliedFilters(draftFilters);
                  setShowFilterPanel(false);
                }}
                className="rounded-md bg-[#576CBC] px-4 py-2 text-xs font-medium text-white hover:bg-[#4A5A9A]"
              >
                Show {previewFilteredPlans.length} results
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPageSafe === 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex h-8 min-w-[44px] items-center justify-center rounded border border-[#496A96] bg-white px-3 text-sm font-medium text-[#496A96]">
          {currentPageSafe} / {totalPages}
        </div>

        <button
          type="button"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPageSafe === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-5">
          {/* Modal */}
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1F2937]">
                  Plan Details
                </h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] max-h-[85vh]">
              {/* Top Plan Card */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4">
                  <div className="w-20 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
                    <Image
                      src="/assets/images/plandetails.svg"
                      alt="Plan Details"
                      width={40}
                      height={40}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedPlan.planName}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-sm text-[10px] font-medium
${
  selectedPlan.planStatus === "Active"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"
}`}
                      >
                        {selectedPlan.planStatus}
                      </span>
                    </div>

                    <p className="text-gray-700 text-xs mt-1 font-medium">
                      Our most powerful subscription plan designed for large
                      organizations with advanced features, higher resource
                      limits and priority support.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Cards */}

              <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-4 mb-5">
                {[
                  ["Plan Name", selectedPlan.planName],

                  ["Billing Cycle", selectedPlan.billingCycle],

                  [
                    "Created Date",
                    new Date(selectedPlan.createdDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ),
                  ],

                  [
                    "Last Updated",
                    new Date(selectedPlan.updatedDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ),
                  ],

                  ["Created By", selectedPlan.createdBy],
                ].map(([title, value]) => (
                  <div key={title} className="bg-[#EEF1FF] rounded-md p-3">
                    <p className="text-xs text-[#010E30]">{title}</p>

                    <p className="font-medium text-[#010e30a5] mt-1 text-[11px]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing & Statistics */}

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                {/* Pricing */}

                <div className="rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-blue-500 text-white p-4">
                  <h4 className="font-medium text-base mb-6">Pricing</h4>

                  <div className="grid grid-cols-2">
                    <div>
                      <p className="text-sm opacity-90">Monthly Price</p>

                      <h2 className="text-lg font-medium mt-3">
                        ₹{selectedPlan.monthlyPrice} <span>/ Month</span>
                      </h2>
                    </div>

                    <div className="border-l border-white/40 pl-6">
                      <p className="text-sm opacity-90">Yearly Price</p>

                      <h2 className="text-lg font-medium mt-3">
                        ₹{selectedPlan.yearlyPrice} <span>/ Year</span>
                      </h2>

                      <span className="inline-block mt-2 bg-[#D6FED5] text-green-800 px-3 py-1 rounded text-xs">
                        Save 17%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}

                <div className="border rounded-xl p-3">
                  <h4 className="font-medium text-base mb-2">
                    Plan Statistics
                  </h4>

                  {[
                    ["Student Limit", selectedPlan.studentLimit],

                    ["Trial Days", selectedPlan.trialDays],

                    ["Setup Fee", `₹${selectedPlan.setupFee}`],

                    ["GST / Tax", `${selectedPlan.gstAndTax}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-[5px]">
                      <span className="text-[#010e30] text-[14px] font-normal">
                        {k}
                      </span>

                      <span className="font-light text-[14px] text-[#010e30]">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits + Modules */}

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <div className="border rounded-xl p-3">
                  <h4 className="font-medium text-base mb-2">Plan Limits</h4>
                  <div className="max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] pr-2">
                    {[
                      ["Maximum Students", selectedPlan.studentLimit],

                      [
                        "Custom Domain",
                        selectedPlan.customDomain ? "Yes" : "No",
                      ],

                      ["Backup", selectedPlan.backup ? "Yes" : "No"],

                      [
                        "Custom Role",
                        selectedPlan.canCreateCustomRole ? "Yes" : "No",
                      ],

                      ["Domain", selectedPlan.domain || "-"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2">
                        <span className="text-[#010e30] text-[14px] font-normal">
                          {k}
                        </span>
                        <span className="font-light text-[14px] text-[#010e30]">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-xl p-3">
                  <h4 className="font-medium text-base mb-4">
                    Included Modules
                  </h4>

                  <div className="grid grid-cols-2 gap-y-3 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] pr-2 text-[#010e30] text-[14px] font-normal">
                    {modules.map((item: string) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}

              <div className="border rounded-xl p-3">
                <h4 className="font-medium text-base mb-3">Timeline</h4>

                {[
                  [
                    "Plan Created",
                    new Date(selectedPlan.createdDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ),
                  ],

                  [
                    "Last Updated",
                    new Date(selectedPlan.updatedDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ),
                  ],

                  ["Last Updated By", selectedPlan.lastUpdatedBy || "-"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <span className="text-[#010e30] text-[14px] font-normal">
                      {k}
                    </span>

                    <span className="font-light text-[13px] text-[#010e30]">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedPlan && (
        <div className="fixed inset-0 z-[9999] rounded-lg flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-lg border-2 border-[#3B82F6] bg-[#FBFDFF] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6EAF2] px-4 py-3">
              <h2 className="text-lg font-semibold text-[#1F2A44]">Update Plan</h2>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="rounded-md p-1 text-[#667085] transition hover:bg-gray-100"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-4 py-3">
              <div className="rounded-md border border-[#E5EAF3] bg-white p-4">
                <h3 className="mb-3 text-[15px] font-semibold text-[#1F2A44]">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054]">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={formData.planName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          planName: e.target.value,
                        })
                      }
                      className="h-8 w-full rounded border border-[#D0D5DD] px-3 text-xs outline-none focus:border-[#576CBC]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054]">
                      Plan Tag
                    </label>
                    <select
                      value={formData.planTag}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          planTag: e.target.value,
                        })
                      }
                      className="h-8 w-full rounded border border-[#D0D5DD] px-3 text-xs outline-none focus:border-[#576CBC]"
                    >
                      <option>Most Popular</option>
                      <option>Growing</option>
                      <option>Low Adoption</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-[#344054]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.planDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        planDescription: e.target.value,
                      })
                    }
                    className="w-full rounded border border-[#D0D5DD] p-3 text-xs outline-none focus:border-[#576CBC]"
                    placeholder="Short explanation about the plan and its features."
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4">
                <h3 className="mb-3 text-[15px] font-semibold text-[#1F2A44]">
                  Plan Limits
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054]">
                      Students
                    </label>
                    <input
                      type="number"
                      value={formData.studentLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentLimit: Number(e.target.value),
                        })
                      }
                      className="h-8 w-full rounded border border-[#D0D5DD] px-3 text-xs outline-none focus:border-[#576CBC]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054]">
                      Users
                    </label>
                    <input
                      type="number"
                      value={formData.userLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          userLimit: Number(e.target.value),
                        })
                      }
                      className="h-8 w-full rounded border border-[#D0D5DD] px-3 text-xs outline-none focus:border-[#576CBC]"
                    />
                  </div>

                  <div className="flex items-end gap-8 md:col-span-2 lg:col-span-2">
                    <div className="flex flex-col">
                      <span className="mb-2 text-xs font-medium text-[#344054]">
                        Custom Domain
                      </span>
                      <ToggleSwitch
                        checked={features.customDomain}
                        onChange={() =>
                          setFeatures((prev) => ({
                            ...prev,
                            customDomain: !prev.customDomain,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-2 text-xs font-medium text-[#344054]">
                        Backup
                      </span>
                      <ToggleSwitch
                        checked={features.backup}
                        onChange={() =>
                          setFeatures((prev) => ({
                            ...prev,
                            backup: !prev.backup,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1F2A44]">
                    Pricing Configuration
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddBillingPeriodModal(true)}
                    className="rounded border border-[#C9D3F9] bg-[#EEF2FF] px-3 py-1 text-[11px] font-medium text-[#3D56A8]"
                  >
                    Add Custom Billing Period
                  </button>
                </div>

                <div className="overflow-x-auto rounded border border-[#E6EAF2]">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-[#576CBC] text-white">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Billing Period</th>
                        <th className="px-3 py-2 text-left font-medium">Duration</th>
                        <th className="px-3 py-2 text-left font-medium">Price (₹)</th>
                        <th className="px-3 py-2 text-left font-medium">Discount (%)</th>
                        <th className="px-3 py-2 text-left font-medium">
                          GST ({Number(formData.gstAndTax) || 0}%)
                        </th>
                        <th className="px-3 py-2 text-left font-medium">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRowsForTable.map((row) => {
                        const discounted = row.price - (row.price * row.discount) / 100;
                        const gst = (discounted * Number(formData.gstAndTax || 0)) / 100;
                        const total = discounted + gst;

                        return (
                          <tr
                            key={row.billingPeriodId ?? row.period}
                            className="border-t border-[#EEF2F7] text-[#344054]"
                          >
                            <td className="px-3 py-2">{String(row.period)}</td>
                            <td className="px-3 py-2">
                              {row.duration > 0
                                ? `${row.duration} Month${row.duration > 1 ? "s" : ""}`
                                : "-"}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min={0}
                                value={row.price}
                                readOnly={!row.billingPeriodId}
                                onChange={(e) =>
                                  handlePricingRowChange(
                                    row.billingPeriodId,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                onBlur={() => handlePricingRowBlur(row.billingPeriodId)}
                                className="h-7 w-[88px] rounded border border-[#D0D5DD] bg-[#F8FAFC] px-2 disabled:bg-[#F1F3F7]"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={row.discount}
                                readOnly={!row.billingPeriodId}
                                onChange={(e) =>
                                  handlePricingRowChange(
                                    row.billingPeriodId,
                                    "discount",
                                    e.target.value,
                                  )
                                }
                                onBlur={() => handlePricingRowBlur(row.billingPeriodId)}
                                className="h-7 w-[72px] rounded border border-[#D0D5DD] bg-[#F8FAFC] px-2"
                              />
                            </td>
                            <td className="px-3 py-2">₹{gst.toFixed(2)}</td>
                            <td className="px-3 py-2">₹{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-[#344054]">
                    GST / Tax
                  </label>
                  <input
                    type="number"
                    value={formData.gstAndTax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gstAndTax: Number(e.target.value),
                      })
                    }
                    className="h-8 w-full rounded border border-[#D0D5DD] px-3 text-xs outline-none focus:border-[#576CBC]"
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1F2A44]">
                    Included Modules & Features
                  </h3>
                  <button
                    type="button"
                    className="rounded border border-[#C9D3F9] bg-[#EEF2FF] px-3 py-1 text-[11px] font-medium text-[#3D56A8]"
                  >
                    Add
                  </button>
                </div>

                <div className="mb-4 flex gap-3">
                  {roleTabs.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setActiveRoleTab(role)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        activeRoleTab === role
                          ? "bg-[#E5EDFF] text-[#3D56A8]"
                          : "text-[#475467] hover:bg-[#F2F4F7]"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2 text-[13px] text-[#1F2A44] md:grid-cols-2">
                  {[
                    "Student Management",
                    "Staff Management",
                    "Attendance",
                    "Fees Management",
                    "Examination",
                    "Transport Management",
                    "Library Management",
                    "Hostel Management",
                    "HR & Payroll",
                    "Performance Analytics",
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-[#576CBC]"
                        checked={activeRoleModules.includes(item) || selectedModules.includes(item)}
                        onChange={(e) => {
                          let modules = [...activeRoleModules];

                          if (e.target.checked) {
                            modules.push(item);
                          } else {
                            modules = modules.filter((m) => m !== item);
                          }

                          setFormData((prev) => ({
                            ...prev,
                            features: {
                              ...prev.features,
                              [activeRoleTab]: modules,
                            },
                          }));
                        }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4">
                <h3 className="mb-3 text-[15px] font-semibold text-[#1F2A44]">Status</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr] md:items-center">
                  <label className="text-xs font-medium text-[#344054]">Plan Status</label>
                  <select
                    value={formData.planStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        planStatus: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-[#D0D5DD] px-3 text-xs outline-none focus:border-[#576CBC]"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E6EAF2] bg-[#F8FAFC] px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  if (selectedPlan?.planId) {
                    getPlanById(selectedPlan.planId);
                  }
                }}
                className="rounded border border-[#D0D5DD] bg-white px-4 py-1.5 text-xs font-medium text-[#475467]"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSavingPlan}
                className="rounded bg-[#576CBC] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {isSavingPlan ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddBillingPeriodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-5">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#010E30]">
                Add Custom Billing Period
              </h3>

              <button
                onClick={handleCancelAddBillingPeriod}
                className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-gray-100 hover:text-black rounded-md"
                type="button"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#010E30] font-medium mb-2">
                  Billing Period
                </label>

                <input
                  type="text"
                  value={billingPeriodForm.billingPeriod}
                  onChange={(e) =>
                    setBillingPeriodForm((prev) => ({
                      ...prev,
                      billingPeriod: e.target.value,
                    }))
                  }
                  placeholder="Monthly"
                  className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59]"
                />

                {billingPeriodFormErrors.billingPeriod && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {billingPeriodFormErrors.billingPeriod}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#010E30] font-medium mb-2">
                  Duration
                </label>

                <input
                  type="number"
                  min={1}
                  value={billingPeriodForm.duration === 0 ? "" : billingPeriodForm.duration}
                  onChange={(e) =>
                    setBillingPeriodForm((prev) => ({
                      ...prev,
                      duration: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  placeholder="1"
                  className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59]"
                />

                {billingPeriodFormErrors.duration && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {billingPeriodFormErrors.duration}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelAddBillingPeriod}
                className="border border-gray-300 hover:bg-gray-50 px-4 text-xs py-2 rounded-md"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={handleAddBillingPeriod}
                disabled={isSavingBillingPeriod}
                className="bg-[#576CBC] text-white px-4 text-xs py-2 rounded-md disabled:opacity-60"
                type="button"
              >
                {isSavingBillingPeriod ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansTable;
