"use client";

import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const activities = [
  {
    id: 1,
    date: "Sep, 12 2023",
    role: "Admin",
    activity: "User added",
    details: "New tenant has been added",
  },
  {
    id: 2,
    date: "Sep, 12 2023",
    role: "Admin",
    activity: "Login",
    details: "New tenant has been added",
  },
  {
    id: 3,
    date: "Sep, 12 2023",
    role: "Admin",
    activity: "Feature enabled",
    details: "New tenant has been added",
  },
  {
    id: 4,
    date: "Sep, 12 2023",
    role: "Admin",
    activity: "Login",
    details: "New tenant has been added",
  },
  {
    id: 5,
    date: "Sep, 12 2023",
    role: "Admin 1",
    activity: "Jeeva S",
    details: "New tenant has been added",
  },
  {
    id: 6,
    date: "Sep, 12 2023",
    role: "Admin",
    activity: "Login",
    details: "New tenant has been added",
  },
  {
    id: 7,
    date: "Sep, 12 2023",
    role: "Admin",
    activity: "Feature disabled",
    details: "New tenant has been added",
  },
  {
    id: 8,
    date: "Sep, 12 2023",
    role: "Admin 2",
    activity: "Feature enabled",
    details: "New tenant has been added",
  },
];


export default function ActivityTable() {
     const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

const toggleDropdown = (id: number) => {
  setOpenDropdownId((prev) => (prev === id ? null : id));
};
  return (
    <div className=" ">

      <h2 className="text-[20px] font-semibold text-[#1E293B] mb-4">
        All Activity
      </h2>

      <div className="overflow-hidden rounded-xl border border-[#E8E8E8]">

        <table className="w-full">

          <thead className="bg-[#486A99]">

            <tr>

              {[
                "Date & Time",
                "ROLE",
                "Activity",
                "Details",
                "Action",
              ].map((item) => (
                <th
                  key={item}
                  className="px-5 py-3 text-left text-white text-[12px] font-semibold"
                >
                  {item}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {activities.map((row, index) => {
              const rowBgClass =
                index % 2 === 0
                  ? "bg-[#fff] dark:bg-[#2C2C2C]"
                  : "bg-[#F8F8F8] dark:bg-[#303030]";
              return (
                <tr className={`text-[10px] ${rowBgClass}`} key={row.id}>

                <td className="px-5 py-4 text-[12px] text-[#576CBC]">
                  {row.date}
                </td>

                <td className="px-5 py-4 text-[12px] text-[#1E293B]">
                  {row.role}
                </td>

                <td className="px-5 py-4 text-[12px] text-[#1E293B]">
                  {row.activity}
                </td>

                <td className="px-5 py-4 text-[12px] text-[#1E293B]">
                  {row.details}
                </td>

                <td className="px-5 py-4">
                  <button 
                                              onClick={() => toggleDropdown(row.id)}
className="text-[#6B7280] hover:text-[#576CBC]">
                    <BsThreeDotsVertical size={15} />
                  </button>
                  {openDropdownId === row.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#343434] border rounded-md shadow-lg z-50">
                              <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]">
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

    </div>
  );
}