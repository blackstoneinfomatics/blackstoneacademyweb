"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch, FiChevronDown, FiLayers } from "react-icons/fi";
import { MdTune, MdCheckCircle, MdCancel } from "react-icons/md";

const portalItems = [
  {
    featureName: "Admin",
    portal: "Academic",
    category: "Module",
    parentModule :"Chat&Support",
    childModule:"Tickets",
    description: "Manage student information and activities",
    status: "Active",
    addOnDate: "02 Sep 2026",
  }
];

const MENU_WIDTH = 112; // w-28

const Table = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const openMenuRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const router = useRouter();

  const toggleMenu = (index: number) => {
    if (openMenu === index) {
      setOpenMenu(null);
      setMenuPosition(null);
      return;
    }

    const button = buttonRefs.current[index];

    if (button) {
      const rect = button.getBoundingClientRect();
      const left = Math.min(
        rect.right - MENU_WIDTH,
        window.innerWidth - MENU_WIDTH - 8
      );

      setMenuPosition({
        top: rect.bottom + 4,
        left: Math.max(left, 8),
      });
    }

    setOpenMenu(index);
  };

  const closeMenu = () => {
    setOpenMenu(null);
    setMenuPosition(null);
  };

  useEffect(() => {
    if (openMenu === null) return;

    const handleClickOutside = (event: MouseEvent) => {
      const button = buttonRefs.current[openMenu];

      if (
        openMenuRef.current &&
        !openMenuRef.current.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleReposition = () => closeMenu();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [openMenu]);

  return (
    <div className="min-h-screen bg-[#F4F6FC] dark:bg-[#1F1F1F] p-2">
      {/* Main Container */}
      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 mt-3">

          {/* Total Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[112px]
            "
          >
            <div className="flex items-start gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#EEE8FF]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <FiLayers className="text-[#7047FF] text-[21px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#7047FF] font-medium">
                  Total Feature
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  28
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span className="text-[12px] text-gray-500">
                 All Features in the system
              </span>
            </div>
          </div>

          {/* Active Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#E4F7EA]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCheckCircle className="text-[#45BD67] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#45BD67] font-medium">
                  Added This Month
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  28
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span className="text-[12px] text-gray-500">
                New Features added
              </span>
            </div>
          </div>

          {/* Inactive Portal */}
          <div
            className="
              bg-white
              dark:bg-[#343434]
              rounded-xl
              shadow-[0_4px_15px_rgba(0,0,0,0.06)]
              px-4
              py-4
              min-h-[102px]
            "
          >
            <div className="flex items-start gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#FCE6E6]
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <MdCancel className="text-[#E53935] text-[23px]" />
              </div>

              <div>
                <p className="text-[14px] text-[#E53935] font-medium">
                  Inactive Feature
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  10
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span className="text-[12px] text-gray-500">
                Currently Inactive
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            bg-white
            dark:bg-[#343434]
            rounded-xl
            shadow-[0_4px_15px_rgba(0,0,0,0.05)]
            mt-3
            overflow-hidden
            mx-2
          "
        >

          {/* Section Title */}
          <div className="px-3 pt-3 pb-2">
            <h2 className="text-[16px] font-semibold text-[#24324B] dark:text-white">
              All Feature
            </h2>
          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              border-y
              border-[#E7EAF3]
              bg-[#FAFAFB]
              dark:bg-[#2E2E2E]
            "
          >

            {/* Search */}
            <div
              className="
                flex
                items-center
                px-3
                h-10
                border-r
                border-[#E7EAF3]
              "
            >
              <FiSearch className="text-gray-400 mr-2 text-[15px]" />

              <input
                placeholder="Search by keyword"
                className="
                  w-full
                  outline-none
                  bg-transparent
                  text-[11px]
                  text-gray-600
                  dark:text-gray-200
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Filter */}
            <div
              className="
                flex
                items-center
                justify-between
                px-3
                h-10
                border-r
                border-[#E7EAF3]
                cursor-pointer
              "
            >
              <div className="flex items-center">
                <MdTune className="text-gray-400 mr-2 text-[16px]" />

                <span className="text-[11px] text-gray-400">
                  Filter
                </span>
              </div>

              <FiChevronDown className="text-gray-400 text-[14px]" />
            </div>

            {/* Count */}
            <div className="flex items-center px-4 h-10">
              <span className="text-[11px] text-gray-400">
                Showing 10 Of 50
              </span>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[750px] text-xs border-collapse">

              {/* Table Header */}
              <thead
                className="
                  bg-[#4C6993]
                  text-white
                  text-[13px]
                  dark:bg-[#44699D]
                "
              >
                <tr>
                  {[
                    "Feature Name",
                    "Portal",
                    "Category",
                    "Parent Module",
                    "Child Module",
                    "Description",
                    "Status",
                    "Add On Date",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="
                        py-3
                        px-3
                        whitespace-nowrap
                        font-medium
                        text-left
                        text-[11px]
                        border-r
                        border-[#466993]
                      "
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>

                {portalItems.length > 0 ? (
                  portalItems.map((item, index) => (
                    <tr
                      key={index}
                      className="
                        text-[11px]
                        odd:bg-[#F8F8F8]
                        even:bg-white
                        dark:odd:bg-[#2C2C2C]
                        dark:even:bg-[#303030]
                      "
                    >

                      {/* Portal Name */}
                      <td className="py-3 px-3 font-medium text-[#24324B] dark:text-white whitespace-nowrap">
                        {item.featureName}
                      </td>

                      {/* Portal Type */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.portal}
                      </td>
 <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.category}
                      </td> <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.parentModule}
                      </td> <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.childModule}
                      </td>
                      {/* Description */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.description}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-md
                            text-[9px]
                            font-medium
                            ${
                              item.status === "Active"
                                ? "bg-[#E7F8ED] text-[#2E9D4D]"
                                : "bg-[#FDECEC] text-[#E53935]"
                            }
                          `}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {item.addOnDate}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 relative">
                        <button
                          ref={(el) => {
                            buttonRefs.current[index] = el;
                          }}
                          onClick={() => toggleMenu(index)}
                          className="
                            p-1
                            rounded-md
                            hover:bg-gray-100
                            dark:hover:bg-gray-700
                          "
                        >
                          <BsThreeDotsVertical className="text-[14px]" />
                        </button>

                        {openMenu === index &&
                          menuPosition &&
                          createPortal(
                            <div
                              ref={openMenuRef}
                              style={{
                                position: "fixed",
                                top: menuPosition.top,
                                left: menuPosition.left,
                                width: MENU_WIDTH,
                              }}
                              className="
                                bg-white
                                dark:bg-[#2C2C2C]
                                rounded-lg
                                shadow-lg
                                border
                                border-gray-100
                                dark:border-gray-700
                                z-50
                              "
                            >
                              <button
                                className="
                                  w-full
                                  text-center
                                  px-3
                                  py-2
                                  text-[10px]
                                  hover:bg-gray-100
                                  dark:hover:bg-gray-700
                                "
                                onClick={closeMenu}
                              >
                                Enable
                              </button>

                              <button
                                className="
                                  w-full
                                  text-center
                                  px-3
                                  py-2
                                  text-[10px]
                                  hover:bg-gray-100
                                  dark:hover:bg-gray-700
                                "
                                onClick={closeMenu}
                              >
                                Disable
                              </button>

                              <button
                                className="
                                  w-full
                                  text-center
                                  px-3
                                  py-2
                                  text-[10px]
                                  hover:bg-gray-100
                                  dark:hover:bg-gray-700
                                "
                                onClick={closeMenu}
                              >
                                Cancel
                              </button>
                            </div>,
                            document.body
                          )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-5 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center gap-1 px-3 py-4">

            {/* Previous */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
              "
            >
              <span className="text-[23px] color-[#999FAC]">‹</span>
            </button>

            {/* Page 1 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#203F78]
                text-[#203F78]
                bg-[#FAFAFB]
                text-[11px]
              "
            >
              1
            </button>

            {/* Page 2 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              2
            </button>

            {/* Page 3 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              3
            </button>

            {/* Dots */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              ...
            </button>

            {/* Page 10 */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E6E7EA]
                text-gray-400
                bg-[#F5F5F2]
                text-[11px]
              "
            >
              10
            </button>

            {/* Next */}
            <button
              className="
                w-7
                h-7
                rounded-md
                border
                border-[#E5E7EB]
                flex
                items-center
                justify-center
                text-gray-400
                bg-[#F5F5F2]
              "
            >
              <span className="text-[23px] color-[#999FAC]">›</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;