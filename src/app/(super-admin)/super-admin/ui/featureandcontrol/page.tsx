"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Table from "./component/featureTable/page";
import TenantTable from "./component/tenantTable/page";
import AddFeatureForm, {
  FeatureFormData,
} from "./featureandtenant/AddFeatureForm";
import { BsX } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

/* ================= TYPES ================= */
interface FormData {
  portal: string;
  category: string;
  navigationType: "parent" | "child";
  parentNavigation: string;
  parentNavigationName: string;
  childNavigationName: string;
  childNavigations: string[];
  featureName: string;
  moduleType: "parent" | "child";
  parentModule: string;
  childModuleName: string;
  description: string;
  status: string;
}

const Page = () => {
  const [activeTab, setActiveTab] = useState<"feature" | "tenants">("feature");

  /* ====== MODAL STATES ====== */
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdFeatureName, setCreatedFeatureName] = useState<string>("");

  /* ====== FORM STATE ====== */
  const [formData, setFormData] = useState<FormData>({
    portal: "Student",
    category: "Normal Feature",
    navigationType: "child",
    parentNavigation: "Chat & Support",
    parentNavigationName: "",
    childNavigationName: "",
    childNavigations: ["Ticket"],
    featureName: "",
    moduleType: "child",
    parentModule: "Chat & Support",
    childModuleName: "",
    description: "",
    status: "Active",
  });

  /* ====== HANDLE INPUT CHANGE ====== */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ====== HANDLE RADIO CHANGE ====== */
  const handleModuleTypeChange = (type: "parent" | "child") => {
    setFormData((prev) => ({ ...prev, moduleType: type }));
  };

  const toggleChildNavigation = (navigation: string) => {
    setFormData((previous) => ({
      ...previous,
      childNavigations: previous.childNavigations.includes(navigation)
        ? previous.childNavigations.filter((item) => item !== navigation)
        : [...previous.childNavigations, navigation],
    }));
  };

  /* ====== RESET FORM ====== */
  const resetForm = () => {
    setFormData({
      portal: "Student",
      category: "Normal Feature",
      navigationType: "child",
      parentNavigation: "Chat & Support",
      parentNavigationName: "",
      childNavigationName: "",
      childNavigations: ["Ticket"],
      featureName: "",
      moduleType: "child",
      parentModule: "Chat & Support",
      childModuleName: "",
      description: "",
      status: "Active",
    });
  };

  /* ====== CLOSE ADD MODAL ====== */
  const closeAddFeatureModal = () => {
    setShowAddFeatureModal(false);
    resetForm();
  };

  /* ====== CLOSE ALL MODALS ====== */
  const closeModals = () => {
    setShowSuccess(false);
    setShowFailure(false);
    setIsLoading(false);
    setCreatedFeatureName("");
  };

  /* ====== HANDLE SUBMIT ====== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ================= API PAYLOAD =================
      const payload = {
        portal: formData.portal,
        category: formData.category,
        navigationType: formData.navigationType,
        parentNavigation: formData.parentNavigation,
        parentNavigationName: formData.parentNavigationName,
        childNavigationName: formData.childNavigationName,
        childNavigations: formData.childNavigations,
        featureName: formData.featureName,
        moduleType: formData.moduleType,
        parentModule: formData.parentModule,
        childModuleName: formData.childModuleName,
        description: formData.description,
        status: formData.status.toUpperCase(),
      };

      console.log("Sending payload:", payload);

      // Replace with actual API endpoint
      // const response = await axios.post("http://localhost:5001/feature", payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // For demo: 90% success rate
      if (Math.random() > 0.1) {
        setCreatedFeatureName(
          formData.childModuleName || formData.parentModule || "Feature",
        );
        setShowSuccess(true);
        setShowAddFeatureModal(false);
        toast.success("Feature added successfully!");
        resetForm();
      } else {
        setCreatedFeatureName(
          formData.childModuleName || formData.parentModule || "Feature",
        );
        setShowFailure(true);
        setShowAddFeatureModal(false);
        toast.error("Failed to add feature");
      }
    } catch (error: any) {
      console.error("Error creating feature:", error);
      setCreatedFeatureName(
        formData.childModuleName || formData.parentModule || "Feature",
      );
      setShowFailure(true);
      setShowAddFeatureModal(false);
      toast.error(
        error.response?.data?.message ||
          "Failed to add feature. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseSuperLayout>
      <div className="flex flex-col gap-4">
        <SuperAdminHeader currentSection="Feature & Control" />

        <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">
          <div className="flex items-center justify-between mt-2 px-3 py-2">
            <h2 className="text-[17px] font-medium text-[#24324B] dark:text-white">
              Institute Feature Control
            </h2>

            {activeTab === "feature" && (
              <button
                onClick={() => setShowAddFeatureModal(true)}
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
                Add Feature
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 px-5 mt-1">
            <button
              onClick={() => setActiveTab("feature")}
              className={`relative text-[13px] font-medium pb-2 transition-colors ${
                activeTab === "feature"
                  ? "text-[#5872C5]"
                  : "text-[#24324B] dark:text-gray-300"
              }`}
            >
              Feature
              {activeTab === "feature" && (
                <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("tenants")}
              className={`relative text-[13px] font-medium pb-2 transition-colors ${
                activeTab === "tenants"
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
          {activeTab === "feature" && <Table />}
          {activeTab === "tenants" && <TenantTable />}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ==================== ADD FEATURE MODAL ===================== */}
      {/* ============================================================ */}
      {showAddFeatureModal && (
        <AddFeatureForm
          formData={formData as FeatureFormData}
          isLoading={isLoading}
          onClose={closeAddFeatureModal}
          onReset={resetForm}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onNavigationTypeChange={(navigationType) =>
            setFormData((previous) => ({ ...previous, navigationType }))
          }
          onChildNavigationToggle={toggleChildNavigation}
        />
      )}

      {false && showAddFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[700px] mx-6 max-h-[92vh] overflow-y-auto scrollbar-none">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-[18px] font-semibold text-[#1E293B] dark:text-white">
                Add Feature
              </h2>
              <button
                onClick={closeAddFeatureModal}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <BsX className="text-[22px] text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4">
              {/* ================= BASIC INFORMATION ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] dark:text-white mb-3">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Select Portal */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Select Portal
                    </label>
                    <div className="relative">
                      <select
                        name="portal"
                        value={formData.portal}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Academy">Academy</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                    </div>
                  </div>

                  {/* Select Category */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Select category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                      >
                        <option value="Module">Module</option>
                        <option value="Feature">Feature</option>
                        <option value="Navigation">Navigation</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= MODULE INFORMATION ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] dark:text-white mb-3">
                  Module Information
                </h3>

                {/* Radio Buttons */}
                <div className="flex items-center gap-8 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition ${
                        formData.moduleType === "parent"
                          ? "border-[#4F5BD5]"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {formData.moduleType === "parent" && (
                        <span className="w-[9px] h-[9px] rounded-full bg-[#4F5BD5]" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name="moduleType"
                      value="parent"
                      checked={formData.moduleType === "parent"}
                      onChange={() => handleModuleTypeChange("parent")}
                      className="hidden"
                    />
                    <span className="text-[12px] text-[#1E293B] dark:text-gray-200">
                      Parent Module
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition ${
                        formData.moduleType === "child"
                          ? "border-[#4F5BD5]"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {formData.moduleType === "child" && (
                        <span className="w-[9px] h-[9px] rounded-full bg-[#4F5BD5]" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name="moduleType"
                      value="child"
                      checked={formData.moduleType === "child"}
                      onChange={() => handleModuleTypeChange("child")}
                      className="hidden"
                    />
                    <span className="text-[12px] text-[#1E293B] dark:text-gray-200">
                      Child Module
                    </span>
                  </label>
                </div>

                {/* Parent Module Dropdown */}
                <div className="mb-3">
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                    Parent Module
                  </label>
                  <div className="relative">
                    <select
                      name="parentModule"
                      value={formData.parentModule}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                    >
                      <option value="Chat & Support">Chat & Support</option>
                      <option value="Dashboard">Dashboard</option>
                      <option value="Subscriptions">Subscriptions</option>
                      <option value="Finance">Finance</option>
                      <option value="Users & Roles">Users & Roles</option>
                      <option value="Feature Control">Feature Control</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Settings">Settings</option>
                      <option value="Backup & Restore">Backup & Restore</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                  </div>
                </div>

                {/* Child Module Name */}
                <div className="mb-3">
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                    Child Module Name
                  </label>
                  <input
                    type="text"
                    name="childModuleName"
                    value={formData.childModuleName}
                    onChange={handleInputChange}
                    placeholder="Tickets"
                    className="w-full px-3 py-2 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white placeholder:text-gray-400 bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white placeholder:text-gray-400 bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5] resize-none"
                  />
                </div>
              </div>

              {/* ================= STATUS ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <label className="block text-[14px] font-semibold text-[#1E293B] dark:text-white mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3 py-2 pr-9 border border-[#E4E8EF] dark:border-gray-600 rounded-md text-[12px] text-[#1E293B] dark:text-white bg-white dark:bg-[#1F1F1F] focus:outline-none focus:border-[#5872C5]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                </div>
              </div>

              {/* ================= BUTTONS ================= */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-[12px] font-semibold text-[#5872C5] bg-white dark:bg-transparent border border-[#5872C5] hover:bg-[#5872C5]/5 rounded-md transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 text-[12px] font-semibold text-white bg-[#4F5BD5] hover:bg-[#4350C0] rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ==================== SUCCESS MODAL ========================= */}
      {/* ============================================================ */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[420px] mx-4 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-[#1E293B] dark:text-white mb-2">
              Navigation Added Successfully!
            </h2>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              The Student Management Navigation has been added successfully.
            </p>

            <div className="flex justify-center mb-6">
              <div className="w-[100px] h-[3px] bg-green-500 rounded-full" />
            </div>

            <button
              onClick={closeModals}
              className="w-full py-3 text-[13px] font-semibold text-white bg-[#4F5BD5] hover:bg-[#4350C0] rounded-md transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ==================== FAILURE MODAL ========================= */}
      {/* ============================================================ */}
      {showFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[440px] mx-4 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-[#1E293B] dark:text-white mb-2">
              Navigation Added Failed
            </h2>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              The Student Management navigation could not be added. Please check
              the details and try again.
            </p>

            <div className="flex justify-center mb-6">
              <div className="w-[100px] h-[3px] bg-[#EF4444] rounded-full" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-3 text-[13px] font-semibold text-[#EF4444] bg-white dark:bg-transparent border border-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowFailure(false);
                  setShowAddFeatureModal(true);
                }}
                className="flex-1 py-3 text-[13px] font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-md transition"
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
