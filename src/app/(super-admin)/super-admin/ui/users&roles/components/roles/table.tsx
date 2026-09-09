"use client";

import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch, FiChevronDown, FiLayers } from "react-icons/fi";
import { MdTune, MdCheckCircle, MdCancel } from "react-icons/md";
import axios from "axios";

interface PortalItem {
  _id: string;
  portalId: string;
  portalName: string;
  portalType: string;
  roleType: string;
  description: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
}

interface PaginationData {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface TableHandle {
  refreshData: () => void;
}

interface TableProps {
  onPortalCreated?: () => void;
}

const Table = forwardRef<TableHandle, TableProps>(({ onPortalCreated }, ref) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [portalItems, setPortalItems] = useState<PortalItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const openMenuRef = useRef<HTMLTableCellElement | null>(null);
  const router = useRouter();

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/portal/dashboard/count"
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };


  const fetchPortalList = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      let url = `http://localhost:5001/portal?page=${page}&limit=10`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setPortalItems(response.data.data.items);
        setPagination(response.data.data.pagination);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalRecords(response.data.data.pagination.totalRecords);
        setCurrentPage(response.data.data.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching portal list:", error);
      setPortalItems([]);
    } finally {
      setLoading(false);
    }
  };


  useImperativeHandle(ref, () => ({
    refreshData: () => {
      fetchDashboardStats();
      fetchPortalList(1, searchTerm);
    },
  }));


  useEffect(() => {
    fetchDashboardStats();
    fetchPortalList(1);
  }, []);


  const handleSearch = () => {
    fetchPortalList(1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPortalList(page, searchTerm);
    }
  };

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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper function to get status badge styles
  const getStatusBadgeStyles = (status: string) => {
    if (status === "ACTIVE" || status === "Active") {
      return "bg-[#E7F8ED] text-[#2E9D4D]";
    } else {
      return "bg-[#FDECEC] text-[#E53935]";
    }
  };

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
                  Total Portal
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span className="text-[12px] text-gray-500">
                All Portal in the system
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
                  Active Portal
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {stats.active}
                </p>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-1">
              <span className="text-[12px] text-gray-500">
                Currently Active
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
                  Inactive Portal
                </p>

                <p className="text-[18px] font-semibold text-[#303030] dark:text-white mt-1">
                  {stats.inactive}
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
              All Portal
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
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
                Showing {portalItems.length} Of {totalRecords}
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
                    "Portal Name",
                    "Portal Type",
                    "Description",
                    "Tenant Status",
                    "Created Date",
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

                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-5 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : portalItems.length > 0 ? (
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
                        {item.portalName}
                      </td>

                      {/* Portal Type */}
                      <td className="py-3 px-3 text-[#24324B] dark:text-gray-200 whitespace-nowrap">
                        {item.portalType.charAt(0).toUpperCase() + item.portalType.slice(1).toLowerCase()}
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
                            ${getStatusBadgeStyles(item.status)}
                          `}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-[#24324B] dark:text-gray-200">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Action - Dropdown appears BELOW the button */}
                      <td
                        className="py-3 px-3 relative"
                        ref={
                          openMenu === index
                            ? openMenuRef
                            : null
                        }
                      >
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === index
                                ? null
                                : index
                            )
                          }
                          className="
      p-1
      rounded-md
      hover:bg-gray-100
      dark:hover:bg-gray-700
    "
                        >
                          <BsThreeDotsVertical className="text-[14px]" />
                        </button>

                        {openMenu === index && (
                          <div
                            className="
        absolute
        right-3
        top-full
        mt-1
        w-28
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
          rounded-t-lg
        "
                              onClick={() => {
                                setOpenMenu(null);
                                router.push(
                                  `/super-admin/ui/users&roles/portal_details?portalName=${encodeURIComponent(
                                    item.portalName
                                  )}`
                                );
                              }}
                            >
                              View Details
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
          rounded-b-lg
        "
                            >
                              Edit
                            </button>
                          </div>
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

          {/* Pagination */}
          <div className="flex justify-end items-center gap-1 px-3 py-4">

            {/* Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination?.hasPrevious}
              className={`
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
                ${!pagination?.hasPrevious ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span className="text-[23px] color-[#999FAC]">‹</span>
            </button>

            {/* Page 1 */}
            <button
              onClick={() => handlePageChange(1)}
              className={`
                w-7
                h-7
                rounded-md
                border
                ${currentPage === 1 ? "border-[#203F78] text-[#203F78] bg-[#FAFAFB]" : "border-[#E6E7EA] text-gray-400 bg-[#F5F5F2]"}
                text-[11px]
              `}
            >
              1
            </button>

            {/* Page 2 */}
            {totalPages >= 2 && (
              <button
                onClick={() => handlePageChange(2)}
                className={`
                  w-7
                  h-7
                  rounded-md
                  border
                  ${currentPage === 2 ? "border-[#203F78] text-[#203F78] bg-[#FAFAFB]" : "border-[#E6E7EA] text-gray-400 bg-[#F5F5F2]"}
                  text-[11px]
                `}
              >
                2
              </button>
            )}

            {/* Page 3 */}
            {totalPages >= 3 && (
              <button
                onClick={() => handlePageChange(3)}
                className={`
                  w-7
                  h-7
                  rounded-md
                  border
                  ${currentPage === 3 ? "border-[#203F78] text-[#203F78] bg-[#FAFAFB]" : "border-[#E6E7EA] text-gray-400 bg-[#F5F5F2]"}
                  text-[11px]
                `}
              >
                3
              </button>
            )}

            {/* Dots */}
            {totalPages > 3 && currentPage < totalPages - 1 && (
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
                disabled
              >
                ...
              </button>
            )}

            {/* Last Page */}
            {totalPages > 3 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`
                  w-7
                  h-7
                  rounded-md
                  border
                  ${currentPage === totalPages ? "border-[#203F78] text-[#203F78] bg-[#FAFAFB]" : "border-[#E6E7EA] text-gray-400 bg-[#F5F5F2]"}
                  text-[11px]
                `}
              >
                {totalPages}
              </button>
            )}

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination?.hasNext}
              className={`
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
                ${!pagination?.hasNext ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <span className="text-[23px] color-[#999FAC]">›</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
});

Table.displayName = "Table";

export default Table;