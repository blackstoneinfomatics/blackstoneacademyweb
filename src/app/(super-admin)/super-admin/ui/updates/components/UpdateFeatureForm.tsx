"use client";

import { useState } from "react";
import { IoChevronDown, IoClose } from "react-icons/io5";
import { LuCalendarDays, LuUpload } from "react-icons/lu";
import { FaInfoCircle } from "react-icons/fa";
import type {
  Plan,
  ProductUpdate,
  Tenant,
  UpdateFeaturePayload,
  UpdatePriority,
} from "../types";

interface UpdateFeatureFormProps {
  update: ProductUpdate;
  // Replace these with your Plan List / Tenant List API responses.
  plans?: Plan[];
  tenants?: Tenant[];
  totalTenantCount?: number;
  onClose?: () => void;
  onSubmit?: (payload: UpdateFeaturePayload) => void;
}

const DEFAULT_PLANS: Plan[] = [
  { planId: "PLAN-001", planName: "Standard" },
  { planId: "PLAN-002", planName: "Premium" },
  { planId: "PLAN-003", planName: "Basic" },
];

const DEFAULT_TENANTS: Tenant[] = [
  { tenantId: "TEN-001", tenantName: "Blackstone Academy" },
  { tenantId: "TEN-002", tenantName: "ABC Academy" },
  { tenantId: "TEN-003", tenantName: "XYZ College" },
];

export default function UpdateFeatureForm({
  update,
  plans = DEFAULT_PLANS,
  tenants = DEFAULT_TENANTS,
  totalTenantCount = 288,
  onClose,
  onSubmit,
}: UpdateFeatureFormProps) {
  // ---------------------------------------------------------
  // Form States - initialized from the update being edited
  // ---------------------------------------------------------

  const [title, setTitle] = useState(update.title);
  const [category, setCategory] = useState(update.category || "Feature Release");
  const [description, setDescription] = useState(update.description);
  const [publishDate, setPublishDate] = useState(update.releaseDate);
  const [priority, setPriority] = useState<UpdatePriority>(update.priority);

  const [allTenants, setAllTenants] = useState(update.audience === "All Tenants");
  const [selectTenants, setSelectTenants] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");

  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(false);

  // ---------------------------------------------------------
  // Plan Checkbox
  // ---------------------------------------------------------

  const handlePlanChange = (planId: string) => {
    setSelectedPlans((previous) => {
      if (previous.includes(planId)) {
        return previous.filter((id) => id !== planId);
      }

      return [...previous, planId];
    });
  };

  // ---------------------------------------------------------
  // All Tenants
  // ---------------------------------------------------------

  const handleAllTenantsChange = (checked: boolean) => {
    setAllTenants(checked);

    if (checked) {
      setSelectTenants(false);
      setSelectedTenant("");
      setSelectedPlans([]);
    }
  };

  // ---------------------------------------------------------
  // Select Tenants
  // ---------------------------------------------------------

  const handleSelectTenantsChange = (checked: boolean) => {
    setSelectTenants(checked);

    if (checked) {
      setAllTenants(false);
    }
  };

  const audienceSummary = allTenants
    ? "All Tenants"
    : selectTenants && selectedTenant
      ? (tenants.find((t) => t.tenantId === selectedTenant)?.tenantName ?? "Selected Tenant")
      : selectedPlans.length > 0
        ? plans
            .filter((plan) => selectedPlans.includes(plan.planId))
            .map((plan) => plan.planName)
            .join(", ")
        : update.audience;

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  const handlePublish = () => {
    onSubmit?.({
      updateId: update.updateId,
      title,
      category,
      description,
      publishDate,
      priority,
      audience: audienceSummary,
      sendEmail,
      sendInApp,
    });
  };

  return (
    <div className="w-full max-w-[640px] rounded-md bg-white dark:bg-[#343434] p-4 shadow-sm">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-[#172554] dark:text-white">
          Update Feature
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="text-[#9CA3AF] hover:text-[#172554] dark:hover:text-white"
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* =====================================================
          TITLE + CATEGORY
      ====================================================== */}

      <div className="grid grid-cols-2 gap-3">
        {/* Title */}

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Update Title"
            className="h-[34px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
          />
        </div>

        {/* Category */}

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Category
          </label>

          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[34px] w-full appearance-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 pr-7 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
            >
              <option value="Feature Release">Feature Release</option>
              <option value="Bug Fix">Bug Fix</option>
              <option value="Announcement">Announcement</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            <IoChevronDown
              size={15}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#596579] dark:text-[#B5B5B5]"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          AUDIENCE
      ====================================================== */}

      <div className="mt-3">
        <label className="mb-2 block text-[12px] font-medium text-[#172554] dark:text-white">
          Audience
        </label>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {/* All Tenants */}

          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
            <input
              type="checkbox"
              checked={allTenants}
              onChange={(e) => handleAllTenantsChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#576CBC]"
            />

            <span>All Tenants</span>
          </label>

          {/* Select Tenants */}

          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
            <input
              type="checkbox"
              checked={selectTenants}
              onChange={(e) => handleSelectTenantsChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#576CBC]"
            />

            <span>Select Tenants</span>
          </label>

          {/* =================================================
              DYNAMIC PLANS
          ================================================== */}

          {plans.map((plan) => (
            <label
              key={plan.planId}
              className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]"
            >
              <input
                type="checkbox"
                checked={selectedPlans.includes(plan.planId)}
                onChange={() => handlePlanChange(plan.planId)}
                className="h-3.5 w-3.5 accent-[#576CBC]"
              />

              <span>{plan.planName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* =====================================================
          SELECT TENANTS
          Only displayed when Select Tenants is checked
      ====================================================== */}

      {selectTenants && (
        <div className="mt-3">
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Select Tenants
          </label>

          <div className="relative">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="h-[34px] w-full appearance-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 pr-7 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
            >
              <option value="">Select Tenants</option>

              {tenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName}
                </option>
              ))}
            </select>

            <IoChevronDown
              size={15}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#596579] dark:text-[#B5B5B5]"
            />
          </div>
        </div>
      )}

      {/* =====================================================
          INFORMATION MESSAGE
      ====================================================== */}

      <div className="mt-3 flex items-center gap-2 rounded bg-[#E5ECFF] dark:bg-[#36477e33] px-3 py-2.5 text-[12px] text-[#304674] dark:text-[#C7D2FE]">
        <FaInfoCircle size={13} className="shrink-0 text-[#576CBC]" />

        <span>
          {allTenants
            ? `This Updates will be sent to all tenants (${totalTenantCount} tenants)`
            : selectTenants
              ? "This Updates will be sent to the selected tenant"
              : selectedPlans.length > 0
                ? `This Updates will be sent to ${selectedPlans.length} selected plan${selectedPlans.length > 1 ? "s" : ""}`
                : "Please select an audience"}
        </span>
      </div>

      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      <div className="mt-3">
        <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Today Update day"
          className="h-[100px] w-full resize-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] p-2 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC] placeholder:text-[#A5AAB4] dark:placeholder:text-[#7A7A7A]"
        />
      </div>

      {/* =====================================================
          PUBLISH DATE + PRIORITY
      ====================================================== */}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Publish Date */}

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Publish Date
          </label>

          <div className="relative">
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="h-[34px] w-full rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 pr-8 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
            />

            <LuCalendarDays
              size={15}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#596579] dark:text-[#B5B5B5]"
            />
          </div>
        </div>

        {/* Priority */}

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Priority
          </label>

          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as UpdatePriority)}
              className="h-[34px] w-full appearance-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 pr-7 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <IoChevronDown
              size={15}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#596579] dark:text-[#B5B5B5]"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          ATTACHMENT + NOTIFICATION
      ====================================================== */}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Attachments */}

        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Attachments
          </label>

          <div className="flex h-[34px] items-center justify-between rounded border border-[#D9DDE5] dark:border-[#4A4A4A] px-2">
            <span className="text-[12px] text-[#596579] dark:text-[#B5B5B5]">File</span>

            <label className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#576CBC]">
              <LuUpload size={13} />
              <span>Upload</span>
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>

        {/* Sent Notification */}

        <div>
          <label className="mb-2 block text-[12px] font-medium text-[#172554] dark:text-white">
            Sent Notification
          </label>

          <div className="flex items-center gap-4">
            {/* Email */}

            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#576CBC]"
              />
              <span>Email</span>
            </label>

            {/* In App */}

            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                checked={sendInApp}
                onChange={(e) => setSendInApp(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#576CBC]"
              />
              <span>In-App Notification</span>
            </label>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="mt-3 flex justify-end border-t border-[#E5E7EB] dark:border-[#4A4A4A] pt-2">
        <button
          type="button"
          onClick={handlePublish}
          className="rounded-md bg-[#576CBC] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-[#4C60AE]"
        >
          Publish Update
        </button>
      </div>
    </div>
  );
}
