"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  Users,
  Check,
  Info,
  CloudUpload,
  Loader2,
   Clock,
  CheckCircle2,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";


import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";


type BackupStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

interface BackupStatusResponse {
  backupId: string;
  status: BackupStatus;
  isDownloadAvailable: boolean;
  errorMessage?: string | null;
  file?: {
    fileName: string;
    fileSize: number;
    totalRecords: number;
    expiresAt: string;
    downloadUrl: string;
  } | null;
}
const BACKUP_STORAGE_KEY = "TENANT_BACKUP_REQUEST";

interface BillingPeriod {
  billingPeriod?: string;
  duration?: number;
  price?: number;
  gstRate?: number;
  taxAmount?: number;
  totalAmount?: number;
}

interface SubscriptionModule {
  moduleName: string;
  portalName?: string;
  features?: { featureName: string }[];
  children?: { childModuleName: string }[];
}

interface TenantSubscription {
  billingCycle?: number;
  status?: string;
  nextRenewalDate?: string;
  price?: number;
  plan?: {
    planName?: string;
    planDescription?: string;
    studentLimit?: number;
    userLimit?: number;
    billingPeriods?: BillingPeriod[];
    modules?: SubscriptionModule[];
  };
}

const formatCurrency = (amount?: number) =>
  `₹${(amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const CurrentSubscription = () => {
  // --- STATE ---
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState("");

const [backupId, setBackupId] = useState<string | null>(null);
const [backupStatus, setBackupStatus] =
  useState<BackupStatus | null>(null);

const [backupDetails, setBackupDetails] =
  useState<BackupStatusResponse | null>(null);

const [backupLoading, setBackupLoading] = useState(false);
const [downloadLoading, setDownloadLoading] = useState(false);

// Restore backup ID after page refresh.
useEffect(() => {
  const savedBackupId = localStorage.getItem(BACKUP_STORAGE_KEY);

  if (savedBackupId) {
    setBackupId(savedBackupId);
  }
}, []);

// Check backup status every 5 seconds.
useEffect(() => {
  if (!backupId) return;

  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  const checkBackupStatus = async () => {
    try {
     const response = await fetch(
  `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.TENANT.GET_BACKUP_STATUS(backupId)}`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      tenantId: localStorage.getItem("tenantId") || "",
    }
  },
);

if (!response.ok) {
  throw new Error("Failed to fetch backup status");
}

const result = await response.json();

const data = result.data;

setBackupDetails(data);
setBackupStatus(data.status);

      if (
        data.status === "COMPLETED" ||
        data.status === "FAILED"
      ) {
        return;
      }
    } catch (error) {
      console.error("Backup status failed:", error);
    }

    if (!cancelled) {
      timeoutId = setTimeout(checkBackupStatus, 5000);
    }
  };

  checkBackupStatus();

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}, [backupId]);

// // Call this after the user confirms the backup modal.
// const handleBackupRequest = async () => {
//   try {
//     setBackupLoading(true);

//  const response = await fetch(
//         `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}/backup-request`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             tenantId,
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//  const result: {
//         message?: string;
//         data?: { backupId?: string };
//         error?: {
//           fieldErrors?: Record<string, string[]>;
//           formErrors?: string[];
//         };
//       } = await response.json().catch(() => ({}));
//     // Save backup ID in localStorage.
//     localStorage.setItem(BACKUP_STORAGE_KEY, result.data?.backupId || "");

//     setBackupId(result.data?.backupId || "");
//     setBackupStatus("PENDING");
//     setBackupDetails(null);

//     setShowBackupModal(false);
//   } catch (error) {
//     console.error("Backup request failed:", error);
//   } finally {
//     setBackupLoading(false);
//   }
// };

// Download completed Excel file.
const handleBackupDownload = async () => {
  if (!backupId) return;

  try {
    setDownloadLoading(true);
const response = await fetch(
  `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.TENANT.DOWNLOAD_BACKUP(backupId)}`,
  {
    method: "GET",
  },
);

if (!response.ok) {
  throw new Error("Backup download failed");
}

const blob = await response.blob();

const url = window.URL.createObjectURL(blob);

const link = document.createElement("a");
link.href = url;
link.download =
  backupDetails?.file?.fileName || "tenant-backup.xlsx";

document.body.appendChild(link);
link.click();
link.remove();

window.URL.revokeObjectURL(url);

// Clear local backup after successful download.
localStorage.removeItem("TENANT_BACKUP_REQUEST");

setBackupId(null);
setBackupStatus(null);
setBackupDetails(null);
  

  } catch (error) {
    console.error("Backup download failed:", error);
  } finally {
    setDownloadLoading(false);
  }
};

// Reset failed request and allow a new request.
const handleBackupRetry = () => {
  localStorage.removeItem(BACKUP_STORAGE_KEY);

  setBackupId(null);
  setBackupStatus(null);
  setBackupDetails(null);

  setShowBackupModal(true);
};
  useEffect(() => {
    const controller = new AbortController();

    const fetchSubscription = async () => {
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) {
        setSubscriptionError("Tenant ID not found. Please sign in again.");
        setIsSubscriptionLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("AdminAuthToken");
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.TENANT.GET_TENANT_SUBSCRIPTION(tenantId)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          },
        );
        const result: {
          success: boolean;
          message?: string;
          data?: TenantSubscription;
        } = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Failed to fetch subscription details.");
        }

        setSubscription(result.data);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load subscription details.";
        setSubscriptionError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) setIsSubscriptionLoading(false);
      }
    };

    fetchSubscription();
    return () => controller.abort();
  }, []);

  const plan = subscription?.plan;
  const billingPeriod =
    plan?.billingPeriods?.find((period) => period.duration === subscription?.billingCycle) ??
    plan?.billingPeriods?.[0];
  const renewalDate = subscription?.nextRenewalDate;
  const renewalTimestamp = renewalDate ? new Date(renewalDate).getTime() : Number.NaN;
  const renewalDaysLeft = Number.isNaN(renewalTimestamp)
    ? null
    : Math.max(0, Math.ceil((renewalTimestamp - Date.now()) / 86400000));
  const portalFeatures = (plan?.modules ?? []).reduce<Record<string, string[]>>((groups, module) => {
    const portalName = module.portalName || "Included Features";
    const moduleFeatures = [
      module.moduleName,
      ...(module.features ?? []).map((feature) => feature.featureName),
      ...(module.children ?? []).map((child) => child.childModuleName),
    ];
    groups[portalName] = [...(groups[portalName] ?? []), ...moduleFeatures];
    return groups;
  }, {});

  // --- DYNAMIC DATES (Defaults to current month/year) ---
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const formattedNextWeek = nextWeek.toISOString().split("T")[0];

  const handleBackupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const fromDate = String(formData.get("startDate") ?? "").trim();
    const toDate = String(formData.get("endDate") ?? "").trim();
    const additionalNotes = String(formData.get("notes") ?? "").trim();

    const tenantId = localStorage.getItem("tenantId");
    const token = localStorage.getItem("AdminAuthToken");
    const requestedBy =
      localStorage.getItem("AdminPortalUserId") ||
      localStorage.getItem("AdminPortalId");

    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }
    if (!tenantId) {
      toast.error("Tenant ID not found. Please log in again.");
      return;
    }
    if (!requestedBy) {
      toast.error("Admin user ID not found. Please log in again.");
      return;
    }
    if (!fromDate || !toDate) {
      toast.error("Please select both dates for the backup date range.");
      return;
    }

    const payload = {
      dateRange: {
        fromDate,
        toDate,
      },
      additionalNotes,
      requestedBy,
    };

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}/backup-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            tenantId,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result: {
        message?: string;
        data?: { backupId?: string };
        error?: {
          fieldErrors?: Record<string, string[]>;
          formErrors?: string[];
        };
      } = await response.json().catch(() => ({}));

      localStorage.setItem(BACKUP_STORAGE_KEY, result.data?.backupId || "");
       setBackupStatus(result.data?.backupId ? "PENDING" : null); 

      if (!response.ok) {
        console.error("❌ Backend Rejected with:", result);

        let errorMsg = "Failed to submit request.";
        if (result.error?.fieldErrors) {
          const fieldErrors = result.error.fieldErrors;
          const firstErrorKey = Object.keys(fieldErrors)[0];
          if (firstErrorKey) {
            errorMsg = `${firstErrorKey}: ${fieldErrors[firstErrorKey]?.[0]}`;
          }
        } else if (result.error?.formErrors?.length > 0) {
          errorMsg = result.error.formErrors[0];
        } else if (result.message) {
          errorMsg = result.message;
        }

        throw new Error(errorMsg);
      }

      const successMessage =
        result.message || "Backup request submitted successfully.";
      setSuccessMessage(
        result.data?.backupId
          ? `${successMessage} Backup ID: ${result.data.backupId}`
          : successMessage,
      );
      toast.success(successMessage);

      setTimeout(() => {
        setShowBackupModal(false);
        setSuccessMessage("");
      }, 1500);

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to submit request.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#2e2e2e] p-3 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-lg">
      {subscriptionError && (
        <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {subscriptionError}
        </p>
      )}
      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_0.9fr_0.9fr]">
        {/* Current Plan */}
        <div className="relative flex min-h-[120px] items-center overflow-hidden rounded-xl bg-gradient-to-r from-[#5067d7] to-[#6d80eb] px-3 py-3 text-white shadow-md">
          <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-xl bg-white/15">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute h-10 w-10 rotate-45 rounded-[5px] bg-white" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#6478df]">
                <span className="text-[24px] text-white">★</span>
              </div>
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-[11px] text-white/90">Current Plan</p>
            <h2 className="mt-1 text-[17px] font-semibold">
              {isSubscriptionLoading ? "Loading..." : plan?.planName || "No plan"}
            </h2>
            <p className="mt-1 max-w-[420px] text-[10px] leading-[14px] text-white/90">
              {plan?.planDescription || "Your current subscription plan and included features."}
            </p>
          </div>
          {subscription?.status && (
            <span className="absolute right-3 top-3 rounded bg-[#dff8dc] px-2 py-[3px] text-[9px] font-medium text-[#36a53a]">
              {subscription.status}
            </span>
          )}
        </div>

        {/* Billing Cycle */}
        <div className="flex min-h-[120px] items-center rounded-xl bg-white px-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-lg dark:bg-[#343434]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5edff]">
            <CreditCard className="h-6 w-6 text-[#3670e7]" />
          </div>
          <div className="ml-4">
            <p className="text-[14px] text-gray-500 dark:text-gray-300">Billing Cycle</p>
            <h3 className="mt-1 text-[19px] font-semibold text-[#292929] dark:text-white">
              {billingPeriod?.billingPeriod || (subscription?.billingCycle ? `${subscription.billingCycle} months` : "N/A")}
            </h3>
            <p className="mt-2 text-[12px] text-gray-500 dark:text-gray-300">
              {isSubscriptionLoading
                ? "Loading price..."
                : `${formatCurrency(billingPeriod?.price ?? subscription?.price)}${billingPeriod?.duration ? ` / ${billingPeriod.duration} month(s)` : ""}`}
            </p>
          </div>
        </div>

        {/* Renewal Date */}
        <div className="flex min-h-[120px] items-center rounded-xl bg-white px-4 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-lg dark:bg-[#343434]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5f7e9]">
            <CalendarDays className="h-6 w-6 text-[#35b866]" />
          </div>
          <div className="ml-4">
            <p className="text-[14px] text-gray-500 dark:text-gray-300">Renewal Date</p>
            <h3 className="mt-1 text-[18px] font-semibold text-[#292929] dark:text-white">
              {formatDate(renewalDate)}
            </h3>
            <p className="mt-2 text-[12px] text-gray-500 dark:text-gray-300">
              {renewalDaysLeft === null ? "Renewal date unavailable" : `${renewalDaysLeft} days left`}
            </p>
          </div>
        </div>
      </div>

      {/* Usage + Summary */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-lg dark:bg-[#343434] bg-white p-3">
          <h3 className="text-[14px] font-semibold text-[#10204a] dark:text-white">Usage & Limits</h3>
          <div className="mt-4 space-y-3">
            <UsageRow icon={<GraduationCap className="h-4 w-4" />} label="Student limit" value={plan?.studentLimit === undefined ? "N/A" : String(plan.studentLimit)} />
            <UsageRow icon={<Users className="h-4 w-4" />} label="User limit" value={plan?.userLimit === undefined ? "N/A" : String(plan.userLimit)} />
          </div>
          <div className="mt-4 flex items-center rounded-md bg-[#e5ebff] px-3 py-2 dark:bg-[#25324b]">
            <Info className="h-3.5 w-3.5 text-[#536abf] dark:text-[#a9baff]" />
            <span className="ml-2 text-[10px] text-[#29375f] dark:text-[#d5dcf2]">Users are created and managed by the Super Admin.</span>
          </div>
        </div>

        <div className="rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-lg dark:bg-[#343434] bg-white p-3">
          <h3 className="text-[14px] font-semibold text-[#10204a] dark:text-white">Subscription Summary</h3>
          <div className="mt-4">
            <SummaryRow label="Plan Price" value={formatCurrency(billingPeriod?.price ?? subscription?.price)} />
            <SummaryRow
              label={`GST${billingPeriod?.gstRate === undefined ? "" : ` (${billingPeriod.gstRate}%)`}`}
              value={formatCurrency(billingPeriod?.taxAmount)}
            />
            <SummaryRow
              label="Total Amount"
              value={formatCurrency(
                billingPeriod?.totalAmount ??
                  ((billingPeriod?.price ?? subscription?.price ?? 0) + (billingPeriod?.taxAmount ?? 0)),
              )}
              bold
            />
            <SummaryRow label="Next Billing Date" value={formatDate(renewalDate)} />
          </div>
        </div>
      </div>

      {/* Features + Backup */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[3fr_1fr]">
        <div className="rounded-lg shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] dark:shadow-lg dark:bg-[#343434] bg-white p-3">
          <h3 className="text-[14px] font-semibold text-[#10204a] dark:text-white">Included Portal & Features</h3>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(portalFeatures).length > 0 ? (
              Object.entries(portalFeatures).map(([portalName, features]) => (
                <FeatureColumn key={portalName} title={portalName} features={features} />
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isSubscriptionLoading ? "Loading included features..." : "No features are listed for this plan."}
              </p>
            )}
          </div>
        </div>

        
<div className="flex min-h-[215px] flex-col items-center justify-center rounded-lg bg-[#f8eaff] px-4 py-5 text-center dark:bg-[#3d2945]">

  {/* REQUEST */}
  {!backupStatus && (
    <>
      <CloudUpload className="mb-3 h-14 w-14 text-[#d177ef]" />

      <h3 className="text-[11px] font-semibold text-[#17182e] dark:text-white">
        Backup Request
      </h3>

      <p className="mt-1 max-w-[210px] text-[9px] leading-4 text-[#4c4560] dark:text-[#e0d2e7]">
        Request a backup for your data and ensure data safety.
      </p>

      <button
        type="button"
        onClick={() => setShowBackupModal(true)}
        className="mt-3 rounded-md bg-white px-4 py-1.5 text-[10px] font-medium text-[#252944] shadow-sm transition hover:bg-gray-50 dark:bg-[#29232d] dark:text-white dark:hover:bg-[#342b39]"
      >
        Backup Request
      </button>
    </>
  )}

  {/* PENDING */}
  {backupStatus === "PENDING" && (
    <>
      <Clock className="mb-3 h-12 w-12 text-amber-500" />

      <h3 className="text-[11px] font-semibold text-[#17182e] dark:text-white">
        Backup Requested
      </h3>

      <p className="mt-1 text-[9px] text-[#4c4560] dark:text-[#e0d2e7]">
        Your backup request is waiting for processing.
      </p>

      <span className="mt-3 rounded-full bg-amber-100 px-3 py-1 text-[9px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        PENDING
      </span>

      <p className="mt-2 text-[9px] text-[#756b80] dark:text-[#d9c8e1]">
        ID: {backupId}
      </p>
    </>
  )}

  {/* PROCESSING */}
  {backupStatus === "PROCESSING" && (
    <>
      <Loader2 className="mb-3 h-12 w-12 animate-spin text-blue-500" />

      <h3 className="text-[11px] font-semibold text-[#17182e] dark:text-white">
        Generating Backup
      </h3>

      <p className="mt-1 text-[9px] text-[#4c4560] dark:text-[#e0d2e7]">
        Please wait while we prepare your Excel backup.
      </p>

      <span className="mt-3 rounded-full bg-blue-100 px-3 py-1 text-[9px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        PROCESSING
      </span>

      <p className="mt-2 text-[9px] text-[#756b80] dark:text-[#d9c8e1]">
        ID: {backupId}
      </p>
    </>
  )}

  {/* COMPLETED */}
  {backupStatus === "COMPLETED" && (
    <>
      <CheckCircle2 className="mb-2 h-12 w-12 text-green-600" />

      <h3 className="text-[11px] font-semibold text-[#17182e] dark:text-white">
        Backup Ready!
      </h3>

      <p className="mt-1 max-w-[220px] truncate text-[9px] text-[#4c4560] dark:text-[#e0d2e7]">
        {backupDetails?.file?.fileName}
      </p>

      <span className="mt-2 rounded-full bg-green-100 px-3 py-1 text-[9px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
        COMPLETED
      </span>

      <button
        type="button"
        onClick={handleBackupDownload}
        disabled={
          downloadLoading ||
          !backupDetails?.isDownloadAvailable
        }
        className="mt-3 flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-[10px] font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloadLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Download className="h-3 w-3" />
        )}

        {downloadLoading ? "Downloading..." : "Download Backup"}
      </button>

      <p className="mt-2 text-[8px] text-[#756b80] dark:text-[#d9c8e1]">
        ID: {backupId}
      </p>
    </>
  )}

  {/* FAILED */}
  {backupStatus === "FAILED" && (
    <>
      <AlertCircle className="mb-3 h-12 w-12 text-red-500" />

      <h3 className="text-[11px] font-semibold text-[#17182e] dark:text-white">
        Backup Failed
      </h3>

      <p className="mt-1 max-w-[220px] text-[9px] text-red-600 dark:text-red-300">
        {backupDetails?.errorMessage || "Unable to generate backup."}
      </p>

      <button
        type="button"
        onClick={handleBackupRetry}
        className="mt-3 flex items-center gap-2 rounded-md bg-white px-4 py-1.5 text-[10px] font-medium text-[#252944] shadow-sm hover:bg-gray-50 dark:bg-[#29232d] dark:text-white"
      >
        <RefreshCw className="h-3 w-3" />
        Try Again
      </button>
    </>
  )}

</div>

      </div>

      {showBackupModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-[620px] rounded-[9px] bg-white px-[18px] py-[20px] shadow-2xl dark:bg-[#2e2e2e]" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-[14px] text-[15px] font-semibold text-[#111111] dark:text-white">Backup Request</h2>

            <form onSubmit={handleBackupSubmit} className="rounded-[10px] border border-[#dce1eb] px-[16px] pb-[16px] pt-[14px] dark:border-[#555]">
              <div className="mb-[15px]">
                <label className="mb-[7px] block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">Backup Date</label>
                <div className="grid grid-cols-2 gap-[5px]">
                  {/* Dynamically set to today */}
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={formattedToday}
                    disabled={isSubmitting}
                    className="h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[10px] text-[12px] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white disabled:opacity-50"
                  />
                  {/* Dynamically set to today + 7 days */}
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={formattedNextWeek}
                    disabled={isSubmitting}
                    className="h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[10px] text-[12px] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="mb-[13px]">
                <label className="mb-[7px] block text-[13px] font-medium text-[#101b3d] dark:text-[#e5e7eb]">Additional Notes</label>
                <textarea name="notes" rows={5} disabled={isSubmitting} placeholder="Enter any additional information..." className="h-[105px] w-full resize-none rounded-[5px] border border-[#d1d1d1] bg-white px-[10px] py-[9px] text-[12px] outline-none focus:border-[#5870c5] dark:border-[#555] dark:bg-[#252525] dark:text-white disabled:opacity-50" />
              </div>

              {errorMessage && <div className="mb-2 rounded bg-red-50 p-2 text-[12px] text-red-600 dark:bg-red-900/20 dark:text-red-400">{errorMessage}</div>}
              {successMessage && <div className="mb-2 rounded bg-green-50 p-2 text-[12px] text-green-600 dark:bg-green-900/20 dark:text-green-400">{successMessage}</div>}

              <div className="flex h-[39px] items-center rounded-[6px] bg-[#E5EBFF] px-[10px] dark:bg-[#25324b]">
                <div className="mr-[9px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-[#5870c5] text-[12px] font-semibold text-white">i</div>
                <p className="text-[12px] text-[#17213f] dark:text-[#d5dcf2]">Backup is available only for data from the last 30 days.</p>
              </div>

              <div className="my-[17px] h-px w-full bg-[#dddddd] dark:bg-[#555]" />

              <div className="flex justify-end gap-[18px]">
                <button type="button" onClick={() => setShowBackupModal(false)} disabled={isSubmitting} className="h-[38px] min-w-[93px] rounded-[6px] border border-[#5870c5] bg-white px-[18px] text-[13px] font-semibold text-[#5870c5] transition hover:bg-[#f4f6ff] disabled:opacity-50 dark:bg-transparent dark:hover:bg-[#3a3a3a]">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex h-[38px] min-w-[93px] items-center justify-center gap-2 rounded-[6px] bg-[#5870c5] px-[18px] text-[13px] font-semibold text-white transition hover:bg-[#4d63b5] disabled:opacity-50">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

interface UsageRowProps { icon: React.ReactNode; label: string; value: string; }
const UsageRow = ({ icon, label, value }: UsageRowProps) => {
  return (
    <div className="flex items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e8edff] text-[#526dc8] dark:bg-[#29334d] dark:text-[#a9baff]">{icon}</div>
      <span className="ml-3 flex-1 text-[13px] text-[#18213c] dark:text-[#e5e7eb]">{label}</span>
      <span className="text-right text-[12px] font-medium text-[#101a3c] dark:text-[#e5e7eb]">{value}</span>
    </div>
  );
};

interface SummaryRowProps { label: string; value: string; bold?: boolean; }
const SummaryRow = ({ label, value, bold = false }: SummaryRowProps) => {
  return (
    <div className="flex items-center justify-between border-b border-[#edf0f5] py-2 last:border-b-0 dark:border-[#505050]">
      <span className={`text-[12px] ${bold ? "font-medium text-[#17203d] dark:text-white" : "text-[#17203d] dark:text-[#e5e7eb]"}`}>{label}</span>
      <span className={`text-[12px] ${bold ? "font-medium text-[#17203d] dark:text-white" : "text-[#17203d] dark:text-[#e5e7eb]"}`}>{value}</span>
    </div>
  );
};

interface FeatureColumnProps { title: string; features: string[]; }
const FeatureColumn = ({ title, features }: FeatureColumnProps) => {
  return (
    <div>
      <h4 className="text-[13px] font-medium text-[#14203e] dark:text-white">{title}</h4>
      <div className="mt-2 space-y-2">
        {features.map((feature, index) => (
          <div key={`${feature}-${index}`} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-[#2dbb63]" />
            <span className="text-[12px] text-[#17203d] dark:text-[#e5e7eb]">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentSubscription;