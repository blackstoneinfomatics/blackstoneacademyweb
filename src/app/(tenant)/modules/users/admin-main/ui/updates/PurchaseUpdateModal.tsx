"use client";

import React, { useState } from "react";
import { X, Info } from "lucide-react";

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[760px] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3F3F3F]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#3F3F3F]">
                    <h2 className="text-[18px] font-semibold text-[#1F2937] dark:text-white">
                        Purchase Update
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {/* Purchase Scheduling Section */}
                    <div className="mb-6">
                        <h3 className="text-[15px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-3">
                            Purchase Scheduling
                        </h3>
                        <div className="flex items-center gap-6 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="schedule"
                                    checked={scheduleType === "next-plan"}
                                    onChange={() => setScheduleType("next-plan")}
                                    className="w-4 h-4 text-[#4C6993] focus:ring-[#4C6993] border-gray-300"
                                />
                                <span className="text-sm text-[#4B5563] dark:text-[#B5B5B5]">
                                    Start with Next Plan
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="schedule"
                                    checked={scheduleType === "immediate"}
                                    onChange={() => setScheduleType("immediate")}
                                    className="w-4 h-4 text-[#4C6993] focus:ring-[#4C6993] border-gray-300"
                                />
                                <span className="text-sm text-[#4B5563] dark:text-[#B5B5B5]">
                                    Activate Immediately
                                </span>
                            </label>
                        </div>

                        {/* Info Alert */}
                        <div className="flex items-start gap-2 bg-[#EEF4FF] dark:bg-[#2F3A4E] text-[#3E6DB5] dark:text-[#7FA7E8] p-3 rounded-lg text-xs leading-relaxed">
                            <Info size={16} className="mt-0.5 shrink-0" />
                            <p>
                                {scheduleType === "next-plan"
                                    ? "This feature will be added to your next subscription and will be available from your next plan start date."
                                    : "If you activate now, you can use this feature from today until your current plan ends. From your next subscription cycle, the feature will be included in your subscription."}
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Content based on selection */}
                    {scheduleType === "next-plan" ? (
                        <div className="mb-6">
                            <h3 className="text-[15px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-3">
                                Feature Summary
                            </h3>
                            <div className="bg-[#F9FAFB] dark:bg-[#333333] rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Feature Name</p>
                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">Analytics Dashboard</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Month Amount</p>
                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">150</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Next Plan Start Date</p>
                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">01 Oct 2026</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Status</p>
                                    <p className="text-sm font-medium text-[#24324B] dark:text-[#E2E2E2]">Will be added in next plan</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <h3 className="text-[15px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-2">
                                Activate Immediately Details
                            </h3>
                            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4 leading-relaxed">
                                This feature will be active from today (01 Apr 2026) until your current plan ends. From your next subscription cycle, it will be included in your subscription.
                            </p>

                            <h4 className="text-[14px] font-medium text-[#4B5563] dark:text-[#E2E2E2] mb-2 mt-6">
                                Subscription Summary
                            </h4>
                            <div className="bg-[#F9FAFB] dark:bg-[#333333] rounded-xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">Feature</span>
                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">₹1000</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">Current plan remaing Days</span>
                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">08</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">Plan Remaining Amount</span>
                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">₹700</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-[#4A4A4A] pb-3">
                                    <span className="text-[#4B5563] dark:text-[#B5B5B5]">GST (18%)</span>
                                    <span className="font-medium text-[#24324B] dark:text-[#E2E2E2]">₹781.7</span>
                                </div>
                                <div className="flex justify-between items-center text-[15px]">
                                    <span className="font-semibold text-[#24324B] dark:text-[#E2E2E2]">Total Amount</span>
                                    <span className="font-semibold text-[#24324B] dark:text-[#E2E2E2]">₹4,990.00</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#3F3F3F]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-[#D1D5DB] text-sm font-medium text-[#4B5563] hover:bg-gray-50 dark:border-[#4A4A4A] dark:text-[#B5B5B5] dark:hover:bg-[#333333] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(scheduleType)}
                        className="px-6 py-2 rounded-lg bg-[#576CBC] text-sm font-medium text-white hover:bg-[#576CBC] dark:bg-[#7FA7E8] dark:text-[#2c2c2c] dark:hover:bg-[#6a91d1] cursor-pointer"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}