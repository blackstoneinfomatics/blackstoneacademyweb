"use client";

import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiPoliceBadgeFill } from "react-icons/ri";


const recentItems = [
  {
    planName: "Blackstone Academy",
    price: "John Doe",
    billingCycle: "Premium",
    CreatedDate: "2026-12-31",
    features: 250,
    subscribedTenants: 250,
    status: "Active",
  },
  {
    planName: "Srashtalk",
    price: "Sarah Ali",
    billingCycle: "Basic",
    CreatedDate: "2026-10-15",
    features: 120,
    subscribedTenants: 120,
    status: "Expired",
  },
  {
    planName: "Zotal AI",
    price: "Rahul Kumar",
    billingCycle: "Premium",
    CreatedDate: "2027-01-20",
    features: 500,
    subscribedTenants: 500,
    status: "Active",
  },
];

export default function PlansTable() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434]">
        <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-5 py-3">
          Plan
        </h2>

        <div className="overflow-x-auto scrollbar-none h-full">
          <div className="h-[380px] rounded-b-xl scrollbar-none">
            <table className="min-w-full text-xs border-collapse table-fixed">
              <thead className="text-[13px] bg-[#4C6993] text-white dark:bg-[#44699d]">
                <tr>
                  {[
                    "Plan Name",
                    "Price",
                    "Billing Cycle",
                    "Created Date",
                    "Features",
                    "Subscribed Tenants",
                    "Status",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="py-4 px-2 font-semibold text-left border border-[#466993]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {recentItems.map((item, index) => (
                  <tr
                    key={index}
                    className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff]"
                  >
                    <td className="py-4 px-2">{item.planName}</td>
                    <td className="py-4 px-2">{item.price}</td>
                    <td className="py-4 px-2">{item.billingCycle}</td>
                    <td className="py-4 px-2">{item.CreatedDate}</td>
                    <td className="py-4 px-2">{item.features}</td>
                    <td className="py-4 px-2">{item.subscribedTenants}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 text-[12px] py-[3px] rounded-md ${
                          item.status === "Active"
                            ? "bg-[#E4F4E8] text-[#40BD5F]"
                            : item.status === "Expired"
                              ? "bg-[#F6E0E0] text-[#EA4F4F]"
                              : "bg-[#F6EcDC] text-[#EFA133]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-2 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === index ? null : index)
                        }
                        className="p-2 rounded-md hover:bg-gray-200"
                      >
                        <BsThreeDotsVertical size={16} />
                      </button>

                      {openMenu === index && (
                        <div className="absolute right-4 top-12 z-50 w-36 bg-white rounded-lg shadow-lg border">
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
    </>
  );
}
