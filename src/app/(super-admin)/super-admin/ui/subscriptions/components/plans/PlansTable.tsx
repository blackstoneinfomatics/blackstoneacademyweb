"use client";

import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiPoliceBadgeFill } from "react-icons/ri";
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import Image from "next/image"


const badgeColors: Record<string, string> = {
  Basic: "bg-cyan-100 text-cyan-600",
  Standard: "bg-blue-100 text-blue-600",
  Premium: "bg-indigo-100 text-indigo-600",
};

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

const PlansTable = () => {

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
  fetchPlans();
}, []);

const fetchPlans = async () => {
  try {
    setLoading(true);

    const response = await axios.get(
      "http://localhost:5001/plans"
    );

    setPlans(response.data.data || []);
  } catch (error) {
    console.error("Error fetching plans:", error);
  } finally {
    setLoading(false);
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
              placeholder="Search by keyword"
              className="ml-2 w-full bg-transparent text-sm text-[#444] outline-none placeholder:text-[#A5AAB4]"
            />
          </div>

          {/* Filter */}
          <button className="flex h-12 items-center justify-between border-r border-[#E6EAF2] px-4 text-sm text-[#80848E] hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} />
              Filter
            </div>

            <ChevronDown size={16} />
          </button>

          {/* Count */}
          <div className="flex h-12 items-center px-4 text-sm text-[#80848E]">
            Showing 10 Of 50
          </div>
        </div>

        {/* Table */}
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="h-10 bg-[#496A96] text-left text-[14px] text-white">
                <th className="px-4 font-medium">Plan Name</th>
                <th className="px-4 font-medium">Price</th>
                <th className="px-4 font-medium">Billing Cycle</th>
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
              ) : (
                plans.map((item, index) => (
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
      item.planName
    )}`}
  >
    {item.planName}
  </span>
</td>

                  <td className="px-4">${item.monthlyPrice}</td>

                  <td className="px-4">{item.billingCycle}</td>

<td className="px-4 text-[#4D74AE]">
  {item.createdDate
    ? (() => {
        const date = new Date(item.createdDate);
        const month = date.toLocaleString("en-US", { month: "short" });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}, ${day} ${year}`;
      })()
    : "-"}
</td>

                  <td className="px-4">{Object.values(item.features || {}).flat().length}</td>

                  <td className="px-4">{item.subscribedTenants || 0}</td>

                  <td className="px-4">
                    <span
    className={`rounded-md px-3 py-1 text-xs font-medium ${
      item.status === "Active"
        ? "bg-[#EAF8EC] text-[#34A853]"
        : "bg-red-100 text-red-600"
    }`}
  > 
  {item.status}
  </span>
                  </td>

                  <td className="px-4 py-4 relative">
                    <div className="flex justify-center">
                      <button className="rounded-md p-1 hover:bg-gray-100" onClick={() =>
                          setOpenMenu(openMenu === index ? null : index)
                        }>
                        <MoreVertical size={18} className="text-[#6B7280]" />
                      </button>

                      {openMenu === index && (
                        <div className="absolute right-4 top-12 z-50 w-36 bg-white rounded-lg shadow-lg border">
                          <button
                            className="w-full border-b text-left px-4 py-2 text-xs hover:bg-gray-100"
                            onClick={() => {
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
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-4 py-3">
        <button className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronLeft size={18} />
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded border border-[#496A96] bg-white font-medium text-[#496A96]">
          1
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50">
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
                      <h3 className="text-lg font-semibold">Enterprise</h3>

                      <span className="px-3 py-1 rounded-sm bg-green-100 text-green-700 text-[10px] font-medium">
                        Active
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
                  ["Plan Type", "Enterprise"],
                  ["Billing Cycle", "Monthly / Yearly"],
                  ["Created Date", "Sep 12, 2023"],
                  ["Last Updated", "May 20, 2024"],
                  ["Created By", "Super Admin"],
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
                        $8,500 <span>/ Month</span>
                      </h2>
                    </div>

                    <div className="border-l border-white/40 pl-6">
                      <p className="text-sm opacity-90">Yearly Price</p>

                      <h2 className="text-lg font-medium mt-3">
                        $8,500 <span>/ Year</span>
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
                    ["Total Subscribed Tenant", "42"],
                    ["Active Tenants", "32"],
                    ["Monthly Revenue", "$8,500,000"],
                    ["Yearly Revenue", "$8,500,000"],
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
                      ["Maximum Students", "500"],
                      ["Maximum Staff / Users", "100"],
                      ["Storage Limit", "250 GB"],
                      ["Custom Domain", "Yes"],
                      ["Backup", "Yes"],
                      ["API Access", "Yes"],
                      ["White Label", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
                      ["Priority Support", "Yes"],
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

                  <div className="grid grid-cols-2 gap-y-3 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#576CBC] scrollbar-track-[#fff] pr-2">
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
                      "Reports & Insights",
                      "Mobile App Access",
                    ].map((item) => (
                      <div
                        key={item}
                        className="text-[#010e30] text-[14px] font-normal"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}

              <div className="border rounded-xl p-3">
                <h4 className="font-medium text-base mb-3">Timeline</h4>

                {[
                  ["Plan Created", "May 01, 2024"],
                  ["Last Updated", "May 01, 2024"],
                  ["Last Price Change", "May 01, 2024"],
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
          <div className="w-full max-w-3xl max-h-[95vh] overflow-y-scroll scrollbar-none rounded-lg bg-white shadow-2xl">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-medium text-gray-800">Update Plan</h2>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 py-2 px-4">
              {/* Basic Information */}
              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold text-gray-800">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                      placeholder="Name of the subscription plan."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Plan Type
                    </label>

                    <select className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500">
                      <option>Select</option>
                      <option>Premium</option>
                      <option>Standard</option>
                      <option>Basic</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    className="w-full rounded border border-[#d4d4d4] p-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                    placeholder="Short explanation about the plan and its features."
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Monthly Price (USD)
                    </label>

                    <input
                      type="text"
                      defaultValue="$8,800"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Yearly Price (USD)
                    </label>

                    <input
                      type="text"
                      defaultValue="$86,500"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Limits */}
              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold">Plan Limits</h3>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Students
                    </label>

                    <select className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs">
                      <option>Unlimited</option>
                      <option>100</option>
                      <option>500</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Users
                    </label>

                    <input
                      defaultValue="10"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Storage Limit (GB)
                    </label>

                    <input
                      defaultValue="250"
                      className="h-8 w-full rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-5 gap-6">
                  {featureItems.map((item) => (
                    <div key={item.key} className="flex flex-col items-start">
                      <span className="mb-2 text-sm font-medium text-[#010e30]">
                        {item.label}
                      </span>

                      <ToggleSwitch
                        checked={features[item.key as keyof typeof features]}
                        onChange={() =>
                          setFeatures((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof prev],
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Modules */}

              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold">
                  Included Modules
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Student Management",
                    "Staff Management",
                    "Attendance",
                    "Fees Management",
                    "Examination",
                    "Transport Management",
                    "Student Management",
                    "Student Management",
                    "Library Management",
                    "Hostel Management",
                    "HR & Payroll",
                    "Performance Analytics",
                  ].map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 cursor-pointer text-[13px]"
                    >
                      <span className="relative flex h-[13px] w-[13px] items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer absolute inset-0 h-[13px] w-[13px] cursor-pointer opacity-0"
                        />

                        <span className="flex h-[13px] w-[13px] items-center justify-center rounded-[3px] border border-[#576CBC] bg-white text-transparent peer-checked:bg-[#576CBC] peer-checked:text-white">
                          <svg
                            viewBox="0 0 16 16"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}

              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-4 text-[15px] font-semibold">Status</h3>

                <div className="gap-4">
                  <div className="flex flex-row gap-5">
                    <label className="text-sm mt-2 font-medium">
                      Plan Status
                    </label>

                    <select className="h-8 w-[550px] ml-11 rounded border border-[#d4d4d4] px-3 placeholder:text-[#010e309c] text-xs">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button className="rounded bg-[#576CBC] px-4 py-2 text-xs font-medium text-white">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlansTable;
