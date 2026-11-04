// RefundModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, Info, CheckCircle2 } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";

type PlanOption = {
    id: string;
    name: string;
};

const extractPlans = (response: unknown): PlanOption[] => {
    if (typeof response !== "object" || response === null) return [];
    const root = response as Record<string, unknown>;
    const data = typeof root.data === "object" && root.data !== null
        ? root.data as Record<string, unknown>
        : null;
    const candidates =
        (Array.isArray(data?.items) && data.items) ||
        (Array.isArray(root.items) && root.items) ||
        (Array.isArray(root.data) && root.data) ||
        (Array.isArray(response) && response) ||
        [];

    return candidates.flatMap((candidate) => {
        if (typeof candidate !== "object" || candidate === null) return [];
        const plan = candidate as Record<string, unknown>;
        if (typeof plan.planName !== "string") return [];
        const id =
            typeof plan._id === "string"
                ? plan._id
                : typeof plan.planId === "string"
                    ? plan.planId
                    : plan.planName;
        return [{ id, name: plan.planName }];
    });
};

interface RefundModalProps {
    onClose: () => void;
    paymentId: string;
    tenantName: string;
}

const PLAN_CHANGE_REASON = "Want to change to another plan";

const RefundModal: React.FC<RefundModalProps> = ({
    onClose,
    paymentId,
    tenantName,
}) => {
    const [refundReason, setRefundReason] = useState("");
    const [newPlan, setNewPlan] = useState("");
    const [plans, setPlans] = useState<PlanOption[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [plansError, setPlansError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [additionalDetails, setAdditionalDetails] = useState("");
    const [refundAmount, setRefundAmount] = useState("₹12,000");
    const [refundMethod, setRefundMethod] = useState("UPI");

    useEffect(() => {
        if (refundReason !== PLAN_CHANGE_REASON) return;

        const controller = new AbortController();
        const loadPlans = async () => {
            setIsLoadingPlans(true);
            setPlansError(null);
            try {
                const token = localStorage.getItem("AdminAuthToken");
                const response = await fetch(
                    `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.PLAN.GET_ACTIVE_PLANS}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        signal: controller.signal,
                    },
                );
                const result: unknown = await response.json();
                if (!response.ok) {
                    const message =
                        typeof result === "object" && result !== null && "message" in result
                            ? String((result as { message?: unknown }).message)
                            : "Failed to load active plans.";
                    throw new Error(message);
                }

                const availablePlans = extractPlans(result);
                if (availablePlans.length === 0) {
                    throw new Error("No active plans are available.");
                }
                setPlans(availablePlans);
            } catch (error) {
                if (controller.signal.aborted) return;
                setPlansError(
                    error instanceof Error ? error.message : "Unable to load active plans.",
                );
            } finally {
                if (!controller.signal.aborted) setIsLoadingPlans(false);
            }
        };

        loadPlans();
        return () => controller.abort();
    }, [refundReason]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (refundReason === PLAN_CHANGE_REASON && !newPlan) {
            setSubmitError("Select a new plan to continue.");
            return;
        }
        if (!paymentId) {
            setSubmitError("Payment ID is missing. Please refresh and try again.");
            return;
        }
        if (!tenantName.trim()) {
            setSubmitError("Tenant name is missing. Please sign in again.");
            return;
        }

        const submitRefundRequest = async () => {
            setIsSubmitting(true);
            try {
                const tenantId = localStorage.getItem("tenantId");
                if (!tenantId) {
                    throw new Error("Tenant ID is missing. Please sign in again.");
                }

                const token = localStorage.getItem("AdminAuthToken");
                const response = await fetch(
                    `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.REFUND.CREATE_REQUEST}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({
                            tenantId,
                            tenantName: tenantName.trim(),
                            paymentId,
                            refundMethod,
                            refundReason,
                            ...(newPlan ? { newPlan } : {}),
                            ...(additionalDetails.trim()
                                ? { additionalDetails: additionalDetails.trim() }
                                : {}),
                        }),
                    },
                );
                const result: { success?: boolean; message?: string } = await response.json();
                if (!response.ok || result.success === false) {
                    throw new Error(result.message || "Failed to submit refund request.");
                }

                toast.success(result.message || "Refund request submitted successfully.");
                onClose();
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Unable to submit refund request.";
                setSubmitError(message);
                toast.error(message);
            } finally {
                setIsSubmitting(false);
            }
        };

        void submitRefundRequest();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="refund-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#292d39]"
                style={{
                    scrollbarWidth: "none" /* Firefox */,
                    msOverflowStyle: "none" /* IE and Edge */,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hide scrollbar for WebKit browsers (Chrome, Safari, Edge) */}
                <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                <div className="no-scrollbar h-full w-full">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2
                            id="refund-title"
                            className="text-xl font-semibold text-gray-900 dark:text-white"
                        >
                            Refund Details
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a4050]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#f4f7fc] p-3.5 dark:bg-[#2a3a50]">
                        {/* Blue Circle with White 'i' */}
                        <div className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#576CBC] text-white">
                            <Info size={20} strokeWidth={2} />
                        </div>
                        <p className="text-sm font-medium text-[#334155] dark:text-blue-200">
                            Refund requests can only be submitted within 7 days of the payment date. Requests submitted after 7 days are not eligible for a refund.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Payment Details - Forced to 5 columns */}
                        <div className="mb-5">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                Payment Details
                            </h3>
                            <div className="grid grid-cols-5 gap-2 text-sm">
                                <div>
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Current Plan</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Premium Plan</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Paid Amount</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">₹12,000</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Payment Date</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">22 Sep 2026</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Refund Eligibility</p>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eafbf1] px-2 py-0.5 text-xs font-medium text-[#23803d] dark:bg-[#183c2b] dark:text-[#70e49a] whitespace-nowrap">
                                        <CheckCircle2 size={12} className="shrink-0" />
                                        Eligible
                                    </span>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Days Remaining</p>
                                    <p className="text-sm font-medium text-green-600 whitespace-nowrap">5 Days</p>
                                </div>
                            </div>
                        </div>

                        {/* Refund Reason & New Plan */}
                        <div className="mb-4">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                Refund Reason
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <select
                                        value={refundReason}
                                        onChange={(e) => {
                                            setRefundReason(e.target.value);
                                            setNewPlan("");
                                            setPlans([]);
                                            setPlansError(null);
                                            setSubmitError(null);
                                        }}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-white"
                                        aria-label="Refund reason"
                                        required
                                    >
                                        <option value="" disabled>Select refund reason</option>
                                        <option value={PLAN_CHANGE_REASON}>{PLAN_CHANGE_REASON}</option>
                                        <option value="Not satisfied with the service">Not satisfied with the service</option>
                                        <option value="Billing issue">Billing issue</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                {refundReason === PLAN_CHANGE_REASON && (
                                <div>
                                    <select
                                        value={newPlan}
                                        onChange={(e) => setNewPlan(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-400 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-gray-400"
                                        aria-label="New plan"
                                        disabled={isLoadingPlans || plans.length === 0}
                                        required
                                    >
                                        <option value="">
                                            {isLoadingPlans ? "Loading plans..." : "Select new plan"}
                                        </option>
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.name}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                    {plansError && (
                                        <p role="alert" className="mt-1 text-xs text-red-600">
                                            {plansError}
                                        </p>
                                    )}
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="mb-4">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                Additional Details
                            </h3>
                            <textarea
                                value={additionalDetails}
                                onChange={(e) => setAdditionalDetails(e.target.value)}
                                placeholder="Please provide the reason for requesting a refund."
                                rows={3}
                                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-white dark:placeholder:text-gray-500"
                            />
                        </div>
                        {submitError && (
                            <p role="alert" className="mb-3 text-sm text-red-600">
                                {submitError}
                            </p>
                        )}

                        {/* Refund Amount & Method */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    Refund Amount
                                </h3>
                                <input
                                    type="text"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-green-600 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-green-400"
                                />
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    Refund Method
                                </h3>
                                <select
                                    value={refundMethod}
                                    onChange={(e) => setRefundMethod(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-[#454a5a] dark:bg-[#22252f] dark:text-white"
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Original Payment Method">Original Payment Method</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-blue-200 px-5 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-[#4a5a7a] dark:text-blue-300 dark:hover:bg-[#343e55]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || (refundReason === PLAN_CHANGE_REASON && isLoadingPlans)}
                                className="rounded-lg bg-[#4c6995] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3d587f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RefundModal;