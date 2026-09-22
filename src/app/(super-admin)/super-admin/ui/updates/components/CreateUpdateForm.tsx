"use client";

import React, { useState } from "react";
import { FiChevronDown, FiInfo } from "react-icons/fi";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface UpdateFormData {
    updateTitle: string;
    category: string;
    audience: "allTenants" | "selectTenants";
    selectedTenants: string;
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
}

interface CreateUpdateFormProps {
    formData: UpdateFormData;
    isLoading: boolean;
    totalTenants?: number;
    tenantOptions?: TenantOption[];
    onClose: () => void;
    onReset: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onInputChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => void;
    onAudienceChange: (audience: "allTenants" | "selectTenants") => void;
    onSendEmailChange: (checked: boolean) => void;
    onSendInAppChange: (checked: boolean) => void;
    onFileChange: (file: File | null) => void;
}

// ─────────────────────────────────────────────
// Endpoint
// ─────────────────────────────────────────────
const API_URL = "http://localhost:5001/api/updates";

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const inputClassName =
    "w-full px-3 py-2 border border-[#D5D9E2] rounded-md text-[12px] text-[#101B41] placeholder:text-gray-400 focus:outline-none focus:border-[#5872C5] dark:bg-[#3A3A3A] dark:border-[#555] dark:text-white dark:placeholder:text-gray-500";
const selectClassName =
    "w-full appearance-none px-3 py-2 pr-9 border border-[#D5D9E2] rounded-md text-[12px] text-[#101B41] bg-white focus:outline-none focus:border-[#5872C5] dark:bg-[#3A3A3A] dark:border-[#555] dark:text-white";
const labelClassName =
    "block text-[12px] font-medium text-[#101B41] mb-1.5 dark:text-gray-200";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const CreateUpdateForm = ({
    formData,
    isLoading,
    totalTenants = 288,
    tenantOptions = [],
    onClose,
    onReset,
    onSubmit,
    onInputChange,
    onAudienceChange,
    onSendEmailChange,
    onSendInAppChange,
    onFileChange,
}: CreateUpdateFormProps) => {
    const isSelectTenants = formData.audience === "selectTenants";

    // ── Local state for API status ──
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onFileChange(file);
    };

    const buildPayload = () => {
        // Map UI category label → backend-friendly value
        const categoryMap: Record<string, string> = {
            "Feature Release": "Feature",
            "Bug Fix": "Bug Fix",
            Maintenance: "Maintenance",
            Announcement: "Announcement",
        };

        return {
            // ── strings ──
            title: formData.updateTitle.trim(),
            category: categoryMap[formData.category] ?? formData.category,
            description: formData.description.trim(),
            publishDate: formData.publishDate,          // "YYYY-MM-DD" → Date via z.coerce

            // ── single enum string ──
            priority: formData.priority as "Low" | "Medium" | "High",

            // ── status enum ──
            status: "Scheduled",                         // or "Published"

            // ── arrays ──
            audience:
                formData.audience === "allTenants"
                    ? ["All Tenants"]
                    : ["Select Tenants"],
            selectedTenants:
                formData.audience === "selectTenants" && formData.selectedTenants
                    ? [formData.selectedTenants]
                    : [],
            attachments: formData.attachments
                ? [formData.attachments.name]           // ✅ filenames only
                : [],

            // ── object (note the field name!) ──
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
                // ✅ surface the exact backend validation message
                throw new Error(
                    json.message ||
                    json.error?.[0]?.message ||
                    `HTTP ${res.status}`
                );
            }

            setSuccessMsg(json.message || "Update published successfully!");
            onSubmit(e);

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
                    {/* ── Header with Cancel × ── */}
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-[#101B41] dark:text-white">
                            Update Feature
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isWorking}
                            className="text-[#A5AAB4] hover:text-[#101B41] dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-50"
                            aria-label="Close"
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

                    {/* ── Status banner ── */}
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
                        {/* ── Update Title + Category ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClassName}>
                                    Update Title
                                </label>
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
                                <label className={labelClassName}>
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={onInputChange}
                                        className={selectClassName}
                                    >
                                        <option value="Feature Release">
                                            Feature Release
                                        </option>
                                        <option value="Bug Fix">Bug Fix</option>
                                        <option value="Maintenance">
                                            Maintenance
                                        </option>
                                        <option value="Announcement">
                                            Announcement
                                        </option>
                                    </select>
                                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* ── Audience ── */}
                        <div>
                            <label className={labelClassName}>Audience</label>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                                    <input
                                        type="checkbox"
                                        checked={
                                            formData.audience === "allTenants"
                                        }
                                        onChange={() =>
                                            onAudienceChange("allTenants")
                                        }
                                        className="h-3.5 w-3.5 accent-[#5872C5]"
                                    />
                                    All Tenants
                                </label>

                                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                                    <input
                                        type="checkbox"
                                        checked={
                                            formData.audience ===
                                            "selectTenants"
                                        }
                                        onChange={() =>
                                            onAudienceChange("selectTenants")
                                        }
                                        className="h-3.5 w-3.5 accent-[#5872C5]"
                                    />
                                    Select Tenants
                                </label>

                                {["Standard", "Premium", "Basic"].map(
                                    (plan) => (
                                        <label
                                            key={plan}
                                            className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200"
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-3.5 w-3.5 accent-[#5872C5]"
                                            />
                                            {plan}
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        {/* ── Select Tenants dropdown ── */}
                        {isSelectTenants && (
                            <div>
                                <label className={labelClassName}>
                                    Select Tenants
                                </label>
                                <div className="relative">
                                    <select
                                        name="selectedTenants"
                                        value={formData.selectedTenants}
                                        onChange={onInputChange}
                                        className={selectClassName}
                                    >
                                        <option value="">Select Tenants</option>
                                        {tenantOptions.length > 0 ? (
                                            tenantOptions.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="Blackstone Academy">
                                                    Blackstone Academy
                                                </option>
                                                <option value="Alfurqan School">
                                                    Alfurqan School
                                                </option>
                                                <option value="Bright Minds School">
                                                    Bright Minds School
                                                </option>
                                            </>
                                        )}
                                    </select>
                                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                </div>
                            </div>
                        )}

                        {/* ── Info banner ── */}
                        <div className="flex items-start gap-3 rounded-md bg-[#EEF0FB] px-3 py-2.5 text-[12px] text-[#101B41] dark:bg-[#2A3550] dark:text-gray-200">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5872C5] text-[10px] font-bold text-white">
                                <FiInfo className="h-2.5 w-2.5" />
                            </span>
                            <span>
                                This Updates will be sent to all tenants (
                                {totalTenants} tenants)
                            </span>
                        </div>

                        {/* ── Description ── */}
                        <div>
                            <label className={labelClassName}>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={onInputChange}
                                rows={6}
                                placeholder="Today Update day"
                                className={`${inputClassName} resize-none`}
                            />
                        </div>

                        {/* ── Publish Date + Priority ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClassName}>
                                    Publish Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="publishDate"
                                        value={formData.publishDate}
                                        onChange={onInputChange}
                                        className={`${inputClassName} pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <svg
                                        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="4"
                                            width="18"
                                            height="18"
                                            rx="2"
                                            ry="2"
                                        />
                                        <line
                                            x1="16"
                                            y1="2"
                                            x2="16"
                                            y2="6"
                                        />
                                        <line
                                            x1="8"
                                            y1="2"
                                            x2="8"
                                            y2="6"
                                        />
                                        <line
                                            x1="3"
                                            y1="10"
                                            x2="21"
                                            y2="10"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label className={labelClassName}>
                                    Priority
                                </label>
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

                        {/* ── Attachments + Sent Notification ── */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClassName}>
                                    Attachments
                                </label>
                                <div className="flex items-center justify-between rounded-md border border-[#D5D9E2] bg-white px-3 py-2 dark:bg-[#3A3A3A] dark:border-[#555]">
                                    <span className="truncate text-[12px] text-gray-400 dark:text-gray-500">
                                        {formData.attachments
                                            ? formData.attachments.name
                                            : "File"}
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
                                <label className={labelClassName}>
                                    Sent Notification
                                </label>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1.5">
                                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendEmail}
                                            onChange={(e) =>
                                                onSendEmailChange(
                                                    e.target.checked
                                                )
                                            }
                                            className="h-3.5 w-3.5 accent-[#5872C5]"
                                        />
                                        Email
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#101B41] dark:text-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={
                                                formData.sendInAppNotification
                                            }
                                            onChange={(e) =>
                                                onSendInAppChange(
                                                    e.target.checked
                                                )
                                            }
                                            className="h-3.5 w-3.5 accent-[#5872C5]"
                                        />
                                        In-App Notification
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ── Submit ── */}
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