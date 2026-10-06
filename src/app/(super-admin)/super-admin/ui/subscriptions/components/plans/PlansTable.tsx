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
          : "border-[#D6DCEB] bg-[#EFF2F8] dark:border-[#555] dark:bg-[#2C2C2C]"
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

interface PortalOption {
  _id: string;
  portalName: string;
  status?: string;
}

interface AllowedRole {
  portalId: string;
  portalName: string;
}

const isAllowedRole = (value: unknown): value is AllowedRole =>
  typeof value === "object" &&
  value !== null &&
  "portalId" in value &&
  typeof value.portalId === "string" &&
  "portalName" in value &&
  typeof value.portalName === "string";

interface FeatureControlRow {
  portal: string;
  parentModuleId: string;
  parentModuleName: string;
  childModuleId: string | null;
  childModuleName: string | null;
  featureId: string | null;
  featureName: string | null;
  status: string;
}

interface PlanFeatureItem {
  featureId?: string;
  featureName?: string;
  portalId?: string;
  portalName?: string;
}

interface PlanChildModule {
  childModuleId?: string;
  childModuleName?: string;
  order?: number;
  portalId?: string;
  portalName?: string;
  features?: PlanFeatureItem[];
}

interface PlanModule {
  moduleId?: string;
  moduleName?: string;
  order?: number;
  portalId?: string;
  portalName?: string;
  features?: PlanFeatureItem[];
  children?: PlanChildModule[];
}

const getPlanFeatureCount = (plan: Record<string, unknown>): number => {
  if (Array.isArray(plan.modules)) {
    return (plan.modules as PlanModule[]).reduce(
      (count, module) =>
        count +
        (module.features?.length ?? 0) +
        (module.children ?? []).reduce(
          (childCount, child) => childCount + (child.features?.length ?? 0),
          0,
        ),
      0,
    );
  }

  const legacyFeatures = plan.features;
  return legacyFeatures && typeof legacyFeatures === "object"
    ? Object.values(legacyFeatures as Record<string, unknown[]>).reduce(
        (count, items) => count + (Array.isArray(items) ? items.length : 0),
        0,
      )
    : 0;
};

const getModulesForPortal = (
  portal: PortalOption,
  rows: FeatureControlRow[],
): PlanModule[] => {
  const modules = new Map<string, PlanModule>();

  rows
    .filter(
      (row) =>
        row.portal?.trim().toLowerCase() === portal.portalName.trim().toLowerCase() &&
        row.status?.toLowerCase() === "active",
    )
    .forEach((row) => {
      if (!row.parentModuleId || !row.parentModuleName) return;

      let parentModule = modules.get(row.parentModuleId);
      if (!parentModule) {
        parentModule = {
          moduleId: row.parentModuleId,
          moduleName: row.parentModuleName,
          order: modules.size + 1,
          portalId: portal._id,
          portalName: portal.portalName,
          features: [],
          children: [],
        };
        modules.set(row.parentModuleId, parentModule);
      }

      if (row.childModuleId && row.childModuleName) {
        let child = parentModule.children?.find(
          (item) => item.childModuleId === row.childModuleId,
        );
        if (!child) {
          child = {
            childModuleId: row.childModuleId,
            childModuleName: row.childModuleName,
            order: (parentModule.children?.length ?? 0) + 1,
            portalId: portal._id,
            portalName: portal.portalName,
            features: [],
          };
          parentModule.children?.push(child);
        }

        if (row.featureId && row.featureName) {
          child.features?.push({
            featureId: row.featureId,
            featureName: row.featureName,
            portalId: portal._id,
            portalName: portal.portalName,
          });
        }
      } else if (row.featureId && row.featureName) {
        parentModule.features?.push({
          featureId: row.featureId,
          featureName: row.featureName,
          portalId: portal._id,
          portalName: portal.portalName,
        });
      }
    });

  return Array.from(modules.values());
};

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
  const [featureCountByPlan, setFeatureCountByPlan] = useState<
    Record<string, number>
  >({});
  const [subscribedTenantCountByPlan, setSubscribedTenantCountByPlan] =
    useState<Record<string, number>>({});
  const [selectedPlanModules, setSelectedPlanModules] = useState<PlanModule[]>([]);
  const [portalOptions, setPortalOptions] = useState<PortalOption[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<FeatureControlRow[]>([]);
  const [isLoadingModuleCatalog, setIsLoadingModuleCatalog] = useState(false);
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
      return "bg-[#DEF5FA] text-[#18BCDC] dark:bg-[#16414A] dark:text-[#65D8EB]";
    }

    if (name.includes("standard")) {
      return "bg-[#DAE4F6] text-[#2668EF] dark:bg-[#263B5A] dark:text-[#8DB5FF]";
    }

    if (name.includes("premium")) {
      return "bg-[#E7E8FA] text-[#585BDC] dark:bg-[#38395E] dark:text-[#A6A7FF]";
    }

    return "bg-gray-100 text-gray-600 dark:bg-[#444] dark:text-gray-200";
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
      return "bg-[#EAF8EC] text-[#34A853] dark:bg-[#23452B] dark:text-[#72D889]";
    }

    if (normalized === "EXPIRED") {
      return "bg-[#FDEAEA] text-[#E35D5D] dark:bg-[#512B2B] dark:text-[#FF8B8B]";
    }

    if (normalized === "EXPIRED_SOON" || normalized === "INACTIVE") {
      return "bg-[#FFF7E8] text-[#F4A429] dark:bg-[#4A3A1F] dark:text-[#FFD078]";
    }

    return "bg-[#EEF3FF] text-[#4D74AE] dark:bg-[#29384F] dark:text-[#AFC2E4]";
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

      const payload =
        response.data?.data?.items ??
        response.data?.items ??
        response.data?.data ??
        response.data;

      const planRows = Array.isArray(payload) ? payload : plansArray;
      setPlans(planRows);

      const counts = await Promise.all(
        planRows.map(async (plan: any) => {
          const planId = plan.planId;
          if (!planId) return null;

          try {
            const detailResponse = await axios.get(
              `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.GET_PLAN_BY_ID}`.replace(
                "${planId}",
                planId,
              ),
            );
            const detail = detailResponse.data?.data ?? detailResponse.data;
            return [planId, getPlanFeatureCount(detail)] as const;
          } catch (error) {
            console.error(`Error fetching plan features for ${planId}:`, error);
            return [planId, getPlanFeatureCount(plan)] as const;
          }
        }),
      );

      const countEntries = counts.filter(
        (entry): entry is readonly [string, number] => entry !== null,
      );
      setFeatureCountByPlan((current) => ({
        ...current,
        ...Object.fromEntries(countEntries),
      }));

      try {
        const firstPageResponse = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_SUBSCRIPTION.GET}`,
          { params: { page: 1, limit: 100 } },
        );
        const firstPageData = firstPageResponse.data?.data;
        const subscriptions: any[] = Array.isArray(firstPageData?.tenants)
          ? [...firstPageData.tenants]
          : Array.isArray(firstPageData?.items)
            ? [...firstPageData.items]
            : Array.isArray(firstPageData)
              ? [...firstPageData]
              : [];
        const totalPages = Number(
          firstPageData?.pagination?.totalPages ??
            firstPageResponse.data?.pagination?.totalPages ??
            1,
        );

        for (let page = 2; page <= totalPages; page += 1) {
          const pageResponse = await axios.get(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_SUBSCRIPTION.GET}`,
            { params: { page, limit: 100 } },
          );
          const pageTenants = pageResponse.data?.data?.tenants;
          if (Array.isArray(pageTenants)) subscriptions.push(...pageTenants);
        }

        const tenantsByPlan = new Map<string, Set<string>>();
        subscriptions.forEach((subscription) => {
          const tenantKey = String(
            subscription.tenantId ??
              subscription.tenant?._id ??
              subscription._id ??
              "",
          );
          if (!tenantKey) return;

          const planIdentifiers = new Set(
            [
              subscription.planId,
              subscription.plan?._id,
              subscription.plan?.planId,
            ]
              .filter(Boolean)
              .map(String),
          );

          planIdentifiers.forEach((planIdentifier) => {
            const tenantSet = tenantsByPlan.get(planIdentifier) ?? new Set<string>();
            tenantSet.add(tenantKey);
            tenantsByPlan.set(planIdentifier, tenantSet);
          });
        });

        const tenantCounts: Record<string, number> = {};
        tenantsByPlan.forEach((tenantIds, planIdentifier) => {
          tenantCounts[planIdentifier] = tenantIds.size;
        });
        setSubscribedTenantCountByPlan(tenantCounts);
      } catch (error) {
        console.error("Error fetching tenant subscription counts:", error);
      }
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

  const modules = Array.isArray(selectedPlan?.modules)
    ? selectedPlan.modules.flatMap((module: PlanModule) => [
        module.moduleName,
        ...(module.features ?? []).map((feature) => feature.featureName),
        ...(module.children ?? []).flatMap((child) => [
          child.childModuleName,
          ...(child.features ?? []).map((feature) => feature.featureName),
        ]),
      ]).filter((name:any): name is string => Boolean(name))
    : selectedPlan?.features && typeof selectedPlan.features === "object"
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
    allowedRoles: [] as AllowedRole[],
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

  useEffect(() => {
    if (!showUpdateModal) return;

    let isCurrent = true;
    const fetchModuleCatalog = async () => {
      setIsLoadingModuleCatalog(true);
      try {
        const [portalResponse, firstFeatureResponse] = await Promise.all([
          axios.get(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PORTAL.GET_ALL}`,
            { params: { page: 1, limit: 100 } },
          ),
          axios.get(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEATURE_CONTROL.GET_ALL}`,
            { params: { page: 1, limit: 100 } },
          ),
        ]);

        const portalPayload = portalResponse.data?.data;
        const portals: PortalOption[] = Array.isArray(portalPayload?.items)
          ? portalPayload.items
          : Array.isArray(portalPayload)
            ? portalPayload
            : [];
        const featureRows: FeatureControlRow[] = Array.isArray(
          firstFeatureResponse.data?.data,
        )
          ? [...firstFeatureResponse.data.data]
          : [];
        const totalPages = Number(
          firstFeatureResponse.data?.pagination?.totalPages ?? 1,
        );

        for (let page = 2; page <= totalPages; page += 1) {
          const response = await axios.get(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEATURE_CONTROL.GET_ALL}`,
            { params: { page, limit: 100 } },
          );
          if (Array.isArray(response.data?.data)) {
            featureRows.push(...response.data.data);
          }
        }

        if (isCurrent) {
          setPortalOptions(
            portals.filter(
              (portal) =>
                portal._id &&
                portal.portalName &&
                portal.status?.toUpperCase() !== "INACTIVE",
            ),
          );
          setFeatureCatalog(featureRows);
        }
      } catch (error) {
        console.error("Error loading portal module catalog:", error);
        if (isCurrent) toast.error("Failed to load portals and features");
      } finally {
        if (isCurrent) setIsLoadingModuleCatalog(false);
      }
    };

    fetchModuleCatalog();
    return () => {
      isCurrent = false;
    };
  }, [showUpdateModal]);

  const togglePlanModule = (
    portal: PortalOption,
    module: PlanModule,
    child?: PlanChildModule,
    feature?: PlanFeatureItem,
  ) => {
    if (!module.moduleId) return;

    setSelectedPlanModules((current) => {
      const moduleIndex = current.findIndex(
        (item) =>
          item.moduleId === module.moduleId && item.portalId === portal._id,
      );
      const existingModule = current[moduleIndex];

      if (!child && !feature) {
        return existingModule
          ? current.filter((_, index) => index !== moduleIndex)
          : [
              ...current,
              {
                ...module,
                portalId: portal._id,
                portalName: portal.portalName,
                features: [],
                children: [],
              },
            ];
      }

      const baseModule: PlanModule = existingModule ?? {
        ...module,
        portalId: portal._id,
        portalName: portal.portalName,
        features: [],
        children: [],
      };

      let updatedModule = baseModule;
      if (feature && child) {
        const children = baseModule.children ?? [];
        const childIndex = children.findIndex(
          (item) => item.childModuleId === child.childModuleId,
        );
        const existingChild = children[childIndex];
        const baseChild = existingChild ?? {
          ...child,
          portalId: portal._id,
          portalName: portal.portalName,
          features: [],
        };
        const selectedFeatures = baseChild.features ?? [];
        const featureSelected = selectedFeatures.some(
          (item) => item.featureId === feature.featureId,
        );
        const updatedChild: PlanChildModule = {
          ...baseChild,
          features: featureSelected
            ? selectedFeatures.filter(
                (item) => item.featureId !== feature.featureId,
              )
            : [
                ...selectedFeatures,
                {
                  ...feature,
                  portalId: portal._id,
                  portalName: portal.portalName,
                },
              ],
        };
        updatedModule = {
          ...baseModule,
          children:
            childIndex >= 0
              ? children.map((item, index) =>
                  index === childIndex ? updatedChild : item,
                )
              : [...children, updatedChild],
        };
      } else if (feature) {
        const selectedFeatures = baseModule.features ?? [];
        const featureSelected = selectedFeatures.some(
          (item) => item.featureId === feature.featureId,
        );
        updatedModule = {
          ...baseModule,
          features: featureSelected
            ? selectedFeatures.filter(
                (item) => item.featureId !== feature.featureId,
              )
            : [
                ...selectedFeatures,
                {
                  ...feature,
                  portalId: portal._id,
                  portalName: portal.portalName,
                },
              ],
        };
      } else if (child) {
        const children = baseModule.children ?? [];
        const childSelected = children.some(
          (item) => item.childModuleId === child.childModuleId,
        );
        updatedModule = {
          ...baseModule,
          children: childSelected
            ? children.filter(
                (item) => item.childModuleId !== child.childModuleId,
              )
            : [
                ...children,
                {
                  ...child,
                  portalId: portal._id,
                  portalName: portal.portalName,
                  features: [],
                },
              ],
        };
      }

      return moduleIndex >= 0
        ? current.map((item, index) =>
            index === moduleIndex ? updatedModule : item,
          )
        : [...current, updatedModule];
    });
  };

  const getPlanById = async (planId: string) => {
    try {
      const res = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.GET_PLAN_BY_ID}`.replace("${planId}", planId));

      const plan = res.data.data;
      setSelectedPlanModules(
        Array.isArray(plan.modules) ? plan.modules : [],
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
        allowedRoles: Array.isArray(plan.allowedRoles)
          ? plan.allowedRoles.filter(isAllowedRole)
          : [],
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

    const allowedRoles = formData.allowedRoles;

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
      modules: selectedPlanModules,

      canCreateCustomRole: Boolean(formData.canCreateCustomRole),

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
      <h2 className="mb-0 text-[22px] p-2 font-semibold text-[#1F2A44] dark:text-white">
        Plan
      </h2>

      {/* Card */}
      <div className="overflow-hidden rounded-lg border border-[#E6EAF2] bg-white text-gray-800 dark:border-[#3F3F3F] dark:bg-[#343434] dark:text-gray-200">
        {/* Top Bar */}
        <div className="grid grid-cols-3 border-b border-[#E6EAF2] dark:border-[#3F3F3F]">
          {/* Search */}
          <div className="flex h-12 items-center border-r border-[#E6EAF2] px-4 dark:border-[#3F3F3F]">
            <Search size={17} className="text-[#A5AAB4]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword"
              className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4] dark:text-white dark:placeholder:text-gray-400"
            />
          </div>

          {/* Filter */}
          <button
            onClick={() => {
              setDraftFilters(appliedFilters);
              setShowFilterPanel(true);
            }}
            className="flex h-12 items-center justify-between border-r border-[#E6EAF2] px-4 text-sm text-[#80848E] hover:bg-gray-50 dark:border-[#3F3F3F] dark:text-gray-300 dark:hover:bg-[#3A3A3A]"
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
          <div className="flex h-12 items-center px-4 text-sm text-[#80848E] dark:text-gray-300">
            Showing {showingStart} - {showingEnd} of {filteredPlans.length}
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="h-10 bg-[#496A96] text-left text-[14px] text-white dark:bg-[#344563]">
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
                  <td colSpan={8} className="p-8 text-center text-gray-700 dark:text-gray-200">
                    Loading...
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280] dark:text-gray-300">
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
                          className="h-7 rounded border border-[#E5E7EB] bg-white px-2 text-[11px] text-[#344054] outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
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

                    <td className="px-4 text-[#4D74AE] dark:text-[#9CB8E0]">
                      {formatTableDate(item.createdDate)}
                    </td>

                    <td className="px-4">
                      {featureCountByPlan[item.planId] ??
                        getPlanFeatureCount(item)}
                    </td>

                    <td className="px-4">
                      {subscribedTenantCountByPlan[item._id] ??
                        subscribedTenantCountByPlan[item.planId] ??
                        item.subscribedTenants ??
                        0}
                    </td>

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
                          className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-[#444]"
                          onClick={() =>
                            setOpenMenu(openMenu === index ? null : index)
                          }
                        >
                          <MoreVertical size={18} className="text-[#6B7280]" />
                        </button>

                        {openMenu === index && (
                          <div className="absolute right-4 top-12 z-50 w-36 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-lg dark:border-[#4A4A4A] dark:bg-[#343434] dark:text-gray-100">
                            <button
                              className="w-full border-b border-gray-200 px-4 py-2 text-left text-xs hover:bg-gray-100 dark:border-[#4A4A4A] dark:hover:bg-[#444]"
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
                              className="w-full px-4 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-[#444]"
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
          <div className="w-full max-w-[360px] overflow-hidden rounded-xl bg-white text-gray-900 shadow-2xl dark:bg-[#343434] dark:text-white">
            <div className="flex items-center justify-between border-b border-[#E6EAF2] px-5 py-4 dark:border-[#4A4A4A]">
              <div>
                <h3 className="text-lg font-semibold font-sans text-[#111827] dark:text-white">
                  Filter by
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterPanel(false)}
                className="rounded-md p-2 text-[#6B7280] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#444]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-1">
                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828] dark:text-gray-200">
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
                    className="h-8 w-full rounded border border-[#d5d5d5] bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828] dark:text-gray-200">
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
                    className="h-8 w-full rounded border border-[#d5d5d5] bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
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
                  <label className="mb-2 text-sm font-medium text-[#101828] dark:text-gray-200">
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
                    className="h-8 w-full rounded border border-[#d5d5d5] bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
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
                  <label className="mb-2 text-sm font-medium text-[#101828] dark:text-gray-200">
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
                      className="h-8 w-full rounded border border-[#d5d5d5] bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 text-sm font-medium text-[#101828] dark:text-gray-200">
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
                      className="h-8 w-full rounded border border-[#d5d5d5] bg-white px-3 text-xs outline-none focus:border-indigo-500 focus:ring-indigo-500 dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E6EAF2] bg-[#F9FAFB] px-5 py-4 dark:border-[#4A4A4A] dark:bg-[#2C2C2C]">
              <button
                type="button"
                onClick={() => setDraftFilters(INITIAL_FILTERS)}
                className="rounded-md border border-[#d5d5d5] px-4 py-2 text-xs text-[#4B5563] hover:bg-gray-50 dark:border-[#555] dark:text-gray-200 dark:hover:bg-[#3A3A3A]"
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
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#3A3A3A]"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex h-8 min-w-[44px] items-center justify-center rounded border border-[#496A96] bg-white px-3 text-sm font-medium text-[#496A96] dark:bg-[#343434] dark:text-[#AFC2E4]">
          {currentPageSafe} / {totalPages}
        </div>

        <button
          type="button"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPageSafe === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4A4A4A] dark:hover:bg-[#3A3A3A]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-5">
          {/* Modal */}
          <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-white text-gray-900 shadow-2xl dark:bg-[#343434] dark:text-gray-100">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-[#4A4A4A]">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1F2937] dark:text-white">
                  Plan Details
                </h2>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 transition hover:text-gray-700 dark:hover:text-white"
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

            <div className="max-h-[85vh] overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] dark:scrollbar-track-[#343434]">
              {/* Top Plan Card */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4">
                  <div className="flex h-16 w-20 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-[#41466A]">
                    <Image
                      src="/assets/images/plandetails.svg"
                      alt="Plan Details"
                      width={40}
                      height={40}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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

                    <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
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
                  <div key={title} className="rounded-md bg-[#EEF1FF] p-3 dark:bg-[#2C3344]">
                    <p className="text-xs text-[#010E30] dark:text-gray-200">{title}</p>

                    <p className="mt-1 text-[11px] font-medium text-[#010e30a5] dark:text-gray-300">
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

                <div className="rounded-xl border border-gray-200 p-3 dark:border-[#4A4A4A]">
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
                      <span className="text-[14px] font-normal text-[#010e30] dark:text-gray-300">
                        {k}
                      </span>

                      <span className="text-[14px] font-light text-[#010e30] dark:text-gray-200">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits + Modules */}

              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <div className="rounded-xl border border-gray-200 p-3 dark:border-[#4A4A4A]">
                  <h4 className="font-medium text-base mb-2">Plan Limits</h4>
                  <div className="max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] dark:scrollbar-track-[#343434]">
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
                        <span className="text-[14px] font-normal text-[#010e30] dark:text-gray-300">
                          {k}
                        </span>
                        <span className="text-[14px] font-light text-[#010e30] dark:text-gray-200">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-3 dark:border-[#4A4A4A]">
                  <h4 className="font-medium text-base mb-4">
                    Included Modules
                  </h4>

                  <div className="grid max-h-[180px] grid-cols-2 gap-y-3 overflow-y-auto pr-2 text-[14px] font-normal text-[#010e30] scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] dark:text-gray-200 dark:scrollbar-track-[#343434]">
                    {modules.map((item: string) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}

              <div className="rounded-xl border border-gray-200 p-3 dark:border-[#4A4A4A]">
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
                    <span className="text-[14px] font-normal text-[#010e30] dark:text-gray-300">
                      {k}
                    </span>

                    <span className="text-[13px] font-light text-[#010e30] dark:text-gray-200">
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
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-lg border-2 border-[#3B82F6] bg-[#FBFDFF] text-gray-900 shadow-2xl dark:bg-[#2C2C2C] dark:text-gray-100">
            <div className="flex items-center justify-between border-b border-[#E6EAF2] px-4 py-3 dark:border-[#4A4A4A]">
              <h2 className="text-lg font-semibold text-[#1F2A44] dark:text-white">Update Plan</h2>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="rounded-md p-1 text-[#667085] transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#444]"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-4 py-3">
              <div className="rounded-md border border-[#E5EAF3] bg-white p-4 dark:border-[#4A4A4A] dark:bg-[#343434]">
                <h3 className="mb-3 text-[15px] font-semibold text-[#1F2A44] dark:text-white">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054] dark:text-gray-300">
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
                      className="h-8 w-full rounded border border-[#D0D5DD] bg-white px-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054] dark:text-gray-300">
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
                      className="h-8 w-full rounded border border-[#D0D5DD] bg-white px-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    >
                      <option>Most Popular</option>
                      <option>Growing</option>
                      <option>Low Adoption</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-[#344054] dark:text-gray-300">
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
                    className="w-full rounded border border-[#D0D5DD] bg-white p-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    placeholder="Short explanation about the plan and its features."
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4 dark:border-[#4A4A4A] dark:bg-[#343434]">
                <h3 className="mb-3 text-[15px] font-semibold text-[#1F2A44] dark:text-white">
                  Plan Limits
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054] dark:text-gray-300">
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
                      className="h-8 w-full rounded border border-[#D0D5DD] bg-white px-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#344054] dark:text-gray-300">
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
                      className="h-8 w-full rounded border border-[#D0D5DD] bg-white px-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                    />
                  </div>

                  <div className="flex items-end gap-8 md:col-span-2 lg:col-span-2">
                    <div className="flex flex-col">
                      <span className="mb-2 text-xs font-medium text-[#344054] dark:text-gray-300">
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
                      <span className="mb-2 text-xs font-medium text-[#344054] dark:text-gray-300">
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

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4 dark:border-[#4A4A4A] dark:bg-[#343434]">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1F2A44] dark:text-white">
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

                <div className="overflow-x-auto rounded border border-[#E6EAF2] dark:border-[#4A4A4A]">
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
                            className="border-t border-[#EEF2F7] text-[#344054] dark:border-[#4A4A4A] dark:text-gray-200"
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
                                className="h-7 w-[88px] rounded border border-[#D0D5DD] bg-[#F8FAFC] px-2 disabled:bg-[#F1F3F7] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white dark:disabled:bg-[#383838]"
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
                                className="h-7 w-[72px] rounded border border-[#D0D5DD] bg-[#F8FAFC] px-2 dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
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
                  <label className="mb-1 block text-xs font-medium text-[#344054] dark:text-gray-300">
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
                    className="h-8 w-full rounded border border-[#D0D5DD] bg-white px-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4 dark:border-[#4A4A4A] dark:bg-[#343434]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1F2A44] dark:text-white">
                    Included Modules & Features
                  </h3>
                </div>

                <div className="mb-5">
                  <p className="mb-2 text-xs font-medium text-[#344054] dark:text-gray-300">
                    Allowed Portals
                  </p>
                  {isLoadingModuleCatalog ? (
                    <p className="text-xs text-[#667085] dark:text-gray-400">Loading portal catalog...</p>
                  ) : portalOptions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {portalOptions.map((portal) => {
                        const isChecked = formData.allowedRoles.some(
                          (role) => role.portalId === portal._id,
                        );

                        return (
                          <label
                            key={portal._id}
                            className="flex cursor-pointer items-center gap-2 text-[13px] text-[#344054] dark:text-gray-300"
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 accent-[#576CBC]"
                              checked={isChecked}
                              onChange={(event) => {
                                setFormData((current) => ({
                                  ...current,
                                  allowedRoles: event.target.checked
                                    ? [
                                        ...current.allowedRoles,
                                        {
                                          portalId: portal._id,
                                          portalName: portal.portalName,
                                        },
                                      ]
                                    : current.allowedRoles.filter(
                                        (role) => role.portalId !== portal._id,
                                      ),
                                }));
                                if (!event.target.checked) {
                                  setSelectedPlanModules((current) =>
                                    current.filter(
                                      (module) => module.portalId !== portal._id,
                                    ),
                                  );
                                }
                              }}
                            />
                            {portal.portalName}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#667085] dark:text-gray-400">No portals found.</p>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.allowedRoles.map((allowedRole) => {
                    const portal = portalOptions.find(
                      (item) => item._id === allowedRole.portalId,
                    );
                    if (!portal) return null;

                    const portalModules = getModulesForPortal(
                      portal,
                      featureCatalog,
                    );

                    return (
                      <section
                        key={portal._id}
                        className="rounded border border-[#E6EAF2] bg-[#F8FAFC] p-3 dark:border-[#4A4A4A] dark:bg-[#2C2C2C]"
                      >
                        <h4 className="mb-3 text-xs font-semibold text-[#344054] dark:text-gray-200">
                          {portal.portalName}
                        </h4>
                        {portalModules.length > 0 ? (
                          <div className="space-y-3">
                            {portalModules.map((module) => {
                              const selectedModule = selectedPlanModules.find(
                                (item) =>
                                  item.portalId === portal._id &&
                                  item.moduleId === module.moduleId,
                              );

                              return (
                                <div
                                  key={`${portal._id}-${module.moduleId}`}
                                  className="rounded border border-[#E6EAF2] bg-white p-3 dark:border-[#4A4A4A] dark:bg-[#343434]"
                                >
                                  <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#1F2A44] dark:text-gray-200">
                                    <input
                                      type="checkbox"
                                      className="h-3.5 w-3.5 accent-[#576CBC]"
                                      checked={Boolean(selectedModule)}
                                      onChange={() =>
                                        togglePlanModule(portal, module)
                                      }
                                    />
                                    {module.moduleName}
                                  </label>

                                  {module.features?.map((feature) => (
                                    <label
                                      key={feature.featureId}
                                      className="ml-6 mt-2 flex cursor-pointer items-center gap-2 text-xs text-[#475467] dark:text-gray-300"
                                    >
                                      <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 accent-[#576CBC]"
                                        checked={Boolean(
                                          selectedModule?.features?.some(
                                            (item) =>
                                              item.featureId === feature.featureId,
                                          ),
                                        )}
                                        onChange={() =>
                                          togglePlanModule(portal, module, undefined, feature)
                                        }
                                      />
                                      {feature.featureName}
                                    </label>
                                  ))}

                                  {module.children?.map((child) => {
                                    const selectedChild = selectedModule?.children?.find(
                                      (item) =>
                                        item.childModuleId === child.childModuleId,
                                    );

                                    return (
                                      <div
                                        key={child.childModuleId}
                                        className="ml-6 mt-3 border-l border-[#D0D5DD] pl-3 dark:border-[#555]"
                                      >
                                        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#344054] dark:text-gray-300">
                                          <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 accent-[#576CBC]"
                                            checked={Boolean(selectedChild)}
                                            onChange={() =>
                                              togglePlanModule(portal, module, child)
                                            }
                                          />
                                          {child.childModuleName}
                                        </label>
                                        {child.features?.map((feature) => (
                                          <label
                                            key={feature.featureId}
                                            className="ml-6 mt-2 flex cursor-pointer items-center gap-2 text-xs text-[#667085] dark:text-gray-400"
                                          >
                                            <input
                                              type="checkbox"
                                              className="h-3.5 w-3.5 accent-[#576CBC]"
                                              checked={Boolean(
                                                selectedChild?.features?.some(
                                                  (item) =>
                                                    item.featureId === feature.featureId,
                                                ),
                                              )}
                                              onChange={() =>
                                                togglePlanModule(
                                                  portal,
                                                  module,
                                                  child,
                                                  feature,
                                                )
                                              }
                                            />
                                            {feature.featureName}
                                          </label>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-[#667085] dark:text-gray-400">
                            No active modules or features for this portal.
                          </p>
                        )}
                      </section>
                    );
                  })}
                  {formData.allowedRoles.length === 0 && (
                    <p className="text-xs text-[#667085] dark:text-gray-400">
                      Select a portal to choose its modules and features.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-[#E5EAF3] bg-white p-4 dark:border-[#4A4A4A] dark:bg-[#343434]">
                <h3 className="mb-3 text-[15px] font-semibold text-[#1F2A44] dark:text-white">Status</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr] md:items-center">
                  <label className="text-xs font-medium text-[#344054] dark:text-gray-300">Plan Status</label>
                  <select
                    value={formData.planStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        planStatus: e.target.value,
                      })
                    }
                    className="h-8 w-full rounded border border-[#D0D5DD] bg-white px-3 text-xs outline-none focus:border-[#576CBC] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#E6EAF2] bg-[#F8FAFC] px-5 py-3 dark:border-[#4A4A4A] dark:bg-[#2C2C2C]">
              <button
                type="button"
                onClick={() => {
                  if (selectedPlan?.planId) {
                    getPlanById(selectedPlan.planId);
                  }
                }}
                className="rounded border border-[#D0D5DD] bg-white px-4 py-1.5 text-xs font-medium text-[#475467] dark:border-[#555] dark:bg-[#343434] dark:text-gray-200"
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
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-gray-900 shadow-xl dark:bg-[#343434] dark:text-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#010E30] dark:text-white">
                Add Custom Billing Period
              </h3>

              <button
                onClick={handleCancelAddBillingPeriod}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-[#444] dark:hover:text-white"
                type="button"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#010E30] dark:text-gray-200">
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
                  className="h-8 w-full rounded-sm border border-[#D4D4D4] px-2 text-xs outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white dark:placeholder:text-gray-400"
                />

                {billingPeriodFormErrors.billingPeriod && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {billingPeriodFormErrors.billingPeriod}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#010E30] dark:text-gray-200">
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
                  className="h-8 w-full rounded-sm border border-[#D4D4D4] px-2 text-xs outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:border-[#555] dark:bg-[#2C2C2C] dark:text-white dark:placeholder:text-gray-400"
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
                className="rounded-md border border-gray-300 px-4 py-2 text-xs hover:bg-gray-50 dark:border-[#555] dark:hover:bg-[#444]"
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
