"use client";

import React, { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { MdTune } from "react-icons/md";

const userItems = [
  {
    name: "Abimanyu",
    email: "blackstone@gmail.com",
    department: "Administration",
    role: "Admin",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdOn: "Today, 10:30 AM",
  },
  {
    name: "Jeeva",
    email: "blackstone@gmail.com",
    department: "Science",
    role: "Teacher",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdOn: "Today, 10:30 AM",
  },
  {
    name: "Abimanyu",
    email: "blackstone@gmail.com",
    department: "Administration",
    role: "Admin",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdOn: "Today, 10:30 AM",
  },
  {
    name: "Jeeva",
    email: "blackstone@gmail.com",
    department: "Science",
    role: "Teacher",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdOn: "Today, 10:30 AM",
  },
  {
    name: "Abimanyu",
    email: "blackstone@gmail.com",
    department: "Administration",
    role: "Admin",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdOn: "Today, 10:30 AM",
  },
  {
    name: "Jeeva",
    email: "blackstone@gmail.com",
    department: "Science",
    role: "Teacher",
    status: "Active",
    lastLogin: "Today, 10:30 AM",
    createdOn: "Today, 10:30 AM",
  },
];

const Usertable = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const openMenuRef = useRef<HTMLTableCellElement | null>(null);

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
    Users
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
                  "Users",
                  "Email id",
                  "Department",
                  "Role",
                  "Status",
                  "Last Login",
                  "Created On",
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
  {userItems.map((item, index) => (
    <tr
      key={index}
      className="border-b border-gray-100 hover:bg-gray-50 text-[12px]"
    >
      <td className="py-4 px-3 font-medium text-[#1F2937]">
        {item.name}
      </td>

      <td className="py-4 px-3 text-[#3D8FDE]">
        {item.email}
      </td>

      <td className="py-4 px-3 text-[#374151]">
        {item.department}
      </td>

      <td className="py-4 px-3">
        <span
          className={`px-5 py-1 rounded-md text-[12px]
          ${
            item.role === "Admin"
              ? "bg-[#DCEBFB] text-[#2F80ED]"
              : "bg-[#D9F1E6] text-[#22A06B]"
          }`}
        >
          {item.role}
        </span>
      </td>

      <td className="py-4 px-3">
        <span className="px-5 py-1 rounded-md bg-[#EDF9F0] text-[#35A853] text-[12px]">
          {item.status}
        </span>
      </td>

      <td className="py-4 px-3 text-[#38619A]">
        {item.lastLogin}
      </td>

      <td className="py-4 px-3 text-[#38619A]">
        {item.createdOn}
      </td>

      <td
        className="py-4 px-3 relative"
        ref={openMenu === index ? openMenuRef : null}
      >
        <button
          onClick={() =>
            setOpenMenu(openMenu === index ? null : index)
          }
          className="p-1 rounded hover:bg-gray-100"
        >
          <BsThreeDotsVertical />
        </button>

    {openMenu === index && (
      <div className="absolute right-4 top-12 w-36 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border z-50">
        <button
          className="w-full text-center px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setOpenMenu(null)}
        >
          View Details
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
    </div>
  );
}

export default Usertable
