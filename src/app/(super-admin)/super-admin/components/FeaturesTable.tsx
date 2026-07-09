"use client";

import React, { useEffect, useState } from "react";
import { MdTune } from "react-icons/md";
import { Search } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";

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
const FeaturesTable = () => {
  const router = useRouter();
const [showViewModal, setShowViewModal] = useState(false);

const [selectedFeature, setSelectedFeature] =
  useState<Feature | null>(null);

 const [features, setFeatures] = useState<Feature[]>([
  {
    id: "1",
    featureName: "Student Management",
    category: "Core Module",
    description: "Manage students and enrollment",
    plan: "Enterprise",
    date: "2023-08-15",
    status: "Active",
    featureStatus: "Enabled",
  },
  {
    id: "2",
    featureName: "Attendance",
    category: "Academic",
    description: "Track daily attendance",
    plan: "Premium",
    date: "2023-08-15",
    status: "Active",
    featureStatus: "Enabled",
  },
  {
    id: "3",
    featureName: "Video Classes",
    category: "Learning",
    description: "Conduct live online classes",
    plan: "Standard",
    date: "2023-08-15",
    status: "Inactive",
    featureStatus: "Disabled",
  },
]);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);


const getPlanStyle = (plan: string) => {
  switch (plan) {
    case "Premium":
      return "bg-purple-100 text-purple-600";

    case "Standard":
      return "bg-blue-100 text-blue-600";

    case "Basic":
      return "bg-cyan-100 text-cyan-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const [filters, setFilters] = useState({
  featureName: "",
  category: "",
  plan: "",
  status: "",
  featureStatus: "",
});

  const itemsPerPage = 10;

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

 const filteredFeatures = features.filter((feature) => {
  const search =
    feature.featureName
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    feature.category
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    feature.description
      .toLowerCase()
      .includes(searchKeyword.toLowerCase()) ||
    feature.plan
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());

  const featureNameFilter =
    !filters.featureName ||
    feature.featureName
      .toLowerCase()
      .includes(filters.featureName.toLowerCase());

  const categoryFilter =
    !filters.category ||
    feature.category === filters.category;

  const planFilter =
    !filters.plan ||
    feature.plan === filters.plan;

  const statusFilter =
    !filters.status ||
    feature.status === filters.status;

  const featureStatusFilter =
    !filters.featureStatus ||
    feature.featureStatus === filters.featureStatus;

  return (
    search &&
    featureNameFilter &&
    categoryFilter &&
    planFilter &&
    statusFilter &&
    featureStatusFilter
  );
});

  const paginatedFeatures = filteredFeatures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage);

 

  return (
    <div>
      <br />

      <div className="md:p-0 mx-auto w-full">
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4 font-semibold text-xl">
                Blackstone Academy Features
              </div>
            </div>

            {/* Search + Filter */}
            <div className="w-full bg-[#FAFAFB] dark:bg-[#343434] rounded-lg">
              <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    className="bg-transparent outline-none text-[15px] w-52 py-3"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>

                <div
                  onClick={() => setShowFilter(true)}
                  className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                >
                  <MdTune className="w-4 h-4" />
                  <span>Filter</span>
                </div>

                <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                  <span className="text-left -ml-60">
                    Showing {filteredFeatures.length} of{" "}
                    {features.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="table-fixed w-full">
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
                        className="px-2 py-1 border border-[#4C6993] text-left text-wrap break-words"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedFeatures.map((feature, index) => {
                    const rowBgClass =
                      index % 2 === 0
                        ? "bg-[#fff] dark:bg-[#2C2C2C]"
                        : "bg-[#F8F8F8] dark:bg-[#303030]";

                    return (
                      <tr
                        key={feature.id}
                        className={`text-[10px] ${rowBgClass}`}
                      >
                        <td className="px-3 py-3 text-[11px] text-left">
                          {feature.featureName}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {feature.category}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-left">
                          {feature.description}
                        </td>
  <td className="px-3 py-3 text-left">

                        <span
                          className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${getPlanStyle(
                            feature.plan
                          )}`}
                        >
                          {feature.plan}
                        </span>
                      </td>

                        
  <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${
                              feature.status === "Paid"
                                ? "bg-green-100 text-green-600"
                                : feature.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {feature.status}
                          </span>
                        </td>
                        

                          <td className="px-3 py-3 text-left">
                          <span
                            className={`inline-flex items-center justify-center w-[80px] h-6 rounded-md text-xs font-medium ${
                              feature.featureStatus === "Paid"
                                ? "bg-green-100 text-green-600"
                                : feature.featureStatus === "Pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {feature.featureStatus}
                          </span>
                        </td>

                      

                        <td className="px-3 py-3 text-left relative text-[12px]">
                          <button
                            onClick={() => toggleDropdown(feature.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openDropdownId === feature.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#343434] border rounded-md shadow-lg z-50">
                              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]">
                                Update Feature
                              </button>
                             <button
  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
  onClick={() => {
    setSelectedFeature(feature);
    setShowViewModal(true);
    setOpenDropdownId(null);
  }}
>
  View Details
</button>

                              <button
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
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white dark:bg-[#232323] p-6 rounded-2xl shadow-lg w-[500px] flex flex-col z-50"
            onSubmit={(e) => {
              e.preventDefault();
              setShowFilter(false);
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filter by</h2>
              <button
                type="button"
                className="text-gray-400 text-2xl font-bold cursor-pointer"
                onClick={() => setShowFilter(false)}
              >
                ×
              </button>
            </div>

            {/* Invoice ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
Category              </label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
                className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2c2c2c]"
                placeholder="Enter Invoice ID"
              />
            </div>

            {/* Plan */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select
                value={filters.plan}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    plan: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:bg-[#2c2c2c] rounded-lg px-4 py-2 bg-gray-50"
              >
                <option value="">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            
            {/* Feature Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
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
                className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-[#2c2c2c] "
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="border border-[#576CBC] text-[#576CBC] rounded-lg px-6 py-2 font-semibold"
                onClick={() =>
                  setFilters({
                    category: "",
                    plan: "",
                    status: "",
                    featureStatus: "",
                    featureName: "",
                  })
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className="bg-[#576CBC] text-white rounded-lg px-6 py-2 font-semibold"
              >
                Show {filteredFeatures.length} Results
              </button>
            </div>
          </form>

          <div className="fixed inset-0" onClick={() => setShowFilter(false)} />
        </div>
      )}

      {showViewModal && selectedFeature && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-[24px] font-semibold text-[#1E293B] dark:text-white">
          Features Details
        </h2>

        <button
          onClick={() => setShowViewModal(false)}
          className="text-3xl text-gray-400 hover:text-gray-600"
        >
          ×
        </button>

      </div>

      <div className="grid grid-cols-2 gap-5">

        {/* Features */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Features
          </label>

          <input
            readOnly
            value={selectedFeature.featureName}
            className="w-full border rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
          />
        </div>

        {/* Category */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Category
          </label>

          <input
            readOnly
            value={selectedFeature.category}
            className="w-full border rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
          />
        </div>

        {/* Description */}

        <div className="col-span-2">

          <label className="block text-sm font-medium mb-2">
            Description
          </label>

          <textarea
            readOnly
            rows={3}
            value={selectedFeature.description}
            className="w-full border rounded-lg px-4 py-3 resize-none bg-[#F9FAFB] dark:bg-[#2C2C2C]"
          />

        </div>

        {/* Plan */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Plan
          </label>

          <input
            readOnly
            value={selectedFeature.plan}
            className="w-full border rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
          />
        </div>

        {/* Date */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Date
          </label>

          <input
            readOnly
            value={selectedFeature.date}
            className="w-full border rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
          />
        </div>

        {/* Tenant Status */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Tenant Status
          </label>

          <input
            readOnly
            value={selectedFeature.status}
            className="w-full border rounded-lg px-4 py-2 text-green-600 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
          />
        </div>

        {/* Feature Status */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Features Status
          </label>

          <input
            readOnly
            value={selectedFeature.featureStatus}
            className="w-full border rounded-lg px-4 py-2 text-green-600 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
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
