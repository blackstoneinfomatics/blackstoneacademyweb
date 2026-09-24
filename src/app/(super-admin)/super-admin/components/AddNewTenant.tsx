"use client";

import { useEffect, useState } from "react";
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
import axios from "axios";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";
import type { ICountry, IState, ICity } from "country-state-city";
import { allTimezones } from "react-timezone-select";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import {
  AppFailureToastMessages,
  AppSuccessToastMessages,
} from "@/app/_components/contents/toast_message";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Props = {
  readonly onClose: () => void;
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
  plan: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  street: string;
  landmark: string;
  pincode: string;
  tenantBackup: boolean;
  logo: File | null;
  gstCertificate: File | null;
  registrationCertificate: File | null;
  addressProof: File | null;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
};

type FileField =
  | "logo"
  | "gstCertificate"
  | "registrationCertificate"
  | "addressProof";

/* ------------------------------------------------------------------ */
/* Country -> Time Zone / State -> City data (country-state-city +    */
/* react-timezone-select packages)                                    */
/* ------------------------------------------------------------------ */

const ALL_COUNTRIES: ICountry[] = Country.getAllCountries();

const TIME_ZONE_OPTIONS = Array.from(
  new Set([
    ...Object.keys(allTimezones),
    ...ALL_COUNTRIES.flatMap(
      (country) => country.timezones?.map((tz) => tz.zoneName) ?? [],
    ),
  ]),
).sort();

const getStatesForCountry = (countryName: string): IState[] => {
  const country = ALL_COUNTRIES.find((c) => c.name === countryName);
  return country ? State.getStatesOfCountry(country.isoCode) : [];
};

const getCitiesForState = (countryName: string, stateName: string): ICity[] => {
  const country = ALL_COUNTRIES.find((c) => c.name === countryName);
  if (!country) return [];

  const state = getStatesForCountry(countryName).find(
    (s) => s.name === stateName,
  );

  return state ? City.getCitiesOfState(country.isoCode, state.isoCode) : [];
};

/* ------------------------------------------------------------------ */
/* Subscription plans (GET /plans)                                    */
/* ------------------------------------------------------------------ */

type AvailablePlan = {
  planId: string;
  planName: string;
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

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
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
        className={`${fieldBase} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
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
            value
              ? ""
              : "text-[#010e30] dark:text-gray-500 placeholder:text-[#343e59] dark:placeholder:text-[#8a93a6]"
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
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
  accept,
  onUpload,
  onRemove,
}: {
  title: string;
  name: FileField;
  file: File | null;
  accept?: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (name: FileField) => void;
}) {
  console.log("[UploadRow render]", name, "file =", file);

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

          <input
            hidden
            type="file"
            name={name}
            accept={accept}
            onChange={onUpload}
          />
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

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function AddNewTenant({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsPlansLoading(true);
        setAvailablePlans(await fetchAvailablePlans());
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setIsPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

  const [formData, setFormData] = useState<TenantFormData>({
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
    plan: "",
    currency: "",
    country: "",
    state: "",
    city: "",
    street: "",
    landmark: "",
    pincode: "",
    tenantBackup: false,
    logo: null,
    gstCertificate: null,
    registrationCertificate: null,
    addressProof: null,
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  const steps = [
    "Basic Information",
    "Upload Documents",
    "Review",
    "Invite Admin",
  ];
  const totalSteps = steps.length;

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

    if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        status: value,
        plan: value === "Trial" ? "" : prev.plan,
      }));

      return;
    }

    if (name === "country") {
      const country = ALL_COUNTRIES.find((c) => c.name === value);

      setFormData((prev) => ({
        ...prev,
        country: value,
        timeZone: country?.timezones?.[0]?.zoneName ?? "",
        state: "",
        city: "",
      }));

      return;
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, state: value, city: "" }));

      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    console.log(
      "[handleFileUpload] RAW EVENT — name:",
      name,
      "files:",
      files,
      "files.length:",
      files?.length,
      "files[0]:",
      files?.[0],
    );

    if (!files || files.length === 0) {
      console.log("[handleFileUpload] bailing out — no files. name:", name);
      return;
    }

    const picked = files[0];

    console.log(
      "[handleFileUpload] about to setFormData — name:",
      name,
      "picked:",
      picked,
      "picked is File:",
      picked instanceof File,
    );

    setFormData((prev) => ({ ...prev, [name]: picked }));

    toast.success(AppSuccessToastMessages.DOCUMENT_UPLOADED);

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

    setIsSubmitting(true);

    try {
      // The backend route only allows multipart/form-data and reads the
      // uploaded filename off each file part's `.hapi.filename`, so files
      // must be sent as real File parts, not plain strings.
      const fd = new FormData();

      fd.append("tenantName", formData.companyName);
      if (formData.logo)
        fd.append("tenantLogo", formData.logo, formData.logo.name);
      fd.append("mobileNumber", formData.phone);
      fd.append("organizationName", formData.companyName);
      fd.append("phoneNumber", formData.phone);
      fd.append("state", formData.state || "");
      fd.append("city", formData.city || "");
      fd.append("street", formData.street || "");
      fd.append("country", formData.country || "");
      if (formData.registrationCertificate)
        fd.append(
          "companyRegistrationCertificate",
          formData.registrationCertificate,
          formData.registrationCertificate.name,
        );
      if (formData.addressProof)
        fd.append(
          "addressProof",
          formData.addressProof,
          formData.addressProof.name,
        );
      if (formData.gstCertificate)
        fd.append(
          "gstCertificate",
          formData.gstCertificate,
          formData.gstCertificate.name,
        );
      // Plan is hidden/cleared on the form when Status is "Trial" (see
      // handleInput), but the backend's Tenants schema still requires a
      // non-empty plan value - fall back to "Trial" so that submission
      // isn't rejected for a field the user was never shown.
      fd.append(
        "plan",
        formData.plan || (formData.status === "Trial" ? "Trial" : ""),
      );
      fd.append("timeZone", formData.timeZone || "");
      fd.append("currency", formData.currency || "");
      fd.append("emailId", formData.email || "");
      fd.append("faxNo", formData.faxNo || "");
      fd.append("gstNo", formData.gstNo || "");
      fd.append("panNo", formData.panNo || "");
      fd.append("postalCode", formData.pincode || "");
      fd.append("tenantJobCode", `TENANT-${Date.now()}`);
      fd.append("website", formData.website || "");
      fd.append("domainName", formData.domain || "");
      fd.append("status", formData.status || "");
      fd.append("createdBy", formData.adminName || "");
      fd.append("lastUpdatedBy", formData.adminName || "");
      fd.append("adminName", formData.adminName || "");
      fd.append("adminEmail", formData.adminEmail || "");
      fd.append("designation", "Tenant Admin");
      fd.append("comments", formData.comments || "");

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.CREATE_TENANT}`,
        fd,
        { timeout: 30000 },
      );

      console.log("Create tenant response:", response.data);

      setSuccessMessage(AppSuccessToastMessages.SUPER_ADMIN_TENANT_FAMILY);
      setSuccess(true);
    } catch (err: any) {
      console.error("Create tenant error:", err);

      setFailedMessage(
        err.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : err.response?.data?.message ||
              AppFailureToastMessages.SUPER_ADMIN_TENANT_CREATE,
      );

      setFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-scroll scrollbar-thin bg-black/70 p-3 sm:p-5">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-md bg-white shadow-[0_20px_50px_rgba(15,23,42,0.22)] dark:bg-[#252525] sm:max-h-[calc(100dvh-2.5rem)]">
        {/* ---------------- Header ---------------- */}
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

        {/* ---------------- Body ---------------- */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none p-4 px-4 sm:px-6">
          {/* Stepper */}
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

          {/* ================= STEP 1 ================= */}
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

                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInput}
                  placeholder="Select status"
                  options={["Active", "Inactive", "Trial"]}
                />

                <SelectField
                  label="Time Zone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleInput}
                  placeholder="Select country first"
                  options={TIME_ZONE_OPTIONS}
                />

                {formData.status !== "Trial" && (
                  <SelectField
                    label="Plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleInput}
                    placeholder={
                      isPlansLoading ? "Loading plans..." : "Select plan"
                    }
                    options={availablePlans.map((p) => p.planName)}
                    disabled={isPlansLoading}
                  />
                )}

                <SelectField
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInput}
                  placeholder="Select currency"
                  options={["INR", "USD", "EUR", "GBP"]}
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
                <SelectField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInput}
                  placeholder="Select country"
                  options={ALL_COUNTRIES.map((c) => c.name)}
                />

                <SelectField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInput}
                  placeholder={
                    formData.country ? "Select state" : "Select country first"
                  }
                  options={getStatesForCountry(formData.country).map(
                    (s) => s.name,
                  )}
                  disabled={!formData.country}
                />

                <SelectField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInput}
                  placeholder={
                    formData.state ? "Select city" : "Select state first"
                  }
                  options={getCitiesForState(
                    formData.country,
                    formData.state,
                  ).map((c) => c.name)}
                  disabled={!formData.state}
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
                  value={formData.landmark}
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

          {/* ================= STEP 2 ================= */}
          {currentStep === 2 && (
            <div>
              <h3 className={`${sectionTitle} mb-4`}>Upload Documents</h3>

              <div className="mb-5 border-b border-[#D9DDE8] dark:border-[#5c5c5c]" />

              <div className="mb-5 space-y-2 rounded-[10px] bg-[#E9EDFF] p-4 dark:bg-[#576CBC]/10">
                <div className="flex items-center gap-3">
                  <CloudUpload size={16} className="shrink-0 text-[#5967E8]" />

                  <span className="text-sm text-[#374151] dark:text-gray-200">
                    Upload the documents required to create this tenant account.
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

          {/* ================= STEP 3 ================= */}
          {currentStep === 3 && (
            <div>
              <h3 className={`${sectionTitle} mb-4`}>Review Details</h3>

              <div className="mb-5 border-b border-[#D9DDE8] dark:border-[#5c5c5c]" />

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

          {/* ================= STEP 4 ================= */}
          {currentStep === 4 && (
            <div>
              <h3 className={`${sectionTitle} mb-1`}>Invite Tenant Admin</h3>

              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Create the primary administrator account for this tenant.
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
                  An invitation email will be sent to the tenant administrator
                  once you send the invite.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- Footer ---------------- */}
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
                ? "Sending..."
                : "Send Invite"
              : "Next"}

            {currentStep !== totalSteps && <ChevronRight size={16} />}
          </button>
        </div>

        {success && (
          <SuccessPopup
            onClose={() => setSuccess(false)}
            title={successMessage}
          />
        )}

        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </div>
    </div>
  );
}
