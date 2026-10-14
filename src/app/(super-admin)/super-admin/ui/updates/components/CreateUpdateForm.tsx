"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

/* ──────────────────────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────────────────────── */
export const CATEGORY_OPTIONS = [
  { label: "Feature Release", value: "Feature" },
  { label: "Bug Fix", value: "Bug Fix" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Announcement", value: "Announcement" },
] as const;

export const PRIORITY_OPTIONS = ["Low", "Medium", "High"] as const;

const UNASSIGNED_PLAN = "Unassigned";
const TENANTS_PAGE_LIMIT = 1000;

const SUPER_ADMIN_TENANT_NAME = "SuperAdmin";
const SUPER_ADMIN_TENANT_CODE = "TEN00000";
const SUPER_ADMIN_PLAN = "Super";
const EXCLUDED_STATUSES = ["completed", "inactive", "deleted"];

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────── */
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
  planId: string | undefined;
}

interface PlanOption {
  id: string;      // _id
  name: string;    // planName
}

interface CreateUpdateFormProps {
  formData: UpdateFormData;
  isLoading: boolean;
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
  onAudienceChange: (
    audience: "allTenants" | "selectTenants" | "byPlan",
  ) => void;
  onTenantToggle: (tenantName: string) => void;
  onPlanChange: (planName: string) => void;
  onSendEmailChange: (checked: boolean) => void;
  onSendInAppChange: (checked: boolean) => void;
  onFileChange: (file: File | null) => void;
}

/* ──────────────────────────────────────────────────────────────
   API endpoints
   ────────────────────────────────────────────────────────────── */
const API_URL = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.UPDATES.CREATE}`;
const TENANTS_API = `${AppApiEndpoints.API_END_POINT}/tenantsubscription`;
const PLANS_API = `${AppApiEndpoints.API_END_POINT}/api/plans/active`;

/* ──────────────────────────────────────────────────────────────
   Styles
   ────────────────────────────────────────────────────────────── */
const inputClassName =
  "w-full px-3 py-2 border border-[#D5D9E2] rounded-md text-[12px] text-[#101B41] placeholder:text-gray-400 focus:outline-none focus:border-[#5872C5] dark:bg-[#3A3A3A] dark:border-[#555] dark:text-white dark:placeholder:text-gray-500";
const selectClassName =
  "w-full appearance-none px-3 py-2 pr-9 border border-[#D5D9E2] rounded-md text-[12px] text-[#101B41] bg-white focus:outline-none focus:border-[#5872C5] dark:bg-[#3A3A3A] dark:border-[#555] dark:text-white";
const labelClassName =
  "block text-[12px] font-medium text-[#101B41] mb-1.5 dark:text-gray-200";

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */
const deriveStatus = (publishDate: string): "Scheduled" | "Published" => {
  if (!publishDate) return "Scheduled";
  return new Date(publishDate) > new Date() ? "Scheduled" : "Published";
};

const resolveAudience = (formData: UpdateFormData): string[] => {
  switch (formData.audience) {
    case "allTenants":
      return ["All Tenants"];
    case "selectTenants":
      return ["Select Tenants"];
    case "byPlan":
      return formData.selectedPlan ? [formData.selectedPlan] : [];
    default:
      return [];
  }
};

const resolvePlanName = (t: any): string =>
  t.plan ?? t.planName ?? t.subscriptionPlan ?? UNASSIGNED_PLAN;

const resolvePlanId = (t: any): string | undefined =>
  t.planId ?? t.plan_id ?? undefined;

const resolveTenantId = (t: any): string =>
  t.tenantCode ?? t._id ?? t.id ?? "";

const resolveTenantName = (t: any): string => t.tenantName ?? t.name ?? "";

const isActiveTenant = (t: any): boolean => {
  const status = (t.status ?? "").toString().trim().toLowerCase();
  if (!status) return false;
  return !EXCLUDED_STATUSES.includes(status);
};

const isNotSuperAdmin = (t: any): boolean => {
  const name = (t.tenantName ?? t.name ?? "").toString().trim().toLowerCase();
  const plan = (t.plan ?? "").toString().trim().toLowerCase();
  const code = (t.tenantCode ?? "").toString().trim().toLowerCase();

  if (name === SUPER_ADMIN_TENANT_NAME.toLowerCase()) return false;
  if (plan === SUPER_ADMIN_PLAN.toLowerCase()) return false;
  if (code === SUPER_ADMIN_TENANT_CODE.toLowerCase()) return false;
  return true;
};

/* ──────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────── */
const CreateUpdateForm = ({
  formData,
  isLoading,
  onClose,
  onReset: _onReset,
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
  const [allTenants, setAllTenants] = useState<TenantOption[]>([]);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsError, setTenantsError] = useState<string | null>(null);
  const [searchTenant, setSearchTenant] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setTenantsLoading(true);
      setTenantsError(null);

      try {
        // ✅ No query params — backend rejects them
        const res = await fetch(TENANTS_API, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // Response shape: { total, tenants: [...] }
        const items: any[] = Array.isArray(json)
          ? json
          : json?.tenants ?? json?.data?.tenants ?? json?.data?.items ?? [];

        const list: TenantOption[] = items
          .filter(isActiveTenant)
          .filter(isNotSuperAdmin)
          .reduce<TenantOption[]>((acc, t) => {
            const id = resolveTenantId(t);
            const name = resolveTenantName(t);
            if (!id || !name) return acc;
            acc.push({
              id,
              name,
              plan: resolvePlanName(t),
              planId: resolvePlanId(t),
            });
            return acc;
          }, []);

        if (cancelled) return;
        setAllTenants(list);

        const planMap = new Map<string, PlanOption>();
        list.forEach((t) => {
          if (t.plan.toLowerCase() === SUPER_ADMIN_PLAN.toLowerCase()) return;
          if (!planMap.has(t.plan)) {
            planMap.set(t.plan, { id: t.planId ?? t.plan, name: t.plan });
          }
        });

        setPlanOptions(
          Array.from(planMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
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

  /* ── Derived ── */
  const totalTenantsCount = allTenants.length;

  const filteredTenants = useMemo(
    () =>
      allTenants.filter((t) =>
        t.name.toLowerCase().includes(searchTenant.toLowerCase()),
      ),
    [allTenants, searchTenant],
  );

  /* ── Handlers ── */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] ?? null);
  };

  /* ⭐ Build payload reads `formData.selectedTenants` — the parent keeps it fresh ── */
  const buildPayload = () => {
    const categoryValue =
      CATEGORY_OPTIONS.find((o) => o.label === formData.category)?.value ??
      formData.category;

    const audienceArr = resolveAudience(formData);

    // Backend wants string[] — send plain names
    const selectedTenantsArr =
      formData.audience === "selectTenants" ? formData.selectedTenants : [];

    return {
      title: formData.updateTitle.trim(),
      category: categoryValue,
      description: formData.description.trim(),
      publishDate: formData.publishDate,
      priority: formData.priority as (typeof PRIORITY_OPTIONS)[number],
      status: deriveStatus(formData.publishDate),
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

    if (!formData.updateTitle.trim()) {
      toast.error("Please enter an update title");
      return;
    }

    if (
      formData.audience === "selectTenants" &&
      formData.selectedTenants.length === 0
    ) {
      toast.error("Please select at least one tenant");
      return;
    }

    if (formData.audience === "byPlan" && !formData.selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "🧪 At submit — selectedTenants:",
          formData.selectedTenants,
          "length:",
          formData.selectedTenants.length,
        );
        console.log("📤 POST /api/updates →", JSON.stringify(payload, null, 2));
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (process.env.NODE_ENV !== "production") {
        console.log("📥 Response:", res.status, json);
      }

      if (!res.ok || !json.success) {
        throw new Error(
          json.message || json.error?.[0]?.message || `HTTP ${res.status}`,
        );
      }

      onSubmit(e, payload, json);
      toast.success(json.message || "Update published successfully!");
      setTimeout(() => onClose(), 900);
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ Submit failed:", err);
      }
      const message =
        err instanceof Error ? err.message : "Failed to publish update";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isWorking = submitting || isLoading;

  const infoMessage = useMemo(() => {
    switch (formData.audience) {
      case "allTenants":
        return `This update will be sent to all tenants (${totalTenantsCount} tenants)`;
      case "selectTenants":
        if (formData.selectedTenants.length === 0) {
          return "Select one or more tenants to send this update";
        }
        return `This update will be sent to ${formData.selectedTenants.length} tenant${formData.selectedTenants.length > 1 ? "s" : ""
          }: ${formData.selectedTenants.join(", ")}`;
      case "byPlan":
        return formData.selectedPlan
          ? `This update will be sent to all tenants on the "${formData.selectedPlan}" plan`
          : "Select a plan";
      default:
        return "Select an audience";
    }
  }, [
    formData.audience,
    formData.selectedPlan,
    formData.selectedTenants,
    totalTenantsCount,
  ]);

  /* ──────────────────────────────────────────────────────────
     Render
     ────────────────────────────────────────────────────────── */
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Update Title</label>
                <input type="text" name="updateTitle"
                  value={formData.updateTitle} onChange={onInputChange}
                  placeholder="Enter Update Title" className={inputClassName} />
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
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
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
                  <input type="radio" name="audienceType"
                    checked={formData.audience === "allTenants"}
                    onChange={() => onAudienceChange("allTenants")}
                    className="h-3.5 w-3.5 accent-[#5872C5]" />
                  All Tenants
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                  <input type="radio" name="audienceType"
                    checked={formData.audience === "selectTenants"}
                    onChange={() => onAudienceChange("selectTenants")}
                    className="h-3.5 w-3.5 accent-[#5872C5]" />
                  Select Tenants
                </label>

                {tenantsLoading ? (
                  <span className="text-[12px] text-gray-400">Loading plans...</span>
                ) : (
                  planOptions.map((plan) => {
                    const count = allTenants.filter(
                      (t) => t.plan.toLowerCase() === plan.name.toLowerCase(),
                    ).length;
                    return (
                      <label key={plan.id}
                        className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                        <input type="radio" name="audienceType"
                          checked={formData.audience === "byPlan" && formData.selectedPlan === plan.name}
                          onChange={() => onPlanChange(plan.name)}
                          className="h-3.5 w-3.5 accent-[#5872C5]" />
                        {plan.name} ({count})
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Select Tenants */}
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

                <input type="text" placeholder="Search tenants..."
                  value={searchTenant}
                  onChange={(e) => setSearchTenant(e.target.value)}
                  className={`${inputClassName} mb-2`} />

                {formData.selectedTenants.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5 rounded-md border border-[#D5D9E2] bg-[#F8F9FC] p-2 dark:border-[#555] dark:bg-[#333]">
                    {formData.selectedTenants.map((name) => (
                      <button key={name} type="button"
                        onClick={() => onTenantToggle(name)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#E6EAF2] px-2 py-1 text-[11px] font-medium text-[#576CBC] hover:bg-[#D6DDF0] dark:bg-[#3A4570] dark:text-[#A8B7E8]">
                        {name}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                <div className="max-h-[180px] overflow-y-auto rounded-md border border-[#D5D9E2] bg-white p-2 dark:border-[#555] dark:bg-[#3A3A3A]">
                  {tenantsLoading ? (
                    <p className="py-4 text-center text-[12px] text-gray-400">Loading tenants...</p>
                  ) : tenantsError ? (
                    <p className="py-4 text-center text-[12px] text-red-500">{tenantsError}</p>
                  ) : filteredTenants.length === 0 ? (
                    <p className="py-4 text-center text-[12px] text-gray-400">No tenants found</p>
                  ) : (
                    filteredTenants.map((t) => {
                      const isChecked = formData.selectedTenants.includes(t.name);
                      return (
                        <label key={t.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[12px] text-[#101B41] hover:bg-[#F5F6FA] dark:text-gray-200 dark:hover:bg-[#444]">
                          <input type="checkbox" checked={isChecked}
                            onChange={() => onTenantToggle(t.name)}
                            className="h-3.5 w-3.5 accent-[#5872C5]" />
                          {t.name}
                          <span className="ml-auto text-[10px] text-gray-400">{t.plan}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-3 rounded-md bg-[#EEF0FB] px-3 py-2.5 text-[12px] text-[#101B41] dark:bg-[#2A3550] dark:text-gray-200">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5872C5] text-[10px] font-bold text-white">
                <FiInfo className="h-2.5 w-2.5" />
              </span>
              <span>{infoMessage}</span>
            </div>

            {/* Description */}
            <div>
              <label className={labelClassName}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={6}
                placeholder="Enter update description"
                className={`${inputClassName} resize-none`}
              />
            </div>

            {/* Publish Date + Priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName}>Publish Date</label>
                <input type="date" name="publishDate"
                  value={formData.publishDate} onChange={onInputChange}
                  className={inputClassName} />
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
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
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
                    {formData.attachments
                      ? formData.attachments.name
                      : "No file"}
                  </span>
                  <label className="cursor-pointer text-[12px] font-medium text-[#5872C5] hover:underline dark:text-[#A8B7E8]">
                    Upload
                    <input type="file" onChange={handleFileInput} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Sent Notification</label>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1.5">
                  <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                    <input type="checkbox" checked={formData.sendEmail}
                      onChange={(e) => onSendEmailChange(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#5872C5]" />
                    Email
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                    <input type="checkbox" checked={formData.sendInAppNotification}
                      onChange={(e) => onSendInAppChange(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#5872C5]" />
                    In-App Notification
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isWorking}
                className="rounded-md bg-[#5872C5] px-6 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#4D66B3] disabled:opacity-50 dark:bg-[#7B92D9] dark:hover:bg-[#6A82CC]">
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