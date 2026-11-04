"use client";

import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import AcademyHeader from "./AcademyHeader";
import PortalSidebar from "./PortalSideber";
import FeatureToolbar from "./FeatureToolbar";
import FeatureTable from "./FeatureTable";
import {
  Feature,
  PortalRole,
} from "./PortalData";
import {
  FilterField,
  FilterOption,
  ViewTab,
} from "./FeatureToolbar";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const ITEMS_PER_PAGE = 10;

type TenantPortalResponse = {
  success: boolean;
  message?: string;
  data?: {
    items?: Array<{
      portalName: string;
      status?: string;
      isEnabled?: boolean;
    }>;
  };
};

type ConfiguredFeature = {
  featureId: string;
  featureName: string;
  description?: string | null;
  isEnabled?: boolean;
  createdAt?: string;
};

type ConfiguredChild = {
  childModuleId: string;
  childModuleName: string;
  isEnabled?: boolean;
  createdAt?: string;
  features?: ConfiguredFeature[];
};

type ConfiguredModule = {
  moduleId: string;
  moduleName: string;
  description?: string | null;
  isEnabled?: boolean;
  createdAt?: string;
  features?: ConfiguredFeature[];
  children?: ConfiguredChild[];
};

type TenantConfiguration = {
  tenantId: string;
  portalName: string;
  modules: ConfiguredModule[];
};

type TenantConfigurationResponse = {
  success: boolean;
  message?: string;
  data?: TenantConfiguration[];
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleDateString();
};

const mapTenantConfigurations = (
  configurations: TenantConfiguration[],
): Feature[] =>
  configurations.flatMap((configuration) =>
    (configuration.modules ?? []).flatMap((module) => {
      const rows: Feature[] = [
        {
          id: `module:${configuration.portalName}:${module.moduleId}`,
          portalName: configuration.portalName,
          viewType: "Module List",
          name: module.moduleName,
          parentModule: module.moduleName,
          childModule: "—",
          description: module.description || "—",
          addedOn: formatDate(module.createdAt),
          enabled: Boolean(module.isEnabled),
        },
        ...(module.children ?? []).map((child) => ({
          id: `child:${configuration.portalName}:${child.childModuleId}`,
          portalName: configuration.portalName,
          viewType: "Module List" as const,
          name: child.childModuleName,
          parentModule: module.moduleName,
          childModule: child.childModuleName,
          description: "—",
          addedOn: formatDate(child.createdAt),
          enabled: Boolean(child.isEnabled),
        })),
        ...(module.features ?? []).map((feature) => ({
          id: `feature:${configuration.portalName}:${feature.featureId}`,
          portalName: configuration.portalName,
          viewType: "Feature List" as const,
          name: feature.featureName,
          parentModule: module.moduleName,
          childModule: "—",
          description: feature.description || "—",
          addedOn: formatDate(feature.createdAt),
          enabled: Boolean(feature.isEnabled),
        })),
      ];

      for (const child of module.children ?? []) {
        rows.push(
          ...(child.features ?? []).map((feature) => ({
            id: `feature:${configuration.portalName}:${feature.featureId}`,
            portalName: configuration.portalName,
            viewType: "Feature List" as const,
            name: feature.featureName,
            parentModule: module.moduleName,
            childModule: child.childModuleName,
            description: feature.description || "—",
            addedOn: formatDate(feature.createdAt),
            enabled: Boolean(feature.isEnabled),
          })),
        );
      }

      return rows;
    }),
  );

export default function PortalAccess() {
  const [portals, setPortals] = useState<PortalRole[]>([]);
  const [loadingPortals, setLoadingPortals] = useState(true);
  const [portalsError, setPortalsError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<PortalRole>("");

  const [activeTab, setActiveTab] =
    useState<ViewTab>("Feature List");

  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<FilterField, string>
  >({
    name: "All",
    parentModule: "All",
    childModule: "All",
    description: "All",
    addedOn: "All",
    status: "All",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingConfiguration, setLoadingConfiguration] = useState(true);
  const [configurationError, setConfigurationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isCurrent = true;

    const loadTenantPortals = async () => {
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) {
        setPortalsError("Tenant ID is not available. Please sign in again.");
        setLoadingPortals(false);
        return;
      }

      try {
        const endpoint = AppApiEndpoints.PORTAL.GET_BY_TENANT.replace(
          "{tenantId}",
          encodeURIComponent(tenantId),
        );
        const response = await axios.get<TenantPortalResponse>(
          `${AppApiEndpoints.API_END_POINT}${endpoint}`,
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Tenant portal request failed.",
          );
        }

        const items = response.data.data?.items;
        if (!Array.isArray(items)) {
          throw new Error("Tenant portal response did not contain an item list.");
        }

        const portalNames = items
          .filter(
            (portal) =>
              portal.portalName &&
              portal.status?.toUpperCase() === "ACTIVE" &&
              portal.isEnabled !== false,
          )
          .map((portal) => portal.portalName);

        if (isCurrent) {
          setPortals(portalNames);
          setActiveRole(portalNames[0] ?? "");
        }
      } catch (error) {
        console.error("Failed to load tenant portals:", error);
        if (isCurrent) {
          setPortalsError(
            error instanceof Error
              ? error.message
              : "Unable to load tenant portals.",
          );
        }
      } finally {
        if (isCurrent) setLoadingPortals(false);
      }
    };

    void loadTenantPortals();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadTenantConfiguration = async () => {
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) {
        setConfigurationError("Tenant ID is not available. Please sign in again.");
        setLoadingConfiguration(false);
        return;
      }

      setLoadingConfiguration(true);
      setConfigurationError(null);
      try {
        const response = await axios.get<TenantConfigurationResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.MODULE_TENANT.GET_CONFIG}`,
          { params: { tenantId } },
        );

        if (!response.data.success || !Array.isArray(response.data.data)) {
          throw new Error(
            response.data.message ||
              "Tenant configuration response is invalid.",
          );
        }

        const rows = mapTenantConfigurations(response.data.data);
        if (isCurrent) setFeatures(rows);
      } catch (error) {
        console.error("Failed to load tenant module configuration:", error);
        if (isCurrent) {
          setConfigurationError(
            error instanceof Error
              ? error.message
              : "Unable to load tenant configuration.",
          );
        }
      } finally {
        if (isCurrent) setLoadingConfiguration(false);
      }
    };

    void loadTenantConfiguration();
    return () => {
      isCurrent = false;
    };
  }, []);

  const portalFeatures = useMemo(
    () => features.filter((feature) => feature.portalName === activeRole),
    [activeRole, features],
  );

  const tabFeatures = useMemo(
    () => portalFeatures.filter((feature) => feature.viewType === activeTab),
    [activeTab, portalFeatures],
  );

  const filterOptions = useMemo<FilterOption[]>(() => {
    const columnFields: Array<{
      field: Exclude<FilterField, "status">;
      label: string;
      getValue: (feature: Feature) => string;
    }> = [
      {
        field: "name",
        label: activeTab === "Feature List" ? "Feature Name" : "Module Name",
        getValue: (feature) => feature.name,
      },
      {
        field: "parentModule",
        label: "Parent Module",
        getValue: (feature) => feature.parentModule,
      },
      {
        field: "childModule",
        label: "Child Module",
        getValue: (feature) => feature.childModule,
      },
      {
        field: "description",
        label: "Description",
        getValue: (feature) => feature.description,
      },
      {
        field: "addedOn",
        label: "Add on",
        getValue: (feature) => feature.addedOn,
      },
    ];

    return [
      ...columnFields.map(({ field, label, getValue }) => ({
        field,
        label,
        values: Array.from(
          new Set(
            tabFeatures
              .map(getValue)
              .filter((value) => value && value !== "—"),
          ),
        ).sort(),
      })),
      {
        field: "status",
        label: "Status",
        values: ["Enabled", "Disabled"],
      },
    ];
  }, [activeTab, tabFeatures]);

  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tabFeatures.filter((feature) => {
      const matchesSearch =
        !query ||
        [
          feature.name,
          feature.parentModule,
          feature.childModule,
          feature.description,
        ].some((value) => value.toLowerCase().includes(query));

      const filtersMatch = Object.entries(selectedFilters).every(
        ([field, selectedValue]) => {
          if (selectedValue === "All") return true;
          const rowValue =
            field === "status"
              ? feature.enabled
                ? "Enabled"
                : "Disabled"
              : feature[field as Exclude<FilterField, "status">];
          return rowValue === selectedValue;
        },
      );

      return matchesSearch && filtersMatch;
    });
  }, [search, selectedFilters, tabFeatures]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeatures.length / ITEMS_PER_PAGE)
  );

  const page = Math.min(currentPage, totalPages);

  const paginatedFeatures = filteredFeatures.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleFeature = (id: string) => {
    setFeatures((previous) =>
      previous.map((feature) =>
        feature.id === id
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="w-full space-y-3 rounded-xl bg-[#f7f8fc] p-3 text-[#101b3d] shadow-[0_6px_20px_rgba(153,153,153,0.15)] dark:bg-[#242424] dark:text-gray-100 sm:p-4 md:p-5">
      <AcademyHeader />

      <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[166px_minmax(0,1fr)]">
        <PortalSidebar
          activeRole={activeRole}
          portals={portals}
          loading={loadingPortals}
          error={portalsError}
          onChange={(role) => {
            setActiveRole(role);
            setSelectedFilters({
              name: "All",
              parentModule: "All",
              childModule: "All",
              description: "All",
              addedOn: "All",
              status: "All",
            });
            setSearch("");
            resetPage();
          }}
        />

        <section className="min-w-0 overflow-hidden rounded-lg border border-[#e2e7f0] bg-white shadow-sm dark:border-[#414141] dark:bg-[#303030]">
          <FeatureToolbar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSelectedFilters({
                name: "All",
                parentModule: "All",
                childModule: "All",
                description: "All",
                addedOn: "All",
                status: "All",
              });
              resetPage();
            }}
            search={search}
            setSearch={(value) => {
              setSearch(value);
              resetPage();
            }}
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            setSelectedFilter={(field, value) => {
              setSelectedFilters((current) => ({ ...current, [field]: value }));
              resetPage();
            }}
            resetFilters={() => {
              setSelectedFilters({
                name: "All",
                parentModule: "All",
                childModule: "All",
                description: "All",
                addedOn: "All",
                status: "All",
              });
              setSearch("");
              resetPage();
            }}
            count={filteredFeatures.length}
            start={
              filteredFeatures.length === 0
                ? 0
                : (page - 1) * ITEMS_PER_PAGE + 1
            }
            end={Math.min(
              page * ITEMS_PER_PAGE,
              filteredFeatures.length
            )}
          />

          <FeatureTable
            features={paginatedFeatures}
            activeTab={activeTab}
            onToggle={toggleFeature}
            page={page}
            totalPages={totalPages}
            setPage={setCurrentPage}
          />
          {configurationError && (
            <p className="px-4 pb-4 text-sm text-red-600" role="alert">
              {configurationError}
            </p>
          )}
          {loadingConfiguration && (
            <p className="px-4 pb-4 text-sm text-gray-500" aria-live="polite">
              Loading tenant configuration...
            </p>
          )}
        </section>
      </div>
    </div>
  );
}