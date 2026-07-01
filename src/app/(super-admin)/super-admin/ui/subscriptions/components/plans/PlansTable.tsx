"use client";

import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

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
  {
    planName: "ERP School",
    price: "Aisha Khan",
    billingCycle: "Standard",
    CreatedDate: "2026-09-10",
    features: 180,
    subscribedTenants: 180,
    status: "Suspended",
  },
  {
    planName: "EduPortal",
    price: "Ali Hassan",
    billingCycle: "Basic",
    CreatedDate: "2026-11-25",
    features: 320,
    subscribedTenants: 320,
    status: "Active",
  },
];

export default function PlansTable() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434]">
      <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-5 py-3">
        New Tenants
      </h2>

      <div className="overflow-x-auto scrollbar-none h-full">
        <div className=" h-[380px] rounded-b-xl scrollbar-none">
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
              {recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <tr
                    key={index}
                    className="text-[12px] odd:bg-[#f8f8f8] even:bg-[#ffffff] dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
                  >
                    <td className="py-4 px-2">{item.planName}</td>
                    <td className="py-4 px-2">{item.price}</td>
                    <td className="py-4 px-2">{item.billingCycle}</td>{" "}
                    <td className="py-4 px-2">{item.CreatedDate}</td>
                    <td className="py-4 px-2">{item.features}</td>
                    <td className="py-4 px-2">{item.subscribedTenants}</td>
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
                              console.log("View Details", item);
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
    </div>
  );
}
