"use client";

import React, { useState, useRef } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Table from "./components/roles/table";
import TenantTable from "./user_tenants/page";
import { BsX } from "react-icons/bs";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

interface FormData {
  portalRoles: string;
  description: string;
  roleType: string;
  status: string;
}

// Props for Table component to refresh data
interface TableProps {
  refreshData?: () => void;
}

const Page = () => {
  const [activeTab, setActiveTab] = useState<"portal" | "tenants">("portal");
  const [showAddPortalModal, setShowAddPortalModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    portalRoles: "",
    description: "",
    roleType: "Academic",
    status: "Active",
  });
  const [createdPortalName, setCreatedPortalName] = useState<string>("");

  // Ref to trigger table refresh
  const tableRef = React.useRef<{ refreshData: () => void }>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare payload for API
      const payload = {
        portalName: formData.portalRoles,
        description: formData.description,
        roleType: formData.roleType.toUpperCase(),
        status: formData.status.toUpperCase(),
        portalType: "DEFAULT",
      };

      console.log("Sending payload:", payload);

      // Make API call to create portal
      const response = await axios.post("http://localhost:5001/portal", payload);

      console.log("API Response:", response.data);

      if (response.data.success) {
        // Store the created portal name for display in success modal
        setCreatedPortalName(formData.portalRoles);
        setShowSuccess(true);
        setShowAddPortalModal(false);
        toast.success(response.data.message || "Portal created successfully!");

        // Reset form
        setFormData({
          portalRoles: "",
          description: "",
          roleType: "Academic",
          status: "Active",
        });

        // Refresh table data
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
      } else {
        // Store the portal name for failure modal
        setCreatedPortalName(formData.portalRoles);
        setShowFailure(true);
        setShowAddPortalModal(false);
        toast.error(response.data.message || "Failed to create portal");
      }
    } catch (error: any) {
      console.error("Error creating portal:", error);

      // Store the portal name for failure modal
      setCreatedPortalName(formData.portalRoles);

      // Handle different error scenarios
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create portal. Please try again.";

      setShowFailure(true);
      setShowAddPortalModal(false);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModals = () => {
    setShowSuccess(false);
    setShowFailure(false);
    setIsLoading(false);
    setCreatedPortalName("");
  };

  const closeAddPortalModal = () => {
    setShowAddPortalModal(false);
    setFormData({
      portalRoles: "",
      description: "",
      roleType: "Academic",
      status: "Active",
    });
  };

  // Function to refresh portal list from parent
  const refreshPortalList = () => {
    // This will be called from Table component via ref
  };

  return (
    <BaseSuperLayout>
      <div className="flex flex-col gap-4">
        <SuperAdminHeader currentSection="Users & Roles" />

        <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">

          <div className="flex items-center justify-between mt-2 px-3 py-2">
            <h2 className="text-[17px] font-medium text-[#24324B] dark:text-white">
              Institute Portal & Roles
            </h2>

            {activeTab === "portal" && (
              <button
                onClick={() => setShowAddPortalModal(true)}
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
            )}
          </div>

          <div className="flex items-center gap-6 px-5 mt-1">
            <button
              onClick={() => setActiveTab("portal")}
              className={`relative text-[13px] font-medium pb-2 transition-colors ${activeTab === "portal"
                ? "text-[#5872C5]"
                : "text-[#24324B] dark:text-gray-300"
                }`}
            >
              Portal
              {activeTab === "portal" && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("tenants")}
              className={`relative text-[13px] font-medium pb-2 transition-colors ${activeTab === "tenants"
                ? "text-[#5872C5]"
                : "text-[#24324B] dark:text-gray-300"
                }`}
            >
              Tenants
              {activeTab === "tenants" && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "portal" && (
            <Table
              ref={tableRef}
              onPortalCreated={refreshPortalList}
            />
          )}
          {activeTab === "tenants" && <TenantTable />}

        </div>
      </div>

      {/* ADD PORTAL MODAL */}
      {showAddPortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-[#24324B] dark:text-white">
                Add Portal
              </h2>
              <button
                onClick={closeAddPortalModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <BsX className="text-2xl text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Portal Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Portal Roles
                </label>
                <input
                  type="text"
                  name="portalRoles"
                  value={formData.portalRoles}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter module name"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5872C5] focus:border-transparent dark:bg-[#1F1F1F] dark:text-white text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Senior Teacher"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5872C5] focus:border-transparent dark:bg-[#1F1F1F] dark:text-white text-sm"
                />
              </div>

              {/* Role Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role Type
                </label>
                <select
                  name="roleType"
                  value={formData.roleType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5872C5] focus:border-transparent dark:bg-[#1F1F1F] dark:text-white text-sm"
                >
                  <option value="Academic">Academic</option>
                  <option value="Finance">Supervisor</option>
                  <option value="Admin">Admin</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5872C5] focus:border-transparent dark:bg-[#1F1F1F] dark:text-white text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeAddPortalModal}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#5872C5] hover:bg-[#4D66B3] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Adding..." : "Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-5xl text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#24324B] dark:text-white mb-2">
              Portal Added Successfully
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-5">
              The Portal has Added Successfully
            </p>
            <div className="bg-gray-50 dark:bg-[#1F1F1F] rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Portal Name :</span> {createdPortalName || formData.portalRoles || ""}
              </p>
            </div>
            <button
              onClick={closeModals}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#5872C5] hover:bg-[#4D66B3] rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FAILURE MODAL */}
      {showFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <FaExclamationCircle className="text-5xl text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#24324B] dark:text-white mb-2">
              Failed to Add Portal
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-5">
              We couldn't add the new Portal to the system. Please try again.
            </p>
            <div className="bg-gray-50 dark:bg-[#1F1F1F] rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Portal Name :</span> {createdPortalName || formData.portalRoles || ""}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowFailure(false);
                  setShowAddPortalModal(true);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5872C5] hover:bg-[#4D66B3] rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseSuperLayout>
  );
};

export default Page;