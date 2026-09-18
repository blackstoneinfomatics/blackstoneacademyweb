"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsThreeDotsVertical, BsX } from "react-icons/bs";
import { FiSearch, FiChevronDown, FiInfo } from "react-icons/fi";
import { MdTune } from "react-icons/md";
import { HiOutlineArrowLeft } from "react-icons/hi";
import BaseSuperLayout from "../../../components/BaseSuperLayout";
import SuperAdminHeader from "../../../components/SuperAdminHeader";
import AddTenantFeatureForm, {
  type TenantParentModuleOption,
  type TenantPortalOption,
} from "../component/AddTenantFeatureForm";
import axios from "axios";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import {
  addTenantModule,
  addTenantChildModule,
  addTenantModuleFeature,
  addTenantChildFeature,
  updateTenantModuleAccess,
  updateTenantChildModuleAccess,
  updateTenantModuleFeatureAccess,
  updateTenantChildFeatureAccess,
  type TenantModule,
  type TenantAccessPayload,
  type PortalStatus,
} from "../../../portalModule/index";

/* ================= TYPES ================= */
interface ModuleListRow {
  moduleId: string;
  childModuleId: string | null;
  moduleName: string;
  childModule: string;
  order: number | string;
  description: string;
  addOn: string;
  status: "Enable" | "Disable";
  isEnabled: boolean;
}

interface FeatureListRow {
  featureId: string;
  moduleId: string;
  childModuleId: string | null;
  featureName: string;
  parentModule: string;
  childModule: string;
  description: string;
  addOn: string;
  status: "Enable" | "Disable";
  isEnabled: boolean;
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

/* Flattens tenant modules -> one row per parent module + one row per child module */
const buildModuleRows = (modules: TenantModule[]): ModuleListRow[] => {
  const rows: ModuleListRow[] = [];
  modules.forEach((module) => {
    rows.push({
      moduleId: module.moduleId,
      childModuleId: null,
      moduleName: module.moduleName,
      childModule: "-",
      order: module.orderNo,
      description: "-",
      addOn: formatDate(module.createdAt),
      status: module.isEnabled ? "Enable" : "Disable",
      isEnabled: module.isEnabled,
    });
    module.children.forEach((child) => {
      rows.push({
        moduleId: module.moduleId,
        childModuleId: child.childModuleId,
        moduleName: module.moduleName,
        childModule: child.childModuleName,
        order: "-",
        description: "-",
        addOn: formatDate(child.createdAt),
        status: child.isEnabled ? "Enable" : "Disable",
        isEnabled: child.isEnabled,
      });
    });
  });
  return rows;
};

/* Flattens tenant modules -> one row per feature, under its parent module and (if any) child module */
const buildFeatureRows = (modules: TenantModule[]): FeatureListRow[] => {
  const rows: FeatureListRow[] = [];
  modules.forEach((module) => {
    module.features.forEach((feature) => {
      rows.push({
        featureId: feature.featureId,
        moduleId: module.moduleId,
        childModuleId: null,
        featureName: feature.featureName,
        parentModule: module.moduleName,
        childModule: "-",
        description: "-",
        addOn: formatDate(feature.createdAt),
        status: feature.isEnabled ? "Enable" : "Disable",
        isEnabled: feature.isEnabled,
      });
    });
    module.children.forEach((child) => {
      child.features.forEach((feature) => {
        rows.push({
          featureId: feature.featureId,
          moduleId: module.moduleId,
          childModuleId: child.childModuleId,
          featureName: feature.featureName,
          parentModule: module.moduleName,
          childModule: child.childModuleName,
          description: "-",
          addOn: formatDate(feature.createdAt),
          status: feature.isEnabled ? "Enable" : "Disable",
          isEnabled: feature.isEnabled,
        });
      });
    });
  });
  return rows;
};

interface FormData {
  portal: string;
  category: string;
  navigationType: "parent" | "child" | "feature";
  parentNavigation: string;
  parentNavigationName: string;
  childNavigationName: string;
  childNavigations: string[];
  featureName: string;
  parentModule: string;
  description: string;
  status: string;
}

/* ================= CHILD NAVIGATION OPTIONS ================= */
const childNavigationOptions = ["Ticket", "Message"];
const PAGE_LIMIT = 10;
const MENU_WIDTH = 112; // w-28

const paginate = <T,>(items: T[], page: number, limit: number): T[] => {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};

const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

interface TenantPortalListItem {
  _id: string;
  portalId: string;
  portalName: string;
}

interface TenantDetails {
  tenantCode: string;
  tenantName: string;
  tenantLogo: string | null;
  domainName: string | null;
  organizationName: string | null;
  emailId: string;
  phoneNumber: string;
  mobileNumber: string;
  plan: string;
  status: string;
}

interface SubscriptionDetails {
  planId: string;
  planName: string;
  subscriptionCode: string;
  duration: number;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  nextRenewalDate: string;
  autoRenew: boolean;
  remarks: string;
}

const Usercards = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"module" | "feature">("module");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingModuleKey, setTogglingModuleKey] = useState<string | null>(
    null,
  );
  const [togglingFeatureKey, setTogglingFeatureKey] = useState<string | null>(
    null,
  );
  const openMenuRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? "";
  const portalIdParam = searchParams.get("portalId") ?? "";

  /* ====== MODAL STATES ====== */
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdFeatureName, setCreatedFeatureName] = useState<string>("");
  const [portalOptions, setPortalOptions] = useState<TenantPortalOption[]>([]);
  const [tenantModules, setTenantModules] = useState<TenantModule[]>([]);
  const [tenantDetails, setTenantDetails] = useState<TenantDetails | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<SubscriptionDetails | null>(null);
  const [configCreatedAt, setConfigCreatedAt] = useState<string | null>(null);

  /* ====== FORM STATE ====== */
  const [formData, setFormData] = useState<FormData>({
    portal: portalIdParam,
    category: "Feature",
    navigationType: "child",
    parentNavigation: "",
    parentNavigationName: "",
    childNavigationName: "",
    childNavigations: ["Ticket"],
    featureName: "",
    parentModule: "",
    description: "",
    status: "Active",
  });

  const parentModuleOptions: TenantParentModuleOption[] = tenantModules.map(
    (module) => ({
      id: module.moduleId,
      name: module.moduleName,
      children: module.children.map((child) => ({
        id: child.childModuleId,
        name: child.childModuleName,
      })),
    }),
  );

  const closeMenu = () => {
    setOpenMenu(null);
    setMenuPosition(null);
  };

  const toggleMenu = (index: number) => {
    if (openMenu === index) {
      closeMenu();
      return;
    }

    const button = buttonRefs.current[index];

    if (button) {
      const rect = button.getBoundingClientRect();
      const left = Math.min(
        rect.right - MENU_WIDTH,
        window.innerWidth - MENU_WIDTH - 8,
      );

      setMenuPosition({
        top: rect.bottom + 4,
        left: Math.max(left, 8),
      });
    }

    setOpenMenu(index);
  };

  useEffect(() => {
    if (openMenu === null) return;

    const handleClickOutside = (event: MouseEvent) => {
      const button = buttonRefs.current[openMenu];

      if (
        openMenuRef.current &&
        !openMenuRef.current.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleReposition = () => closeMenu();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [openMenu]);

  useEffect(() => {
    setSearchTerm("");
    setOpenMenu(null);
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* ====== LOAD TENANT PORTAL LIST (for Select Portal dropdown) ====== */
  useEffect(() => {
    if (!tenantId) {
      setPortalOptions([]);
      return;
    }

    const loadTenantPortals = async () => {
      try {
        const portalEndpoint = AppApiEndpoints.PORTAL.GET_BY_TENANT.replace(
          "{tenantId}",
          encodeURIComponent(tenantId),
        );
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${portalEndpoint}`,
        );

        if (response.data.success) {
          const items: TenantPortalListItem[] = response.data.data?.items ?? [];
          const options: TenantPortalOption[] = items.map((item) => ({
            id: item.portalId,
            name: item.portalName,
          }));
          setPortalOptions(options);
          setFormData((previous) => ({
            ...previous,
            portal: previous.portal || options[0]?.id || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching tenant portal list:", error);
        toast.error("Failed to load portal list");
      }
    };

    loadTenantPortals();
  }, [tenantId]);

  /* ====== LOAD TENANT CONFIG (modules, tenant details, subscription details) ====== */
  const loadTenantModules = async () => {
    if (!tenantId || !formData.portal) {
      setTenantModules([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        tenantId,
        portalId: formData.portal,
      });
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MODULE_TENANT.GET_CONFIG}?${params.toString()}`,
      );

      if (!response.data.success) {
        // Not every module/portal combination has a tenantPortalConfig yet -
        // just show an empty module/feature list for this portal, keep
        // showing the tenant's own details (name, plan, domain, ...) as-is.
        setTenantModules([]);
        return;
      }

      const data = response.data.data;
      const modules: TenantModule[] = data?.modules ?? [];

      setTenantModules(modules);
      setTenantDetails(data?.tenantDetails ?? null);
      setSubscriptionDetails(data?.subscriptionDetails ?? null);
      setConfigCreatedAt(data?.createdAt ?? null);
      setFormData((previous) => ({
        ...previous,
        parentNavigation: modules[0]?.moduleId || "",
        parentModule: modules[0]?.moduleId || "",
      }));
    } catch (error: any) {
      console.error("Error fetching tenant config:", error);
      setTenantModules([]);
    }
  };

  useEffect(() => {
    loadTenantModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, formData.portal]);

  /* ====== TENANT PARENT/CHILD MODULE + FEATURE ENABLE-DISABLE (in-place, independent updates) ====== */
  const setModuleEnabled = (moduleId: string, isEnabled: boolean) => {
    setTenantModules((previous) =>
      previous.map((module) =>
        module.moduleId === moduleId ? { ...module, isEnabled } : module,
      ),
    );
  };

  const setChildModuleEnabled = (
    moduleId: string,
    childModuleId: string,
    isEnabled: boolean,
  ) => {
    setTenantModules((previous) =>
      previous.map((module) =>
        module.moduleId !== moduleId
          ? module
          : {
              ...module,
              children: module.children.map((child) =>
                child.childModuleId === childModuleId
                  ? { ...child, isEnabled }
                  : child,
              ),
            },
      ),
    );
  };

  const setParentFeatureEnabled = (
    moduleId: string,
    featureId: string,
    isEnabled: boolean,
  ) => {
    setTenantModules((previous) =>
      previous.map((module) =>
        module.moduleId !== moduleId
          ? module
          : {
              ...module,
              features: module.features.map((feature) =>
                feature.featureId === featureId
                  ? { ...feature, isEnabled }
                  : feature,
              ),
            },
      ),
    );
  };

  const setChildFeatureEnabled = (
    moduleId: string,
    childModuleId: string,
    featureId: string,
    isEnabled: boolean,
  ) => {
    setTenantModules((previous) =>
      previous.map((module) =>
        module.moduleId !== moduleId
          ? module
          : {
              ...module,
              children: module.children.map((child) =>
                child.childModuleId !== childModuleId
                  ? child
                  : {
                      ...child,
                      features: child.features.map((feature) =>
                        feature.featureId === featureId
                          ? { ...feature, isEnabled }
                          : feature,
                      ),
                    },
              ),
            },
      ),
    );
  };

  const buildTenantAccessPayload = (isEnabled: boolean): TenantAccessPayload => ({
    tenantId,
    portalId: formData.portal,
    isEnabled,
    updatedBy: "SUPER_ADMIN",
  });

  const canToggleTenantAccess = () => {
    if (!tenantId || !formData.portal) {
      toast.error("Select a tenant and portal first");
      return false;
    }
    return true;
  };

  /* Module List tab - parent module toggle only */
  const handleToggleModule = async (moduleId: string, nextEnabled: boolean) => {
    if (!canToggleTenantAccess()) return;

    const key = `module:${moduleId}`;
    setTogglingModuleKey(key);
    setModuleEnabled(moduleId, nextEnabled);

    try {
      await updateTenantModuleAccess(
        moduleId,
        buildTenantAccessPayload(nextEnabled),
      );
      toast.success(
        `Module ${nextEnabled ? "enabled" : "disabled"} successfully!`,
      );
    } catch (error: any) {
      setModuleEnabled(moduleId, !nextEnabled);
      toast.error(error?.message || "Failed to update module status");
    } finally {
      setTogglingModuleKey(null);
    }
  };

  /* Module List tab - child module toggle only */
  const handleToggleChildModule = async (
    moduleId: string,
    childModuleId: string,
    nextEnabled: boolean,
  ) => {
    if (!canToggleTenantAccess()) return;

    const key = `child:${moduleId}:${childModuleId}`;
    setTogglingModuleKey(key);
    setChildModuleEnabled(moduleId, childModuleId, nextEnabled);

    try {
      await updateTenantChildModuleAccess(
        moduleId,
        childModuleId,
        buildTenantAccessPayload(nextEnabled),
      );
      toast.success(
        `Child module ${nextEnabled ? "enabled" : "disabled"} successfully!`,
      );
    } catch (error: any) {
      setChildModuleEnabled(moduleId, childModuleId, !nextEnabled);
      toast.error(error?.message || "Failed to update child module status");
    } finally {
      setTogglingModuleKey(null);
    }
  };

  /* Feature List tab - feature directly under a parent module */
  const handleToggleParentFeature = async (
    moduleId: string,
    featureId: string,
    nextEnabled: boolean,
  ) => {
    if (!canToggleTenantAccess()) return;

    const key = `feature:${moduleId}:${featureId}`;
    setTogglingFeatureKey(key);
    setParentFeatureEnabled(moduleId, featureId, nextEnabled);

    try {
      await updateTenantModuleFeatureAccess(
        moduleId,
        featureId,
        buildTenantAccessPayload(nextEnabled),
      );
      toast.success(
        `Feature ${nextEnabled ? "enabled" : "disabled"} successfully!`,
      );
    } catch (error: any) {
      setParentFeatureEnabled(moduleId, featureId, !nextEnabled);
      toast.error(error?.message || "Failed to update feature status");
    } finally {
      setTogglingFeatureKey(null);
    }
  };

  /* Feature List tab - feature nested under a child module */
  const handleToggleChildFeature = async (
    moduleId: string,
    childModuleId: string,
    featureId: string,
    nextEnabled: boolean,
  ) => {
    if (!canToggleTenantAccess()) return;

    const key = `childFeature:${moduleId}:${childModuleId}:${featureId}`;
    setTogglingFeatureKey(key);
    setChildFeatureEnabled(moduleId, childModuleId, featureId, nextEnabled);

    try {
      await updateTenantChildFeatureAccess(
        moduleId,
        childModuleId,
        featureId,
        buildTenantAccessPayload(nextEnabled),
      );
      toast.success(
        `Feature ${nextEnabled ? "enabled" : "disabled"} successfully!`,
      );
    } catch (error: any) {
      setChildFeatureEnabled(moduleId, childModuleId, featureId, !nextEnabled);
      toast.error(error?.message || "Failed to update feature status");
    } finally {
      setTogglingFeatureKey(null);
    }
  };

  /* ====== FORM HANDLERS ====== */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ====== TOGGLE CHILD NAVIGATION ====== */
  const toggleChildNavigation = (nav: string) => {
    setFormData((prev) => {
      const exists = prev.childNavigations.includes(nav);
      return {
        ...prev,
        childNavigations: exists
          ? prev.childNavigations.filter((n) => n !== nav)
          : [...prev.childNavigations, nav],
      };
    });
  };

  const resetForm = () => {
    setFormData((previous) => ({
      portal: previous.portal || portalOptions[0]?.id || "",
      category: "Feature",
      navigationType: "child",
      parentNavigation: tenantModules[0]?.moduleId ?? "",
      parentNavigationName: "",
      childNavigationName: "",
      childNavigations: [],
      featureName: "",
      parentModule: tenantModules[0]?.moduleId ?? "",
      description: "",
      status: "Active",
    }));
  };

  const closeAddFeatureModal = () => {
    setShowAddFeatureModal(false);
    resetForm();
  };

  const openAddFeatureModal = () => {
    resetForm();
    setShowAddFeatureModal(true);
  };

  const closeModals = () => {
    setShowSuccess(false);
    setShowFailure(false);
    setIsLoading(false);
    setCreatedFeatureName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const portalId = formData.portal;
    const status = formData.status.toUpperCase() as PortalStatus;

    try {
      if (!tenantId) {
        throw new Error("Missing tenant id");
      }
      if (!portalId) {
        throw new Error("Select a portal first");
      }

      if (formData.category === "Module") {
        if (formData.navigationType === "parent") {
          if (formData.parentNavigationName.trim()) {
            const config = await addTenantModule({
              tenantId,
              portalId,
              moduleName: formData.parentNavigationName,
              moduleStatus: status,
              createdBy: "SUPER_ADMIN",
            });
            setCreatedFeatureName(
              formData.parentNavigationName || "Parent Module",
            );

            if (formData.featureName.trim()) {
              const newModule = config.modules.find(
                (module) => module.moduleName === formData.parentNavigationName,
              );
              if (newModule) {
                await addTenantModuleFeature(newModule.moduleId, {
                  tenantId,
                  portalId,
                  featureName: formData.featureName,
                  featureStatus: status,
                  createdBy: "SUPER_ADMIN",
                });
              }
            }
          } else {
            const parent = tenantModules.find(
              (module) => module.moduleId === formData.parentModule,
            );
            if (!parent) {
              throw new Error(
                "Enter a new parent module name or select an existing one",
              );
            }
            await addTenantModuleFeature(parent.moduleId, {
              tenantId,
              portalId,
              featureName: formData.featureName,
              featureStatus: status,
              createdBy: "SUPER_ADMIN",
            });
            setCreatedFeatureName(formData.featureName || "Feature");
          }
        } else {
          const parent = tenantModules.find(
            (module) => module.moduleId === formData.parentNavigation,
          );
          if (!parent) {
            throw new Error("Select a parent module first");
          }
          await addTenantChildModule(parent.moduleId, {
            tenantId,
            portalId,
            childModuleName: formData.childNavigationName,
            childModuleStatus: status,
            createdBy: "SUPER_ADMIN",
          });
          setCreatedFeatureName(
            formData.childNavigationName || "Child Module",
          );
        }
      } else {
        const parent = tenantModules.find(
          (module) => module.moduleId === formData.parentModule,
        );
        if (!parent) {
          throw new Error("Select a parent module first");
        }

        const featurePayload = {
          tenantId,
          portalId,
          featureName: formData.featureName,
          featureStatus: status,
          createdBy: "SUPER_ADMIN",
        };

        if (formData.childNavigations.length === 0) {
          await addTenantModuleFeature(parent.moduleId, featurePayload);
        } else {
          await Promise.all(
            formData.childNavigations.map((childModuleId) =>
              addTenantChildFeature(
                parent.moduleId,
                childModuleId,
                featurePayload,
              ),
            ),
          );
        }

        setCreatedFeatureName(formData.featureName || "Feature");
      }

      await loadTenantModules();
      setShowSuccess(true);
      setShowAddFeatureModal(false);
      toast.success("Saved successfully!");
      resetForm();
    } catch (error: any) {
      console.error("Error creating feature:", error);
      setCreatedFeatureName(
        formData.featureName ||
          formData.childNavigationName ||
          formData.parentNavigationName ||
          "Feature",
      );
      setShowFailure(true);
      setShowAddFeatureModal(false);
      toast.error(error?.message || "Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FILTERS ================= */
  const moduleRows = buildModuleRows(tenantModules);
  const featureRows = buildFeatureRows(tenantModules);
  const totalFeaturesCount = featureRows.length;

  const filteredModules = moduleRows.filter(
    (item) =>
      item.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.childModule.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredFeatures = featureRows.filter(
    (item) =>
      item.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parentModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.childModule.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  /* ================= PAGINATION ================= */
  const activeRowCount =
    activeTab === "module" ? filteredModules.length : filteredFeatures.length;
  const totalPages = Math.max(1, Math.ceil(activeRowCount / PAGE_LIMIT));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedModules = paginate(filteredModules, safeCurrentPage, PAGE_LIMIT);
  const pagedFeatures = paginate(filteredFeatures, safeCurrentPage, PAGE_LIMIT);
  const shownRowCount =
    activeTab === "module" ? pagedModules.length : pagedFeatures.length;

  const goToPage = (page: number) => {
    setOpenMenu(null);
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  
  /* ================= HELPERS ================= */
  const getStatusBadge = (status: string) => (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-medium ${
        status === "Enable"
          ? "bg-[#E8F5E9] text-[#2E7D32] dark:bg-green-900/30 dark:text-green-400"
          : "bg-[#FDECEC] text-[#D34645] dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  );

  const getOrderBox = (order: number | string) => (
    <span className="inline-flex items-center justify-center w-[44px] h-[32px] rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-[#2C2C2C] text-[12px] font-medium text-[#1E293B] dark:text-gray-200">
      {order || "-"}
    </span>
  );

  const getParentModuleCell = (value: string) => {
    if (!value || value === "-") {
      return <span className="text-[#94A3B8]">-</span>;
    }

    if (value.toLowerCase() === "finance") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[12px] font-medium bg-[#E5E7EB] text-[#374151] dark:bg-gray-700 dark:text-gray-200">
          {value}
        </span>
      );
    }

    if (value.toLowerCase() === "chat & support") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[12px] font-medium bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-900/40 dark:text-blue-200">
          {value}
        </span>
      );
    }

    return <span className="text-[#1E293B] dark:text-gray-200">{value}</span>;
  };

  const getChildModuleCell = (value: string) => {
    if (!value || value === "-") {
      return <span className="text-[#94A3B8]">-</span>;
    }
    return <span className="text-[#1E293B] dark:text-gray-200">{value}</span>;
  };

  const renderActionCell = (
    id: string,
    index: number,
    routeBase: string,
    toggle: { label: string; loading: boolean; onClick: () => void },
  ) => (
    <td className="py-3.5 px-4 relative">
      <button
        ref={(el) => {
          buttonRefs.current[index] = el;
        }}
        onClick={() => toggleMenu(index)}
        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <BsThreeDotsVertical className="text-[16px] text-gray-700 dark:text-gray-300" />
      </button>

      {openMenu === index &&
        menuPosition &&
        createPortal(
          <div
            ref={openMenuRef}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: MENU_WIDTH,
            }}
            className="bg-white dark:bg-[#2C2C2C] rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50"
          >
            
            <button className="w-full text-center px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={closeMenu}
            >
              Cancel
            </button>
            <button
              disabled={toggle.loading}
              className="w-full text-center px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                closeMenu();
                toggle.onClick();
              }}
            >
              {toggle.loading ? "Updating..." : toggle.label}
            </button>
          </div>,
          document.body,
        )}
    </td>
  );

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Feature Control" />

      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F] p-2">
        <div className="px-2 pt-2">
          <div className="w-full bg-white dark:bg-[#343434] rounded-xl shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-[#F0F1F5] dark:border-gray-700 px-5 py-3">
            {/* Top Row: Back Button + Title + Add Feature Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F1F5] dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <HiOutlineArrowLeft className="text-[20px] text-[#1E293B] dark:text-white" />
                </button>
                <h1 className="text-[18px] font-semibold text-[#1E293B] dark:text-white">
                  Institute Feature Control
                </h1>
              </div>

              <button
                type="button"
                onClick={openAddFeatureModal}
                className="bg-[#576CBC] hover:bg-[#4350C0] text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition"
              >
                Add Feature
              </button>
            </div>

            {/* Bottom Row: Tenant Info + Stats */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-full bg-[#EEEEEE] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={tenantDetails?.tenantLogo || "/assets/images/bsicon.png"}
                    alt="Tenant Logo"
                    className="w-[48px] h-[48px] object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                      {tenantDetails?.tenantName || "Tenant"}
                    </h2>
                    <span className="inline-flex items-center px-2 py-[3px] rounded-[4px] bg-[#E9F1FF] text-[#4F7DF3] text-[10px] font-medium">
                      {subscriptionDetails?.planName || tenantDetails?.plan || "-"}
                    </span>
                  </div>

                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-[2px]">
                    {tenantDetails?.domainName ||
                      tenantDetails?.organizationName ||
                      "-"}
                  </p>

                  <div className="flex items-center gap-1 mt-[2px] text-[10px]">
                    <span className="text-gray-400 text-[11px]">
                      Created on : {formatDate(configCreatedAt || undefined)} |
                    </span>
                    <span className="font-medium text-[10px] text-[#576CBC]">
                      ID: {tenantDetails?.tenantCode || tenantId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 mr-10">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[#E9ECFB] flex items-center justify-center shrink-0">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#7C8DD4]"
                    >
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Users
                    </p>
                    <p className="text-[15px] font-semibold text-[#1E293B] dark:text-white mt-[1px]">
                      -
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[#E9ECFB] flex items-center justify-center shrink-0">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#7C8DD4]"
                    >
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Features
                    </p>
                    <p className="text-[15px] font-semibold text-[#22A34A] dark:text-green-400 mt-[1px]">
                      {totalFeaturesCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TITLE ================= */}
        <div className="px-3 pt-5 pb-3">
          <h2 className="text-[18px] font-semibold text-[#1E293B] dark:text-white">
            Blackstone Academy Feature
          </h2>
        </div>

        {/* ================= SIDEBAR + TABLE LAYOUT ================= */}
        <div className="flex gap-4 px-2">
          <div className="w-[200px] shrink-0 bg-white dark:bg-[#343434] rounded-xl border border-[#E4E8EF] dark:border-gray-700 px-3 py-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B] dark:text-white px-2 pb-3">
              Portal
            </h3>

            <div className="flex flex-col gap-1">
              {portalOptions.length === 0 ? (
                <span className="px-3 py-2.5 text-[12px] text-gray-400">
                  {tenantId ? "Loading portals..." : "No tenant selected"}
                </span>
              ) : (
                portalOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        portal: option.id,
                        parentNavigation: "",
                        parentModule: "",
                        childNavigations: [],
                      }))
                    }
                    className={`
                      text-left px-3 py-2.5 rounded-lg text-[13px]  font-medium transition
                      ${
                        formData.portal === option.id
                          ? "bg-gradient-to-b border border-blue-300 from-[#fcfdff] to-[#dbe2fd] text-black"
                          : "text-[#1E293B] dark:text-gray-300 hover:bg-[#F5F6FA] dark:hover:bg-[#3A3A3A]"
                      }
                    `}
                  >
                    {option.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-[#343434] rounded-xl border border-[#E4E8EF] dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-6 px-5 pt-4 pb-2">
              <button
                onClick={() => setActiveTab("module")}
                className={`relative text-[14px] font-medium pb-2 transition-colors ${
                  activeTab === "module"
                    ? "text-[#5872C5] dark:text-[#8296E6]"
                    : "text-[#1E293B] dark:text-gray-300"
                }`}
              >
                Module List
                {activeTab === "module" && (
                  <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] dark:bg-[#8296E6] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("feature")}
                className={`relative text-[14px] font-medium pb-2 transition-colors ${
                  activeTab === "feature"
                    ? "text-[#5872C5] dark:text-[#8296E6]"
                    : "text-[#1E293B] dark:text-gray-300"
                }`}
              >
                Feature List
                {activeTab === "feature" && (
                  <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] dark:bg-[#8296E6] rounded-full" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[#E7EAF3] dark:border-gray-700 bg-[#FAFAFB] dark:bg-[#2E2E2E]">
              <div className="flex items-center px-3 h-10 border-r border-[#E7EAF3] dark:border-gray-700">
                <FiSearch className="text-gray-400 mr-2 text-[15px]" />
                <input
                  placeholder="Search by keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full outline-none bg-transparent text-[12px] text-gray-600 dark:text-gray-200 placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between px-3 h-10 border-r border-[#E7EAF3] dark:border-gray-700 cursor-pointer">
                <div className="flex items-center">
                  <MdTune className="text-gray-400 mr-2 text-[16px]" />
                  <span className="text-[12px] text-gray-500">Filter</span>
                </div>
                <FiChevronDown className="text-gray-400 text-[14px]" />
              </div>

              <div className="flex items-center px-4 h-10">
                <span className="text-[12px] text-gray-500">
                  Showing {shownRowCount} Of {activeRowCount}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "module" ? (
                <table className="w-full table-fixed text-xs border-collapse">
                  <thead className="bg-[#4C6993] text-white dark:bg-[#44699D]">
                    <tr>
                      <th className="w-[16%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Parent Module
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Child Module
                      </th>
                      <th className="w-[8%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Order
                      </th>
                      <th className="w-[26%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Description
                      </th>
                      <th className="w-[14%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Add on
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Status
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedModules.length > 0 ? (
                      pagedModules.map((item, index) => {
                        const isChildRow = item.childModuleId !== null;
                        const toggleKey = isChildRow
                          ? `child:${item.moduleId}:${item.childModuleId}`
                          : `module:${item.moduleId}`;

                        return (
                          <tr
                            key={`${item.moduleId}-${item.childModuleId ?? "root"}`}
                            className="text-[12px] odd:bg-white even:bg-[#F8F8F8] dark:odd:bg-[#303030] dark:even:bg-[#2C2C2C]"
                          >
                            <td className="py-3.5 px-4 font-medium text-[#1E293B] dark:text-white break-words">
                              {item.moduleName}
                            </td>
                            <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                              {item.childModule}
                            </td>
                            <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200">
                              {getOrderBox(item.order)}
                            </td>
                            <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                              {item.description}
                            </td>
                            <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 whitespace-nowrap">
                              {item.addOn}
                            </td>
                            <td className="py-3.5 px-4">
                              {getStatusBadge(item.status)}
                            </td>
                            {renderActionCell(
                              item.childModuleId ?? item.moduleId,
                              index,
                              "/super-admin/ui/feature-control/module_details",
                              {
                                label: item.isEnabled ? "Disable" : "Enable",
                                loading: togglingModuleKey === toggleKey,
                                onClick: () =>
                                  isChildRow
                                    ? handleToggleChildModule(
                                        item.moduleId,
                                        item.childModuleId as string,
                                        !item.isEnabled,
                                      )
                                    : handleToggleModule(
                                        item.moduleId,
                                        !item.isEnabled,
                                      ),
                              },
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-5 text-center text-gray-500"
                        >
                          No modules available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full table-fixed text-xs border-collapse">
                  <thead className="bg-[#4C6993] text-white dark:bg-[#44699D]">
                    <tr>
                      <th className="w-[14%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Feature Name
                      </th>
                      <th className="w-[16%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Parent Module
                      </th>
                      <th className="w-[14%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Child Module
                      </th>
                      <th className="w-[24%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Description
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Add on
                      </th>
                      <th className="w-[10%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Status
                      </th>
                      <th className="w-[10%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedFeatures.length > 0 ? (
                      pagedFeatures.map((item, index) => {
                        const isChildFeature = item.childModuleId !== null;
                        const toggleKey = isChildFeature
                          ? `childFeature:${item.moduleId}:${item.childModuleId}:${item.featureId}`
                          : `feature:${item.moduleId}:${item.featureId}`;

                        return (
                          <tr
                            key={`${item.moduleId}-${item.childModuleId ?? "root"}-${item.featureId}`}
                            className="text-[12px] odd:bg-white even:bg-[#F8F8F8] dark:odd:bg-[#303030] dark:even:bg-[#2C2C2C]"
                          >
                            <td className="py-3.5 px-4 font-medium text-[#1E293B] dark:text-white break-words">
                              {item.featureName}
                            </td>
                            <td className="py-3.5 px-4">
                              {getParentModuleCell(item.parentModule)}
                            </td>
                            <td className="py-3.5 px-4">
                              {getChildModuleCell(item.childModule)}
                            </td>
                            <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                              {item.description}
                            </td>
                            <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 whitespace-nowrap">
                              {item.addOn}
                            </td>
                            <td className="py-3.5 px-4">
                              {getStatusBadge(item.status)}
                            </td>
                            {renderActionCell(
                              item.featureId,
                              index,
                              "/super-admin/ui/feature-control/feature_details",
                              {
                                label: item.isEnabled ? "Disable" : "Enable",
                                loading: togglingFeatureKey === toggleKey,
                                onClick: () =>
                                  isChildFeature
                                    ? handleToggleChildFeature(
                                        item.moduleId,
                                        item.childModuleId as string,
                                        item.featureId,
                                        !item.isEnabled,
                                      )
                                    : handleToggleParentFeature(
                                        item.moduleId,
                                        item.featureId,
                                        !item.isEnabled,
                                      ),
                              },
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-5 text-center text-gray-500"
                        >
                          No features available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end items-center gap-1 px-4 py-4">
              <button
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="w-7 h-7 rounded-md border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-[20px]">‹</span>
              </button>

              {getPageNumbers(safeCurrentPage, totalPages).map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 text-[11px]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-7 h-7 rounded-md border text-[11px] ${
                      page === safeCurrentPage
                        ? "border-[#203F78] dark:border-[#8296E6] text-[#203F78] dark:text-[#8296E6] bg-[#FAFAFB] dark:bg-[#3A3A3A]"
                        : "border-[#E6E7EA] dark:border-gray-600 text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="w-7 h-7 rounded-md border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-[20px]">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddFeatureModal && (
        <AddTenantFeatureForm
          formData={formData}
          isLoading={isLoading}
          portalOptions={portalOptions}
          parentModuleOptions={parentModuleOptions}
          onClose={closeAddFeatureModal}
          onReset={resetForm}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onNavigationTypeChange={(navigationType) =>
            setFormData((previous) => ({ ...previous, navigationType }))
          }
          onChildNavigationToggle={toggleChildNavigation}
          onParentModuleSelect={(moduleId) =>
            setFormData((previous) => ({
              ...previous,
              parentModule: moduleId,
              parentNavigationName: "",
            }))
          }
        />
      )}

      {/* Legacy form markup below is intentionally unreachable; AddTenantFeatureForm above is the current design. */}
      {false && showAddFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[750px] mx-6 max-h-[92vh] overflow-y-auto scrollbar-none">
            {/* ================= CLOSE BUTTON (TOP RIGHT) ================= */}
            <button
              onClick={closeAddFeatureModal}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition z-10"
            >
              <BsX className="text-[22px] text-gray-500 dark:text-gray-400" />
            </button>

            {/* Header */}
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-[17px] font-semibold text-[#1E293B] dark:text-white">
                Add Feature
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4">
              {/* ================= BASIC INFORMATION ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] dark:text-white mb-3">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Select Module
                    </label>
                    <div className="relative">
                      <select
                        name="portal"
                        value={formData.portal}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Academy">Academy</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Select category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                      >
                        <option value="Normal Feature">Normal Feature</option>
                        <option value="Premium Feature">Premium Feature</option>
                        <option value="Module">Module</option>
                        <option value="Navigation Menu">Navigation Menu</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= NAVIGATION MENU INFORMATION ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] dark:text-white mb-3">
                  Navigation Menu Information
                </h3>

                {formData.category === "Navigation Menu" && (
                  <div className="mb-3 flex items-center gap-8">
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#1E293B] dark:text-gray-200">
                      <input
                        type="radio"
                        name="navigationType"
                        checked={formData.navigationType === "parent"}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            navigationType: "parent",
                          }))
                        }
                        className="h-4 w-4 accent-[#5872C5]"
                      />
                      Parent Navigation
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#1E293B] dark:text-gray-200">
                      <input
                        type="radio"
                        name="navigationType"
                        checked={formData.navigationType === "child"}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            navigationType: "child",
                          }))
                        }
                        className="h-4 w-4 accent-[#5872C5]"
                      />
                      Child Navigation
                    </label>
                  </div>
                )}

                {formData.category === "Navigation Menu" &&
                formData.navigationType === "parent" ? (
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Parent Navigation Name
                    </label>
                    <input
                      type="text"
                      name="parentNavigationName"
                      value={formData.parentNavigationName}
                      onChange={handleInputChange}
                      placeholder="Chat & Support"
                      className="w-full px-3 py-2 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white placeholder:text-gray-400 bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                    />
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Parent Navigation
                    </label>
                    <div className="relative">
                      <select
                        name="parentNavigation"
                        value={formData.parentNavigation}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                      >
                        <option value="Chat & Support">Chat & Support</option>
                        <option value="Dashboard">Dashboard</option>
                        <option value="Subscriptions">Subscriptions</option>
                        <option value="Finance">Finance</option>
                        <option value="Users & Roles">Users & Roles</option>
                        <option value="Feature Control">Feature Control</option>
                        <option value="Analytics">Analytics</option>
                        <option value="Settings">Settings</option>
                        <option value="Backup & Restore">
                          Backup & Restore
                        </option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                    </div>
                  </div>
                )}

                {formData.category !== "Navigation Menu" && (
                  <div className="flex items-center gap-3 bg-[#EEF1FB] dark:bg-[#4F5BD5]/20 rounded-md px-4 py-3 mb-3">
                    <div className="w-[16px] h-[16px] rounded-full bg-[#4F5BD5] flex items-center justify-center shrink-0">
                      <span
                        className="text-white text-[11px] leading-none italic"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        i
                      </span>
                    </div>
                    <p className="text-[12px] text-[#1E293B] dark:text-gray-200 leading-relaxed">
                      To Add this feature under a child navigation, select a
                      child navigation from the list below.
                    </p>
                  </div>
                )}

                {formData.category !== "Navigation Menu" && (
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-2">
                      Child Navigation
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {childNavigationOptions.map((nav) => {
                        const isSelected =
                          formData.childNavigations.includes(nav);
                        return (
                          <button
                            key={nav}
                            type="button"
                            onClick={() => toggleChildNavigation(nav)}
                            className={`
                      px-4 py-2 rounded-md text-[12px] font-medium border transition
                      ${
                        isSelected
                          ? "bg-[#EEF0FB] border-[#4F5BD5] text-[#4F5BD5] dark:bg-[#4F5BD5]/20 dark:text-[#8296E6]"
                          : "bg-white dark:bg-transparent border-[#E4E8EF] dark:border-gray-600 text-[#1E293B] dark:text-gray-300 hover:border-gray-300"
                      }
                    `}
                          >
                            {nav}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.category === "Navigation Menu" &&
                  formData.navigationType === "child" && (
                    <div className="mb-3">
                      <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                        Child Navigation Name
                      </label>
                      <input
                        type="text"
                        name="childNavigationName"
                        value={formData.childNavigationName}
                        onChange={handleInputChange}
                        placeholder="Ticket"
                        className="w-full px-3 py-2 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white placeholder:text-gray-400 bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                      />
                    </div>
                  )}

                {formData.category !== "Navigation Menu" && (
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Feature Name
                    </label>
                    <input
                      type="text"
                      name="featureName"
                      value={formData.featureName}
                      onChange={handleInputChange}
                      placeholder="Video"
                      className="w-full px-3 py-2 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white placeholder:text-gray-400 bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white placeholder:text-gray-400 bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5] resize-none"
                  />
                </div>
              </div>

              {/* ================= STATUS ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <label className="block text-[14px] font-semibold text-[#1E293B] dark:text-white mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                </div>
              </div>

              {/* ================= BUTTONS ================= */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-[12px] font-semibold text-[#5872C5] bg-white dark:bg-transparent border border-[#5872C5] hover:bg-[#5872C5]/5 rounded-md transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 text-[12px] font-semibold text-white bg-[#4F5BD5] hover:bg-[#4350C0] rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SUCCESS MODAL ==================== */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[420px] mx-4 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-[#1E293B] dark:text-white mb-2">
              Feature Added Successfully!
            </h2>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              The {createdFeatureName} feature has been added successfully.
            </p>

            <div className="flex justify-center mb-6">
              <div className="w-[100px] h-[3px] bg-green-500 rounded-full" />
            </div>

            <button
              onClick={closeModals}
              className="w-full py-3 text-[13px] font-semibold text-white bg-[#4F5BD5] hover:bg-[#4350C0] rounded-md transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ==================== FAILURE MODAL ==================== */}
      {showFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[440px] mx-4 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-[#1E293B] dark:text-white mb-2">
              Failed to Add Feature
            </h2>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              The {createdFeatureName} feature could not be added. Please check
              the details and try again.
            </p>

            <div className="flex justify-center mb-6">
              <div className="w-[100px] h-[3px] bg-[#EF4444] rounded-full" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-3 text-[13px] font-semibold text-[#EF4444] bg-white dark:bg-transparent border border-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowFailure(false);
                  setShowAddFeatureModal(true);
                }}
                className="flex-1 py-3 text-[13px] font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-md transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseSuperLayout>
  );
};

export default Usercards;
