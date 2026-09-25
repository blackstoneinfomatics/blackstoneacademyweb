"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import Pagination from "@/components/Pagination";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface FeatureApiItem {
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

interface FeatureApiResponse {
  success: boolean;
  message: string;
  data: FeatureApiItem[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface Feature {
  id: string;
  featureName: string;
  category: string;
  description: string;
  plan: string;
  date: string;
  status: string;
  featureStatus: string;
}
interface FeaturesTableProps {
  tenantId: string;
}

const FeaturesTable = ({tenantId} : FeaturesTableProps) => {

  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    featureName: "",
    category: "",
    plan: "",
    status: "",
    featureStatus: "",
  });

  const itemsPerPage = 10;

  /**
   * Fetch tenant features
   */
  const fetchFeatures = useCallback(
    async (signal?: AbortSignal) => {
      if (!tenantId) {
        setFeatures([]);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get<FeatureApiResponse>(
          `${AppApiEndpoints.API_END_POINT}/feature-control/all/tenant/${tenantId}`,
          {
            params: {
              page: currentPage,
              limit: itemsPerPage,
            },
            signal,
          },
        );

        if (response.data?.success) {
          const apiData = response.data.data ?? [];
          const pagination = response.data.pagination;

          const mappedFeatures: Feature[] = apiData.map((item, index) => ({
            id:
              item.featureId ??
              item.childModuleId ??
              item.parentModuleId ??
              `${currentPage}-${index}`,

            /*
             * Feature name:
             * Use actual feature name when available.
             * If the API row represents only a module, use parent module name.
             */
            featureName:
              item.featureName?.trim() ||
              item.childModuleName?.trim() ||
              item.parentModuleName?.trim() ||
              "-",

            /*
             * Category:
             * Child module is the closest category information
             * returned by the API.
             */
            category: item.childModuleName?.trim() || "-",

            description: item.description?.trim() || "-",

            /*
             * The current API response does not contain plan.
             * Do not hard-code a plan.
             */
            plan: "-",

            date: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",

            status:
              item.status?.toUpperCase() === "ACTIVE"
                ? "Active"
                : item.status || "Inactive",

            featureStatus: item.isEnabled ? "Enabled" : "Disabled",
          }));

          setFeatures(mappedFeatures);

          setTotalRecords(pagination?.totalRecords ?? 0);
          setTotalPages(pagination?.totalPages ?? 1);
        } else {
          setFeatures([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error("Failed to fetch tenant features:", error);

        setFeatures([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [tenantId, currentPage],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchFeatures(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchFeatures]);

  /**
   * Search + local filters
   */
  const filteredFeatures = features.filter((feature) => {
    const search = searchKeyword.trim().toLowerCase();

    const matchesSearch =
      !search ||
      feature.featureName.toLowerCase().includes(search) ||
      feature.category.toLowerCase().includes(search) ||
      feature.description.toLowerCase().includes(search) ||
      feature.plan.toLowerCase().includes(search);

    const featureNameFilter =
      !filters.featureName ||
      feature.featureName
        .toLowerCase()
        .includes(filters.featureName.toLowerCase());

    const categoryFilter =
      !filters.category ||
      feature.category
        .toLowerCase()
        .includes(filters.category.toLowerCase());

    const planFilter =
      !filters.plan || feature.plan === filters.plan;

    const statusFilter =
      !filters.status || feature.status === filters.status;

    const featureStatusFilter =
      !filters.featureStatus ||
      feature.featureStatus === filters.featureStatus;

    return (
      matchesSearch &&
      featureNameFilter &&
      categoryFilter &&
      planFilter &&
      statusFilter &&
      featureStatusFilter
    );
  });

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setOpenDropdownId(null);
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchKeyword(event.target.value);

    /*
     * Reset to first page when searching.
     */
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  /**
   * Plan styles
   */
  const getPlanStyle = (plan: string) => {
    switch (plan) {
      case "Premium":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";

      case "Standard":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";

      case "Basic":
        return "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400";

      default:
        return "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  /**
   * Status styles
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Enabled":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";

      case "Inactive":
      case "Disabled":
        return "bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400";

      default:
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  return (
    <div className="dark:text-white">
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col bg-white dark:bg-[#343434] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] rounded-xl p-3">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <h2 className="flex flex-wrap gap-4 font-medium dark:text-white">
                Blackstone Academy Features
              </h2>
            </div>

            {/* Search + Filter */}
            <div className="w-full bg-[#FAFAFB] dark:bg-[#1F1F1F] rounded-xl">

              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#1F1F1F]">

                {/* Search */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />

                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[15px] w-52 py-3 dark:text-white dark:placeholder:text-gray-400"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Filter */}
                <div
                  onClick={() => setShowFilter(true)}
                  className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </div>

                {/* Count */}
                <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                  <span className="text-left -ml-60">
                    Showing {filteredFeatures.length} of {totalRecords}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="table-fixed w-full border-collapse">

                  <thead className="text-[13px] bg-[#4C6993] text-white">
                    <tr>
                      {[
                        "Features",
                        "Category",
                        "Description",
                        "Plan",
                        "Status",
                        "Features Status",
                        "Action",
                      ].map((header, idx) => (
                        <th
                          key={idx}
                          className="px-2 py-1 border border-[#4C6993] dark:border-[#6A8AB0] text-left text-wrap break-words"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr
                          key={index}
                          className="animate-pulse bg-white dark:bg-[#2C2C2C]"
                        >
                          {Array.from({ length: 7 }).map((__, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-4"
                            >
                              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredFeatures.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-10 text-sm text-gray-500 dark:text-gray-400"
                        >
                          No features found
                        </td>
                      </tr>
                    ) : (
                      filteredFeatures.map((feature, index) => {
                        const rowBgClass =
                          index % 2 === 0
                            ? "bg-[#fff] dark:bg-[#2C2C2C]"
                            : "bg-[#F8F8F8] dark:bg-[#383838]";

                        return (
                          <tr
                            key={feature.id}
                            className={`text-[10px] ${rowBgClass}`}
                          >
                            {/* Feature */}
                            <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                              {feature.featureName}
                            </td>

                            {/* Category */}
                            <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                              {feature.category}
                            </td>

                            {/* Description */}
                            <td className="px-3 py-3 text-[11px] text-left dark:text-white">
                              {feature.description}
                            </td>

                            {/* Plan */}
                            <td className="px-3 py-3 text-left">
                              <span
                                className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getPlanStyle(
                                  feature.plan,
                                )}`}
                              >
                                {feature.plan}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-3 py-3 text-left">
                              <span
                                className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getStatusColor(
                                  feature.status,
                                )}`}
                              >
                                {feature.status}
                              </span>
                            </td>

                            {/* Feature Status */}
                            <td className="px-3 py-3 text-left">
                              <span
                                className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getStatusColor(
                                  feature.featureStatus,
                                )}`}
                              >
                                {feature.featureStatus}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-3 py-3 text-left relative text-[12px]">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDropdown(feature.id)
                                }
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                              >
                                <BsThreeDotsVertical />
                              </button>

                              {openDropdownId === feature.id && (
                                <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">

                                  <button
                                    type="button"
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                  >
                                    Update Feature
                                  </button>

                                  <button
                                    type="button"
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] dark:text-gray-200"
                                    onClick={() => {
                                      setSelectedFeature(feature);
                                      setShowViewModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    View Details
                                  </button>

                                  <button
                                    type="button"
                                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white dark:bg-[#2C2C2C] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
              setShowFilter(false);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg dark:text-white">
                Filter by
              </h2>

              <button
                type="button"
                className="text-gray-400 text-2xl font-bold cursor-pointer dark:text-gray-300"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Category
              </label>

              <input
                type="text"
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2C2C2C] dark:text-white focus:outline-none focus:border-[#576CBC] dark:focus:border-[#8296E6]"
                placeholder="Enter Category"
              />
            </div>

            {/* Plan */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Plan
              </label>

              <select
                value={filters.plan}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    plan: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2C2C2C] dark:text-white"
              >
                <option value="">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Status
              </label>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2C2C2C] dark:text-white"
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="border border-[#576CBC] bg-white dark:bg-transparent text-[#576CBC] dark:text-[#8296E6] rounded-lg px-6 py-2 font-semibold"
                onClick={() => {
                  setFilters({
                    category: "",
                    plan: "",
                    status: "",
                    featureStatus: "",
                    featureName: "",
                  });

                  setCurrentPage(1);
                }}
              >
                Reset
              </button>

              <button
                type="submit"
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold"
              >
                Show Results
              </button>
            </div>
          </form>

          <div
            className="fixed inset-0"
            onClick={() => setShowFilter(false)}
          />
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedFeature && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] max-w-[95vw] p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-semibold text-[#1E293B] dark:text-white">
                Features Details
              </h2>

              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">

              {/* Feature */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Features
                </label>

                <input
                  readOnly
                  value={selectedFeature.featureName}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Category
                </label>

                <input
                  readOnly
                  value={selectedFeature.category}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Description
                </label>

                <textarea
                  readOnly
                  rows={3}
                  value={selectedFeature.description}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Plan
                </label>

                <input
                  readOnly
                  value={selectedFeature.plan}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Date
                </label>

                <input
                  readOnly
                  value={selectedFeature.date}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C] dark:text-white"
                />
              </div>

              {/* Tenant Status */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Tenant Status
                </label>

                <input
                  readOnly
                  value={selectedFeature.status}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-green-600 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>

              {/* Feature Status */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Features Status
                </label>

                <input
                  readOnly
                  value={selectedFeature.featureStatus}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-green-600 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesTable;

