"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { HiUserGroup } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { MdTune } from "react-icons/md";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import AddPortalForm, { PortalFormData } from "./AddPortalForm";

interface PortalItem {
  _id: string;
  portalId: string;
  portalCode: string;
  portalName: string;
  portalType: string;
  userLimit: number;
  status: string;
  isEnabled: boolean;
  createdAt: string;
}

const initialPortalForm: PortalFormData = {
  portalName: "",
  portalType: "CUSTOM",
  userLimit: "",
  status: "Active",
};

const Usercards = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [tableItems, setTableItems] = useState<PortalItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddPortal, setShowAddPortal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [portalForm, setPortalForm] =
    useState<PortalFormData>(initialPortalForm);
  const [createdPortalName, setCreatedPortalName] = useState("");
  const openMenuRef = useRef<HTMLTableCellElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId =
    searchParams.get("tenantId") ?? searchParams.get("tenantCode");

  const resetPortalForm = () => setPortalForm(initialPortalForm);

  const handlePortalInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setPortalForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddPortal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      tenantId: tenantId ?? "TEN000010",
      subscriptionId: "6a893c1994d5c944a8173cd6",
      supervisorId:
        searchParams.get("supervisorId") ??
        (typeof window !== "undefined"
          ? localStorage.getItem("SupervisorPortalId")
          : null),
      portalName: portalForm.portalName,
      portalType: portalForm.portalType,
      roleType: "ACADEMIC",
      userLimit: Number(portalForm.userLimit),
      isEnabled: portalForm.status === "Active",
      description: "Custom portal for student management",
      createdBy: "SUPER_ADMIN",
    };

    try {
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PORTAL.CREATE_BY_TENANT}`,
        payload,
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add portal");
      }

      setCreatedPortalName(portalForm.portalName);
      setShowAddPortal(false);
      setShowSuccess(true);
      resetPortalForm();
      setTableItems((previous) => {
        const createdItem = response.data.data?.item ?? response.data.data;
        return createdItem?._id ? [createdItem, ...previous] : previous;
      });
      setTotalRecords((previous) => previous + 1);
    } catch (error) {
      console.error("Error creating tenant portal:", error);
      setCreatedPortalName(portalForm.portalName);
      setShowAddPortal(false);
      setShowFailure(true);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchTenantPortals = async () => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      try {
        const portalEndpoint = AppApiEndpoints.PORTAL.GET_BY_TENANT.replace(
          "{tenantId}",
          encodeURIComponent(tenantId),
        );
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${portalEndpoint}`,
        );

        if (response.data.success) {
          const items = response.data.data.items ?? [];
          setTableItems(items);
          setTotalRecords(
            response.data.data.pagination?.totalRecords ?? items.length,
          );
        }
      } catch (error) {
        console.error("Error fetching tenant portal list:", error);
        setTableItems([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantPortals();
  }, [tenantId]);

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
    <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">
      <div className="flex items-center justify-between mt-2 px-4 py-2">
        <h2 className="text-[17px] font-medium text-[#24324B] dark:text-white">
          Institute Portal & Roles
        </h2>

        <button
          type="button"
          onClick={() => {
            resetPortalForm();
            setShowAddPortal(true);
          }}
          className="
            bg-[#5872C5]
            hover:bg-[#4D66B3]
            text-white
            text-[12px]
            font-medium
            px-4
            py-3
            rounded-lg
            transition
          "
        >
          Add Portal
        </button>
      </div>

      {showAddPortal && (
        <AddPortalForm
          formData={portalForm}
          isSaving={isSaving}
          onClose={() => setShowAddPortal(false)}
          onSubmit={handleAddPortal}
          onChange={handlePortalInputChange}
        />
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[312px] rounded-lg bg-white px-5 py-5 text-center shadow-2xl">
            <FaCheckCircle className="mx-auto mb-3 text-[34px] text-[#08A66A]" />
            <h2 className="text-[20px] font-bold text-[#101B3D]">
              Portal Added Successfully
            </h2>
            <p className="mt-1 text-[13px] text-gray-500">
              The {createdPortalName} portal has been added successfully.
            </p>
            <div className="mx-auto my-5 h-1 w-24 rounded-full bg-[#08A66A]" />
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="w-full rounded-md bg-[#5872C5] py-3 text-[13px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[312px] rounded-lg bg-white px-5 py-5 text-center shadow-2xl">
            <FaExclamationCircle className="mx-auto mb-3 text-[34px] text-[#F0444F]" />
            <h2 className="text-[20px] font-bold text-[#101B3D]">
              Failed to Add Portal
            </h2>
            <p className="mt-1 text-[13px] text-gray-500">
              We couldn&apos;t add the {createdPortalName} portal. Please try
              again.
            </p>
            <div className="mx-auto my-5 h-1 w-24 rounded-full bg-[#F0444F]" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFailure(false)}
                className="flex-1 rounded-md border border-[#F0444F] py-3 text-[13px] font-semibold text-[#F0444F]"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFailure(false);
                  setShowAddPortal(true);
                }}
                className="flex-1 rounded-md bg-[#F0444F] py-3 text-[13px] font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 px-4 gap-3">
        <div
          className="
            lg:col-span-2
            bg-white
            dark:bg-[#343434]
            rounded-xl
            shadow-[0_3px_12px_rgba(0,0,0,0.05)]
            border border-[#F0F1F5]
            px-5
            py-3
            h-[96px]
          "
        >
          <div className="flex items-center justify-between h-full">
            {/* LEFT CONTENT */}
            <div className="flex items-center gap-4">
              {/* Tenant Logo */}
              <div
                className="
                  w-[60px]
                  h-[60px]
                  rounded-full
                  bg-[#EEEEEE]
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                  shrink-0
                "
              >
                <img
                  src="/assets/images/bsicon.png"
                  alt="Tenant Logo"
                  className="w-[55px] h-[55px] object-contain"
                />
              </div>

              {/* Tenant Details */}
              <div>
                {/* Name + Status */}
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-[#1B1B1B] dark:text-white">
                    Blackstone Academy
                  </h2>

                  <span className="text-[11px] font-medium text-[#2FB344]">
                    Active
                  </span>
                </div>

                {/* Domain */}
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-[3px]">
                  blackstoneacademy.com
                </p>

                {/* Created + ID */}
                <div className="flex items-center gap-1 mt-[3px] text-[10px]">
                  <span className="text-gray-400 text-[11px]">
                    Created on : 02,July,2000 |
                  </span>

                  <span className="font-medium text-[10px] text-[#576CBC]">
                    ID: TEN 22001
                  </span>
                </div>
              </div>
            </div>

            {/* PLAN BADGE */}
            <div className="self-start mt-2">
              <span
                className="
                  inline-flex
                  items-center
                  px-2
                  py-[4px]
                  rounded-[4px]
                  bg-[#E9F1FF]
                  text-[#4F7DF3]
                  text-[10px]
                  font-medium
                "
              >
                Standard
              </span>
            </div>
          </div>
        </div>

        <div
          className="
            bg-white
            dark:bg-[#343434]
            rounded-xl
            shadow-[0_3px_12px_rgba(0,0,0,0.05)]
            border border-[#F0F1F5]
            px-4
            py-3
            h-[96px]
          "
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="
                w-[45px]
                h-[45px]
                rounded-full
                bg-[#E8F1FF]
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <HiUserGroup className="text-[#3B82F6] text-[22px]" />
            </div>

            {/* Usage Details */}
            <div>
              <p className="text-[12px] font-medium text-[#3B82F6]">
                Portal Usage
              </p>

              <div className="flex items-center gap-1 mt-[2px]">
                <span className="text-[16px] font-semibold text-[#222222] dark:text-white">
                  8
                </span>

                <span className="text-[14px] font-medium text-[#222222] dark:text-gray-300">
                  / 10
                </span>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-[5px] ml-[57px]">
            2 user slots available
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div
        className="
          bg-white
          dark:bg-[#343434]
          rounded-xl
          shadow-[0_4px_15px_rgba(0,0,0,0.05)]
          mt-3
          overflow-hidden
          mx-4
        "
      >
        {/* Section Title */}
        <div className="px-3 pt-3 pb-2">
          <h2 className="text-[16px] font-semibold text-[#24324B] dark:text-white">
            All Tenants
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            border-y
            border-[#E7EAF3]
            bg-[#FAFAFB]
            dark:bg-[#2E2E2E]
          "
        >
          {/* Search */}
          <div className="flex items-center px-3 h-10 border-r border-[#E7EAF3]">
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

              <span className="text-[11px] text-gray-400">Filter</span>
            </div>

            <FiChevronDown className="text-gray-400 text-[14px]" />
          </div>

          {/* Count */}
          <div className="flex items-center px-4 h-10">
            <span className="text-[11px] text-gray-400">
              Showing {tableItems.length} Of {totalRecords}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-[#4C6993] text-white text-[13px] dark:bg-[#44699D]">
              <tr>
                <th className="w-[13%] py-3 px-4 text-left font-medium text-[13px] whitespace-nowrap">
                  Portal Name
                </th>
                <th className="w-[20%] py-3 px-4 text-left font-medium text-[13px] whitespace-nowrap">
                  Portal Type
                </th>
                <th className="w-[30%] py-3 px-4 text-left font-medium text-[13px] whitespace-nowrap">
                  User Limit
                </th>
                <th className="w-[10%] py-3 px-4 text-left font-medium text-[13px] whitespace-nowrap">
                  Portal Status
                </th>
                <th className="w-[9%] py-3 px-4 text-left font-medium text-[13px] whitespace-nowrap">
                  Access
                </th>
                <th className="w-[13%] py-3 px-4 text-left font-medium text-[13px] whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-5 text-center text-gray-500">
                    Loading portals...
                  </td>
                </tr>
              ) : tableItems.length > 0 ? (
                tableItems.map((item, index) => (
                  <tr
                    key={index}
                    className="
                      text-[13px]
                      odd:bg-[#F8F8F8]
                      even:bg-white
                      dark:odd:bg-[#2C2C2C]
                      dark:even:bg-[#303030]
                    "
                  >
                    {/* Portal Name */}
                    <td className="py-4 px-4 font-medium text-[#1E293B] dark:text-white break-words">
                      {item.portalName}
                    </td>

                    {/* Portal Type */}
                    <td className="py-4 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                      {item.portalType === "DEFAULT" ? "Default" : "Custom"}
                    </td>

                    {/* User Limit */}
                    <td className="py-4 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                      {item.userLimit > 0 ? `${item.userLimit} Users` : "-"}
                    </td>

                    {/* Portal Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-[12px] font-medium bg-[#E8F5E9] text-[#2E7D32]">
                        {item.status === "ACTIVE" ? "Active" : item.status}
                      </span>
                    </td>

                    {/* Access */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-[12px] font-medium bg-[#E8F5E9] text-[#2E7D32]">
                        {item.isEnabled ? "Enable" : "Disable"}
                      </span>
                    </td>

                    {/* Action */}
                    <td
                      className="py-4 px-4 relative"
                      ref={openMenu === index ? openMenuRef : null}
                    >
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === index ? null : index)
                        }
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <BsThreeDotsVertical className="text-[16px] text-gray-700 dark:text-gray-300" />
                      </button>

                      {openMenu === index && (
                        <div
                          className="
                            absolute
                            right-4
                            top-12
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
                            className="w-full text-center px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                              setOpenMenu(null);
                              router.push(
                                `/super-admin/ui/users&roles/portal_details?portalName=${encodeURIComponent(
                                  item.portalName,
                                )}`,
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
                  <td colSpan={6} className="p-5 text-center text-gray-500">
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
  );
};

export default Usercards;
