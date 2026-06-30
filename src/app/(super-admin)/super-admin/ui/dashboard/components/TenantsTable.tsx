"use client";

import React from "react";
import { TbUsers } from "react-icons/tb";


const recentItems = [
  {
    tenantName: "Blackstone Academy",
    admin: "John Doe",
    plan: "Premium",
    expiryDate: "2026-12-31",
    users: 250,
    status: "Active",
  },
  {
    tenantName: "Srashtalk",
    admin: "Sarah Ali",
    plan: "Basic",
    expiryDate: "2026-10-15",
    users: 120,
    status: "Expired",
  },
  {
    tenantName: "Zotal AI",
    admin: "Rahul Kumar",
    plan: "Premium",
    expiryDate: "2027-01-20",
    users: 500,
    status: "Active",
  },
  {
    tenantName: "ERP School",
    admin: "Aisha Khan",
    plan: "Standard",
    expiryDate: "2026-09-10",
    users: 180,
    status: "Suspended",
  },
  {
    tenantName: "EduPortal",
    admin: "Ali Hassan",
    plan: "Basic",
    expiryDate: "2026-11-25",
    users: 320,
    status: "Active",
  },
];

const TenantsTable = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg dark:bg-[#343434]">
      <h2 className="text-[19px] font-semibold text-[#000] dark:text-[#fff] mb-0 px-5 py-3">
        New Tenants
      </h2>

      <div className="overflow-x-auto scrollbar-none h-full">
        <div className="overflow-y-auto h-[325px] rounded-b-xl scrollbar-none">
          <table className="min-w-full text-xs border-collapse table-fixed">
            <thead className="text-[13px] bg-[#4C6993] text-white dark:bg-[#44699d]">
              <tr>
                {[
                  "Tenant Name",
                  "Admin",
                  "Plan",
                  "Status",
                  "Expiry Date",
                  "Users",
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
                    <td className="py-4 px-2">{item.tenantName}</td>
                    <td className="py-4 px-2">{item.admin}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 py-1 rounded-md text-[12px] font-medium inline-block ${
                          item.plan === "Premium"
                            ? "bg-[#DCDDF2] text-[#585BDC]"
                            : item.plan === "Basic"
                              ? "bg-[#DDF3F8] text-[#31C7E5]"
                              : "bg-[#DCDDF2] text-[#3169DE]"
                        }`}
                      >
                        {item.plan}
                      </span>
                    </td>{" "}
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 text-[12px] py-[3px] rounded-md ${
                          item.status === "Active"
                            ? "bg-[#E4F4E8] text-[#40BD5F] dark:bg-[#E4F4E8]"
                            : item.status === "Expired==="
                              ? "bg-[#F6E0E0] text-[#EA4F4F] dark:bg-[#D3464533]"
                              : "bg-[#F6EcDC] text-[#EFA133] dark:bg-[#F0AD4E33]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-2">{item.expiryDate}</td>
                    <td className="py-4 px-2 flex flex-1 gap-1"><TbUsers className="mt-[1px]"/>{item.users}</td>
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
};

export default TenantsTable;
