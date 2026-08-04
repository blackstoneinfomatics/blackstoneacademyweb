"use client";

import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

import { X } from "lucide-react";


const recentItems = [
  {
    tenantName: "Blackstone Academy",
    details: "Premium",
    date: "2026-12-31",
    activity: 250,
    status: "Active",
  },
  {
    tenantName: "Srashtalk",
    details: "Basic",
    date: "2026-10-15",
    activity: 120,
    status: "Expired",
  },
  {
    tenantName: "Zotal AI",
    details: "Premium",
    date: "2027-01-20",
    activity: 500,
    status: "Active",
  },
  {
    tenantName: "ERP School",
    details: "Standard",
    date: "2026-09-10",
    activity: 180,
    status: "Suspended",
  },
  {
    tenantName: "EduPortal",
    details: "Basic",
    date: "2026-11-25",
    activity: 320,
    status: "Active",
  },
];
const Table = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null);

  return (
    <div className="bg-white shadow-lg dark:bg-[#343434] rounded-2xl">
      <div className="overflow-x-auto scrollbar-none h-full rounded-2xl">
        <div className=" h-[380px] rounded-b-xl scrollbar-none">
          <table className="min-w-full text-xs border-collapse table-fixed">
            <thead className="text-[14px] bg-[#4C6993] text-white dark:bg-[#44699d]">
              <tr>
                {[
                  "Date & time",
                  "Activity",
                  "Tenant Name & Details",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-4 px-2 font-medium text-left border border-[#466993]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <tr
                    key={index}
                    className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                  >
                    <td className="py-4 px-2">{item.date}</td>
                    <td className="py-4 px-2">{item.activity}</td>
                    <td className="py-4 px-2">{item.tenantName} & {item.details}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 text-[12px] py-[3px] rounded-md ${
                          item.status === "Active"
                            ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#36477e33]"
                            : item.status === "Expired"
                              ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
                              : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
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
                        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <BsThreeDotsVertical size={16} />
                      </button>

                      {openMenu === index && (
                        <div className="absolute right-4 top-12 z-50 w-36 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border dark:border-gray-700">
                          <button
                            className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
  setSelectedAnalytics(item);
  setShowAnalyticsModal(true);
  setOpenMenu(null);
}}
                          >
                            View Details
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                              console.log("Cancel", item);
                              setOpenMenu(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAnalyticsModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-[650px] rounded-xl bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-[20px] font-semibold text-[#101B41]">
          Analytics Details
        </h2>

        <button onClick={() => setShowAnalyticsModal(false)}>
          <X size={22} className="text-gray-400 hover:text-black" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="rounded-xl border border-[#E4E8F1] p-4">

          {/* Tenant Name */}
          <div className="mb-5">
            <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
              Tenant Name
            </label>

            <input
              readOnly
              value={selectedAnalytics?.tenantName || ""}
              className="h-11 w-full rounded-md border border-[#D8DDE8] bg-white px-4 text-sm text-[#4B5563] outline-none"
            />
          </div>

          {/* Date & Activity */}

          <div className="mb-5 grid grid-cols-2 gap-4">

            <div>
              <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
                Trial Start Date
              </label>

              <input
                readOnly
                value={selectedAnalytics?.date || ""}
                className="h-11 w-full rounded-md border border-[#D8DDE8] bg-white px-4 text-sm text-[#4B5563] outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
                Activity
              </label>

              <input
                readOnly
                value={selectedAnalytics?.activity || ""}
                className="h-11 w-full rounded-md border border-[#D8DDE8] bg-white px-4 text-sm text-[#4B5563] outline-none"
              />
            </div>

          </div>

          {/* Details */}

          <div>
            <label className="mb-2 block text-[15px] font-medium text-[#101B41]">
              Details
            </label>

            <input
              readOnly
              value={selectedAnalytics?.details || ""}
              className="h-11 w-full rounded-md border border-[#D8DDE8] bg-white px-4 text-sm text-[#4B5563] outline-none"
            />
          </div>

        </div>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

export default Table
