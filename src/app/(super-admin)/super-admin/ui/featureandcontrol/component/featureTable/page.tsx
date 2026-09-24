"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  FiSearch,
  FiChevronDown,
  FiLayers,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from "react-icons/fi";
import { MdTune, MdCheckCircle, MdCancel } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import FilterDrawer, {
  FilterField,
} from "@/app/(super-admin)/super-admin/components/FilterDrawer";

interface FeatureCardData {
  totalFeatures: FeatureMetric;
  addedFeatures: FeatureMetric;
  activeFeatures: FeatureMetric;
  inactiveFeatures: FeatureMetric;
}

interface FeatureMetric {
  count: number;
  percentageChange: number;
  trend: "UP" | "DOWN" | "NO_CHANGE";
}

interface FeatureCardResponse {
  success: boolean;
  message: string;
  data: FeatureCardData;
}

interface FeatureControlRow {
  portal: string;
  parentModuleId: string;
  parentModuleName: string;
  childModuleId: string | null;
  childModuleName: string | null;
  featureId: string | null;
  featureName: string | null;
  description: string;
  status: string;
  isEnabled: boolean;
  createdAt: string;
}

interface FeatureControlResponse {
  success: boolean;
  message: string;
  data: FeatureControlRow[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface FeatureTableItem {
  featureId: string | null;
  parentModuleId: string;
  childModuleId: string | null;
  featureName: string;
  portal: string;
  parentModule: string;
  childModule: string;
  description: string;
  status: string;
  isEnabled: boolean;
  addOnDate: string;
  addOnDateValue: string;
}

const MENU_WIDTH = 112; // w-28
const PAGE_LIMIT = 5;

const formatAddOnDate = (createdAt: string): string => {
  if (!createdAt) return "-";

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Table = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [featureCardData, setFeatureCardData] =
    useState<FeatureCardData | null>(null);
  const [featureItems, setFeatureItems] = useState<FeatureTableItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [totalFeatureItems, setTotalFeatureItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const openMenuRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const router = useRouter();

  const renderTrend = (metric?: FeatureMetric) => {
    if (!metric) return null;

    const TrendIcon =
      metric.trend === "UP"
        ? FiArrowUp
        : metric.trend === "DOWN"
          ? FiArrowDown
          : FiMinus;
    const trendColor =
      metric.trend === "UP"
        ? "text-[#377E36]"
        : metric.trend === "DOWN"
          ? "text-[#D34645]"
          : "text-gray-500";

    return (
      <span
        className={`flex text-xs items-center gap-1 font-medium ${trendColor}`}
      >
        <TrendIcon className="text-[13px]" />
        {metric.percentageChange}%
      </span>
    );
  };

  useEffect(() => {
    const fetchFeatureCardData = async () => {
      try {
        const response = await axios.get<FeatureCardResponse>(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEATURE_CONTROL.GET_CARD_SUMMARY}`,
        );

        if (response.data.success) {
          setFeatureCardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch feature card data:", error);
      }
    };

    fetchFeatureCardData();
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const rows: FeatureControlRow[] = [];
        let page = 1;
        let totalPagesFromServer = 1;

        do {
          const response = await axios.get<FeatureControlResponse>(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.FEATURE_CONTROL.GET_ALL}`,
            { params: { page, limit: 100 } },
          );

          if (!response.data.success) break;

          rows.push(...response.data.data);
          totalPagesFromServer = response.data.pagination.totalPages;
          page += 1;
        } while (page <= totalPagesFromServer);

        const items: FeatureTableItem[] = rows.map((row) => ({
          featureId: row.featureId,
          parentModuleId: row.parentModuleId,
          childModuleId: row.childModuleId,
          featureName: row.featureName ?? "-",
          portal: row.portal,
          parentModule: row.parentModuleName,
          childModule: row.childModuleName ?? "-",
          description: row.description,
          status: row.status,
          isEnabled: row.isEnabled,
          addOnDate: formatAddOnDate(row.createdAt),
          addOnDateValue: row.createdAt,
        }));

        setFeatureItems(items);
      } catch (error) {
        console.error("Failed to fetch features:", error);
      }
    };

    fetchModules();
  }, []);

  const filteredFeatureItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const matchesText = (value: string, filterKey: string) =>
      !appliedFilters[filterKey] ||
      value.toLowerCase().includes(appliedFilters[filterKey].toLowerCase());

    const fromDate = appliedFilters.addOnDateFrom
      ? new Date(appliedFilters.addOnDateFrom)
      : null;
    const toDate = appliedFilters.addOnDateTo
      ? new Date(appliedFilters.addOnDateTo)
      : null;

    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    return featureItems.filter((item) => {
      const itemDate = new Date(item.addOnDateValue);
      const matchesSearch =
        !term ||
        [
          item.featureName,
          item.portal,
          item.parentModule,
          item.childModule,
          item.description,
        ].some((field) => field?.toLowerCase().includes(term));
      const matchesDate =
        (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);

      return (
        matchesSearch &&
        matchesText(item.portal, "portal") &&
        matchesText(item.parentModule, "parentModule") &&
        matchesText(item.childModule, "childModule") &&
        matchesText(item.featureName, "featureName") &&
        (!appliedFilters.status || item.status === appliedFilters.status) &&
        matchesDate
      );
    });
  }, [appliedFilters, featureItems, searchTerm]);

  const filterFields: FilterField[] = [
    {
      key: "portal",
      label: "Portal",
      type: "text",
      placeholder: "All portals",
    },
    {
      key: "parentModule",
      label: "Parent Module",
      type: "text",
      placeholder: "All parent modules",
    },
    {
      key: "childModule",
      label: "Child Module",
      type: "text",
      placeholder: "All child modules",
    },
    {
      key: "featureName",
      label: "Feature Name",
      type: "text",
      placeholder: "All feature names",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "All statuses",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
    {
      key: "addOnDate",
      label: "Add On Date",
      type: "dateRange",
    },
  ];

  const resetFilters = () => {
    setFilterValues({});
    setAppliedFilters({});
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setTotalFeatureItems(filteredFeatureItems.length);
    setTotalPages(
      Math.max(1, Math.ceil(filteredFeatureItems.length / PAGE_LIMIT)),
    );
  }, [filteredFeatureItems]);

  const pagedFeatureItems = useMemo(
    () =>
      filteredFeatureItems.slice(
        (currentPage - 1) * PAGE_LIMIT,
        currentPage * PAGE_LIMIT,
      ),
    [filteredFeatureItems, currentPage],
  );

  const toggleMenu = (index: number) => {
    if (openMenu === index) {
      setOpenMenu(null);
      setMenuPosition(null);
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

  const closeMenu = () => {
    setOpenMenu(null);
    setMenuPosition(null);
  };

  const handleToggleFeatureAccess = async (
    item: FeatureTableItem,
    isEnabled: boolean,
  ) => {
    closeMenu();

    const featureId = item.featureId;
    const endpoint = !featureId
      ? item.childModuleId
        ? AppApiEndpoints.MODULE.UPDATE_CHILD_ACCESS.replace(
            "{parentModuleId}",
            item.parentModuleId,
          ).replace("{childModuleId}", item.childModuleId)
        : AppApiEndpoints.MODULE.UPDATE_PARENT_ACCESS.replace(
            "{parentModuleId}",
            item.parentModuleId,
          )
      : item.childModuleId
        ? AppApiEndpoints.MODULE.UPDATE_CHILD_FEATURE_ACCESS.replace(
            "{parentModuleId}",
            item.parentModuleId,
          )
            .replace("{childModuleId}", item.childModuleId)
            .replace("{featureId}", featureId)
        : AppApiEndpoints.MODULE.UPDATE_PARENT_FEATURE_ACCESS.replace(
            "{parentModuleId}",
            item.parentModuleId,
          ).replace("{featureId}", featureId);

    try {
      const response = await axios.patch(
        `${AppApiEndpoints.API_END_POINT}${endpoint}`,
        { isEnabled, updatedBy: "SUPER_ADMIN" },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update feature");
      }

      setFeatureItems((previous) =>
        previous.map((feature) =>
          feature.parentModuleId === item.parentModuleId &&
          feature.childModuleId === item.childModuleId &&
          feature.featureId === item.featureId
            ? {
                ...feature,
                isEnabled,
                status: isEnabled ? "Active" : "Inactive",
              }
            : feature,
        ),
      );
      toast.success(
        `Feature ${isEnabled ? "enabled" : "disabled"} successfully!`,
      );
    } catch (error: any) {
      console.error("Failed to update feature access:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update feature",
      );
    }
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

  return (
    <div className="min-h-screen bg-[#F4F6FC] dark:bg-[#1F1F1F] p-2">
      {/* Main Container */}
      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 mt-3">
          {/* Total Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[112px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#EEE8FF]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <FiLayers className="text-[#7047FF] text-[21px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#7047FF] font-medium">
                  Total Feature
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {featureCardData?.totalFeatures.count ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              {renderTrend(featureCardData?.totalFeatures)}
              <span className="text-[12px] text-gray-500 dark:text-gray-300">
                All Features in the system
              </span>
            </div>
          </div>

          {/* Active Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#E4F7EA]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCheckCircle className="text-[#45BD67] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#45BD67] font-medium">
                  Added This Month
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {featureCardData?.addedFeatures.count ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              {renderTrend(featureCardData?.addedFeatures)}
              <span className="text-[12px] text-gray-500 dark:text-gray-300">
                New Features added
              </span>
            </div>
          </div>

          {/* Inactive Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#FCE6E6]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCancel className="text-[#E53935] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#E53935] font-medium">
                  Inactive Feature
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {featureCardData?.inactiveFeatures.count ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              {renderTrend(featureCardData?.inactiveFeatures)}
              <span className="text-[12px] text-gray-500 dark:text-gray-300">
                Currently Inactive
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            bg-white
            dark:bg-[#343434]
            rounded-xl
            shadow-[0_4px_15px_rgba(0,0,0,0.05)]
            mt-3
            overflow-hidden
            mx-2
          "
        >
          {/* Section Title */}
          <div className="px-3 pt-3 pb-2">
            <h2 className="text-[16px] font-semibold text-[#24324B] dark:text-white">
              All Feature
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              bg-[#FAFAFB]
              dark:bg-[#2E2E2E]
            "
          >
            {/* Search */}
            <div
              className="
                flex
                items-center
                px-3
                h-10
                border-r
                border-[#E7EAF3]
                dark:border-r
                dark:border-[#494b52]
              "
            >
              <FiSearch className="text-gray-400 mr-2 text-[15px]" />

              <input
                placeholder="Search by keyword"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="
                  w-full
                  outline-none
                  bg-transparent
                  text-[11px]
                  text-gray-600
                  dark:text-gray-200
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Filter */}
            <div
              className="
                flex
                items-center
                justify-between
                px-3
                h-10
                border-r
                border-[#E7EAF3]
                dark:border-r
                dark:border-[#494b52]
                cursor-pointer
              "
              onClick={() => setShowFilter(true)}
            >
              <div className="flex items-center">
                <MdTune className="text-gray-400 mr-2 text-[16px]" />

                <span className="text-[11px] text-gray-400">Filter</span>
              </div>

              <FiChevronDown className="text-gray-400 text-[14px]" />
            </div>

            {/* Count */}
            <div className="flex items-center px-4 h-10">
              <span className="text-[11px] text-gray-400">
                Showing {pagedFeatureItems.length} Of {totalFeatureItems}
              </span>
            </div>
          </div>

          <FilterDrawer
            open={showFilter}
            title="Filter Features"
            fields={filterFields}
            values={filterValues}
            resultCount={filteredFeatureItems.length}
            onClose={() => setShowFilter(false)}
            onApply={(values) => {
              setFilterValues(values);
              setAppliedFilters(values);
              setCurrentPage(1);
              setShowFilter(false);
            }}
            onReset={resetFilters}
          />

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-xs border-collapse">
              {/* Table Header */}
              <thead
                className="
                  bg-[#4C6993]
                  text-white
                  text-[13px]
                  dark:bg-[#44699D]
                "
              >
                <tr>
                  {[
                    "Portal",
                    "Parent Module",
                    "Child Module",
                    "Feature Name",
                    "Description",
                    "Status",
                    "Add On Date",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="
                        py-3
                        px-3
                        whitespace-nowrap
                        font-medium
                        text-left
                        text-[11px]
                        border-r
                        border-[#466993]
                      "
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {pagedFeatureItems.length > 0 ? (
                  pagedFeatureItems.map((item, index) => (
                    <tr
                      key={index}
                      className="
                        text-[11px]
                        odd:bg-[#F8F8F8]
                        even:bg-white
                        dark:odd:bg-[#2C2C2C]
                        dark:even:bg-[#303030]
                      "
                    >
                      {/* Portal Name */}
                      {/* Portal Type */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.portal}
                      </td>
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.parentModule}
                      </td>{" "}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.childModule}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#24324B] dark:text-white whitespace-nowrap">
                        {item.featureName}
                      </td>
                      {/* Description */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.description}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-md
                            text-[9px]
                            font-medium
                            ${
                              item.status === "Active"
                                ? "bg-[#E7F8ED] text-[#2E9D4D]"
                                : "bg-[#FDECEC] text-[#E53935]"
                            }
                          `}
                        >
                          {item.status}
                        </span>
                      </td>
                      {/* Created Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.addOnDate}
                      </td>
                      {/* Action */}
                      <td className="py-3 px-3 relative">
                        <button
                          ref={(el) => {
                            buttonRefs.current[index] = el;
                          }}
                          onClick={() => toggleMenu(index)}
                          className="
                            p-1
                            rounded-md
                            hover:bg-gray-100
                            dark:hover:bg-gray-700
                          "
                        >
                          <BsThreeDotsVertical className="text-[14px]" />
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
                              className="
                                bg-white
                                dark:bg-[#2C2C2C]
                                rounded-lg
                                shadow-lg
                                border
                                border-gray-100
                                dark:border-gray-700
                                z-50
                              "
                            >
                              <button
                                className="
                                  w-full
                                  text-center
                                  px-2 border-b
                                  py-2
                                  text-[10px]
                                  hover:bg-gray-100
                                  dark:hover:bg-gray-700
                                "
                                onClick={() =>
                                  handleToggleFeatureAccess(
                                    item,
                                    !item.isEnabled,
                                  )
                                }
                              >
                                {item.isEnabled ? "Disable" : "Enable"}
                              </button>

                              <button
                                className="
                                  w-full
                                  text-center
                                  px-2
                                  py-2 rounded-b-lg
                                  text-[10px]
                                  text-red-800
                                  hover:bg-gray-100
                                  dark:hover:bg-gray-700
                                "
                                onClick={closeMenu}
                              >
                                Cancel
                              </button>
                            </div>,
                            document.body,
                          )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-5 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center gap-1 px-3 py-4">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <span className="text-[23px] color-[#999FAC]">‹</span>
            </button>

            <span className="px-2 text-[11px] text-gray-500">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                disabled:cursor-not-allowed
                disabled:opacity-50
                text-[11px]
              "
            >
              <span className="text-[23px] color-[#999FAC]">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
