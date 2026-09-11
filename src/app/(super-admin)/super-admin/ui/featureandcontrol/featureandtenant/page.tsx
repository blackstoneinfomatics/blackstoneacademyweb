"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical, BsX } from "react-icons/bs";
import { FiSearch, FiChevronDown, FiInfo } from "react-icons/fi";
import { MdTune } from "react-icons/md";
import { HiOutlineArrowLeft } from "react-icons/hi";
import BaseSuperLayout from "../../../components/BaseSuperLayout";
import SuperAdminHeader from "../../../components/SuperAdminHeader";
import axios from "axios";
import { toast } from "react-toastify";

/* ================= TYPES ================= */
interface ModuleItem {
  _id: string;
  moduleName: string;
  order: number | string;
  description: string;
  addOn: string;
  status: "Enable" | "Disable";
}

interface FeatureItem {
  _id: string;
  featureName: string;
  parentModule: string;
  childModule: string;
  description: string;
  addOn: string;
  status: "Enable" | "Disable";
}

interface FormData {
  portal: string;
  category: string;
  parentNavigation: string;
  childNavigations: string[];
  featureName: string;
  description: string;
  status: string;
}

/* ================= MODULE DATA ================= */
const moduleItems: ModuleItem[] = [
  {
    _id: "m1",
    moduleName: "Dashboard",
    order: 1,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m2",
    moduleName: "Subscriptions",
    order: 2,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m3",
    moduleName: "Finance",
    order: 3,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m4",
    moduleName: "Users & Roles",
    order: 4,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m5",
    moduleName: "Feature Control",
    order: 5,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m6",
    moduleName: "Analytics",
    order: 6,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m7",
    moduleName: "Chat & Support",
    order: 7,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m8",
    moduleName: "Settings",
    order: 8,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "m9",
    moduleName: "Backup & Restore",
    order: 9,
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
];

/* ================= FEATURE DATA ================= */
const featureItems: FeatureItem[] = [
  {
    _id: "1",
    featureName: "Billing",
    parentModule: "Finance",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "2",
    featureName: "group chat",
    parentModule: "Chat & Support",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "3",
    featureName: "class",
    parentModule: "Subscriptions",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "4",
    featureName: "Finance",
    parentModule: "Finance",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "5",
    featureName: "Users & Roles",
    parentModule: "Users & Roles",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "6",
    featureName: "Feature Control",
    parentModule: "Feature Control",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "7",
    featureName: "Analytics",
    parentModule: "Analytics",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "8",
    featureName: "Chat & Support",
    parentModule: "Chat & Support",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "9",
    featureName: "Chat & Support",
    parentModule: "Chat & Support",
    childModule: "Tickets",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "10",
    featureName: "Settings",
    parentModule: "Settings",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
  {
    _id: "11",
    featureName: "Backup & Restore",
    parentModule: "Backup & Restore",
    childModule: "-",
    description: "Access designed for students.",
    addOn: "Sep, 12 2023",
    status: "Enable",
  },
];

const portalSidebarItems = [
  "Student",
  "Teacher",
  "Academy",
  "Supervisor",
  "Admin",
];

/* ================= CHILD NAVIGATION OPTIONS ================= */
const childNavigationOptions = ["Ticket", "Message"];

const Usercards = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [activePortal, setActivePortal] = useState<string>("Student");
  const [activeTab, setActiveTab] = useState<"module" | "feature">("module");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const openMenuRef = useRef<HTMLTableCellElement | null>(null);
  const router = useRouter();

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
    parentNavigation: "Chat & Support",
    childNavigations: ["Ticket"],
    featureName: "",
    description: "",
    status: "Active",
  });

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

  useEffect(() => {
    setSearchTerm("");
    setOpenMenu(null);
  }, [activeTab]);

  /* ====== FORM HANDLERS ====== */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ====== TOGGLE CHILD NAVIGATION ====== */
  const toggleChildNavigation = (nav: string) => {
    setFormData((prev) => {
      const exists = prev.childNavigations.includes(nav);
      return {
        ...prev,
        childNavigations: exists
          ? prev.childNavigations.filter((n) => n !== nav)
          : [...prev.childNavigations, nav],
      };
    });
  };

  const resetForm = () => {
    setFormData({
      portal: "Student",
      category: "Normal Feature",
      parentNavigation: "Chat & Support",
      childNavigations: ["Ticket"],
      featureName: "",
      description: "",
      status: "Active",
    });
  };

  const closeAddFeatureModal = () => {
    setShowAddFeatureModal(false);
    resetForm();
  };

  const closeModals = () => {
    setShowSuccess(false);
    setShowFailure(false);
    setIsLoading(false);
    setCreatedFeatureName("");
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        portal: formData.portal,
        category: formData.category,
        parentNavigation: formData.parentNavigation,
        childNavigations: formData.childNavigations,
        featureName: formData.featureName,
        description: formData.description,
        status: formData.status.toUpperCase(),
      };

      console.log("Sending payload:", payload);

    
      // const response = await axios.post("http://localhost:5001/feature", payload);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (Math.random() > 0.1) {
        setCreatedFeatureName(formData.featureName || "Feature");
        setShowSuccess(true);
        setShowAddFeatureModal(false);
        toast.success("Feature added successfully!");
        resetForm();
      } else {
        setCreatedFeatureName(formData.featureName || "Feature");
        setShowFailure(true);
        setShowAddFeatureModal(false);
        toast.error("Failed to add feature");
      }
    } catch (error: any) {
      console.error("Error creating feature:", error);
      setCreatedFeatureName(formData.featureName || "Feature");
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

  /* ================= FILTERS ================= */
  const filteredModules = moduleItems.filter(
    (item) =>
      item.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredFeatures = featureItems.filter(
    (item) =>
      item.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parentModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.childModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  /* ================= HELPERS ================= */
  const getStatusBadge = (status: string) => (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-medium ${status === "Enable"
        ? "bg-[#E8F5E9] text-[#2E7D32] dark:bg-green-900/30 dark:text-green-400"
        : "bg-[#FDECEC] text-[#D34645] dark:bg-red-900/30 dark:text-red-400"
        }`}
    >
      {status}
    </span>
  );

  const getOrderBox = (order: number | string) => (
    <span className="inline-flex items-center justify-center w-[44px] h-[32px] rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-[#2C2C2C] text-[12px] font-medium text-[#1E293B] dark:text-gray-200">
      {order || "-"}
    </span>
  );

  const getParentModuleCell = (value: string) => {
    if (!value || value === "-") {
      return <span className="text-[#94A3B8]">-</span>;
    }

    if (value.toLowerCase() === "finance") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[12px] font-medium bg-[#E5E7EB] text-[#374151] dark:bg-gray-700 dark:text-gray-200">
          {value}
        </span>
      );
    }

    if (value.toLowerCase() === "chat & support") {
      return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-[12px] font-medium bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-900/40 dark:text-blue-200">
          {value}
        </span>
      );
    }

    return <span className="text-[#1E293B] dark:text-gray-200">{value}</span>;
  };

  const getChildModuleCell = (value: string) => {
    if (!value || value === "-") {
      return <span className="text-[#94A3B8]">-</span>;
    }
    return <span className="text-[#1E293B] dark:text-gray-200">{value}</span>;
  };

  const renderActionCell = (id: string, index: number, routeBase: string) => (
    <td
      className="py-3.5 px-4 relative"
      ref={openMenu === index ? openMenuRef : null}
    >
      <button
        onClick={() => setOpenMenu(openMenu === index ? null : index)}
        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <BsThreeDotsVertical className="text-[16px] text-gray-700 dark:text-gray-300" />
      </button>

      {openMenu === index && (
        <div className="absolute right-4 top-12 w-28 bg-white dark:bg-[#2C2C2C] rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50">
          <button
            className="w-full text-center px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            onClick={() => {
              setOpenMenu(null);
              router.push(`${routeBase}?id=${id}`);
            }}
          >
            View Details
          </button>
          <button className="w-full text-center px-3 py-2 text-[11px] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">
            Edit
          </button>
        </div>
      )}
    </td>
  );

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Feature Control" />

      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F] p-2">

        <div className="px-2 pt-2">
          <div className="w-full bg-white dark:bg-[#343434] rounded-xl shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-[#F0F1F5] dark:border-gray-700 px-5 py-3">
            {/* Top Row: Back Button + Title + Add Feature Button */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F1F5] dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <HiOutlineArrowLeft className="text-[20px] text-[#1E293B] dark:text-white" />
                </button>
                <h1 className="text-[18px] font-semibold text-[#1E293B] dark:text-white">
                  Institute Feature Control
                </h1>
              </div>

              <button
                onClick={() => setShowAddFeatureModal(true)}
                className="bg-[#576CBC] hover:bg-[#4350C0] text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition"
              >
                Add Feature
              </button>


            </div>

            {/* Bottom Row: Tenant Info + Stats */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-full bg-[#EEEEEE] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/assets/images/bsicon.png"
                    alt="Tenant Logo"
                    className="w-[48px] h-[48px] object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                      Blackstone Academy
                    </h2>
                    <span className="inline-flex items-center px-2 py-[3px] rounded-[4px] bg-[#E9F1FF] text-[#4F7DF3] text-[10px] font-medium">
                      Standard
                    </span>
                  </div>

                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-[2px]">
                    blackstoneacademy.com
                  </p>

                  <div className="flex items-center gap-1 mt-[2px] text-[10px]">
                    <span className="text-gray-400 text-[11px]">
                      Created on : 02,July,2000 |
                    </span>
                    <span className="font-medium text-[10px] text-[#576CBC]">
                      ID: TEN 22001
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 mr-10">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[#E9ECFB] flex items-center justify-center shrink-0">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#7C8DD4]"
                    >
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Users
                    </p>
                    <p className="text-[15px] font-semibold text-[#1E293B] dark:text-white mt-[1px]">
                      3
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[#E9ECFB] flex items-center justify-center shrink-0">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#7C8DD4]"
                    >
                      <path
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M23 21v-2a4 4 0 0 0-3-3.87"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Features
                    </p>
                    <p className="text-[15px] font-semibold text-[#22A34A] dark:text-green-400 mt-[1px]">
                      500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TITLE ================= */}
        <div className="px-3 pt-5 pb-3">
          <h2 className="text-[18px] font-semibold text-[#1E293B] dark:text-white">
            Blackstone Academy Feature
          </h2>
        </div>

        {/* ================= SIDEBAR + TABLE LAYOUT ================= */}
        <div className="flex gap-4 px-2">
          <div className="w-[200px] shrink-0 bg-white dark:bg-[#343434] rounded-xl border border-[#E4E8EF] dark:border-gray-700 px-3 py-4">
            <h3 className="text-[16px] font-semibold text-[#1E293B] dark:text-white px-2 pb-3">
              Portal
            </h3>

            <div className="flex flex-col gap-1">
              {portalSidebarItems.map((portal) => (
                <button
                  key={portal}
                  onClick={() => setActivePortal(portal)}
                  className={`
                    text-left px-3 py-2.5 rounded-lg text-[13px]  font-medium transition
                    ${activePortal === portal
                      ? "bg-gradient-to-b border border-blue-300 from-[#fcfdff] to-[#dbe2fd] text-black"
                      : "text-[#1E293B] dark:text-gray-300 hover:bg-[#F5F6FA] dark:hover:bg-[#3A3A3A]"
                    }
                  `}
                >
                  {portal}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-[#343434] rounded-xl border border-[#E4E8EF] dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-6 px-5 pt-4 pb-2">
              <button
                onClick={() => setActiveTab("module")}
                className={`relative text-[14px] font-medium pb-2 transition-colors ${activeTab === "module"
                  ? "text-[#5872C5] dark:text-[#8296E6]"
                  : "text-[#1E293B] dark:text-gray-300"
                  }`}
              >
                Module List
                {activeTab === "module" && (
                  <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] dark:bg-[#8296E6] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("feature")}
                className={`relative text-[14px] font-medium pb-2 transition-colors ${activeTab === "feature"
                  ? "text-[#5872C5] dark:text-[#8296E6]"
                  : "text-[#1E293B] dark:text-gray-300"
                  }`}
              >
                Feature List
                {activeTab === "feature" && (
                  <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] dark:bg-[#8296E6] rounded-full" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[#E7EAF3] dark:border-gray-700 bg-[#FAFAFB] dark:bg-[#2E2E2E]">
              <div className="flex items-center px-3 h-10 border-r border-[#E7EAF3] dark:border-gray-700">
                <FiSearch className="text-gray-400 mr-2 text-[15px]" />
                <input
                  placeholder="Search by keyword"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full outline-none bg-transparent text-[12px] text-gray-600 dark:text-gray-200 placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between px-3 h-10 border-r border-[#E7EAF3] dark:border-gray-700 cursor-pointer">
                <div className="flex items-center">
                  <MdTune className="text-gray-400 mr-2 text-[16px]" />
                  <span className="text-[12px] text-gray-500">Filter</span>
                </div>
                <FiChevronDown className="text-gray-400 text-[14px]" />
              </div>

              <div className="flex items-center px-4 h-10">
                <span className="text-[12px] text-gray-500">
                  Showing 10 Of 50
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "module" ? (
                <table className="w-full table-fixed text-xs border-collapse">
                  <thead className="bg-[#4C6993] text-white dark:bg-[#44699D]">
                    <tr>
                      <th className="w-[16%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Parent Module
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Child Module
                      </th>
                      <th className="w-[8%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Order
                      </th>
                      <th className="w-[26%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Description
                      </th>
                      <th className="w-[14%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Add on
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Status
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredModules.length > 0 ? (
                      filteredModules.map((item, index) => (
                        <tr
                          key={item._id}
                          className="text-[12px] odd:bg-white even:bg-[#F8F8F8] dark:odd:bg-[#303030] dark:even:bg-[#2C2C2C]"
                        >
                          <td className="py-3.5 px-4 font-medium text-[#1E293B] dark:text-white break-words">
                            {item.moduleName}
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                            -
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200">
                            {getOrderBox(item.order)}
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                            {item.description}
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 whitespace-nowrap">
                            {item.addOn}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(item.status)}
                          </td>
                          {renderActionCell(
                            item._id,
                            index,
                            "/super-admin/ui/feature-control/module_details",
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-5 text-center text-gray-500">
                          No modules available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full table-fixed text-xs border-collapse">
                  <thead className="bg-[#4C6993] text-white dark:bg-[#44699D]">
                    <tr>
                      <th className="w-[14%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Feature Name
                      </th>
                      <th className="w-[16%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Parent Module
                      </th>
                      <th className="w-[14%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Child Module
                      </th>
                      <th className="w-[24%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Description
                      </th>
                      <th className="w-[12%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Add on
                      </th>
                      <th className="w-[10%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Status
                      </th>
                      <th className="w-[10%] py-3 px-4 text-left font-medium text-[12px] whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFeatures.length > 0 ? (
                      filteredFeatures.map((item, index) => (
                        <tr
                          key={item._id}
                          className="text-[12px] odd:bg-white even:bg-[#F8F8F8] dark:odd:bg-[#303030] dark:even:bg-[#2C2C2C]"
                        >
                          <td className="py-3.5 px-4 font-medium text-[#1E293B] dark:text-white break-words">
                            {item.featureName}
                          </td>
                          <td className="py-3.5 px-4">
                            {getParentModuleCell(item.parentModule)}
                          </td>
                          <td className="py-3.5 px-4">
                            {getChildModuleCell(item.childModule)}
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 break-words">
                            {item.description}
                          </td>
                          <td className="py-3.5 px-4 text-[#1E293B] dark:text-gray-200 whitespace-nowrap">
                            {item.addOn}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(item.status)}
                          </td>
                          {renderActionCell(
                            item._id,
                            index,
                            "/super-admin/ui/feature-control/feature_details",
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-5 text-center text-gray-500">
                          No features available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end items-center gap-1 px-4 py-4">
              <button className="w-7 h-7 rounded-md border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A]">
                <span className="text-[20px]">‹</span>
              </button>
              <button className="w-7 h-7 rounded-md border border-[#203F78] dark:border-[#8296E6] text-[#203F78] dark:text-[#8296E6] bg-[#FAFAFB] dark:bg-[#3A3A3A] text-[11px]">
                1
              </button>
              <button className="w-7 h-7 rounded-md border border-[#E6E7EA] dark:border-gray-600 text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A] text-[11px]">
                2
              </button>
              <button className="w-7 h-7 rounded-md border border-[#E6E7EA] dark:border-gray-600 text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A] text-[11px]">
                3
              </button>
              <button className="w-7 h-7 rounded-md border border-[#E6E7EA] dark:border-gray-600 text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A] text-[11px]">
                ...
              </button>
              <button className="w-7 h-7 rounded-md border border-[#E6E7EA] dark:border-gray-600 text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A] text-[11px]">
                10
              </button>
              <button className="w-7 h-7 rounded-md border border-[#E5E7EB] dark:border-gray-600 flex items-center justify-center text-gray-400 bg-[#F5F5F2] dark:bg-[#3A3A3A]">
                <span className="text-[20px]">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>


      {showAddFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-2xl w-full max-w-[750px] mx-6 max-h-[92vh] overflow-y-auto scrollbar-none">
            {/* ================= CLOSE BUTTON (TOP RIGHT) ================= */}
            <button
              onClick={closeAddFeatureModal}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition z-10"
            >
              <BsX className="text-[22px] text-gray-500 dark:text-gray-400" />
            </button>

            {/* Header */}
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-[17px] font-semibold text-[#1E293B] dark:text-white">
                Add Feature
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4">
              {/* ================= BASIC INFORMATION ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] dark:text-white mb-3">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                      Select Module
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
                        <option value="Normal Feature">Normal Feature</option>
                        <option value="Premium Feature">Premium Feature</option>
                        <option value="Module">Module</option>
                        <option value="Navigation">Navigation</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= NAVIGATION MENU INFORMATION ================= */}
              <div className="border border-[#E4E8EF] dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-[14px] font-semibold text-[#1E293B] dark:text-white mb-3">
                  Navigation Menu Information
                </h3>

                {/* Parent Navigation */}
                <div className="mb-3">
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                    Parent Navigation
                  </label>
                  <div className="relative">
                    <select
                      name="parentNavigation"
                      value={formData.parentNavigation}
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

                {/* Info Banner */}
                <div className="flex items-center gap-3 bg-[#EEF1FB] dark:bg-[#4F5BD5]/20 rounded-md px-4 py-3 mb-3">
                  <div className="w-[16px] h-[16px] rounded-full bg-[#4F5BD5] flex items-center justify-center shrink-0">
                    <span
                      className="text-white text-[11px] leading-none italic"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      i
                    </span>
                  </div>
                  <p className="text-[12px] text-[#1E293B] dark:text-gray-200 leading-relaxed">
                    To Add this feature under a child navigation, select a child
                    navigation from the list below.
                  </p>
                </div>

                {/* Child Navigation — Multi-select chips */}
                <div className="mb-3">
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-2">
                    Child Navigation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {childNavigationOptions.map((nav) => {
                      const isSelected = formData.childNavigations.includes(nav);
                      return (
                        <button
                          key={nav}
                          type="button"
                          onClick={() => toggleChildNavigation(nav)}
                          className={`
                      px-4 py-2 rounded-md text-[12px] font-medium border transition
                      ${isSelected
                              ? "bg-[#EEF0FB] border-[#4F5BD5] text-[#4F5BD5] dark:bg-[#4F5BD5]/20 dark:text-[#8296E6]"
                              : "bg-white dark:bg-transparent border-[#E4E8EF] dark:border-gray-600 text-[#1E293B] dark:text-gray-300 hover:border-gray-300"
                            }
                    `}
                        >
                          {nav}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Name */}
                <div className="mb-3">
                  <label className="block text-[12px] font-medium text-[#1E293B] dark:text-gray-200 mb-1.5">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    name="featureName"
                    value={formData.featureName}
                    onChange={handleInputChange}
                    placeholder="Video"
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
                  className="px-6 py-2 text-[12px] font-semibold text-[#5872C5] bg-white dark:bg-transparent border border-[#5872C5] hover:bg-[#5872C5]/5 rounded-md transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 text-[12px] font-semibold text-white bg-[#4F5BD5] hover:bg-[#4350C0] rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SUCCESS MODAL ==================== */}
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
              Feature Added Successfully!
            </h2>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              The {createdFeatureName} feature has been added successfully.
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

      {/* ==================== FAILURE MODAL ==================== */}
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
              Failed to Add Feature
            </h2>

            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              The {createdFeatureName} feature could not be added. Please check
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

export default Usercards;