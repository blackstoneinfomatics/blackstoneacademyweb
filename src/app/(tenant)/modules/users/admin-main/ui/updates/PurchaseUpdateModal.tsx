"use client";

import React, { useState, useEffect } from "react";
import { X, Info, Loader2, CheckCircle2 } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface PurchaseUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scheduleType: string) => void;
    data: any | null;
}

export default function PurchaseUpdateModal({
    isOpen,
    onClose,
    onConfirm,
    data,
}: PurchaseUpdateModalProps) {
    const [scheduleType, setScheduleType] = useState<"next-plan" | "immediate">("next-plan");

    const [quoteData, setQuoteData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAlreadyPurchased =
        data?.purchaseStatus?.toLowerCase() === "purchased" ||
        data?.purchaseStatus?.toLowerCase() === "requested";

    useEffect(() => {
        if (!isOpen || !data?.id || isAlreadyPurchased) return;

        const fetchQuote = async () => {
            setIsLoading(true);
            setError(null);
            setQuoteData(null);
            try {
                const token = localStorage.getItem("hillescape_token");
                const tenantId = localStorage.getItem("tenantId") || localStorage.getItem("tenantCode");
                const activationMode = scheduleType === "immediate" ? "IMMEDIATE" : "NEXT_PLAN";

                const url = `${AppApiEndpoints.API_END_POINT}/update/purchase/quote/${data.id}?activationMode=${activationMode}`;

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "tenantid": tenantId || "",
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to load quote. Backend returned ${res.status}`);
                }

                const json = await res.json();
                setQuoteData(json.data || json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuote();
    }, [isOpen, data, scheduleType, isAlreadyPurchased]);

    const handleSubmit = async () => {
        if (!data?.id) return;
        setIsSubmitting(true);
        setError(null);

        try {
            // 🚨 1. CHECK IF WINDOW IS UNDEFINED (SSR SAFETY)
            if (typeof window === "undefined") {
                throw new Error("Cannot access local storage on the server.");
            }

            const token = localStorage.getItem("AdminPortalToken");
            const tenantId = localStorage.getItem("tenantId") || localStorage.getItem("tenantCode");
            const activationMode = scheduleType === "immediate" ? "IMMEDIATE" : "NEXT_PLAN";

            const userStr = localStorage.getItem("AdminPortalUserId");

            // 🚨 2. CHECK FOR UNDEFINED VALUES IN LOCAL STORAGE
            if (!tenantId || tenantId === "undefined" || tenantId === "null") {
                throw new Error("Tenant ID is missing. Please log in again.");
            }
            if (!userStr || userStr === "undefined" || userStr === "null") {
                throw new Error("User ID is missing. Please log in again.");
            }

            const url = `${AppApiEndpoints.API_END_POINT}/update/purchase/${data.id}?activationMode=${activationMode}&requestedBy=${userStr}`;

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "tenantid": tenantId,
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = "Purchase failed. Please try again.";

                try {
                    const parsedError = JSON.parse(errorText);
                    if (parsedError.message) errorMessage = parsedError.message;
                } catch (e) {
                    errorMessage = errorText;
                }

                console.error(`Purchase API Error (${res.status}):`, errorMessage);

                if (errorMessage.includes("already exists")) {
                    alert("This update has already been requested for your account.");
                    onConfirm(scheduleType);
                    onClose();
                    return;
                }
                throw new Error(errorMessage);
            }
            onConfirm(scheduleType);
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[760px] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3F3F3F]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#3F3F3F]">
                    <h2 className="text-[18px] font-semibold text-[#1F2937] dark:text-white">
                        {isAlreadyPurchased ? "Update Details" : "Purchase Update"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh] min-h-[300px]">
                    {isAlreadyPurchased ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <CheckCircle2 size={64} className="text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold text-[#24324B] dark:text-white mb-2">Already Purchased</h3>
                            <p className="text-gray-500 text-center max-w-md mb-6">
                                You have already requested or purchased access to this update.
                                It is currently active in your subscription plan.
                            </p>
                            <div className="bg-[#F9FAFB] dark:bg-[#333333] rounded-xl p-4 w-full max-w-md">
                                <p className="text-sm text-[#4B5563] dark:text-[#B5B5B5] mb-1">Update Name</p>
                                <p className="font-medium text-[#24324B] dark:text-[#E2E2E2]">{data?.updateTitle || "N/A"}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h3 className="text-[15px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-3">Purchase Scheduling</h3>
                                <div className="flex items-center gap-6 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="schedule" checked={scheduleType === "next-plan"} onChange={() => setScheduleType("next-plan")} className="w-4 h-4 text-[#4C6993] focus:ring-[#4C6993]" />
                                        <span className="text-sm text-[#4B5563] dark:text-[#B5B5B5]">Start with Next Plan</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="schedule" checked={scheduleType === "immediate"} onChange={() => setScheduleType("immediate")} className="w-4 h-4 text-[#4C6993] focus:ring-[#4C6993]" />
                                        <span className="text-sm text-[#4B5563] dark:text-[#B5B5B5]">Activate Immediately</span>
                                    </label>
                                </div>

                                <div className="flex items-start gap-2 bg-[#EEF4FF] dark:bg-[#2F3A4E] text-[#3E6DB5] dark:text-[#7FA7E8] p-3 rounded-lg text-xs leading-relaxed">
                                    <Info size={16} className="mt-0.5 shrink-0" />
                                    <p>
                                        {scheduleType === "next-plan"
                                            ? "This feature will be added to your next subscription and will be available from your next plan start date."
                                            : "If you activate now, you can use this feature from today until your current plan ends."}
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                    <Loader2 className="animate-spin mb-3 text-[#576CBC]" size={32} />
                                    <p>Fetching quote...</p>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            ) : quoteData ? (
                                <>
                                    {scheduleType === "next-plan" ? (
                                        <div className="mb-6">
                                            <h3 className="text-[15px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-3">Feature Summary</h3>
                                            <div className="bg-[#F9FAFB] dark:bg-[#333333] rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-8">
                                                <div>
                                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Feature Name</p>
                                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">{quoteData.updateName || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Month Amount</p>
                                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">{quoteData.currency === "INR" ? "₹" : ""}{quoteData.monthlyAmount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Next Plan Start Date</p>
                                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">
                                                        {new Date(quoteData.subscriptionEndDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Status</p>
                                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">Will be added in next plan</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-6">
                                            <h3 className="text-[15px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-2">Activate Immediately Details</h3>
                                            <h4 className="text-[14px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-2 mt-4">Subscription Summary</h4>
                                            <div className="bg-[#F9FAFB] dark:bg-[#333333] rounded-xl p-4 flex flex-col gap-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">Feature Amount</span>
                                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">{quoteData.currency === "INR" ? "₹" : ""}{quoteData.monthlyAmount || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">Current plan remaining Days</span>
                                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">{quoteData.remainingDays || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">Plan Remaining Amount</span>
                                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">₹{quoteData.remainingAmount || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-[#4A4A4A] pb-3">
                                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">GST (18%)</span>
                                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">₹{quoteData.gst || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[15px]">
                                                    <span className="font-semibold text-[#24324B] dark:text-[#E2E2E2]">Total Amount</span>
                                                    <span className="font-semibold text-[#24324B] dark:text-[#E2E2E2]">{quoteData.currency === "INR" ? "₹" : ""}{quoteData.totalAmount || quoteData.monthlyAmount || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#3F3F3F]">
                    {isAlreadyPurchased ? (
                        <button onClick={onClose} className="px-6 py-2 rounded-lg bg-[#576CBC] text-sm font-medium text-white hover:bg-[#4a5ca3]">
                            Close
                        </button>
                    ) : (
                        <>
                            <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-lg border border-[#D1D5DB] text-sm font-medium text-[#4B5563] hover:bg-gray-50 disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={isLoading || isSubmitting || !quoteData} className="px-6 py-2 rounded-lg bg-[#576CBC] text-sm font-medium text-white hover:bg-[#4a5ca3] disabled:opacity-50 flex items-center gap-2">
                                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : "Submit"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}