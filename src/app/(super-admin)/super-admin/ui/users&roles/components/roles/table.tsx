"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { MdTune } from "react-icons/md";

const recentItems = [
  {
    tenantName: "Blackstone Academy",
    domain: "blackstoneacademy.com",
    phoneNumber: "9876543210",
    email: "info@blackstoneacademy.com",
    startDate: "Sep 12, 2023",
    plan: "Standard",
    users: 570,
    renewalDate: "Sep 12, 2024",
    status: "Active",
  },
  {
    tenantName: "Blackstone Institute",
    domain: "blackstone.com",
    phoneNumber: "9876543211",
    email: "admin@blackstone.com",
    startDate: "Sep 12, 2023",
    plan: "Premium",
    users: 345,
    renewalDate: "Sep 12, 2024",
    status: "Active",
  },
  {
    tenantName: "Future Academy",
    domain: "future.com",
    phoneNumber: "9876543212",
    email: "contact@future.com",
    startDate: "Sep 12, 2023",
    plan: "Basic",
    users: 420,
    renewalDate: "-",
    status: "Inactive",
  },
  {
    tenantName: "Smart School",
    domain: "smartschool.com",
    phoneNumber: "9876543213",
    email: "support@smartschool.com",
    startDate: "Sep 12, 2023",
    plan: "Standard",
    users: 555,
    renewalDate: "Sep 12, 2024",
    status: "Active",
  },
  {
    tenantName: "EduPortal",
    domain: "eduportal.com",
    phoneNumber: "9876543214",
    email: "info@eduportal.com",
    startDate: "Sep 12, 2023",
    plan: "Basic",
    users: 1009,
    renewalDate: "Sep 12, 2024",
    status: "Expiring Soon",
  },
];

const Table = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const openMenuRef = useRef<HTMLTableCellElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openMenu !== null &&
        openMenuRef.current &&
        !openMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  return (
<div className="space-y-4">
 {/* Page Title */}
  <h2 className="text-[21px] mt-2 font-semibold text-[#24324B] dark:text-white">
    All Tenants
  </h2>

  {/* Table Card */}
  <div className="rounded-xl bg-white dark:bg-[#343434] shadow-lg overflow-hidden">


  {/* Toolbar */}
  <div className="grid grid-cols-3 border-y border-[#E7EAF3] bg-white dark:bg-[#2E2E2E]">

    {/* Search */}
    <div className="flex items-center px-4 h-12 border-r border-[#E7EAF3]">
      <FiSearch className="text-gray-400 mr-2" />
      <input
        placeholder="Search by keyword"
        className="w-full outline-none bg-transparent text-sm"
      />
    </div>

    {/* Filter */}
    <div className="flex items-center justify-between px-4 h-12 border-r border-[#E7EAF3] cursor-pointer">
      <div className="flex items-center gap-2">
        <MdTune className="text-gray-400 mr-2" />
        <span className="text-sm text-gray-400">Filter</span>
      </div>

      <FiChevronDown className="text-gray-400" />
    </div>

    {/* Count */}
    <div className="flex items-center px-5 h-12">
      <span className="text-sm text-gray-400">
        Showing 10 Of 50
      </span>
    </div>

  </div>

<div className="overflow-x-auto overflow-y-auto h-[380px] rounded-b-xl scrollbar-none">
        <div className=" h-[380px] rounded-b-xl scrollbar-none">
<table className="w-max min-w-full text-xs border-collapse">
                <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#44699d]">
              <tr>
                {[
                  "Tenant Name",
                  "Domain",
                  "Phone Number",
                  "Email",
                  "Start Date",
                  "Plan",
                  "User",
                  "Renewal Date",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-4 px-3 whitespace-nowrap font-medium text-left border border-[#466993]"
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
  className="text-[12px] odd:bg-[#f8f8f8] even:bg-white dark:odd:bg-[#2c2c2c] dark:even:bg-[#303030]"
>
  <td className="py-4 px-3">{item.tenantName}</td>

  <td className="py-4 px-3 text-[#4A90E2]">
    {item.domain}
  </td>

  <td className="py-4 px-3">
    {item.phoneNumber}
  </td>

  <td className="py-4 px-3 text-[#4A90E2] truncate">
    {item.email}
  </td>

  <td className="py-4 px-3">
    {item.startDate}
  </td>

  <td className="py-4 px-3">
    <span className="px-3 py-1 rounded-md bg-[#E8F3FF] text-[#3B82F6] text-[11px]">
      {item.plan}
    </span>
  </td>

  <td className="py-4 px-3">
    {item.users}
  </td>

  <td className="py-4 px-3">
    {item.renewalDate}
  </td>

  <td className="py-4 px-3">
    <span
      className={`px-3 py-1 rounded-md text-[11px] font-medium ${
        item.status === "Active"
          ? "bg-[#E8F8EC] text-[#2E9D4D]"
          : item.status === "Inactive"
          ? "bg-[#FDECEC] text-[#E53935]"
          : "bg-[#FFF4E5] text-[#F39C12]"
      }`}
    >
      {item.status}
    </span>
  </td>

  <td
    className="py-4 px-3 relative"
    ref={openMenu === index ? openMenuRef : null}
  >
    <button
      onClick={() => setOpenMenu(openMenu === index ? null : index)}
      className="p-2 rounded-md hover:bg-gray-100"
    >
      <BsThreeDotsVertical />
    </button>

    {openMenu === index && (
      <div className="absolute right-4 top-12 w-36 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border z-50">
        <button
          className="w-full text-center px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => {
            setOpenMenu(null);
            router.push(
              `/super-admin/ui/users&roles/user_tenants?tenantName=${encodeURIComponent(
                item.tenantName
              )}`
            );
          }}
        >
          View Details
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
    </div>
  );
}

export default Table
