"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UploadCloud,
  FileText,
  Trash2,
  Check,
  Info,
  CloudUpload,
} from "lucide-react";

type UpdateTenantProps = {
  readonly tenant: {
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    domain: string;
    phoneNumber: string;
    email: string;
    gstNo: string;
    faxNo: string;
    panNo: string;
    website: string;
    startDate: string;
    timeZone: string;
    planId?: string;
    plan: string;
    currency: string;
    users: number;
    renewalDate: string;
    status: string;
    state: string;
    country: string;
    city: string;
    street: string;
    landMark: string;
    pincode: string;
    companyRegistrationCertificate: string;
  };
  readonly onClose: () => void;
  readonly onSave: (data: {
    tenantName: string;
    domain: string;
    email: string;
    phoneNumber: string;
    gstNo: string;
    faxNo: string;
    panNo: string;
    website: string;
    status: string;
    timeZone: string;
    planId?: string;
    plan: string;
    currency: string;
    country: string;
    state: string;
    city: string;
    street: string;
    landMark: string;
    pincode: string;
    comments: string;
    companyRegistrationCertificate: string;
  }) => void;
};

type TenantFormData = {
  companyName: string;
  comments: string;
  email: string;
  phone: string;
  domain: string;
  gstNo: string;
  panNo: string;
  faxNo: string;
  website: string;
  status: string;
  timeZone: string;
  planId: string;
  plan: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  street: string;
  landMark: string;
  pincode: string;
  tenantBackup: boolean;
  logo: File | null;
  gstCertificate: File | null;
  registrationCertificate: File | null;
  addressProof: File | null;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  companyRegistrationCertificate: string;
};

type FileField =
  | "logo"
  | "gstCertificate"
  | "registrationCertificate"
  | "addressProof";

type AvailablePlan = {
  planId: string;
  planName: string;
};

type TenantUpdatePayload = {
  tenantName: string;
  domain: string;
  email: string;
  phoneNumber: string;
  gstNo: string;
  faxNo: string;
  panNo: string;
  website: string;
  status: string;
  timeZone: string;
  planId?: string;
  plan: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  street: string;
  landMark: string;
  pincode: string;
  comments: string;
  companyRegistrationCertificate: string;
};

const fetchAvailablePlans = async (): Promise<AvailablePlan[]> => {
  const response = await axios.get(
    `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.PLAN_TABLE}`,
  );
  const responseData = response.data?.data ?? response.data;
  const plans = Array.isArray(responseData)
    ? responseData
    : (responseData?.items ?? responseData?.plans ?? []);

  return plans
    .filter(
      (plan: { status?: string }) => (plan.status ?? "Active") === "Active",
    )
    .map((plan: { _id?: string; planName?: string; name?: string }) => ({
      planId: plan._id ?? "",
      planName: plan.planName ?? plan.name ?? "Unnamed plan",
    }))
    .filter((plan: AvailablePlan) => plan.planId);
};

const getObjectId = (value: unknown): string => {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const objectValue = value as { $oid?: unknown };
    return typeof objectValue.$oid === "string" ? objectValue.$oid : "";
  }

  return "";
};

const fieldBase =
  "w-full h-[35px] rounded-[7px] border border-[#d4d4d4] px-3 text-[13px] outline-none transition " +
  "border-[#D9DDE8] bg-white text-[#010e30] placeholder:text-[#343e59] " +
  "focus:border-[#576CBC] dark:border-[#5c5c5c] dark:bg-[#343434] dark:text-[#f3f4f6] dark:placeholder:text-[#8a93a6]";

const labelBase =
  "mb-2 block text-[13px] font-medium text-[#010E30] dark:text-[#dfe3f3]";
const sectionTitle =
  "text-[18px] font-semibold text-[#0f172a] dark:text-[#f4f4f5]";

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  inputClassName = "",
  title,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  inputClassName?: string;
  title?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelBase}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        title={title}
        className={`${fieldBase} ${disabled ? "cursor-not-allowed opacity-70" : ""} ${inputClassName}`}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select",
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelBase}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${fieldBase} appearance-none pr-10 ${
            disabled ? "cursor-not-allowed opacity-70" : ""
          } ${value ? "" : "text-gray-400 dark:text-gray-500"}`}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
      </div>
    </div>
  );
}

function UploadRow({
  title,
  name,
  file,
  onUpload,
  onRemove,
}: {
  title: string;
  name: FileField;
  file: File | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (name: FileField) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-100">
        {title}
      </p>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-[#4A4A4A] dark:bg-[#2C2C2C]">
          <div className="flex min-w-0 items-center gap-2">
            <FileText size={16} className="shrink-0 text-[#5967E8]" />

            <span className="truncate text-sm text-gray-700 dark:text-gray-200">
              {file.name}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({formatSize(file.size)})
            </span>

            <button
              type="button"
              aria-label={`Remove ${title}`}
              onClick={() => onRemove(name)}
              className="text-gray-400 transition hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-[70px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#5967E8] bg-[#F8F9FF] transition hover:bg-[#EEF2FF] dark:border-[#5967E8]/70 dark:bg-[#2C2C2C] dark:hover:bg-[#333]">
          <UploadCloud size={22} className="text-[#5967E8]" />

          <span className="text-xs text-gray-500 dark:text-gray-400">
            Click or drag and drop
          </span>

          <input hidden type="file" name={name} onChange={onUpload} />
        </label>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_12px_1fr] items-start text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-400 dark:text-gray-500">:</span>
      <span className="break-words font-medium text-gray-800 dark:text-gray-100">
        {value?.trim() ? value : "—"}
      </span>
    </div>
  );
}

function DocumentRow({ file }: { file: File | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <FileText
          size={16}
          className={`shrink-0 ${file ? "text-[#5967E8]" : "text-gray-300 dark:text-gray-600"}`}
        />

        <span
          className={`truncate text-sm ${
            file
              ? "text-gray-700 dark:text-gray-200"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {file?.name || "Not uploaded"}
        </span>
      </div>

      {file && <Check size={16} className="shrink-0 text-green-500" />}
    </div>
  );
}

const createEmptyFormData = (): TenantFormData => ({
  companyName: "",
  email: "",
  phone: "",
  domain: "",
  gstNo: "",
  panNo: "",
  faxNo: "",
  website: "",
  comments: "",
  status: "",
  timeZone: "",
  planId: "",
  plan: "",
  currency: "",
  country: "",
  state: "",
  city: "",
  street: "",
  landMark: "",
  pincode: "",
  tenantBackup: false,
  logo: null,
  gstCertificate: null,
  registrationCertificate: null,
  addressProof: null,
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  companyRegistrationCertificate: "",
});

export default function UpdateTenant({
  tenant,
  onClose,
  onSave,
}: UpdateTenantProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState(tenant.planId || "");
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [isPlanSaving, setIsPlanSaving] = useState(false);
  const [planError, setPlanError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [pendingPayload, setPendingPayload] =
    useState<TenantUpdatePayload | null>(null);

  const [formData, setFormData] = useState<TenantFormData>({
    ...createEmptyFormData(),
    companyName: tenant.tenantName || "",
    email: tenant.email || "",
    phone: tenant.phoneNumber || "",
    gstNo: tenant.gstNo || "",
    panNo: tenant.panNo || "",
    faxNo: tenant.faxNo || "",
    website: tenant.website || "",
    domain: tenant.domain || "",
    status: tenant.status || "",
    timeZone: tenant.timeZone || "",
    planId: tenant.planId || "",
    plan: tenant.plan || "",
    currency: tenant.currency || "",
    country: tenant.country || "",
    state: tenant.state || "",
    city: tenant.city || "",
    street: tenant.street || "",
    landMark: tenant.landMark || "",
    pincode: tenant.pincode || "",
    adminName: tenant.tenantName || "",
    adminEmail: tenant.email || "",
    adminPhone: tenant.phoneNumber || "",
    companyRegistrationCertificate: tenant.companyRegistrationCertificate || "",
  });

  const steps = [
    "Basic Information",
    "Upload Documents",
    "Review",
    "Invite Admin",
  ];
  const totalSteps = steps.length;

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsPlanLoading(true);
        setAvailablePlans(await fetchAvailablePlans());
      } catch {
        setPlanError("Unable to load plans. Please try again.");
      } finally {
        setIsPlanLoading(false);
      }
    };

    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPlanEditor = async () => {
    setShowPlanEditor(true);
    setPlanError("");

    let plans = availablePlans;

    if (plans.length === 0) {
      try {
        setIsPlanLoading(true);
        plans = await fetchAvailablePlans();
        setAvailablePlans(plans);
      } catch {
        setPlanError("Unable to load plans. Please try again.");
        return;
      } finally {
        setIsPlanLoading(false);
      }
    }

    const currentPlan = plans.find(
      (plan) =>
        plan.planName.trim().toLowerCase() ===
        formData.plan.trim().toLowerCase(),
    );
    if (currentPlan) setSelectedPlanId(currentPlan.planId);
  };

  const handlePlanUpdate = async () => {
    if (!selectedPlanId || !tenant.tenantCode) return;

    try {
      setIsPlanSaving(true);
      setPlanError("");
      const token = localStorage.getItem("SuperAdminAuthToken");
      const updatePlanUrl =
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.UPDATE_SUBSCRIPTION_PLAN}`.replace(
          "{tenantCode}",
          tenant.tenantCode,
        );
      const selectedPlan = availablePlans.find(
        (plan) => plan.planId === selectedPlanId,
      );
      const response = await axios.put(
        updatePlanUrl,
        {
          planId: selectedPlanId,
          planName: selectedPlan?.planName ?? "",
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      const updatedPlanName = response.data?.data?.data?.subscription?.planName;

      setFormData((prev) => ({
        ...prev,
        planId: selectedPlanId,
        plan: updatedPlanName ?? selectedPlan?.planName ?? prev.plan,
      }));
      setShowPlanEditor(false);
    } catch {
      setPlanError("Unable to update the plan. Please try again.");
    } finally {
      setIsPlanSaving(false);
    }
  };

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const picked = files[0];
    setFormData((prev) => ({ ...prev, [name]: picked }));
    e.target.value = "";
  };

  const removeFile = (name: FileField) => {
    setFormData((prev) => ({ ...prev, [name]: null }));
  };

  const next = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const previous = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const tenantId = getObjectId(tenant.tenantId);
    if (!tenantId) {
      setFailureMessage(
        "Tenant ID is missing. Please refresh the tenant list and try again.",
      );
      return;
    }

    const updateTenantUrl =
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.UPDATE_TENANT}`.replace(
        "{tenantId}",
        tenantId,
      );
    const payload: TenantUpdatePayload = {
      tenantName: formData.companyName,
      domain: formData.domain,
      email: formData.email,
      phoneNumber: formData.phone,
      gstNo: formData.gstNo,
      panNo: formData.panNo,
      faxNo: formData.faxNo,
      website: formData.website,
      timeZone: formData.timeZone,
      planId: formData.planId,
      status: formData.status,
      plan: formData.plan,
      currency: formData.currency,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      street: formData.street,
      landMark: formData.landMark,
      pincode: formData.pincode,
      comments: formData.comments,
      companyRegistrationCertificate: formData.companyRegistrationCertificate,
    };

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("SuperAdminAuthToken");

      const requestData = new FormData();
      requestData.append("tenantName", formData.companyName);
      requestData.append("organizationName", formData.companyName);
      requestData.append("mobileNumber", formData.phone);
      requestData.append("phoneNumber", formData.phone);
      requestData.append("emailId", formData.email);
      requestData.append("email", formData.email);
      requestData.append("domainName", formData.domain);
      requestData.append("domain", formData.domain);
      requestData.append("gstNo", formData.gstNo);
      requestData.append("panNo", formData.panNo);
      requestData.append("faxNo", formData.faxNo);
      requestData.append("website", formData.website);
      requestData.append("status", formData.status);
      requestData.append("timeZone", formData.timeZone);
      requestData.append("plan", formData.plan);
      requestData.append("planId", formData.planId);
      requestData.append("currency", formData.currency);
      requestData.append("country", formData.country);
      requestData.append("state", formData.state);
      requestData.append("city", formData.city);
      requestData.append("street", formData.street);
      requestData.append("landMark", formData.landMark);
      requestData.append("pincode", formData.pincode);
      requestData.append("postalCode", formData.pincode);
      requestData.append("comments", formData.comments);
      requestData.append("adminName", formData.adminName);
      requestData.append("adminEmail", formData.adminEmail);
      requestData.append("adminPhone", formData.adminPhone);
      requestData.append("designation", "Tenant Admin");
      requestData.append("tenantBackup", String(formData.tenantBackup));

      if (formData.logo) {
        requestData.append("tenantLogo", formData.logo, formData.logo.name);
      }
      if (formData.registrationCertificate) {
        requestData.append(
          "companyRegistrationCertificate",
          formData.registrationCertificate,
          formData.registrationCertificate.name,
        );
      } else if (formData.companyRegistrationCertificate) {
        requestData.append(
          "companyRegistrationCertificate",
          formData.companyRegistrationCertificate,
        );
      }
      if (formData.gstCertificate) {
        requestData.append(
          "gstCertificate",
          formData.gstCertificate,
          formData.gstCertificate.name,
        );
      }
      if (formData.addressProof) {
        requestData.append(
          "addressProof",
          formData.addressProof,
          formData.addressProof.name,
        );
      }

      await axios.put(
        updateTenantUrl,
        requestData,
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      );

      setPendingPayload(payload);
      setSuccessMessage("Tenant updated successfully.");
    } catch (error: unknown) {
      const responseMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
        : error instanceof Error
          ? error.message
          : "Unable to update tenant. Please try again.";

      setFailureMessage(responseMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-scroll scrollbar-thin bg-black/70 p-3 sm:p-5">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-md bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)] dark:bg-[#252525] sm:max-h-[calc(100dvh-2.5rem)]">
        <div className="relative shrink-0 p-2">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-black dark:text-[#ccc] dark:hover:bg-[#343434] dark:hover:text-[#ccc]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none p-4 px-4 sm:px-6">
          <div className="mb-6 px-0 pb-1 pt-1">
            <div className="grid grid-cols-4 place-items-center">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isDone = currentStep >= stepNumber;

                return (
                  <div key={step}>
                    <div
                      aria-current={
                        currentStep === stepNumber ? "step" : undefined
                      }
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-semibold transition-colors ${
                        isDone
                          ? "bg-[#576CBC] text-white"
                          : "bg-[#D9D9D9] text-[#666] dark:bg-[#4A4A4A] dark:text-gray-300"
                      }`}
                    >
                      {stepNumber}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="h-[5px] overflow-hidden rounded-full bg-[#D9D9D9] dark:bg-[#343434]"
                >
                  <div
                    className={`h-full rounded-full bg-[#576CBC] transition-all duration-300 ${currentStep >= index + 1 ? "w-full" : "w-0"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {currentStep === 1 && (
            <div>
              <h3 className={`${sectionTitle} mb-4`}>Basic Information</h3>
              <div className="mb-5 border-b border-[#D9DDE8] dark:border-[#5c5c5c]" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInput}
                  placeholder="Enter company name"
                  required
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInput}
                  placeholder="name@company.com"
                  required
                />

                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInput}
                  placeholder="+91 XXXXX XXXXX"
                />

                <TextField
                  label="Domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInput}
                  placeholder="company.com"
                />

                <TextField
                  label="GST No"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleInput}
                  placeholder="Enter GST number"
                />

                <TextField
                  label="PAN No"
                  name="panNo"
                  value={formData.panNo}
                  onChange={handleInput}
                  placeholder="Enter PAN number"
                />

                <TextField
                  label="FAX No"
                  name="faxNo"
                  value={formData.faxNo}
                  onChange={handleInput}
                  placeholder="Enter fax number"
                />

                <TextField
                  label="Website URL"
                  name="website"
                  value={formData.website}
                  onChange={handleInput}
                  placeholder="https://example.com"
                />

                <TextField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInput}
                  placeholder="Enter status"
                />

                <TextField
                  label="Time Zone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleInput}
                  placeholder="Enter time zone"
                />

                <div>
                  {formData.status.trim().toLowerCase() === "trial" ? (
                    <TextField
                      label="Plan"
                      name="plan"
                      value={formData.plan}
                      onChange={() => {}}
                      placeholder="Select plan"
                      disabled
                      title="Plans are unavailable for Trial tenants. You cannot select a plan while the status is Trial."
                    />
                  ) : (
                    <SelectField
                      label="Plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInput}
                      placeholder={
                        isPlanLoading ? "Loading plans..." : "Select plan"
                      }
                      options={availablePlans.map((p) => p.planName)}
                      disabled={isPlanLoading}
                    />
                  )}

                  {formData.status.trim().toLowerCase() !== "trial" && (
                    <button
                      type="button"
                      onClick={openPlanEditor}
                      className="mt-2 text-xs font-medium text-[#5967E8] hover:underline"
                    >
                      Update Plan
                    </button>
                  )}
                </div>

                <TextField
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInput}
                  placeholder=""
                />
              </div>

              <label className="mt-5 flex w-fit cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="tenantBackup"
                  checked={formData.tenantBackup}
                  onChange={handleInput}
                  className="h-4 w-4 cursor-pointer rounded accent-[#576CBC]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Enable Tenant Backup
                </span>
              </label>

              <h3 className={`${sectionTitle} mb-4 mt-7`}>Address</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInput}
                  placeholder="Select country"
                />

                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInput}
                  placeholder="Select state"
                />

                <SelectField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInput}
                  placeholder="Select city"
                  options={["Coimbatore", "Chennai", "Bengaluru", "Mumbai"]}
                />

                <TextField
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleInput}
                  placeholder="Enter street address"
                />

                <TextField
                  label="Landmark"
                  name="landMark"
                  value={formData.landMark}
                  onChange={handleInput}
                  placeholder="Enter landmark"
                />

                <TextField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInput}
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className={`${sectionTitle} mb-4`}>Upload Documents</h3>
              <div className="mb-5 border-b border-[#D9DDE8] dark:border-[#5c5c5c]" />

              <div className="mb-6 space-y-2 rounded-lg bg-[#EEF2FF] p-4 dark:bg-[#5967E8]/10">
                <div className="flex items-center gap-3">
                  <CloudUpload size={16} className="shrink-0 text-[#5967E8]" />
                  <span className="text-sm text-[#374151] dark:text-gray-200">
                    Upload the documents required to update this tenant account.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Info size={16} className="shrink-0 text-[#5967E8]" />
                  <span className="text-sm text-[#374151] dark:text-gray-200">
                    Accepted formats: PDF, JPG, PNG (max 5 MB each)
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <UploadRow
                  title="Logo"
                  name="logo"
                  file={formData.logo}
                  onUpload={handleFileUpload}
                  onRemove={removeFile}
                />
                <UploadRow
                  title="Company Registration Certificate"
                  name="registrationCertificate"
                  file={formData.registrationCertificate}
                  onUpload={handleFileUpload}
                  onRemove={removeFile}
                />
                <UploadRow
                  title="GST Certificate"
                  name="gstCertificate"
                  file={formData.gstCertificate}
                  onUpload={handleFileUpload}
                  onRemove={removeFile}
                />
                <UploadRow
                  title="Address Proof"
                  name="addressProof"
                  file={formData.addressProof}
                  onUpload={handleFileUpload}
                  onRemove={removeFile}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className={`${sectionTitle} mb-4`}>Review Details</h3>
              <div className="mb-6 border-b border-gray-200 dark:border-[#4A4A4A]" />

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Tenant Information
                  </h4>

                  <div className="space-y-3">
                    <ReviewRow
                      label="Company Name"
                      value={formData.companyName}
                    />
                    <ReviewRow label="Email" value={formData.email} />
                    <ReviewRow label="Phone" value={formData.phone} />
                    <ReviewRow label="Domain" value={formData.domain} />
                    <ReviewRow label="Plan" value={formData.plan} />
                    <ReviewRow label="Time Zone" value={formData.timeZone} />
                    <ReviewRow label="Currency" value={formData.currency} />
                    <ReviewRow
                      label="Address"
                      value={[formData.city, formData.state, formData.country]
                        .filter(Boolean)
                        .join(", ")}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Documents
                  </h4>

                  <div className="space-y-3">
                    <DocumentRow file={formData.logo} />
                    <DocumentRow file={formData.registrationCertificate} />
                    <DocumentRow file={formData.gstCertificate} />
                    <DocumentRow file={formData.addressProof} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className={`${sectionTitle} mb-1`}>Invite Tenant Admin</h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Update the primary administrator account for this tenant.
              </p>

              <div className="mb-5 border-b border-[#D9DDE8] dark:border-[#5c5c5c]" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Admin Name"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInput}
                  placeholder="Enter full name"
                  required
                />

                <TextField
                  label="Admin Email"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleInput}
                  placeholder="admin@company.com"
                  required
                />

                <TextField
                  label="Designation"
                  name="designation"
                  value="Tenant Admin"
                  onChange={() => {}}
                  disabled
                />

                <TextField
                  label="Phone Number"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleInput}
                  placeholder="+91 XXXXX XXXXX"
                />

                <div className="sm:col-span-2">
                  <label htmlFor="comments" className={labelBase}>
                    Comments
                  </label>

                  <textarea
                    id="comments"
                    name="comments"
                    rows={3}
                    value={formData.comments}
                    onChange={handleInput}
                    placeholder="Share your comments"
                    className={`${fieldBase} h-auto resize-none py-3`}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-gray-200 bg-[#F8F9FF] p-4 dark:border-[#4A4A4A] dark:bg-[#2C2C2C]">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Update the invitation details for the tenant administrator.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-[#D9DDE8] p-4 dark:border-[#5c5c5c]">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : previous}
            className="flex h-[40px] items-center gap-1 rounded-[9px] border border-[#D9DDE8] bg-white px-4 text-[12px] font-medium text-[#0f172a] transition hover:bg-[#F6F8FF] dark:border-[#5c5c5c] dark:bg-[#343434] dark:text-[#f3f4f6] dark:hover:bg-[#3d3d3d]"
          >
            {currentStep !== 1 && <ChevronLeft size={16} />}
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          <button
            type="button"
            onClick={currentStep === totalSteps ? handleSubmit : next}
            disabled={currentStep === totalSteps && isSubmitting}
            className="flex h-[40px] items-center gap-1 rounded-[10px] bg-[#576CBC] px-5 text-[12px] font-medium text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {currentStep === totalSteps
              ? isSubmitting
                ? "Saving..."
                : "Save Changes"
              : "Next"}
            {currentStep !== totalSteps && <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {showPlanEditor && formData.status.trim().toLowerCase() !== "trial" && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-[#343434]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Plan
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a new subscription plan for this tenant.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close update plan dialog"
                onClick={() => setShowPlanEditor(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#4A4A4A]"
              >
                <X size={20} />
              </button>
            </div>

            <label htmlFor="update-plan" className={labelBase}>
              Available plans
            </label>
            <select
              id="update-plan"
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              disabled={isPlanLoading || isPlanSaving}
              className={`${fieldBase} mt-2`}
            >
              <option value="">
                {isPlanLoading ? "Loading plans..." : "Select plan"}
              </option>
              {availablePlans.map((plan) => (
                <option key={plan.planId} value={plan.planId}>
                  {plan.planName}
                </option>
              ))}
            </select>

            {planError && (
              <p className="mt-2 text-sm text-red-500">{planError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPlanEditor(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-[#4A4A4A] dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePlanUpdate}
                disabled={!selectedPlanId || isPlanLoading || isPlanSaving}
                className="rounded-lg bg-[#5967E8] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A57D4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlanSaving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && pendingPayload && (
        <SuccessPopup
          title={successMessage}
          message={successMessage}
          onClose={() => {
            onSave(pendingPayload);
            setPendingPayload(null);
            setSuccessMessage("");
          }}
        />
      )}

      {failureMessage && (
        <FailedPopup
          title={failureMessage}
          onClose={() => setFailureMessage("")}
        />
      )}
    </div>
  );
}
