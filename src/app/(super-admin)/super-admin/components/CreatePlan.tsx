"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { PiInfoFill } from "react-icons/pi";
import {
  AppFailureToastMessages,
  AppSuccessToastMessages,
} from "@/app/_components/contents/toast_message";
import axios from "axios";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Props = {
  readonly onClose: () => void;
};

interface PlanPayload {
  totalPrice: number;
  planName: string;
  studentLimit: number;
  billingCycle: string;
  planDescription: string;
  planStatus: string;

  monthlyPrice: number;
  yearlyPrice: number;
  setupFee: number;
  trialDays: number;
  gstAndTax: number;

  allowedRoles: string[];

  features: Record<string, string[]>;

  canCreateCustomRole: boolean;
  status: string;
  createdBy: string;
  lastUpdatedBy: string;
}

const steps = [1, 2, 3, 4];

// const features = [
//   "Student Management",
//   "Attendance",
//   "Dashboard",
//   "Reports",
//   "Fees",
//   "Exams",
//   "Library",
//   "Transport",
//   "Staff",
//   "Parent Portal",
//   "Notification",
//   "Inventory",
// ];

const roles = [
  "Admin",
  "Supervisor",
  "Academic Coach",
  "Teacher",
  "Student",
] as const;

type Role = (typeof roles)[number];

const roleMap: Record<Role, string> = {
  Admin: "ADMIN",
  Supervisor: "SUPERVISOR",
  "Academic Coach": "ACADEMIC_COACH",
  Teacher: "TEACHER",
  Student: "STUDENT",
};

const permissions = [
  "Attendance",
  "Dashboard",
  "Reports",
  "Fees",
  "Exams",
  "Library",
  "Transport",
  "Student Management",
  "Staff",
  "Parent Portal",
  "Notification",
  "Inventory",
];

const permissionsByRole: Record<Role, string[]> = {
  Admin: permissions,
  Supervisor: [
    "Attendance",
    "Dashboard",
    "Reports",
    "Fees",
    "Exams",
    "Student Management",
    "Staff",
    "Notification",
  ],
  "Academic Coach": [
    "Attendance",
    "Dashboard",
    "Reports",
    "Exams",
    "Student Management",
    "Notification",
  ],
  Teacher: [
    "Attendance",
    "Dashboard",
    "Exams",
    "Library",
    "Student Management",
    "Notification",
  ],
  Student: [
    "Dashboard",
    "Exams",
    "Library",
    "Transport",
    "Parent Portal",
    "Notification",
  ],
};

const variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // smooth ease
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
    },
  }),
};

const CreatePlan = ({ onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>("Admin");
  const [planData, setPlanData] = useState<PlanPayload>({
    planName: "",
    studentLimit: 0,
    billingCycle: "",
    planDescription: "",
    planStatus: "",

    monthlyPrice: 0,
    yearlyPrice: 0,
    setupFee: 0,
    trialDays: 0,
    gstAndTax: 0,

    allowedRoles: [],

    features: {},

    canCreateCustomRole: false,
    status: "Active",
    createdBy: "SUPER_ADMIN",
    lastUpdatedBy: "SUPER_ADMIN",
    totalPrice: 0,
  });

  const handleSubmit = async () => {
    try {
      const rolesFromPermissions = Object.keys(selectedPermissions)
        .filter((role) => selectedPermissions[role as Role].length > 0)
        .map((role) => roleMap[role as Role]);

      const allowedRoles =
        rolesFromPermissions.length > 0
          ? rolesFromPermissions
          : [roleMap[activeRole]];

      const features = Object.fromEntries(
        Object.entries(selectedPermissions)
          .filter(([, value]) => value.length > 0)
          .map(([key, value]) => [roleMap[key as Role], value]),
      );

      const payload: PlanPayload = {
        planName: planData.planName,
        studentLimit: Number(planData.studentLimit),
        billingCycle: planData.billingCycle,
        planDescription: planData.planDescription,
        planStatus: planData.planStatus,

        monthlyPrice: Number(planData.monthlyPrice),
        yearlyPrice: Number(planData.yearlyPrice),
        setupFee: Number(planData.setupFee),
        trialDays: Number(planData.trialDays),
        gstAndTax: Number(planData.gstAndTax),
        totalPrice: Number(planData.totalPrice),

        allowedRoles,
        features,

        canCreateCustomRole: allowedRoles.includes("ADMIN"),

        status: planData.status,
        createdBy: planData.createdBy,
        lastUpdatedBy: planData.lastUpdatedBy,
      };

      console.log(payload);

      const response = await axios.post(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.CREATE_PLAN}`, payload);

      console.log(response.data);

      setSuccessMessage(AppSuccessToastMessages.CREATE_PLAN_SUCCESS);
      setSuccess(true);
      toast.success("Plan Created Successfully");

      // close the modal after a short delay to allow toast/animation to show
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      console.error(err);

      const message =
        err.response?.data?.message || AppFailureToastMessages.CREATE_PLAN_FAILED;

      setFailedMessage(message);
      setFailed(true);
      toast.error(message);
    }
  };

  // Auto-calculate totalPrice based on monthlyPrice, billingCycle and setupFee
  useEffect(() => {
    const cycleDays: Record<string, number> = {
      MONTHLY: 30,
      QUARTERLY: 90,
      HALF_YEARLY: 180,
      YEARLY: 365,
    };

    const monthly = Number(planData.monthlyPrice) || 0;
    const setup = Number(planData.setupFee) || 0;
    const days =
      cycleDays[planData.billingCycle as keyof typeof cycleDays] ?? 30;

    const monthsEquivalent = days / 30; // convert days to month-equivalent
    const computedTotal = monthly * monthsEquivalent + setup;

    if (Number(planData.totalPrice) !== Number(computedTotal)) {
      setPlanData((prev) => ({
        ...prev,
        totalPrice: Number(computedTotal),
      }));
    }
    // only run when relevant fields change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planData.monthlyPrice, planData.billingCycle, planData.setupFee]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setPlanData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<Role, string[]>
  >({
    Admin: [],
    Supervisor: [],
    "Academic Coach": [],
    Teacher: [],
    Student: [],
  });

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) => {
      const current = prev[activeRole];

      return {
        ...prev,
        [activeRole]: current.includes(permission)
          ? current.filter((p) => p !== permission)
          : [...current, permission],
      };
    });
  };

  const toggleSelectAll = () => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [activeRole]:
        prev[activeRole].length === permissionsByRole[activeRole].length
          ? []
          : permissionsByRole[activeRole],
    }));
  };

  const activePermissions = permissionsByRole[activeRole];

  const allowedRoles = Object.keys(selectedPermissions)
    .filter((role) => selectedPermissions[role as Role].length > 0)
    .map((role) => roleMap[role as Role]);

  const featureAccessByRole: Record<string, string[]> = Object.fromEntries(
    Object.entries(selectedPermissions)
      .filter(([, perms]) => perms.length > 0)
      .map(([role, perms]) => [roleMap[role as Role], perms]),
  );

  const next = () => {
    setDirection(1);
    if (step < 4) setStep(step + 1);
  };

  const back = () => {
    setDirection(-1);
    if (step > 1) setStep(step - 1);
  };

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/70 flex items-center justify-center z-50 p-5">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        transition={{
          duration: 0.35,
        }}
        className="bg-white dark:bg-[#252525] rounded-xl w-full max-w-xl shadow-xl"
      >
        {" "}
        {/* Header */}
        <div className="relative p-2">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-gray-100 dark:hover:bg-[#343434] hover:text-black dark:hover:text-[#ccc] rounded-md"
          >
            <X size={15} />
          </button>
        </div>
        {/* Stepper */}
        <div className="px-5 pt-4 pb-6">
          {/* Circles */}
          <div className="grid grid-cols-4 place-items-center">
            {steps.map((item) => (
              <motion.div
                key={item}
                animate={{
                  backgroundColor:
                    step >= item ? "#576CBC" : isDark ? "#343434" : "#D9D9D9",
                  color: step >= item ? "#fff" : isDark ? "#a2a2a2" : "#555",
                }}
                transition={{ duration: 0.25 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-base font-semibold"
              >
                {item}
              </motion.div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {steps.map((item) => (
              <div
                key={item}
                className="h-[5px] rounded-full bg-[#D9D9D9] dark:bg-[#343434] overflow-hidden"
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: step >= item ? "100%" : "0%",
                  }}
                  transition={{
                    duration: 0.35,
                    ease: "easeInOut",
                  }}
                  className="h-full bg-[#576CBC] rounded-full"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="p-4 px-6 min-h-[430px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              layout
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {" "}
              {/* STEP 1 */}
              {step === 1 && (
                <div className="gap-5 w-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* Plan Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="col-span-2"
                    >
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                        Plan Name
                      </label>

                      <input
                        name="planName"
                        placeholder="Premium Plus"
                        value={planData.planName}
                        onChange={handleChange}
                        className="w-full h-8 text-xs dark:bg-[#343434] rounded-sm border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080]"
                      />
                    </motion.div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                        Role
                      </label>

                      <select className="w-full dark:bg-[#343434] h-8 text-xs rounded-sm border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 focus:border-[#576CBC] outline-none">
                        <option>Admin</option>
                        <option>Academic Coach</option>
                        <option>Supervisor</option>
                        <option>Teacher</option>
                        <option>Student</option>
                      </select>
                    </div>

                    {/* Student Limit */}
                    <div>
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                        Student Limit
                      </label>

                      <input
                        type="number"
                        name="studentLimit"
                        value={planData.studentLimit}
                        onChange={handleChange}
                        placeholder="Enter student limit"
                        className="w-full dark:bg-[#343434] h-8 text-xs rounded-lg border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 focus:border-[#576CBC] outline-none"
                      />
                    </div>

                    {/* Billing Cycle */}
                    <div className="col-span-2">
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-3">
                        Billing Cycle
                      </label>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "Monthly", value: "MONTHLY" },
                          { label: "3 Months", value: "QUARTERLY" },
                          { label: "6 Months", value: "HALF_YEARLY" },
                          { label: "Yearly", value: "YEARLY" },
                        ].map((item) => (
                          <label
                            key={item.value}
                            className="h-8 dark:text-[#ccc] border border-[#D4D4D4] dark:border-[#5c5c5c] rounded-sm text-[#343e59] flex items-center px-2 gap-2 cursor-pointer hover:border-[#576CBC] focus:border-[#576CBC] outline-none"
                          >
                            <input
                              type="radio"
                              checked={planData.billingCycle === item.value}
                              value={item.value}
                              onChange={handleChange}
                              name="billingCycle"
                              className="accent-[#576CBC] dark:accent-[#576CBC] focus:ring-0 focus:outline-none"
                            />
                            <span className="text-xs">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                        Plan Description
                      </label>

                      <textarea
                        name="planDescription"
                        value={planData.planDescription}
                        onChange={handleChange}
                        placeholder="Advanced plan for growing institutions with all essential features."
                        className="w-full dark:bg-[#343434] rounded-sm border border-[#D4D4D4] dark:border-[#5c5c5c] p-2 text-xs resize-none placeholder:text-[#343e59] dark:placeholder:text-[#808080] focus:border-[#576CBC] outline-none"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                        Status
                      </label>

                      <select
                        name="status"
                        value={planData.status}
                        onChange={handleChange}
                        className="w-full dark:bg-[#343434] h-8 rounded-lg border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 text-xs focus:border-[#576CBC] outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="In Active">In Active</option>
                      </select>
                    </div>

                    {/* Plan Status */}
                    <div>
                      <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                        Plan Status
                      </label>

                      <select
                        name="planStatus"
                        value={planData.planStatus}
                        onChange={handleChange}
                        className="w-full dark:bg-[#343434] h-8 rounded-lg border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 text-xs focus:border-[#576CBC] outline-none"
                      >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="In active">In active</option>
                        <option value="MOST_POPULAR">MOST POPULAR</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {/* STEP 2 */}
              {step === 2 && (
                <div className="gap-5 w-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Pricing Configuration
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-4">
                        Monthly Price
                      </label>
                      <input
                        type="number"
                        name="monthlyPrice"
                        value={
                          planData.monthlyPrice === 0
                            ? ""
                            : planData.monthlyPrice
                        }
                        onChange={handleChange}
                        className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080] dark:bg-[#343434] dark:border-[#5c5c5c]"
                        placeholder="$344"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-4">
                        Yearly Price
                      </label>
                      <input
                        type="number"
                        name="yearlyPrice"
                        value={
                          planData.yearlyPrice === 0 ? "" : planData.yearlyPrice
                        }
                        onChange={handleChange}
                        className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080] dark:bg-[#343434] dark:border-[#5c5c5c]"
                        placeholder="$2444"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-4">
                        Setup Fee
                      </label>
                      <input
                        type="number"
                        name="setupFee"
                        value={planData.setupFee === 0 ? "" : planData.setupFee}
                        onChange={handleChange}
                        className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080] dark:bg-[#343434] dark:border-[#5c5c5c]"
                        placeholder="$3"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-4">
                        Free Trial Days
                      </label>
                      <input
                        type="number"
                        name="trialDays"
                        value={
                          planData.trialDays === 0 ? "" : planData.trialDays
                        }
                        onChange={handleChange}
                        className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080] dark:bg-[#343434] dark:border-[#5c5c5c]"
                        placeholder="14"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-4">
                        GST / Tax
                      </label>
                      <input
                        type="number"
                        name="gstAndTax"
                        value={
                          planData.gstAndTax === 0 ? "" : planData.gstAndTax
                        }
                        onChange={handleChange}
                        className="w-full h-8 text-xs rounded-sm border border-[#D4D4D4] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080] dark:bg-[#343434] dark:border-[#5c5c5c]"
                        placeholder="18%"
                      />
                    </div>

<div>
  <label className="mb-1.5 block text-xs font-medium text-slate-600">
    Total Price
  </label>

  <input
    type="number"
    value={planData.totalPrice}
    readOnly
    className="w-full rounded-lg border border-slate-200 bg-gray-50 px-3 py-2 text-xs text-slate-700"
  />
</div>

                    {/* 
                    <div className="col-span-2 flex gap-2 bg-[#E5EBFF] border border-dashed rounded-lg p-6 mt-6 text-center text-[#010E30]">
                      <MdError size={23} color="#576CBC" />
                      Accepted formats: PDF, JPG, PNG (Max size: 5MB each)
                    </div> */}
                  </div>
                </div>
              )}
              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-semibold mb-5">Feature Access</h2>

                  {/* Tabs */}
                  <div className="flex gap-3 mb-5 overflow-x-auto scrollbar-none">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-5 h-11 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                          activeRole === role
                            ? "bg-[#E9EDFF] dark:bg-[#343434] text-[#576CBC]"
                            : "text-[#010E30] dark:text-[#ccc]"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  {/* Permission Box */}
                  <div className="border border-[#D4D4D4] rounded-xl p-5">
                    {/* Select All */}
                    <label className="flex items-center gap-2 mb-7 cursor-pointer">
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedPermissions[activeRole].length ===
                            activePermissions.length
                          }
                          onChange={toggleSelectAll}
                          className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
                        />

                        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#576CBC] bg-white dark:bg-[#ccc] text-transparent peer-checked:bg-[#576CBC] peer-checked:text-white">
                          <svg
                            viewBox="0 0 16 16"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>

                      <span className="text-sm text-[#010E30] dark:text-[#ccc]">Select All</span>
                    </label>

                    {/* Permissions */}
                    <div className="grid grid-cols-3 gap-y-7">
                      {activePermissions.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span className="relative flex h-4 w-4 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedPermissions[activeRole].includes(
                                permission,
                              )}
                              onChange={() => togglePermission(permission)}
                              className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
                            />

                            <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#576CBC] bg-white dark:bg-[#ccc] text-transparent peer-checked:bg-[#576CBC] peer-checked:text-white">
                              <svg
                                viewBox="0 0 16 16"
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </span>

                          <span className="text-sm text-[#010E30] dark:text-[#ccc]">
                            {permission}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* STEP 4 */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#010E30] dark:text-[#ccc]">
                      Plan Preview
                    </h2>

                    <span className="bg-[#E9F9EE] text-[#3D9A57] text-sm font-medium px-4 py-2 rounded-lg">
                      Live Preview
                    </span>
                  </div>

                  {/* Plan Card */}
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#7352F6] to-[#5D44F0] text-white p-3">
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-[#EDE9FE] rounded-sm px-2 py-1 flex items-center gap-2">
                      <div className="w-[15px] h-[15px] rounded-[2px] p-0.5 bg-[#DDD6FD] flex items-center justify-center">
                        <svg
                          width="100"
                          height="90"
                          viewBox="0 0 120 140"
                          fill="none"
                        >
                          {/* Shield */}
                          <path
                            d="M60 0
         C70 12 92 20 108 24
         V72
         C108 102 84 122 60 140
         C36 122 12 102 12 72
         V24
         C28 20 50 12 60 0Z"
                            fill="#5A6FCB"
                          />

                          {/* Star */}
                          <path
                            d="M60 38
         L68 58
         L90 60
         L74 74
         L79 96
         L60 84
         L41 96
         L46 74
         L30 60
         L52 58
         Z"
                            fill="#EAE7F7"
                          />
                        </svg>
                      </div>
                      <span className="text-[#576CBC] text-[12px] font-medium">
                        {planData.planStatus || "Plan Status"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold">
                      {planData.planName || "Plan Name"}
                    </h2>

                    <p className="text-sm text-white/90">
                      {planData.planDescription || "No description"}
                    </p>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-3xl font-medium">
                        ₹{planData.monthlyPrice || 0}
                      </span>

                      <span className="text-xl">
                        /{planData.billingCycle.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-3 text-sm">{planData.billingCycle}</p>
                  </div>

                  {/* Features */}
                  <div className="max-h-64 overflow-y-scroll scrollbar-none pr-2">
                    <div className="space-y-5">
                      {allowedRoles.map((role) => (
                        <div key={role}>
                          <h4 className="text-sm font-semibold text-[#576CBC] mb-3">
                            {role.replaceAll("_", " ")}
                          </h4>

                          <div className="grid grid-cols-3 gap-y-3">
                            {(featureAccessByRole[role] || []).map(
                              (permission) => (
                                <div
                                  key={permission}
                                  className="flex items-center gap-2"
                                >
                                  <Check size={16} className="text-[#1DBA41]" />
                                  <span className="text-[12px] text-[#010E30]">
                                    {permission}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-8 bg-[#E5EBFF] rounded-xl px-5 py-4 flex items-center gap-3">
                    <PiInfoFill size={22} className="text-[#576CBC]" />

                    <p className="text-[#010E30]">
                      This plan will be available for tenants to subscribe.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Footer */}
        <div className="border-t p-3 flex justify-end gap-3">
          {step > 1 && (
            <button
              onClick={back}
              className="border border-gray-300 dark:border-[#5c5c5c] hover:bg-gray-50 dark:hover:bg-[#343434] px-4 text-xs py-2 rounded-md"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <motion.button
              onClick={next}
              whileHover={{
                scale: 1.05,
                y: -2,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="bg-[#576CBC] text-white px-4 text-xs py-2 rounded-md"
            >
              Next
            </motion.button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-[#576CBC] text-xs text-white px-6 py-2 rounded-md hover:bg-[#4338CA]"
            >
              Create Plan
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePlan;
