"use client";

import React, { useEffect, useState } from "react";
import { FiChevronDown, FiInfo } from "react-icons/fi";

export interface UpdateFormData {
  updateTitle: string;
  category: string;
  audience: "allTenants" | "selectTenants" | "byPlan";
  selectedTenants: string[];
  selectedPlan: string;
  description: string;
  publishDate: string;
  priority: string;
  attachments: File | null;
  sendEmail: boolean;
  sendInAppNotification: boolean;
}

interface TenantOption {
  id: string;
  name: string;
  plan: string;
}

interface PlanOption {
  id: string;
  name: string;
}

interface CreateUpdateFormProps {
  formData: UpdateFormData;
  isLoading: boolean;
  totalTenants?: number;
  onClose: () => void;
  onReset: () => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    payload: any,
    response: any,
  ) => void;
  onInputChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onAudienceChange: (audience: "allTenants" | "selectTenants" | "byPlan") => void;
  onTenantToggle: (tenantName: string) => void;
  onPlanChange: (planName: string) => void;
  onSendEmailChange: (checked: boolean) => void;
  onSendInAppChange: (checked: boolean) => void;
  onFileChange: (file: File | null) => void;
}

const API_URL = "http://localhost:5001/api/updates";
const TENANTS_API = "http://localhost:5001/tenant";

const inputClassName =
  "w-full px-3 py-2 border border-[#D5D9E2] rounded-md text-[12px] text-[#101B41] placeholder:text-gray-400 focus:outline-none focus:border-[#5872C5] dark:bg-[#3A3A3A] dark:border-[#555] dark:text-white dark:placeholder:text-gray-500";
const selectClassName =
  "w-full appearance-none px-3 py-2 pr-9 border border-[#D5D9E2] rounded-md text-[12px] text-[#101B41] bg-white focus:outline-none focus:border-[#5872C5] dark:bg-[#3A3A3A] dark:border-[#555] dark:text-white";
const labelClassName =
  "block text-[12px] font-medium text-[#101B41] mb-1.5 dark:text-gray-200";

const CreateUpdateForm = ({
  formData,
  isLoading,
  totalTenants = 288,
  onClose,
  onReset,
  onSubmit,
  onInputChange,
  onAudienceChange,
  onTenantToggle,
  onPlanChange,
  onSendEmailChange,
  onSendInAppChange,
  onFileChange,
}: CreateUpdateFormProps) => {
  const isSelectTenants = formData.audience === "selectTenants";

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [allTenants, setAllTenants] = useState<TenantOption[]>([]);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsError, setTenantsError] = useState<string | null>(null);
  const [searchTenant, setSearchTenant] = useState("");

  // ── Fetch tenants ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTenantsLoading(true);
      setTenantsError(null);
      try {
        const res = await fetch(`${TENANTS_API}?limit=1000`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const items = Array.isArray(json)
          ? json
          : json?.data?.items ??
            json?.data?.tenants ??
            json?.tenants ??
            json?.data ??
            json?.items ??
            [];

        const list: TenantOption[] = items
          .filter((t: any) => (t.status ?? "").toLowerCase() === "active")
          .map((t: any) => ({
            id: t.tenantCode ?? t._id ?? t.id ?? "",
            name: t.tenantName ?? t.name ?? "",
            plan: t.plan ?? "Basic",
          }))
          .filter((t: TenantOption) => t.id && t.name);

        if (cancelled) return;
        setAllTenants(list);

        const uniquePlans = Array.from(new Set(list.map((t) => t.plan)))
          .filter(Boolean)
          .sort();

        setPlanOptions(
          uniquePlans.map((name, i) => ({
            id: `PLAN-${i + 1}`,
            name,
          })),
        );
      } catch (e: any) {
        if (!cancelled) setTenantsError(e?.message ?? "Failed to load tenants");
      } finally {
        if (!cancelled) setTenantsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] ?? null);
  };

  const filteredTenants = allTenants.filter((t) =>
    t.name.toLowerCase().includes(searchTenant.toLowerCase()),
  );

  const buildPayload = () => {
    const categoryMap: Record<string, string> = {
      "Feature Release": "Feature",
      "Bug Fix": "Bug Fix",
      Maintenance: "Maintenance",
      Announcement: "Announcement",
    };

    let audienceArr: string[] = [];
    let selectedTenantsArr: string[] = [];

    if (formData.audience === "allTenants") {
      audienceArr = ["All Tenants"];
      selectedTenantsArr = [];
    } else if (formData.audience === "selectTenants") {
      audienceArr = ["Select Tenants"];
      selectedTenantsArr = formData.selectedTenants;
    } else if (formData.audience === "byPlan") {
      audienceArr = [formData.selectedPlan];
      selectedTenantsArr = [];
    }

    return {
      title: formData.updateTitle.trim(),
      category: categoryMap[formData.category] ?? formData.category,
      description: formData.description.trim(),
      publishDate: formData.publishDate,
      priority: formData.priority as "Low" | "Medium" | "High",
      status: "Scheduled",
      audience: audienceArr,
      planName:
        formData.audience === "byPlan" ? formData.selectedPlan : undefined,
      selectedTenants: selectedTenantsArr,
      attachments: formData.attachments ? [formData.attachments.name] : [],
      sendNotification: {
        email: formData.sendEmail,
        inApp: formData.sendInAppNotification,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.updateTitle.trim()) {
      setErrorMsg("Please enter an update title");
      return;
    }

    if (
      formData.audience === "selectTenants" &&
      formData.selectedTenants.length === 0
    ) {
      setErrorMsg("Please select at least one tenant");
      return;
    }

    if (formData.audience === "byPlan" && !formData.selectedPlan) {
      setErrorMsg("Please select a plan");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();
      console.log("📤 POST /api/updates →", JSON.stringify(payload, null, 2));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log("📥 Response:", res.status, json);

      if (!res.ok || !json.success) {
        throw new Error(
          json.message || json.error?.[0]?.message || `HTTP ${res.status}`,
        );
      }

      setSuccessMsg(json.message || "Update published successfully!");
      onSubmit(e, payload, json);
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      console.error("❌ Submit failed:", err);
      setErrorMsg(err?.message || "Failed to publish update");
    } finally {
      setSubmitting(false);
    }
  };

  const isWorking = submitting || isLoading;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-4">
      <div className="relative max-h-[95vh] w-full max-w-[560px] overflow-y-auto scrollbar-none rounded-[14px] bg-white shadow-2xl dark:bg-[#343434] dark:border dark:border-[#454545]">
        <div className="px-6 pb-5 pt-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white">
              Update Feature
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isWorking}
              className="text-[#A5AAB4] hover:text-[#101B41] dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-600 dark:bg-red-900/30 dark:text-red-300">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-[12px] text-green-600 dark:bg-green-900/30 dark:text-green-300">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Update Title</label>
                <input
                  type="text"
                  name="updateTitle"
                  value={formData.updateTitle}
                  onChange={onInputChange}
                  placeholder="Enter Update Title"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={onInputChange}
                    className={selectClassName}
                  >
                    <option value="Feature Release">Feature Release</option>
                    <option value="Bug Fix">Bug Fix</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className={labelClassName}>Audience</label>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                  <input
                    type="radio"
                    name="audienceType"
                    checked={formData.audience === "allTenants"}
                    onChange={() => onAudienceChange("allTenants")}
                    className="h-3.5 w-3.5 accent-[#5872C5]"
                  />
                  All Tenants
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                  <input
                    type="radio"
                    name="audienceType"
                    checked={formData.audience === "selectTenants"}
                    onChange={() => onAudienceChange("selectTenants")}
                    className="h-3.5 w-3.5 accent-[#5872C5]"
                  />
                  Select Tenants
                </label>

                {tenantsLoading ? (
                  <span className="text-[12px] text-gray-400">
                    Loading plans...
                  </span>
                ) : (
                  planOptions.map((plan) => {
                    const count = allTenants.filter(
                      (t) => t.plan === plan.name,
                    ).length;
                    return (
                      <label
                        key={plan.id}
                        className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200"
                      >
                        <input
                          type="radio"
                          name="audienceType"
                          checked={
                            formData.audience === "byPlan" &&
                            formData.selectedPlan === plan.name
                          }
                          onChange={() => onPlanChange(plan.name)}
                          className="h-3.5 w-3.5 accent-[#5872C5]"
                        />
                        {plan.name} ({count})
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Select Tenants list */}
            {isSelectTenants && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClassName} style={{ marginBottom: 0 }}>
                    Select Tenants
                  </label>
                  <span className="text-[11px] text-[#5872C5] dark:text-[#A8B7E8]">
                    {formData.selectedTenants.length} selected
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTenant}
                  onChange={(e) => setSearchTenant(e.target.value)}
                  className={`${inputClassName} mb-2`}
                />

                {formData.selectedTenants.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5 rounded-md border border-[#D5D9E2] bg-[#F8F9FC] p-2 dark:border-[#555] dark:bg-[#333]">
                    {formData.selectedTenants.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onTenantToggle(name)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#E6EAF2] px-2 py-1 text-[11px] font-medium text-[#576CBC] hover:bg-[#D6DDF0] dark:bg-[#3A4570] dark:text-[#A8B7E8]"
                      >
                        {name}
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                <div className="max-h-[180px] overflow-y-auto rounded-md border border-[#D5D9E2] bg-white p-2 dark:border-[#555] dark:bg-[#3A3A3A]">
                  {tenantsLoading ? (
                    <p className="py-4 text-center text-[12px] text-gray-400">
                      Loading tenants...
                    </p>
                  ) : tenantsError ? (
                    <p className="py-4 text-center text-[12px] text-red-500">
                      {tenantsError}
                    </p>
                  ) : filteredTenants.length === 0 ? (
                    <p className="py-4 text-center text-[12px] text-gray-400">
                      No tenants found
                    </p>
                  ) : (
                    filteredTenants.map((t) => {
                      const isChecked = formData.selectedTenants.includes(
                        t.name,
                      );
                      return (
                        <label
                          key={t.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12px] text-[#101B41] hover:bg-[#F5F6FA] dark:text-gray-200 dark:hover:bg-[#444]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onTenantToggle(t.name)}
                            className="h-3.5 w-3.5 accent-[#5872C5]"
                          />
                          {t.name}
                          <span className="ml-auto text-[10px] text-gray-400">
                            {t.plan}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-md bg-[#EEF0FB] px-3 py-2.5 text-[12px] text-[#101B41] dark:bg-[#2A3550] dark:text-gray-200">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5872C5] text-[10px] font-bold text-white">
                <FiInfo className="h-2.5 w-2.5" />
              </span>
              <span>
                {formData.audience === "allTenants"
                  ? `This update will be sent to all tenants (${totalTenants} tenants)`
                  : formData.audience === "selectTenants"
                    ? formData.selectedTenants.length > 0
                      ? `This update will be sent to ${formData.selectedTenants.length} tenant${formData.selectedTenants.length > 1 ? "s" : ""}: ${formData.selectedTenants.join(", ")}`
                      : "Select one or more tenants to send this update"
                    : formData.audience === "byPlan"
                      ? formData.selectedPlan
                        ? `This update will be sent to all tenants on the "${formData.selectedPlan}" plan`
                        : "Select a plan"
                      : "Select an audience"}
              </span>
            </div>

            {/* Description */}
            <div>
              <label className={labelClassName}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={6}
                placeholder="Today Update day"
                className={`${inputClassName} resize-none`}
              />
            </div>

            {/* Publish Date + Priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Publish Date</label>
                <input
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={onInputChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Priority</label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={onInputChange}
                    className={selectClassName}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>

            {/* Attachments + Notifications */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Attachments</label>
                <div className="flex items-center justify-between rounded-md border border-[#D5D9E2] bg-white px-3 py-2 dark:bg-[#3A3A3A] dark:border-[#555]">
                  <span className="truncate text-[12px] text-gray-400 dark:text-gray-500">
                    {formData.attachments ? formData.attachments.name : "File"}
                  </span>
                  <label className="cursor-pointer text-[12px] font-medium text-[#5872C5] hover:underline dark:text-[#A8B7E8]">
                    Upload
                    <input
                      type="file"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Sent Notification</label>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1.5">
                  <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => onSendEmailChange(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#5872C5]"
                    />
                    Email
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.sendInAppNotification}
                      onChange={(e) => onSendInAppChange(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#5872C5]"
                    />
                    In-App Notification
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isWorking}
                className="rounded-md bg-[#5872C5] px-6 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#4D66B3] disabled:opacity-50 dark:bg-[#7B92D9] dark:hover:bg-[#6A82CC]"
              >
                {isWorking ? "Publishing..." : "Publish Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUpdateForm;