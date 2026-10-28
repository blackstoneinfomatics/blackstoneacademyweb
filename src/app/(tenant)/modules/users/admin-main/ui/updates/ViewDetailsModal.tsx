"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface UpdateItem {
    updateTitle: string;
    description: string;
    category: string;
    publishDate: string;
    status: string;
    purchaseStatus: string;
}

interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: UpdateItem | null;
}

export default function ViewDetailsModal({ isOpen, onClose, data }: ViewDetailsModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !data || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 dark:bg-black/10 p-4 m-0 backdrop-blur-sm">
            <div className="w-full max-w-[720px] max-h-[90vh] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col dark:bg-[#2c2c2c] border border-gray-200 dark:border-[#3F3F3F]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#3F3F3F]">
                    <h2 className="text-[18px] font-semibold text-[#1F2937] dark:text-white">
                        Updates Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {/* Main Container Border */}
                    <div className="border border-[#E6EAF2] dark:border-[#4A4A4A] rounded-xl p-6">

                        {/* Top Fields Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-[16px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-2">
                                    Update Title
                                </label>
                                <input
                                    type="text"
                                    value={data.updateTitle || "—"}
                                    readOnly
                                    className="w-full h-11 px-3 border border-[#D1D5DB] rounded-lg bg-white text-[14px] text-[#6B7280] outline-none dark:bg-[#343434] dark:border-[#4A4A4A] dark:text-[#B5B5B5]"
                                />
                            </div>
                            <div>
                                <label className="block text-[16px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={data.category || "—"}
                                    readOnly
                                    className="w-full h-11 px-3 border border-[#D1D5DB] rounded-lg bg-white text-[14px] text-[#6B7280] outline-none dark:bg-[#343434] dark:border-[#4A4A4A] dark:text-[#B5B5B5]"
                                />
                            </div>
                        </div>

                        {/* Description Row */}
                        <div className="mb-6">
                            <label className="block text-[16px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description || "—"}
                                readOnly
                                rows={5}
                                className="w-full p-3 border border-[#D1D5DB] rounded-lg bg-white text-[14px] text-[#6B7280] outline-none resize-none dark:bg-[#343434] dark:border-[#4A4A4A] dark:text-[#B5B5B5]"
                            />
                        </div>

                        {/* Bottom Gray Box */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-[#F9FAFB] rounded-xl dark:bg-[#333333]">
                            <div>
                                <label className="block text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-2">
                                    Status
                                </label>
                                <input
                                    type="text"
                                    value={data.status || "—"}
                                    readOnly
                                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg bg-white text-[14px] text-[#6B7280] outline-none dark:bg-[#343434] dark:border-[#4A4A4A] dark:text-[#B5B5B5]"
                                />
                            </div>
                            <div>
                                <label className="block text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-2">
                                    Requested Send Date
                                </label>
                                <input
                                    type="text"
                                    value={data.publishDate || "—"}
                                    readOnly
                                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg bg-white text-[14px] text-[#6B7280] outline-none dark:bg-[#343434] dark:border-[#4A4A4A] dark:text-[#B5B5B5]"
                                />
                            </div>
                            <div>
                                <label className="block text-[15px] font-medium text-[#24324B] dark:text-[#E2E2E2] mb-2">
                                    Purchase Status
                                </label>
                                <input
                                    type="text"
                                    value={data.purchaseStatus || "—"}
                                    readOnly
                                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-lg bg-white text-[14px] text-[#6B7280] outline-none dark:bg-[#343434] dark:border-[#4A4A4A] dark:text-[#B5B5B5]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}