"use client";
import React, { useEffect, useState } from "react";
import { X, Download, FileText } from "lucide-react";

const TENANTS_API = "http://localhost:5001/tenant";

interface UpdateDetailsProps {
  updateId: string;
  update: any | null;
  loading: boolean;
  error: string | null;
  fallbackSelectedTenants?: string[];
  totalTenantsCount?: number;
  onClose: () => void;
}

const UpdateDetails = ({
  update,
  loading,
  error,
  fallbackSelectedTenants = [],
  totalTenantsCount = 0,
  onClose,
}: UpdateDetailsProps) => {
  // ✅ Tenant ID → Name map
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
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

        const map: Record<string, string> = {};
        items.forEach((t: any) => {
          const code = t.tenantCode ?? t._id ?? t.id;
          const name = t.tenantName ?? t.name;
          if (code && name) {
            map[code] = name;
            if (t._id) map[t._id] = name;
          }
        });

        if (!cancelled) setTenantMap(map);
      } catch (e) {
        console.error("Failed to load tenant map:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // ─────────────────────────────────────────────
  // Audience analysis
  // ─────────────────────────────────────────────
  const rawAudience: string[] = Array.isArray(update.audience)
    ? update.audience
    : [update.audience ?? "All Tenants"];

  const audienceJoined = rawAudience.join(" ").toLowerCase();
  const isAllTenants = audienceJoined.includes("all tenant");
  const isSelectTenants = audienceJoined.includes("select tenant");
  const isByPlan = !isAllTenants && !isSelectTenants;

  // Resolve value → tenant name
  const resolveName = (value: string): string => {
    if (!value) return "";
    if (tenantMap[value]) return tenantMap[value];
    return value;
  };

  const tenantList: string[] = (() => {
    const collected: string[] = [];

    if (Array.isArray(update.selectedTenantDetails)) {
      update.selectedTenantDetails.forEach((t: any) => {
        const raw = t?.tenantName ?? t?.name ?? t?.tenantCode ?? t?._id;
        const name = resolveName(String(raw ?? ""));
        if (name) collected.push(name);
      });
    }

    if (Array.isArray(update.selectedTenants)) {
      update.selectedTenants.forEach((t: any) => {
        if (!t) return;
        if (typeof t === "string") {
          const name = resolveName(t);
          if (name) collected.push(name);
        } else {
          const raw =
            t?.tenantName ?? t?.name ?? t?.tenantCode ?? t?._id ?? "";
          const name = resolveName(String(raw));
          if (name) collected.push(name);
        }
      });
    }

    if (collected.length === 0 && fallbackSelectedTenants.length > 0) {
      fallbackSelectedTenants.forEach((n) => {
        const name = resolveName(n);
        if (name) collected.push(name);
      });
    }

    return Array.from(new Set(collected));
  })();

  const allTenantsCount =
    totalTenantsCount > 0
      ? totalTenantsCount
      : update.affectedTenants ?? update.audienceCount ?? 0;

  const planTenantsCount =
    update.affectedTenants ??
    update.planTenantCount ??
    update.audienceCount ??
    tenantList.length;

  const audienceLabel = isAllTenants
    ? `All Tenants`
    : isSelectTenants
      ? `Selected Tenants (${tenantList.length})`
      : rawAudience[0] ?? "Plan";

  const statusValue: string =
    update.status ?? update.updateStatus ?? update.state ?? "—";

  const statusColor =
    statusValue === "Published"
      ? "text-[#40BD5F] dark:text-[#68D391]"
      : statusValue === "Scheduled"
        ? "text-[#EFA133] dark:text-[#F5C97B]"
        : statusValue === "Archived"
          ? "text-[#EA4F4F] dark:text-[#FC8181]"
          : "text-[#576CBC] dark:text-[#8296E6]";

  const priorityColor =
    update.priority === "High"
      ? "text-[#EA4F4F] dark:text-[#FC8181]"
      : update.priority === "Medium"
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

  const publishDate = formatDate(update.publishDate || update.releaseDate);
  const attachments: string[] = Array.isArray(update.attachments)
    ? update.attachments
    : [];

  const fieldBoxClass =
    "flex w-full items-center rounded-md border border-[#D5D9E2] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#101B41] min-h-[42px] dark:border-[#555] dark:bg-[#3A3A3A] dark:text-white";

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

        {/* All Tenants layout */}
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
        ) : isSelectTenants ? (
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
        ) : (
          /* Plan layout — with tenant list + count */
          <>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#101B41] dark:text-gray-200">
                {audienceLabel} Tenants ({tenantList.length})
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
                      No tenants on this plan
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
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    156 KB
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