"use client";

import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
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
  userLimit: number;
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

interface BillingPeriod {
  billingPeriodId: string;
  billingPeriod: string;
  duration: number;
  price?: number;
  discount?: number;
  gstRate?: number;
  taxAmount?: number;
  totalAmount?: number;
}

// Single source of truth for GST + Total calculation across the billing-period table.
const calculateBillingAmounts = (
  price: number,
  discount: number,
  gstRate: number,
) => {
  const safePrice = Number.isFinite(price) ? price : 0;
  const safeDiscount = Number.isFinite(discount) ? discount : 0;
  const safeGstRate = Number.isFinite(gstRate) ? gstRate : 0;

  const discountedPrice = safePrice - (safePrice * safeDiscount) / 100;
  const taxAmount = (discountedPrice * safeGstRate) / 100;
  const totalAmount = discountedPrice + taxAmount;

  return {
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};


const persistBillingPeriodPricing = (planId: string, row: BillingPeriod) =>
  axios.put(
    `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.UPDATE_BILLING_PERIOD}`
      .replace("${planId}", planId)
      .replace("${billingPeriodId}", row.billingPeriodId),
    {
      price: row.price ?? 0,
      discount: row.discount ?? 0,
      gstRate: row.gstRate ?? 0,
      taxAmount: row.taxAmount ?? 0,
      totalAmount: row.totalAmount ?? 0,
    },
  );

const steps = [1, 2, 3, 4];

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
  const [, setSuccessMessage] = useState("");
  const [, setFailedMessage] = useState("");
  const [, setSuccess] = useState(false);
  const [, setFailed] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>("Admin");
  const [planData, setPlanData] = useState<PlanPayload>({
    planName: "",
    studentLimit: 0,
    userLimit: 0,
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

  // Draft Plan id retained across Steps 2-4 so we never recreate the plan on navigation.
  const [planId, setPlanId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [showBillingPeriodModal, setShowBillingPeriodModal] = useState(false);
  const [isSavingBillingPeriod, setIsSavingBillingPeriod] = useState(false);
  const [billingPeriodForm, setBillingPeriodForm] = useState({
    billingPeriod: "",
    duration: 0,
  });
  const [billingPeriodFormErrors, setBillingPeriodFormErrors] = useState<{
    billingPeriod?: string;
    duration?: string;
  }>({});

  const buildDraftPlanPayload = () => {
    const rolesFromPermissions = Object.keys(selectedPermissions)
      .filter((role) => selectedPermissions[role as Role].length > 0)
      .map((role) => roleMap[role as Role]);

    const allowedRolesForPayload =
      rolesFromPermissions.length > 0
        ? rolesFromPermissions
        : [roleMap[activeRole]];

    const featuresForPayload = Object.fromEntries(
      Object.entries(selectedPermissions)
        .filter(([, value]) => value.length > 0)
        .map(([key, value]) => [roleMap[key as Role], value]),
    );

    return {
      planName: planData.planName,
      studentLimit: Number(planData.studentLimit),
      userLimit: Number(planData.userLimit),
      billingCycle: planData.billingCycle,
      planDescription: planData.planDescription,
      planStatus: planData.planStatus,

      monthlyPrice: Number(planData.monthlyPrice),
      yearlyPrice: Number(planData.yearlyPrice),
      setupFee: Number(planData.setupFee),
      trialDays: Number(planData.trialDays),
      gstAndTax: Number(planData.gstAndTax),
      totalPrice: Number(planData.totalPrice),

      allowedRoles: allowedRolesForPayload,
      features: featuresForPayload,

      canCreateCustomRole: allowedRolesForPayload.includes("ADMIN"),

      status: "Draft",
      createdBy: planData.createdBy,
      lastUpdatedBy: planData.lastUpdatedBy,
    };
  };

  const handleCreateDraftPlan = async () => {
    try {
      setIsCreatingDraft(true);

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.CREATE_PLAN}`,
        buildDraftPlanPayload(),
      );

      const data = response.data?.data ?? response.data;
      const newPlanId = data?.planId;

      if (!newPlanId) {
        throw new Error("Draft plan id missing in response");
      }

      setPlanId(newPlanId);
      setDirection(1);
      setStep(2);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        AppFailureToastMessages.CREATE_DRAFT_PLAN_FAILED;

      toast.error(message);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // The GST/Tax field only lives in local state until this runs — the backend
  // rejects billing-period pricing whose gstRate doesn't match the plan's stored
  // gstAndTax, so push it as soon as the user leaves the field.
  const syncPlanGstAndTax = async () => {
    if (!planId) return;

    const gstRate = Number(planData.gstAndTax) || 0;

    const recalculatedBillingPeriods = billingPeriods.map((row) => {
      const { taxAmount, totalAmount } = calculateBillingAmounts(
        row.price ?? 0,
        row.discount ?? 0,
        gstRate,
      );

      return { ...row, gstRate, taxAmount, totalAmount };
    });

    try {
      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.UPDATE_PLAN}`.replace(
          "${planId}",
          planId,
        ),
        { ...buildDraftPlanPayload(), billingPeriods: recalculatedBillingPeriods },
      );

      // Push every already-saved row's recalculated GST/tax/total too, so the
      // backend copy matches immediately instead of only on the next price edit.
      await Promise.all(
        recalculatedBillingPeriods.map((row) =>
          persistBillingPeriodPricing(planId, row),
        ),
      );

      setBillingPeriods(recalculatedBillingPeriods);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        AppFailureToastMessages.UPDATE_DRAFT_PLAN_FAILED;

      toast.error(message);
    }
  };

  const resetBillingPeriodForm = () => {
    setBillingPeriodForm({ billingPeriod: "", duration: 0 });
    setBillingPeriodFormErrors({});
  };

  const handleCancelBillingPeriodModal = () => {
    setShowBillingPeriodModal(false);
    resetBillingPeriodForm();
  };

  const normalizeBillingPeriod = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const normalized = trimmed
      .toLowerCase()
      .replace(/(^|\s)([a-z])/g, (_, prefix: string, char: string) =>
        prefix + char.toUpperCase(),
      );

    return normalized;
  };

  const normalizeDuration = (value: number) => {
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  const handleSaveBillingPeriod = async () => {
    const billingPeriod = normalizeBillingPeriod(billingPeriodForm.billingPeriod);
    const duration = normalizeDuration(billingPeriodForm.duration);
    const errors: { billingPeriod?: string; duration?: string } = {};

    if (!billingPeriod) {
      errors.billingPeriod = "Billing period is required";
    }

    if (duration <= 0) {
      errors.duration = "Duration is required";
    }

    if (Object.keys(errors).length > 0) {
      setBillingPeriodFormErrors(errors);
      return;
    }

    if (!planId) {
      toast.error(AppFailureToastMessages.CREATE_DRAFT_PLAN_FAILED);
      return;
    }

    try {
      setIsSavingBillingPeriod(true);

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.ADD_BILLING_PERIOD}`.replace(
          "${planId}",
          planId,
        ),
        {
          billingPeriod,
          duration,
        },
      );

      const saved = response.data?.data ?? response.data;

      // The API sometimes wraps the created record under a `billingPeriod` key
      // (data.billingPeriod = { billingPeriodId, billingPeriod, duration, ... })
      // instead of returning it flat — unwrap that case so id/price/etc are read
      // from the real record, not from an empty top-level object.
      const record =
        saved && typeof saved.billingPeriod === "object" && saved.billingPeriod !== null
          ? saved.billingPeriod
          : saved;

      const savedBillingPeriodId =
        record?.billingPeriodId ?? record?.id ?? record?._id;

      if (!savedBillingPeriodId) {
        toast.error(AppFailureToastMessages.ADD_BILLING_PERIOD_FAILED);
        return;
      }

      // Use the locally validated strings for display columns — the API may echo
      // billingPeriod/duration back as nested objects rather than plain strings.
      const newRow: BillingPeriod = {
        billingPeriodId: savedBillingPeriodId,
        billingPeriod,
        duration,
        price: record?.price,
        discount: record?.discount,
        gstRate: record?.gstRate ?? Number(planData.gstAndTax),
        taxAmount: record?.taxAmount,
        totalAmount: record?.totalAmount,
      };

      setBillingPeriods((prev) => [...prev, newRow]);
      setShowBillingPeriodModal(false);
      resetBillingPeriodForm();
      toast.success(AppSuccessToastMessages.BILLING_PERIOD_ADDED);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        AppFailureToastMessages.ADD_BILLING_PERIOD_FAILED;

      toast.error(message);
    } finally {
      setIsSavingBillingPeriod(false);
    }
  };

  const handleBillingPeriodValueChange = (
    billingPeriodId: string,
    field: "price" | "discount",
    rawValue: string,
  ) => {
    setBillingPeriods((prev) =>
      prev.map((row) => {
        if (row.billingPeriodId !== billingPeriodId) {
          return row;
        }

        const numericValue = rawValue === "" ? 0 : Number(rawValue);

        if (Number.isNaN(numericValue) || numericValue < 0) {
          return row;
        }

        if (field === "discount" && numericValue > 100) {
          return row;
        }

        const nextPrice = field === "price" ? numericValue : row.price ?? 0;
        const nextDiscount =
          field === "discount" ? numericValue : row.discount ?? 0;
        const gstRate = Number(planData.gstAndTax) || row.gstRate || 0;

        const { taxAmount, totalAmount } = calculateBillingAmounts(
          nextPrice,
          nextDiscount,
          gstRate,
        );

        return {
          ...row,
          [field]: numericValue,
          gstRate,
          taxAmount,
          totalAmount,
        };
      }),
    );
  };

  const handleBillingPeriodBlur = async (billingPeriodId: string) => {
    const row = billingPeriods.find(
      (item) => item.billingPeriodId === billingPeriodId,
    );

    if (!row || !planId) {
      return;
    }

    try {
      await persistBillingPeriodPricing(planId, {
        ...row,
        gstRate: row.gstRate ?? Number(planData.gstAndTax),
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        AppFailureToastMessages.UPDATE_BILLING_PERIOD_FAILED;

      toast.error(message);
    }
  };

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

      const payload = {
        planName: planData.planName,
        studentLimit: Number(planData.studentLimit),
        userLimit: Number(planData.userLimit),
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

        billingPeriods,

        canCreateCustomRole: allowedRoles.includes("ADMIN"),

        status: planId ? "Active" : planData.status,
        createdBy: planData.createdBy,
        lastUpdatedBy: planData.lastUpdatedBy,
      };

      // The Draft Plan already exists from Step 1 — finalize the SAME plan instead of creating a new one.
      const response = planId
        ? await axios.put(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.UPDATE_PLAN}`.replace(
              "${planId}",
              planId,
            ),
            payload,
          )
        : await axios.post(
            `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.CREATE_PLAN}`,
            payload,
          );

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

    const numericFields = new Set([
      "studentLimit",
      "userLimit",
      "monthlyPrice",
      "yearlyPrice",
      "setupFee",
      "trialDays",
      "gstAndTax",
      "totalPrice",
    ]);

    const newValue = numericFields.has(name) || type === "number"
      ? value === ""
        ? 0
        : Number(value)
      : value;

    setPlanData((prev) => ({
      ...prev,
      [name]: newValue,
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
  const [customDomainEnabled, setCustomDomainEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);

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
    // Draft Plan is created once on Step 1 -> Step 2; every later "Next" is pure navigation.
    if (step === 1 && !planId) {
      handleCreateDraftPlan();
      return;
    }

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
        className="bg-white dark:bg-[#252525] rounded-[18px] w-full max-w-[760px] shadow-[0_20px_50px_rgba(15,23,42,0.22)]"
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
                <div className="w-full">
                  <div className="mb-5">
                    <h2 className="text-[18px] font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                      Basic Information
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                        Plan Name
                      </label>
                      <input
                        name="planName"
                        placeholder="Premium Plus"
                        value={planData.planName}
                        onChange={handleChange}
                        className="w-full h-[42px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] placeholder:text-[#8a93a6] dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c] dark:placeholder:text-[#a3a3a3]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                        Plan Description
                      </label>
                      <textarea
                        name="planDescription"
                        value={planData.planDescription}
                        onChange={handleChange}
                        placeholder="Advanced plan for growing institutions with all essential features."
                        className="w-full min-h-[84px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 py-2.5 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] placeholder:text-[#8a93a6] resize-none dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c] dark:placeholder:text-[#a3a3a3]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                          Users
                        </label>
                        <input
                          type="number"
                          name="userLimit"
                          value={planData.userLimit === 0 ? "" : planData.userLimit}
                          onChange={handleChange}
                          placeholder="10"
                          className="w-full h-[42px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] placeholder:text-[#8a93a6] dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c] dark:placeholder:text-[#a3a3a3]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                          Student Limit
                        </label>
                        <select
                          name="studentLimit"
                          value={planData.studentLimit === 0 ? "" : planData.studentLimit}
                          onChange={handleChange}
                          className="w-full h-[42px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c]"
                        >
                          <option value="">Select</option>
                          {[1, 5, 10, 25, 50, 100].map((limit) => (
                            <option key={limit} value={limit}>
                              {limit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                          Status
                        </label>
                        <select
                          name="status"
                          value={planData.status}
                          onChange={handleChange}
                          className="w-full h-[42px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c]"
                        >
                          <option value="Active">Active</option>
                          <option value="In Active">In Active</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                          Plan Tag
                        </label>
                        <select
                          name="planStatus"
                          value={planData.planStatus}
                          onChange={handleChange}
                          className="w-full h-[42px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c]"
                        >
                          <option value="">Select tag</option>
                          <option value="Most_Popular">Most Popular</option>
                          <option value="Growing">Growing</option>
                          <option value="Low_Adoption">Low Adoption</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] border border-[#D9DDE8] bg-[#F4F6FB] px-4 py-3 dark:border-[#5c5c5c] dark:bg-[#2d2d2d]">
                      <span className="text-[14px] font-medium text-[#0f172a] dark:text-[#f3f4f6]">
                        Custom Domain
                      </span>

                      <button
                        type="button"
                        onClick={() => setCustomDomainEnabled(!customDomainEnabled)}
                        className={`relative h-7 w-[56px] rounded-full transition ${
                          customDomainEnabled ? "bg-[#576CBC]" : "bg-[#dfe3ef]"
                        }`}
                        aria-label="Toggle custom domain"
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                            customDomainEnabled ? "left-[31px]" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] border border-[#D9DDE8] bg-[#F4F6FB] px-4 py-3 dark:border-[#5c5c5c] dark:bg-[#2d2d2d]">
                      <span className="text-[14px] font-medium text-[#0f172a] dark:text-[#f3f4f6]">
                        Backup
                      </span>

                      <button
                        type="button"
                        onClick={() => setBackupEnabled(!backupEnabled)}
                        className={`relative h-7 w-[56px] rounded-full transition ${
                          backupEnabled ? "bg-[#576CBC]" : "bg-[#dfe3ef]"
                        }`}
                        aria-label="Toggle backup"
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                            backupEnabled ? "left-[31px]" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* STEP 2 */}
              {step === 2 && (
                <div className="w-full">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-[18px] font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                      Pricing Configuration
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowBillingPeriodModal(true)}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[#576CBC] bg-white px-3 py-2 text-[12px] font-medium text-[#576CBC] transition hover:bg-[#eef1ff] dark:bg-[#343434] dark:hover:bg-[#3d3d3d]"
                    >
                      <Plus size={14} />
                      Add Custom Billing Period
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]">
                      GST / Tax
                    </label>
                    <input
                      type="number"
                      name="gstAndTax"
                      value={planData.gstAndTax === 0 ? "" : planData.gstAndTax}
                      onChange={handleChange}
                      onBlur={syncPlanGstAndTax}
                      placeholder="18%"
                      className="w-full h-[42px] rounded-[10px] border border-[#D9DDE8] bg-white px-3 text-[13px] text-[#0f172a] outline-none transition focus:border-[#576CBC] placeholder:text-[#8a93a6] dark:bg-[#343434] dark:text-[#f3f4f6] dark:border-[#5c5c5c] dark:placeholder:text-[#a3a3a3]"
                    />
                  </div>

                  <div className="overflow-hidden rounded-[12px] border border-[#D9DDE8] bg-[#F4F6FB] dark:border-[#5c5c5c] dark:bg-[#2d2d2d]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-[12px]">
                        <thead>
                          <tr className="bg-[#EAEFFF] text-[#0f172a] dark:bg-[#343434] dark:text-[#f4f4f5]">
                            <th className="px-3 py-3 font-semibold">Billing Period</th>
                            <th className="px-3 py-3 font-semibold">Duration</th>
                            <th className="px-3 py-3 font-semibold">Price (₹)</th>
                            <th className="px-3 py-3 font-semibold">Discount (%)</th>
                            <th className="px-3 py-3 font-semibold">
                              GST ({Number(planData.gstAndTax) || 0}%)
                            </th>
                            <th className="px-3 py-3 font-semibold">Total (₹)</th>
                          </tr>
                        </thead>

                        <tbody>
                          {billingPeriods.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-3 py-8 text-center text-[#80848E] dark:text-[#a2a2a2]"
                              >
                                No billing periods added yet
                              </td>
                            </tr>
                          ) : (
                            billingPeriods.map((row) => (
                              <tr
                                key={row.billingPeriodId}
                                className="border-t border-[#D9DDE8] text-[#0f172a] dark:border-[#5c5c5c] dark:text-[#f4f4f5]"
                              >
                                <td className="px-3 py-3">{row.billingPeriod}</td>
                                <td className="px-3 py-3">{row.duration} Month</td>
                                <td className="px-2 py-3">
                                  <input
                                    type="number"
                                    min={0}
                                    value={row.price ?? ""}
                                    onChange={(e) =>
                                      handleBillingPeriodValueChange(
                                        row.billingPeriodId,
                                        "price",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => handleBillingPeriodBlur(row.billingPeriodId)}
                                    placeholder="0"
                                    className="w-[80px] h-[32px] rounded-[8px] border border-[#D9DDE8] bg-white px-2 text-[12px] outline-none focus:border-[#576CBC] dark:bg-[#343434] dark:border-[#5c5c5c]"
                                  /> 
                                </td>
                                <td className="px-2 py-3">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={row.discount ?? ""}
                                    onChange={(e) =>
                                      handleBillingPeriodValueChange(
                                        row.billingPeriodId,
                                        "discount",
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => handleBillingPeriodBlur(row.billingPeriodId)}
                                    placeholder="0"
                                    className="w-[68px] h-[32px] rounded-[8px] border border-[#D9DDE8] bg-white px-2 text-[12px] outline-none focus:border-[#576CBC] dark:bg-[#343434] dark:border-[#5c5c5c]"
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  {row.taxAmount !== undefined ? row.taxAmount.toFixed(2) : "-"}
                                </td>
                                <td className="px-3 py-3">
                                  {row.totalAmount !== undefined ? row.totalAmount.toFixed(2) : "-"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-[10px] bg-[#E9EDFF] px-4 py-3 text-[13px] text-[#010E30] dark:text-[#dfe3f3]">
                    <PiInfoFill size={18} className="text-[#576CBC]" />
                    <span>Set the base billing amount. GST/Tax will be calculated automatically.</span>
                  </div>
                </div>
              )}
              {/* STEP 3 */}
              {step === 3 && (
                <div className="w-full">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex gap-2 rounded-none bg-transparent">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => setActiveRole(role)}
                          className={`h-10 rounded-[10px] px-4 text-[13px] font-medium transition-all ${
                            activeRole === role
                              ? "bg-[#E9EDFF] text-[#576CBC] shadow-sm dark:bg-[#343434]"
                              : "bg-[#F4F6FB] text-[#0f172a] dark:bg-[#2d2d2d] dark:text-[#f3f4f6]"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[12px] border border-[#D9DDE8] bg-[#F4F6FB] p-4 dark:border-[#5c5c5c] dark:bg-[#2d2d2d]">
                    <label className="mb-5 flex items-center gap-2 cursor-pointer text-[13px] text-[#0f172a] dark:text-[#f3f4f6]">
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedPermissions[activeRole].length === activePermissions.length
                          }
                          onChange={toggleSelectAll}
                          className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
                        />
                        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#576CBC] bg-white text-transparent peer-checked:bg-[#576CBC] peer-checked:text-white dark:bg-[#d6d6d6]">
                          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </span>
                      Select All
                    </label>

                    <div className="grid grid-cols-3 gap-y-4">
                      {activePermissions.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center gap-2 cursor-pointer text-[13px] text-[#0f172a] dark:text-[#f3f4f6]"
                        >
                          <span className="relative flex h-4 w-4 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedPermissions[activeRole].includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
                            />
                            <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#576CBC] bg-white text-transparent peer-checked:bg-[#576CBC] peer-checked:text-white dark:bg-[#d6d6d6]">
                              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </span>
                          {permission}
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
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-[#0f172a] dark:text-[#f4f4f5]">
                      Plan Preview
                    </h2>
                    <span className="rounded-[8px] bg-[#E9F9EE] px-3 py-1.5 text-[12px] font-medium text-[#3D9A57]">
                      Live Preview
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-[14px] bg-gradient-to-r from-[#6B72FF] to-[#5349D9] p-4 text-white shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-[20px] font-bold text-white">
                        {planData.planName || "Premium Plus"}
                      </h3>
                      <span className="inline-flex items-center gap-2 rounded-[8px] bg-[#F2EEFF] px-2 py-1 text-[11px] font-medium text-[#5B52C2]">
                        <span className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-[4px] bg-[#DBD5FF] text-[#5B52C2]">
                          ★
                        </span>
                        {planData.planStatus || "Most Popular"}
                      </span>
                    </div>

                    <p className="text-[13px] text-white/85">
                      {planData.planDescription || "Advanced plan for growing institutions with all essential features."}
                    </p>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-[28px] font-bold">
                        ₹
                        {(
                          billingPeriods[0]?.totalAmount ??
                          billingPeriods[0]?.price ??
                          0
                        ).toLocaleString()}
                      </span>
                      <span className="mb-1 text-[13px] text-white/80">
                        /{billingPeriods[0]?.billingPeriod || "Month"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                      {billingPeriods.length > 0 ? (
                        billingPeriods.map((item) => (
                          <span
                            key={item.billingPeriodId}
                            className="rounded-[8px] border border-white/20 bg-white/10 px-2 py-1.5"
                          >
                            {item.billingPeriod} · ₹
                            {(item.totalAmount ?? item.price ?? 0).toLocaleString()}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-[8px] border border-white/20 bg-white/10 px-2 py-1.5 text-white/80">
                          No billing periods added yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[12px] border border-[#D9DDE8] bg-[#F4F6FB] p-4 dark:border-[#5c5c5c] dark:bg-[#2d2d2d]">
                    <div className="mb-3 text-[13px] font-semibold text-[#010E30] dark:text-[#f4f4f5]">
                      Plan Details
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[12px] text-[#0f172a] dark:text-[#f4f4f5]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#667085]">Users</span>
                        <span className="font-medium">{planData.studentLimit || 10}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#667085]">Student Limit</span>
                        <span className="font-medium">{planData.studentLimit || 10}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#667085]">Custom Domain</span>
                        <span className="font-medium text-[#16a34a]">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#667085]">Backup</span>
                        <span className="font-medium text-[#16a34a]">Enabled</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-3">
                        <span className="text-[#667085]">Status</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#E9F9EE] px-2 py-1 text-[#16a34a]">
                          <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[12px] border border-[#D9DDE8] bg-[#F4F6FB] p-4 dark:border-[#5c5c5c] dark:bg-[#2d2d2d]">
                    <div className="mb-4 text-[13px] font-semibold text-[#010E30] dark:text-[#f4f4f5]">
                      Included Modules & Features
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[12px] text-[#0f172a] dark:text-[#f4f4f5]">
                      {allowedRoles.length > 0 ? (
                        allowedRoles.map((role) => (
                          <div key={role}>
                            <div className="mb-2 inline-flex rounded-[6px] bg-[#E9EDFF] px-2 py-1 text-[11px] font-medium text-[#576CBC]">
                              {role.replaceAll("_", " ")}
                            </div>
                            <ul className="space-y-1.5 text-[#0f172a] dark:text-[#f4f4f5]">
                              {(featureAccessByRole[role] || []).map((permission) => (
                                <li key={permission} className="flex items-center gap-2">
                                  <Check size={14} className="text-[#16a34a]" />
                                  <span>{permission}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-[#667085]">No features selected yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-[10px] bg-[#E9EDFF] px-4 py-3 text-[13px] text-[#010E30] dark:text-[#dfe3f3]">
                    <PiInfoFill size={18} className="text-[#576CBC]" />
                    <span>This plan will be available for tenants to subscribe.</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Footer */}
        <div className="border-t border-[#D9DDE8] p-4 flex justify-end gap-3 dark:border-[#5c5c5c]">
          {step > 1 && (
            <button
              onClick={back}
              className="border border-[#D9DDE8] bg-white px-5 text-[12px] font-medium text-[#0f172a] hover:bg-[#F6F8FF] dark:border-[#5c5c5c] dark:bg-[#343434] dark:text-[#f3f4f6] dark:hover:bg-[#3d3d3d] rounded-[10px] h-[40px]"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <motion.button
              onClick={next}
              disabled={isCreatingDraft}
              whileHover={{
                scale: 1.02,
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="bg-[#576CBC] text-white px-5 text-[12px] font-medium rounded-[10px] h-[40px] disabled:opacity-60"
            >
              {step === 1 && isCreatingDraft ? "Creating..." : "Next"}
            </motion.button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-[#576CBC] text-[12px] font-medium text-white px-6 h-[40px] rounded-[10px] hover:bg-[#4338CA]"
            >
              Create Plan
            </button>
          )}
        </div>
      </motion.div>

      {/* Add Custom Billing Period Modal */}
      {showBillingPeriodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-[#252525] rounded-xl w-full max-w-sm shadow-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#010E30] dark:text-[#ccc]">
                Add Custom Billing Period
              </h3>

              <button
                onClick={handleCancelBillingPeriodModal}
                className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-gray-100 dark:hover:bg-[#343434] hover:text-black dark:hover:text-[#ccc] rounded-md"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                  Billing Period
                </label>

                <input
                  type="text"
                  value={billingPeriodForm.billingPeriod}
                  onChange={(e) =>
                    setBillingPeriodForm((prev) => ({
                      ...prev,
                      billingPeriod: e.target.value,
                    }))
                  }
                  placeholder="Monthly"
                  className="w-full h-8 text-xs dark:bg-[#343434] rounded-sm border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080]"
                />

                {billingPeriodFormErrors.billingPeriod && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {billingPeriodFormErrors.billingPeriod}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#010E30] dark:text-[#ccc] font-medium mb-2">
                  Duration (in months)
                </label>

                <input
                  type="number"
                  min={1}
                  value={billingPeriodForm.duration === 0 ? "" : billingPeriodForm.duration}
                  onChange={(e) =>
                    setBillingPeriodForm((prev) => ({
                      ...prev,
                      duration: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  placeholder="1"
                  className="w-full h-8 text-xs dark:bg-[#343434] rounded-sm border border-[#D4D4D4] dark:border-[#5c5c5c] px-2 outline-none focus:border-[#576CBC] placeholder:text-[#343e59] dark:placeholder:text-[#808080]"
                />

                {billingPeriodFormErrors.duration && (
                  <p className="mt-1 text-[10px] text-red-500">
                    {billingPeriodFormErrors.duration}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelBillingPeriodModal}
                className="border border-gray-300 dark:border-[#5c5c5c] hover:bg-gray-50 dark:hover:bg-[#343434] px-4 text-xs py-2 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveBillingPeriod}
                disabled={isSavingBillingPeriod}
                className="bg-[#576CBC] text-white px-4 text-xs py-2 rounded-md disabled:opacity-60"
              >
                {isSavingBillingPeriod ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreatePlan;
