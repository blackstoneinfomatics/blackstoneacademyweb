"use client";

import { useEffect, useState } from "react";
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
  plans?: Plan[];
  tenants?: Tenant[];
  totalTenantCount?: number;
  onClose?: () => void;
  onSubmit?: (payload: UpdateFeaturePayload) => void;
}

const TENANTS_API = "http://localhost:5001/tenant";

const FALLBACK_PLANS: Plan[] = [
  { planId: "PLAN-001", planName: "Standard" },
  { planId: "PLAN-002", planName: "Premium" },
  { planId: "PLAN-003", planName: "Basic" },
];

// ✅ Extract existing tenant names from the current update
const getExistingTenantNames = (update: ProductUpdate): string[] => {
  const anyUpdate = update as any;

  // Preferred field
  if (Array.isArray(anyUpdate.rawSelectedTenants)) {
    return anyUpdate.rawSelectedTenants.filter(Boolean);
  }

  // Fallback: parse from audience string "Blackstone Academy, JAS Academy (2)"
  if (typeof update.audience === "string" && update.audience.includes(",")) {
    return update.audience
      .replace(/\s*\(\d+\)\s*$/, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
};

export default function UpdateFeatureForm({
  update,
  plans: externalPlans,
  tenants: externalTenants,
  totalTenantCount = 288,
  onClose,
  onSubmit,
}: UpdateFeatureFormProps) {
  const [title, setTitle] = useState(update.title);
  const [category, setCategory] = useState(update.category || "Feature Release");
  const [description, setDescription] = useState(update.description);
  const [publishDate, setPublishDate] = useState(update.releaseDate);
  const [priority, setPriority] = useState<UpdatePriority>(update.priority);

  // ✅ Preserve the existing audience from the update being edited
  const existingTenantNames = getExistingTenantNames(update);
  const wasAllTenants = update.audience === "All Tenants" ||
    (update as any).rawAudience?.some((a: string) =>
      a.toLowerCase().includes("all tenant"),
    );

  const [allTenants, setAllTenants] = useState(!!wasAllTenants);

  // ✅ Start with selectTenants ON if there were already tenants selected
  const [selectTenants, setSelectTenants] = useState(
    !wasAllTenants && existingTenantNames.length > 0,
  );

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  // ✅ Newly added tenants in this edit session (added on top of existing)
  const [newTenantIds, setNewTenantIds] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");

  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(false);
  const [attachments, setAttachments] = useState<File | null>(null);

  const [plans] = useState<Plan[]>(externalPlans ?? FALLBACK_PLANS);
  const [tenants, setTenants] = useState<Tenant[]>(externalTenants ?? []);
  const [tenantsLoading, setTenantsLoading] = useState(!externalTenants);
  const [tenantsError, setTenantsError] = useState<string | null>(null);

  useEffect(() => {
    if (externalTenants && externalTenants.length > 0) {
      setTenants(externalTenants);
      setTenantsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setTenantsLoading(true);
      setTenantsError(null);
      try {
        const url = `${TENANTS_API}?limit=1000`;
        console.log("🔵 Fetching tenants:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const items = Array.isArray(json)
          ? json
          : json?.data?.items ??
          json?.data?.tenants ??
          json?.data ??
          json?.items ??
          json?.tenants ??
          [];

        const list: Tenant[] = items

          .filter((t: any) => (t.status ?? "").toLowerCase() === "active")
          .map((t: any) => ({
            tenantId: t.tenantCode ?? t._id ?? t.id ?? t.tenantId ?? "",
            tenantName: t.tenantName ?? t.name ?? "",
          }))
          .filter((t: Tenant) => t.tenantId && t.tenantName);

        if (!cancelled) setTenants(list);
      } catch (e: any) {
        if (!cancelled) {
          console.error("❌ Tenant fetch failed:", e);
          setTenantsError(e?.message ?? "Failed to load tenants");
        }
      } finally {
        if (!cancelled) setTenantsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [externalTenants]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  };

  const handleAllTenantsChange = (checked: boolean) => {
    setAllTenants(checked);
    if (checked) {
      setSelectTenants(false);
      setSelectedTenant("");
      setSelectedPlans([]);
      setNewTenantIds([]);
    }
  };

  const handleSelectTenantsChange = (checked: boolean) => {
    setSelectTenants(checked);
    if (checked) setAllTenants(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(e.target.files?.[0] ?? null);
  };

  const handleAddTenant = () => {
    if (!selectedTenant) return;
    setNewTenantIds((prev) =>
      prev.includes(selectedTenant) ? prev : [...prev, selectedTenant],
    );
    setSelectedTenant("");
  };

  const handleRemoveNewTenant = (id: string) => {
    setNewTenantIds((prev) => prev.filter((t) => t !== id));
  };

  const getAudienceSummary = (): string => {
    if (allTenants) return "All Tenants";

    if (selectTenants) {
      const newTenantNames = newTenantIds
        .map((id) => tenants.find((t) => t.tenantId === id)?.tenantName ?? "")
        .filter(Boolean);

      const combined = Array.from(
        new Set([...existingTenantNames, ...newTenantNames]),
      );

      if (combined.length > 0) {
        return combined.join(", ");
      }

      return "Select Tenants";
    }

    if (selectedPlans.length > 0) {
      return plans
        .filter((p) => selectedPlans.includes(p.planId))
        .map((p) => p.planName)
        .join(", ");
    }

    return update.audience;
  };

  const handlePublish = () => {
    onSubmit?.({
      updateId: update.updateId,
      title,
      category,
      description,
      publishDate,
      priority,
      audience: getAudienceSummary(),
      sendEmail,
      sendInApp,
    });
  };

  const infoMessage = (() => {
    if (allTenants) return `This Update will be sent to all tenants (${totalTenantCount} tenants)`;

    if (selectTenants) {
      const newNames = newTenantIds
        .map((id) => tenants.find((t) => t.tenantId === id)?.tenantName ?? "")
        .filter(Boolean);
      const totalCount = existingTenantNames.length + newNames.length;

      if (totalCount === 0) return "Please select at least one tenant";

      if (newNames.length > 0) {
        return `Adding ${newNames.length} new tenant${newNames.length > 1 ? "s" : ""}. Total: ${totalCount} tenants`;
      }

      return `${totalCount} existing tenant${totalCount > 1 ? "s" : ""} selected`;
    }

    if (selectedPlans.length > 0) {
      return `This Update will be sent to ${selectedPlans.length} selected plan${selectedPlans.length > 1 ? "s" : ""}`;
    }

    return "Please select an audience";
  })();

  return (
    <div className="w-full max-w-[640px] rounded-md bg-white dark:bg-[#343434] p-4 shadow-sm">
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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="mt-3">
        <label className="mb-2 block text-[12px] font-medium text-[#172554] dark:text-white">
          Audience
        </label>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
            <input
              type="checkbox"
              checked={allTenants}
              onChange={(e) => handleAllTenantsChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#576CBC]"
            />
            <span>All Tenants</span>
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
            <input
              type="checkbox"
              checked={selectTenants}
              onChange={(e) => handleSelectTenantsChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#576CBC]"
            />
            <span>Select Tenants</span>
          </label>

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

      {selectTenants && (
        <div className="mt-3">
          {/* ✅ Show existing tenants as read-only chips */}
          {existingTenantNames.length > 0 && (
            <div className="mb-3">
              <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
                Current Tenants ({existingTenantNames.length})
              </label>
              <div className="flex flex-wrap gap-1.5 rounded-md border border-[#D9DDE5] dark:border-[#4A4A4A] bg-[#F8F9FC] dark:bg-[#2c2c2c] p-2">
                {existingTenantNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-md bg-[#E6EAF2] px-2.5 py-1 text-[11px] font-medium text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Add New Tenant
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                disabled={tenantsLoading}
                className={`h-[34px] w-full appearance-none rounded border border-[#D9DDE5] dark:border-[#4A4A4A] bg-white dark:bg-[#2c2c2c] px-2 pr-7 text-[12px] text-[#596579] dark:text-[#E2E2E2] outline-none focus:border-[#576CBC] ${tenantsLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                <option value="">
                  {tenantsLoading
                    ? "Loading tenants..."
                    : tenantsError
                      ? "Failed to load tenants"
                      : "Select a tenant to add"}
                </option>

                {!tenantsLoading &&
                  !tenantsError &&
                  tenants
                    .filter(
                      (t) =>
                        !existingTenantNames.includes(t.tenantName) &&
                        !newTenantIds.includes(t.tenantId),
                    )
                    .map((tenant) => (
                      <option key={tenant.tenantId} value={tenant.tenantId}>
                        {tenant.tenantName}
                      </option>
                    ))}
              </select>

              {tenantsLoading ? (
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D9DDE5] border-t-[#576CBC]" />
                </div>
              ) : (
                <IoChevronDown
                  size={15}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#596579] dark:text-[#B5B5B5]"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleAddTenant}
              disabled={!selectedTenant}
              className="rounded-md bg-[#576CBC] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#4C60AE] disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {/* ✅ Show newly added tenants as removable chips */}
          {newTenantIds.length > 0 && (
            <div className="mt-3">
              <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
                New Tenants to Add ({newTenantIds.length})
              </label>
              <div className="flex flex-wrap gap-1.5 rounded-md border border-[#576CBC] bg-[#F0F4FF] dark:bg-[#2A3550] p-2">
                {newTenantIds.map((id) => {
                  const name =
                    tenants.find((t) => t.tenantId === id)?.tenantName ?? id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleRemoveNewTenant(id)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#576CBC] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#4C60AE]"
                    >
                      {name}
                      <IoClose size={12} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tenantsError && (
            <p className="mt-1 text-[11px] text-red-500">{tenantsError}</p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 rounded bg-[#E5ECFF] dark:bg-[#36477e33] px-3 py-2.5 text-[12px] text-[#304674] dark:text-[#C7D2FE]">
        <FaInfoCircle size={13} className="shrink-0 text-[#576CBC]" />
        <span>{infoMessage}</span>
      </div>

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

      <div className="mt-3 grid grid-cols-2 gap-3">
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

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[#172554] dark:text-white">
            Attachments
          </label>
          <div className="flex h-[34px] items-center justify-between rounded border border-[#D9DDE5] dark:border-[#4A4A4A] px-2">
            <span className="truncate text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              {attachments ? attachments.name : "File"}
            </span>
            <label className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#576CBC]">
              <LuUpload size={13} />
              <span>Upload</span>
              <input
                type="file"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[12px] font-medium text-[#172554] dark:text-white">
            Sent Notification
          </label>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[#596579] dark:text-[#B5B5B5]">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#576CBC]"
              />
              <span>Email</span>
            </label>

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