"use client";

import React, { useMemo, useState } from "react";
import AcademyHeader from "./AcademyHeader";
import PortalSidebar from "./PortalSideber";
import FeatureToolbar from "./FeatureToolbar";
import FeatureTable from "./FeatureTable";
import {
  Feature,
  PortalRole,
  initialFeatures,
} from "./PortalData";
import { ViewTab } from "./FeatureToolbar";

const ITEMS_PER_PAGE = 10;

export default function PortalAccess() {
  const [activeRole, setActiveRole] =
    useState<PortalRole>("Student");

  const [activeTab, setActiveTab] =
    useState<ViewTab>("Feature List");

  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [features, setFeatures] =
    useState<Feature[]>(initialFeatures);

  const modules = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(features.map((feature) => feature.parentModule))
      ).sort(),
    ],
    [features]
  );

  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return features.filter((feature) => {
      const matchesSearch =
        !query ||
        [
          feature.name,
          feature.parentModule,
          feature.childModule,
          feature.description,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesModule =
        selectedModule === "All" ||
        feature.parentModule === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [features, search, selectedModule]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeatures.length / ITEMS_PER_PAGE)
  );

  const page = Math.min(currentPage, totalPages);

  const paginatedFeatures = filteredFeatures.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleFeature = (id: number) => {
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
          onChange={(role) => {
            setActiveRole(role);
            resetPage();
          }}
        />

        <section className="min-w-0 overflow-hidden rounded-lg border border-[#e2e7f0] bg-white shadow-sm dark:border-[#414141] dark:bg-[#303030]">
          <FeatureToolbar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              resetPage();
            }}
            search={search}
            setSearch={(value) => {
              setSearch(value);
              resetPage();
            }}
            selectedModule={selectedModule}
            setSelectedModule={(value) => {
              setSelectedModule(value);
              resetPage();
            }}
            modules={modules}
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
            activeRole={activeRole}
            activeTab={activeTab}
            onToggle={toggleFeature}
            page={page}
            totalPages={totalPages}
            setPage={setCurrentPage}
          />
        </section>
      </div>
    </div>
  );
}