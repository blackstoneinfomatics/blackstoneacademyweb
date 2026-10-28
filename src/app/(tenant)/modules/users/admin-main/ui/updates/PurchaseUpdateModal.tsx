"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle2 } from "lucide-react";
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
    const [mounted, setMounted] = useState(false);

    const [quoteData, setQuoteData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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
            if (typeof window === "undefined") throw new Error("Cannot access local storage on the server.");

            const token = localStorage.getItem("AdminPortalToken");
            const tenantId = localStorage.getItem("tenantId") || localStorage.getItem("tenantCode");
            const activationMode = scheduleType === "immediate" ? "IMMEDIATE" : "NEXT_PLAN";
            const userStr = localStorage.getItem("AdminPortalUserId");

            if (!tenantId || tenantId === "undefined" || tenantId === "null") throw new Error("Tenant ID is missing. Please log in again.");
            if (!userStr || userStr === "undefined" || userStr === "null") throw new Error("User ID is missing. Please log in again.");

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

    if (!isOpen || !mounted) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: quoteData?.currency || "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 dark:bg-black/10 p-4 m-0 backdrop-blur-sm">
            <div className="w-full max-w-[820px] max-h-[90vh] rounded-[16px] bg-white shadow-2xl overflow-hidden flex flex-col dark:bg-[#2c2c2c] border border-[#E6EAF2] dark:border-[#3F3F3F]">

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-[#E6EAF2] dark:border-[#3F3F3F]">
                    <h2 className="text-[20px] font-semibold text-[#1F2937] dark:text-white">
                        {isAlreadyPurchased ? "Update Details" : "Purchase Update"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-7 flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {isAlreadyPurchased ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <CheckCircle2 size={64} className="text-green-500 dark:text-green-400 mb-4" />
                            <h3 className="text-xl font-semibold text-[#24324B] dark:text-white mb-2">Already Purchased</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                                You have already requested or purchased access to this update.
                                It is currently active in your subscription plan.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Scheduling Section */}
                            <div className="mb-6 border border-[#E6EAF2] dark:border-[#3F3F3F] rounded-xl p-6">
                                <style>{`
                                    .custom-radio {
                                        appearance: none;
                                        -webkit-appearance: none;
                                        width: 18px;
                                        height: 18px;
                                        border: 2px solid #CBD5E1;
                                        border-radius: 50%;
                                        outline: none;
                                        cursor: pointer;
                                        position: relative;
                                        transition: all 0.2s ease-in-out;
                                        background-color: transparent;
                                    }
                                    .custom-radio:hover { border-color: #576CBC; }
                                    .custom-radio:checked { border-color: #576CBC; background-color: #ffffff; }
                                    .custom-radio:checked::after {
                                        content: '';
                                        position: absolute;
                                        top: 50%; left: 50%;
                                        transform: translate(-50%, -50%);
                                        width: 8px; height: 8px;
                                        border-radius: 50%;
                                        background-color: #576CBC;
                                    }
                                    .dark .custom-radio { border-color: #555; }
                                    .dark .custom-radio:hover, .dark .custom-radio:checked { border-color: #7FA7E8; }
                                    .dark .custom-radio:checked::after { background-color: #7FA7E8; }
                                `}</style>

                                <h3 className="text-[18px] font-medium text-[#101B41] dark:text-[#E2E2E2] mb-5">Purchase Scheduling</h3>

                                <div className="flex items-center gap-16 mb-5">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="radio" name="schedule" checked={scheduleType === "next-plan"} onChange={() => setScheduleType("next-plan")} className="custom-radio" />
                                        <span className="text-[15px] text-[#101B41] dark:text-[#B5B5B5] group-hover:text-[#576CBC] dark:group-hover:text-[#7FA7E8] transition-colors">
                                            Start with Next Plan
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="radio" name="schedule" checked={scheduleType === "immediate"} onChange={() => setScheduleType("immediate")} className="custom-radio" />
                                        <span className="text-[15px] text-[#101B41] dark:text-[#B5B5B5] group-hover:text-[#576CBC] dark:group-hover:text-[#7FA7E8] transition-colors">
                                            Activate Immediately
                                        </span>
                                    </label>
                                </div>

                                <div className="flex items-start gap-3 bg-[#F4F7FF] dark:bg-[#2F3A4E] text-[#101B41] dark:text-[#7FA7E8] p-4 rounded-lg text-[14px] leading-relaxed border border-transparent dark:border-[#3F3F3F]">
                                    <div className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#576CBC] text-white shrink-0 mt-[1px]">
                                        <span className="text-[11px] font-bold">i</span>
                                    </div>
                                    <p>
                                        {scheduleType === "next-plan"
                                            ? "This feature will be added to your next subscription and will be available from your next plan start date."
                                            : "If you activate now, you can use this feature from today until your current plan ends. From your next subscription cycle, the feature will be included in your subscription."}
                                    </p>
                                </div>
                            </div>

                            {/* Data Section */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                                    <Loader2 className="animate-spin mb-3 text-[#576CBC] dark:text-[#7FA7E8]" size={32} />
                                    <p>Fetching quote...</p>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50">
                                    {error}
                                </div>
                            ) : quoteData ? (
                                <>
                                    {scheduleType === "next-plan" ? (
                                        /* NEXT PLAN VIEW */
                                        <div>
                                            <h3 className="text-[18px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-4">Feature Summary</h3>
                                            <div className="border border-[#E6EAF2] dark:border-[#444] rounded-xl p-6 grid grid-cols-2 gap-y-6 gap-x-8 bg-[#F4F5F7] dark:bg-[#333333]">
                                                <div>
                                                    <p className="text-[14px] text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">Feature Name</p>
                                                    <p className="text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2]">{quoteData.updateName || data?.updateTitle || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">Month Amount</p>
                                                    <p className="text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2]">{formatCurrency(quoteData.monthlyAmount)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">Next Plan Start Date</p>
                                                    <p className="text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2]">
                                                        {quoteData.subscriptionEndDate ? new Date(quoteData.subscriptionEndDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">Status</p>
                                                    <p className="text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2]">Will be added in next plan</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* IMMEDIATE VIEW */
                                        <div>
                                            <h3 className="text-[18px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-4">Activate Immediately Details</h3>

                                            <div className="border border-[#E6EAF2] dark:border-[#444] rounded-xl p-6 bg-[#F4F5F7] dark:bg-[#333333]">
                                                <p className="text-[15px] text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed mb-6">
                                                    This feature will be active from today ({new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}) until your current plan ends. From your next subscription cycle, it will be included in your subscription.
                                                </p>

                                                <div className="bg-[#E8E9EC] dark:bg-[#2a2a2a] rounded-xl p-6 flex flex-col">
                                                    <h4 className="text-[17px] font-medium text-[#1F2937] dark:text-[#E2E2E2] mb-4">Subscription Summary</h4>

                                                    {/* 1. Update (Monthly Amount) */}
                                                    <div className="flex justify-between items-center text-[15px] py-2 text-[#4B5563] dark:text-[#B5B5B5]">
                                                        <span>Update</span>
                                                        <span className="font-medium text-[#1F2937] dark:text-[#E2E2E2]">{formatCurrency(quoteData.monthlyAmount)}</span>
                                                    </div>

                                                    {/* 2. Current plan remains Days */}
                                                    <div className="flex justify-between items-center text-[15px] py-2 text-[#4B5563] dark:text-[#B5B5B5]">
                                                        <span>Current plan remains Days</span>
                                                        <span className="font-medium text-[#1F2937] dark:text-[#E2E2E2]">{quoteData.remainingDays ? String(quoteData.remainingDays).padStart(2, '0') : "00"}</span>
                                                    </div>

                                                    {/* 3. Plan Remaining Amount */}
                                                    <div className="flex justify-between items-center text-[15px] py-2 text-[#4B5563] dark:text-[#B5B5B5]">
                                                        <span>Plan Remaining Amount</span>
                                                        <span className="font-medium text-[#1F2937] dark:text-[#E2E2E2]">{formatCurrency(quoteData.subAmount)}</span>
                                                    </div>

                                                    {/* 4. GST (with top border) */}
                                                    <div className="flex justify-between items-center text-[15px] py-2 text-[#4B5563] dark:text-[#B5B5B5]">
                                                        <span>GST ({quoteData.gstRate || 18}%)</span>
                                                        <span className="font-medium text-[#1F2937] dark:text-[#E2E2E2]">
                                                            + {formatCurrency(quoteData.gstAmount)}
                                                        </span>
                                                    </div>

                                                    {/* 5. Discount (below GST) */}
                                                    <div className="flex justify-between items-center text-[15px] py-2 text-[#4B5563] dark:text-[#B5B5B5] border-t border-[#D1D5DB] dark:border-[#444] mt-2">

                                                        <span>Discount ({quoteData.discountValue || 0}%)</span>
                                                        <span className="font-medium text-green-600 dark:text-green-400">- {formatCurrency(quoteData.discountAmount)}</span>
                                                    </div>

                                                    {/* 6. Total Amount */}
                                                    <div className="flex justify-between items-center text-[16px] pt-3">
                                                        <span className="font-semibold text-[#1F2937] dark:text-white">Total Amount</span>
                                                        <span className="font-semibold text-[#1F2937] dark:text-white">{formatCurrency(quoteData.totalAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[#E6EAF2] dark:border-[#3F3F3F]">
                    {isAlreadyPurchased ? (
                        <button onClick={onClose} className="px-7 py-2.5 rounded-lg bg-[#576CBC] dark:bg-[#7FA7E8] text-[15px] font-medium text-white dark:text-[#2c2c2c] hover:bg-[#4a5ca3] dark:hover:bg-[#6a91d1] transition-colors">
                            Close
                        </button>
                    ) : (
                        <>
                            <button onClick={onClose} disabled={isSubmitting} className="px-7 py-2.5 rounded-lg border border-[#576CBC] dark:border-[#7FA7E8] text-[15px] font-medium text-[#576CBC] dark:text-[#7FA7E8] hover:bg-[#F0F4FF] dark:hover:bg-[#2A3550] disabled:opacity-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={isLoading || isSubmitting || !quoteData} className="px-8 py-2.5 rounded-lg bg-[#576CBC] dark:bg-[#7FA7E8] text-[15px] font-medium text-white dark:text-[#2c2c2c] hover:bg-[#4a5ca3] dark:hover:bg-[#6a91d1] disabled:opacity-50 flex items-center gap-2 transition-colors">
                                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Submit"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}