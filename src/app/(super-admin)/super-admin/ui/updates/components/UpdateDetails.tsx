"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Download, FileText } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const TENANTS_API = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT.GET_TENANT}`;

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────────── */
interface UpdateDetailsProps {
  updateId: string;
  update: any | null;
  loading: boolean;
  error: string | null;
  fallbackSelectedTenants?: string[];
  totalTenantsCount?: number;
  onClose: () => void;
}

/* ──────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────── */
const UpdateDetails = ({
  update,
  loading,
  error,
  fallbackSelectedTenants = [],
  totalTenantsCount = 0,
  onClose,
}: UpdateDetailsProps) => {
  // tenantMap: { [tenantCode | _id | tenantName] → tenantName }
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({});

  /* ── Fetch tenants using XHR (bypasses window.fetch override) ── */
  useEffect(() => {
    let cancelled = false;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", TENANTS_API, true);

    xhr.onload = () => {
      if (cancelled) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          const items: any[] = Array.isArray(json)
            ? json
            : json?.tenants ?? json?.data?.tenants ?? json?.data?.items ?? [];

          const map: Record<string, string> = {};

          items.forEach((t: any) => {
            const name = t.tenantName ?? t.name;
            if (!name) return;

            // Store by every identifier we can find
            const keys = [
              t.tenantCode,
              t._id,
              t.id,
              t.tenantJobCode,
              t.tenantName,
              t.name,
            ].filter(Boolean);

            keys.forEach((k: any) => {
              const s = String(k).trim();
              if (!s) return;
              map[s] = name;
              map[s.toLowerCase()] = name;
            });
          });

          if (process.env.NODE_ENV !== "production") {
            console.log("✅ Tenants loaded:", items.length, map);
          }

          setTenantMap(map);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.error("❌ Failed to parse tenants:", e);
          }
        }
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error("❌ Tenant XHR failed with status:", xhr.status);
        }
      }
    };

    xhr.onerror = () => {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ Tenant XHR network error");
      }
    };

    xhr.send();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Resolve value → tenant name ── */
  const resolveName = (value: string): string | null => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();

    // Try full key
    if (tenantMap[trimmed]) return tenantMap[trimmed];
    if (tenantMap[lower]) return tenantMap[lower];

    // Fuzzy match: does any map key contain this value or vice versa?
    const foundKey = Object.keys(tenantMap).find(
      (k) =>
        k.toLowerCase() === lower ||
        k.toLowerCase().includes(lower) ||
        lower.includes(k.toLowerCase()),
    );
    if (foundKey) return tenantMap[foundKey];

    // Last resort: show raw value
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

  /* ── Tenant list (never drops a chip) ── */
  const tenantList: string[] = useMemo(() => {
    if (!update) return [];

    const source: any[] =
      Array.isArray(update.selectedTenants) && update.selectedTenants.length > 0
        ? update.selectedTenants
        : Array.isArray(update.selectedTenantDetails)
          ? update.selectedTenantDetails
          : [];

    const resolved: string[] = source
      .filter((t) => t !== null && t !== undefined && t !== "")
      .map((t) => {
        const raw =
          typeof t === "string"
            ? t
            : t?.tenantCode ??
            t?._id ??
            t?.tenantName ??
            t?.name ??
            String(t);
        const name = resolveName(String(raw));
        return name ?? String(raw); // never null → chip always shows
      });

    // Dedup
    const seen = new Set<string>();
    return resolved.filter((n) => {
      const k = n.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, tenantMap, fallbackSelectedTenants]);

  /* ── Count always matches backend array length ── */
  const selectedCount = Array.isArray(update?.selectedTenants)
    ? update.selectedTenants.length
    : Array.isArray(update?.selectedTenantDetails)
      ? update.selectedTenantDetails.length
      : tenantList.length;

  /* ── Labels ── */
  const audienceLabel = isAllTenants
    ? "All Tenants"
    : isSelectTenants
      ? `Selected Tenants (${selectedCount})`
      : `${rawAudience[0] ?? "Plan"} Tenants (${selectedCount})`;

  const allTenantsCount =
    totalTenantsCount > 0 ? totalTenantsCount : Object.keys(tenantMap).length;

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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="rounded-[14px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
            Update Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-[#454545]"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !update) {
    return (
      <div className="rounded-[14px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
            Update Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="rounded-md bg-red-50 px-4 py-3 text-[12px] text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {error || "Failed to load update details"}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#5872C5] px-6 py-2.5 text-[12px] font-semibold text-white hover:bg-[#4D66B3]"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     Main render
     ────────────────────────────────────────────────────────── */
  return (
    <div className="rounded-[14px] bg-white dark:bg-[#343434] dark:border dark:border-[#454545] shadow-2xl">
      <div className="flex items-start justify-between px-6 pt-5 pb-4">
        <h2 className="text-[16px] font-bold text-[#101B41] dark:text-white">
          Update Details
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
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

        {isAllTenants ? (
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                All Tenants
              </label>
              <div className={fieldBoxClass}>{allTenantsCount}</div>
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
                      <span
                        key={`${name}-${i}`}
                        className="rounded-md bg-[#E6EAF2] px-3 py-1.5 text-[11px] font-medium text-[#576CBC] dark:bg-[#3A4570] dark:text-[#A8B7E8]"
                      >
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
                <div
                  className={`${fieldBoxClass} font-medium ${priorityColor}`}
                >
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
              <button
                type="button"
                className="text-[#576CBC] hover:text-[#4D66B3] dark:text-[#A8B7E8]"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#5872C5] px-6 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#4D66B3] dark:bg-[#7B92D9] dark:hover:bg-[#6A82CC]"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDetails;