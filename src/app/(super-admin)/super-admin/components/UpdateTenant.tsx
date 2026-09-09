"use client";

import { useState } from "react";
import axios from "axios";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
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

const getObjectId = (value: unknown): string => {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const objectValue = value as { $oid?: unknown };
    return typeof objectValue.$oid === "string" ? objectValue.$oid : "";
  }

  return "";
};

const fieldBase =
  "w-full h-11 rounded-lg border px-4 text-sm outline-none transition " +
  "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 " +
  "focus:border-[#5967E8] focus:ring-2 focus:ring-[#5967E8]/25 " +
  "dark:border-[#4A4A4A] dark:bg-[#2C2C2C] dark:text-gray-100 dark:placeholder:text-gray-500";

const labelBase =
  "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200";
const sectionTitle = "text-base font-semibold text-gray-900 dark:text-white";

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

  const openPlanEditor = async () => {
    setShowPlanEditor(true);
    setPlanError("");

    if (availablePlans.length > 0) return;

    try {
      setIsPlanLoading(true);
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.PLAN_TABLE}`,
      );
      const responseData = response.data?.data ?? response.data;
      const plans = Array.isArray(responseData)
        ? responseData
        : (responseData?.plans ?? responseData?.items ?? []);

      const normalizedPlans = plans
        .map((plan: { _id?: string; planName?: string; name?: string }) => ({
          planId: plan._id ?? "",
          planName: plan.planName ?? plan.name ?? "Unnamed plan",
        }))
        .filter((plan: AvailablePlan) => plan.planId);

      setAvailablePlans(normalizedPlans);
      const currentPlan = normalizedPlans.find(
        (plan: AvailablePlan) =>
          plan.planName.trim().toLowerCase() ===
          formData.plan.trim().toLowerCase(),
      );
      if (currentPlan) setSelectedPlanId(currentPlan.planId);
    } catch {
      setPlanError("Unable to load plans. Please try again.");
    } finally {
      setIsPlanLoading(false);
    }
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

  const handleSubmit = () => {
    onSave({
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
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="flex h-[92vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#343434]">
        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-[#4A4A4A] sm:px-8 sm:py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Update Tenant
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the tenant information and save the latest changes.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-[#4A4A4A] dark:hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="mb-7 flex items-center">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isDone = currentStep >= stepNumber;
              const isLast = index === steps.length - 1;

              return (
                <div
                  key={step}
                  className={`flex items-center ${isLast ? "" : "flex-1"}`}
                >
                  <div
                    aria-current={
                      currentStep === stepNumber ? "step" : undefined
                    }
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isDone
                        ? "bg-[#5967E8] text-white"
                        : "bg-[#D9D9D9] text-[#666] dark:bg-[#4A4A4A] dark:text-gray-300"
                    }`}
                  >
                    {stepNumber}
                  </div>

                  {!isLast && (
                    <div
                      className={`mx-2 h-[3px] flex-1 rounded-full transition-colors ${
                        currentStep > stepNumber
                          ? "bg-[#5967E8]"
                          : "bg-gray-200 dark:bg-[#4A4A4A]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {currentStep === 1 && (
            <div>
              <h3 className={`${sectionTitle} mb-4`}>Basic Information</h3>
              <div className="mb-6 border-b border-gray-200 dark:border-[#4A4A4A]" />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
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
                      placeholder="Select plan"
                      options={["Basic", "Standard", "Premium", "Enterprise"]}
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

              <label className="mt-6 flex w-fit cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="tenantBackup"
                  checked={formData.tenantBackup}
                  onChange={handleInput}
                  className="h-[18px] w-[18px] cursor-pointer rounded accent-[#5967E8]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Enable Tenant Backup
                </span>
              </label>

              <h3 className={`${sectionTitle} mb-4 mt-8`}>Address</h3>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
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
                  name="landmark"
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
              <div className="mb-5 border-b border-gray-200 dark:border-[#4A4A4A]" />

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

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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

              <div className="mb-6 border-b border-gray-200 dark:border-[#4A4A4A]" />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
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

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-[#4A4A4A] sm:px-8">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : previous}
            className="flex items-center gap-1 rounded-lg border border-[#5967E8] px-6 py-2 text-sm font-medium text-[#5967E8] transition hover:bg-[#5967E8]/5"
          >
            {currentStep !== 1 && <ChevronLeft size={16} />}
            {currentStep === 1 ? "Cancel" : "Back"}
          </button>

          <button
            type="button"
            onClick={currentStep === totalSteps ? handleSubmit : next}
            className="flex items-center gap-1 rounded-lg bg-[#5967E8] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#4A57D4]"
          >
            {currentStep === totalSteps ? "Save Changes" : "Next"}
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
    </div>
  );
}
