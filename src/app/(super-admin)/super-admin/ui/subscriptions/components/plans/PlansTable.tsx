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


// const plans = [
//   {
//     name: "Basic",
//     price: "$ 8,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Standard",
//     price: "9,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Premium",
//     price: "12,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Basic",
//     price: "8,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
//   {
//     name: "Standard",
//     price: "8,500",
//     billing: "Monthly",
//     date: "Sep, 12 2023",
//     features: 10,
//     tenants: 15,
//   },
// ];

const badgeColors: Record<string, string> = {
  Basic: "bg-cyan-100 text-cyan-600",
  Standard: "bg-blue-100 text-blue-600",
  Premium: "bg-indigo-100 text-indigo-600",
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

  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="mb-4 text-[30px] font-semibold text-[#1F2A44]">Plan</h2>

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
              <tr className="h-10 bg-[#496A96] text-left text-[13px] font-medium text-white">
                <th className="px-4">Plan Name</th>
                <th className="px-4">Price</th>
                <th className="px-4">Billing Cycle</th>
                <th className="px-4">Created Date</th>
                <th className="px-4">Features</th>
                <th className="px-4">Subscribed Tenants</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-center">Action</th>
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
        <button className="flex h-8 w-8 items-center justify-center rounded border border-[#E5E7EB] text-[#98A2B3] hover:bg-gray-50">
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
        <div className="fixed -inset-4 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl w-full max-w-[700px] max-h-full overflow-y-scroll scrollbar-none p-4 relative">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 text-base font-bold"
            >
              ✕
            </button>

            <h2 className="text-base font-semibold mb-4">Plan Details</h2>

            {/* Top Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 p-2 rounded-xl bg-[#ECE8FF] flex items-center justify-center">
                  <RiPoliceBadgeFill className="w-8 h-8 bg-[#6949FC]"/>
                </div>

                <div>
                  <h3 className="text-3xl font-bold">Enterprise</h3>
                  <p className="text-gray-500 max-w-2xl text-sm">
                    Our most powerful subscription plan designed for large
                    organizations with advanced features, higher resource
                    limits, and priority support
                  </p>
                </div>
              </div>

              <span className="bg-[#E4F4E8] text-[#40BD5F] px-4 py-1 rounded-md text-sm">
                Active
              </span>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                ["Plan Type", "Enterprise"],
                ["Billing Cycle", "Monthly / Yearly"],
                ["Created Date", "Sep 12, 2023"],
                ["Last Updated", "May 20, 2024"],
                ["Created By", "Super Admin"],
              ].map(([title, value]) => (
                <div key={title} className="bg-[#F3F4F6] rounded-lg p-4">
                  <p className="text-sm text-gray-500">{title}</p>
                  <p className="font-medium mt-2">{value}</p>
                </div>
              ))}
            </div>

            {/* Pricing + Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-xl p-5">
                <h4 className="font-semibold text-xl mb-5">Pricing</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500">Monthly Price</p>
                    <p className="text-4xl font-bold mt-2">$8,500</p>
                    <span className="text-gray-500">/ Month</span>
                  </div>

                  <div>
                    <p className="text-gray-500">Yearly Price</p>
                    <p className="text-4xl font-bold mt-2">$85,500</p>
                    <span className="text-gray-500">/ Year</span>

                    <div className="mt-3">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        Save 17%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-5">
                <h4 className="font-semibold text-xl mb-5">Plan Statistics</h4>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Subscribed Tenant</span>
                    <span>42</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tenants</span>
                    <span>32</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Revenue</span>
                    <span>$8,500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yearly Revenue</span>
                    <span>$8,500,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limits + Modules */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-xl p-5">
                <h4 className="font-semibold text-xl mb-5">Plan Limits</h4>

                <div className="space-y-4">
                  {[
                    ["Maximum Students", "500"],
                    ["Maximum Staff / Users", "100"],
                    ["Storage Limit", "250 GB"],
                    ["Custom Domain", "Yes"],
                    ["Backup", "Yes"],
                    ["API Access", "Yes"],
                    ["White Label", "Yes"],
                    ["Priority Support", "Yes"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-xl p-5">
                <h4 className="font-semibold text-xl mb-5">Included Modules</h4>

                <div className="grid grid-cols-2 gap-y-4">
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
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border rounded-xl p-5">
              <h4 className="font-semibold text-xl mb-5">Timeline</h4>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Plan Created</span>
                  <span>May 01, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>May 01, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Price Change</span>
                  <span>May 01, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-6">Update Plan</h2>

            {/* Basic Info */}
            <div className="border rounded-xl p-5 mb-4">
              <h3 className="font-semibold mb-4">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm">Plan Name</label>
                  <input
                    defaultValue={selectedPlan.planName}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm">Plan Type</label>
                  <select className="w-full border rounded-md px-3 py-2 mt-1">
                    <option>Premium</option>
                    <option>Basic</option>
                    <option>Standard</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm">Description</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Monthly Price (USD)</label>
                  <input
                    defaultValue="$8,500"
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm">Yearly Price (USD)</label>
                  <input
                    defaultValue="$85,500"
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="border rounded-xl p-5 mb-4">
              <h3 className="font-semibold mb-4">Plan Limits</h3>

              <div className="grid grid-cols-3 gap-4">
                <input
                  placeholder="Students"
                  className="border rounded-md px-3 py-2"
                />
                <input
                  placeholder="Users"
                  className="border rounded-md px-3 py-2"
                />
                <input
                  placeholder="Storage Limit"
                  className="border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-5 gap-4 mt-4 text-sm">
                {[
                  "Custom Domain",
                  "Backup",
                  "API Access",
                  "White Label",
                  "Priority Support",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            {/* Modules */}
            <div className="border rounded-xl p-5 mb-4">
              <h3 className="font-semibold mb-4">Included Modules</h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Student Management",
                  "Attendance",
                  "Examination",
                  "Library Management",
                  "HR & Payroll",
                  "Staff Management",
                  "Fees Management",
                  "Transport Management",
                  "Hostel Management",
                  "Performance Analytics",
                ].map((module) => (
                  <label key={module} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    {module}
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="border rounded-xl p-5 mb-4">
              <h3 className="font-semibold mb-4">Status</h3>

              <select className="w-full border rounded-md px-3 py-2">
                <option>Active</option>
                <option>Expired</option>
                <option>Suspended</option>
              </select>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-5 py-2 border rounded-md"
              >
                Reset
              </button>

              <button className="px-5 py-2 bg-[#4C6993] text-white rounded-md">
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
