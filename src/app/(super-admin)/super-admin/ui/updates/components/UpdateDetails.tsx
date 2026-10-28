"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Download, FileText } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const TENANTS_API = `${AppApiEndpoints.API_END_POINT}/tenantsubscription`;

const EXCLUDED_TENANT_NAMES = ["SuperAdmin", "Super Admin", "Select Tenants"];
const EXCLUDED_TENANT_CODES = ["TEN00000"];

interface TenantOption {
  id: string;
  name: string;
  plan: string;
  aliases: string[];
}

interface UpdateDetailsProps {
  updateId: string;
  update: any | null;
  loading: boolean;
  error: string | null;
  fallbackSelectedTenants?: string[];
  totalTenantsCount?: number;
  expectedCount?: number;
  onClose: () => void;
}

const isExcludedTenant = (name: string, code: string): boolean => {
  const n = (name ?? "").trim().toLowerCase();
  const c = (code ?? "").trim();
  return (
    EXCLUDED_TENANT_NAMES.some((x) => x.toLowerCase() === n) ||
    EXCLUDED_TENANT_CODES.includes(c)
  );
};

const UpdateDetails = ({
  update,
  loading,
  error,
  fallbackSelectedTenants = [],
  totalTenantsCount = 0,
  expectedCount,
  onClose,
}: UpdateDetailsProps) => {
  const [allTenants, setAllTenants] = useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  /* ── Fetch tenants from /tenantsubscription ── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setTenantsLoading(true);
      try {
        const res = await fetch(TENANTS_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const rawTenants: any[] = Array.isArray(json)
          ? json
          : json?.data?.tenants ?? json?.data ?? json?.tenants ?? [];

        const list: TenantOption[] = rawTenants.reduce<TenantOption[]>(
          (acc, t) => {
            const tenantObj = t?.tenant ?? t;
            const id = tenantObj?.tenantCode ?? tenantObj?.tenantId ?? "";
            const name = tenantObj?.tenantName ?? "";
            const plan =
              t?.planName ?? tenantObj?.plan ?? t?.plan?.planName ?? "";

            if (!id || !name) return acc;
            if (isExcludedTenant(name, id)) return acc;
            if ((plan ?? "").toLowerCase() === "super") return acc;

            const aliases = new Set<string>();
            [
              tenantObj?.tenantCode,
              tenantObj?.tenantId,
              tenantObj?._id,
              tenantObj?.tenantName,
              tenantObj?.tenantJobCode,
              name,
              id,
            ]
              .filter(Boolean)
              .forEach((v: any) => {
                const s = String(v).trim();
                if (!s) return;
                aliases.add(s);
                aliases.add(s.toLowerCase());
              });

            acc.push({
              id,
              name,
              plan,
              aliases: Array.from(aliases),
            });
            return acc;
          },
          [],
        );

        if (!cancelled) setAllTenants(list);
      } catch (e) {
        if (!cancelled) setAllTenants([]);
      } finally {
        if (!cancelled) setTenantsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Lookup maps ── */
  const { tenantByAlias, tenantByName } = useMemo(() => {
    const byAlias: Record<string, TenantOption> = {};
    const byName: Record<string, TenantOption> = {};

    allTenants.forEach((t) => {
      t.aliases.forEach((a) => {
        byAlias[a] = t;
        byAlias[a.toLowerCase()] = t;
      });
      byName[t.name.toLowerCase()] = t;
    });

    return { tenantByAlias: byAlias, tenantByName: byName };
  }, [allTenants]);

  /* ── Resolver ── */
  const resolveName = (value: string): string | null => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;

    // Skip generic labels
    if (trimmed.toLowerCase() === "select tenants" || trimmed.toLowerCase() === "all tenants") return null;

    const lower = trimmed.toLowerCase();

    const byAlias = tenantByAlias[trimmed] ?? tenantByAlias[lower];
    if (byAlias) return byAlias.name;

    const byName = tenantByName[lower];
    if (byName) return byName.name;

    const fuzzy = allTenants.find(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        lower.includes(t.name.toLowerCase()),
    );
    if (fuzzy) return fuzzy.name;

    return trimmed;
  };

  /* ── Audience analysis ── */
  const rawAudience: string[] = Array.isArray(update?.audience)
    ? update.audience
    : [update?.audience ?? "All Tenants"];

  const audienceJoined = rawAudience.join(" ").toLowerCase();
  const isAllTenants = audienceJoined.includes("all tenant");
  const isSelectTenants = audienceJoined.includes("select tenant");
  const isByPlan = !isAllTenants && !isSelectTenants;

  /* ⭐ Get the localStorage row FIRST to override backend values */
  const local = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const rows = JSON.parse(
        window.localStorage.getItem("blackstone_created_updates_v1") || "[]"
      );
      // Match by updateId or title
      return rows.find(
        (r: any) =>
          r.updateId === update?.updateId ||
          r.title?.trim().toLowerCase() === update?.title?.trim().toLowerCase()
      );
    } catch {
      return null;
    }
  }, [update?.updateId, update?.title]);

  /* ── Tenant list (UPDATED TO READ FROM LOCAL STORAGE) ── */
  const tenantList: string[] = useMemo(() => {
    if (!update) return [];
    let collected: string[] = [];

    // 1. Prioritize localStorage data
    if (local?.selectedTenants && Array.isArray(local.selectedTenants) && local.selectedTenants.length > 0) {
      collected = local.selectedTenants;
    }
    // 2. Fallback to backend data
    else if (Array.isArray(update.selectedTenantDetails)) {
      update.selectedTenantDetails.forEach((t: any) => {
        const raw = t?.tenantCode ?? t?._id ?? t?.tenantName ?? t?.name;
        if (!raw) return;
        const name = resolveName(String(raw));
        if (name) collected.push(name);
      });
    }

    if (collected.length === 0 && Array.isArray(update.selectedTenants)) {
      update.selectedTenants.forEach((t: any) => {
        if (!t) return;
        if (typeof t === "string") {
          const name = resolveName(t);
          if (name) collected.push(name);
        } else {
          const raw =
            t?.tenantCode ?? t?._id ?? t?.tenantName ?? t?.name ?? "";
          const name = resolveName(String(raw));
          if (name) collected.push(name);
        }
      });
    }

    if (collected.length === 0 && isByPlan && allTenants.length > 0) {
      const planName = String(rawAudience[0] ?? "").trim().toLowerCase();
      allTenants
        .filter((t) => t.plan.toLowerCase() === planName)
        .forEach((t) => collected.push(t.name));
    }

    if (collected.length === 0 && fallbackSelectedTenants.length > 0) {
      fallbackSelectedTenants.forEach((n) => {
        const name = resolveName(n);
        if (name) collected.push(name);
      });
    }

    // Final mapping to ensure proper names are shown
    const resolvedNames = collected.map((n) => resolveName(n) || "").filter(Boolean);
    return Array.from(new Set(resolvedNames));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    update,
    local,
    allTenants,
    isByPlan,
    rawAudience,
    fallbackSelectedTenants,
    tenantByAlias,
    tenantByName,
  ]);

  const selectedCount = tenantList.length > 0 ? tenantList.length : (typeof expectedCount === "number" && expectedCount >= 0 ? expectedCount : 0);

  const allTenantsCount =
    totalTenantsCount > 0 ? totalTenantsCount : allTenants.length;

  const audienceLabel = isAllTenants
    ? "All Tenants"
    : isSelectTenants
      ? `Selected Tenants (${selectedCount})`
      : `${rawAudience[0] ?? "Plan"} Tenants (${selectedCount})`;

  /* ── Colors ── */
  const statusValue: string =
    update?.status ?? update?.updateStatus ?? update?.state ?? "—";

  const statusColor =
    statusValue === "Published"
      ? "text-[#40BD5F] dark:text-[#68D391]"
      : statusValue === "Scheduled"
        ? "text-[#EFA133] dark:text-[#F5C97B]"
        : statusValue === "Archived"
          ? "text-[#EA4F4F] dark:text-[#FC8181]"
          : "text-[#576CBC] dark:text-[#8296E6]";

  const priorityColor =
    update?.priority === "High"
      ? "text-[#EA4F4F] dark:text-[#FC8181]"
      : update?.priority === "Medium"
        ? "text-[#EFA133] dark:text-[#F5C97B]"
        : "text-[#40BD5F] dark:text-[#68D391]";

  const formatDate = (val?: string) => {
    if (!val) return "—";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  const publishDate = formatDate(update?.publishDate || update?.releaseDate);

  const attachments: string[] = Array.isArray(update?.attachments)
    ? update.attachments
    : [];

  const fieldBoxClass =
    "flex w-full items-center rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#101B41] min-h-[42px] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white";

  // ⭐ Prefer localStorage values
  const monthlyPrice = local?.monthlyPrice ?? update?.monthlyPrice ?? "—";
  const discount = local?.discount ?? update?.discount ?? "—";

  if (loading) {
    return (
      <div className="rounded-[14px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
            Update Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-[#454545]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="rounded-[14px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
            Update Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="rounded-md bg-red-50 px-4 py-3 text-[12px] text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {error || "Failed to load update details"}
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose}
            className="rounded-md bg-[#5872C5] px-6 py-2.5 text-[12px] font-semibold text-white hover:bg-[#4D66B3]">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-2xl">
      <div className="flex items-start justify-between px-6 pt-5 pb-4">
        <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
          Update Details
        </h2>
        <button type="button" onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
          <X size={18} />
        </button>
      </div>

      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
              Update Title
            </label>
            <div className={fieldBoxClass}>{update.title || "—"}</div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
              Category
            </label>
            <div className={fieldBoxClass}>{update.category || "—"}</div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
            Description
          </label>
          <div className="w-full min-h-[120px] rounded-md border border-[#D5D9E2] bg-white px-3 py-3 text-[12px] leading-5 text-[#101B41] whitespace-pre-wrap dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white">
            {update.description || "—"}
          </div>
        </div>

        {/* ⭐ Payment Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
              Monthly Price
            </label>
            <div className={fieldBoxClass}>{monthlyPrice}</div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
              Discount (%)
            </label>
            <div className={fieldBoxClass}>
              {discount !== "—" ? `${discount} %` : "—"}
            </div>
          </div>
        </div>

        {isAllTenants ? (
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                All Tenants
              </label>
              <div className={fieldBoxClass}>
                {tenantsLoading ? "…" : allTenantsCount}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                Publish Date
              </label>
              <div className={fieldBoxClass}>{publishDate}</div>
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                Priority
              </label>
              <div className={`${fieldBoxClass} font-medium ${priorityColor}`}>
                {update.priority || "—"}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                Status
              </label>
              <div className={`${fieldBoxClass} font-medium ${statusColor}`}>
                {statusValue}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                {audienceLabel}
              </label>
              <div className="w-full min-h-[100px] rounded-md border border-[#D5D9E2] bg-white px-3 py-3 dark:border-[#555] dark:bg-[#3A3A3A]">
                <div className="flex flex-wrap gap-2">
                  {tenantList.length > 0 ? (
                    tenantList.map((name, i) => (
                      <span key={`${name}-${i}`}
                        className="rounded-md bg-[#E6EAF2] px-3 py-1.5 text-[11px] font-medium text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] text-gray-400">
                      No tenants selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                  Publish Date
                </label>
                <div className={fieldBoxClass}>{publishDate}</div>
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                  Priority
                </label>
                <div className={`${fieldBoxClass} font-medium ${priorityColor}`}>
                  {update.priority || "—"}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                  Status
                </label>
                <div className={`${fieldBoxClass} font-medium ${statusColor}`}>
                  {statusValue}
                </div>
              </div>
            </div>
          </>
        )}

        {attachments.length > 0 && (
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
              Attachment
            </label>
            <div className="flex items-center justify-between rounded-md border border-[#D5D9E2] bg-white px-3 py-3 dark:border-[#555] dark:bg-[#3A3A3A]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
                  <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#101B41] dark:text-white">
                    {attachments[0]}
                  </p>
                </div>
              </div>
              <button type="button"
                className="text-[#576CBC] hover:text-[#4D66B3] dark:text-[#A8B7E8]">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose}
            className="rounded-md bg-[#5872C5] px-6 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#4D66B3] dark:bg-[#7B92D9] dark:hover:bg-[#6A82CC]">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDetails;