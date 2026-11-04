// InvoiceDetailsModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";

interface InvoiceData {
    id: number;
    invoiceNo: string;
    type: string;
    description: string;
    amount: number;
    invoiceDate: string;
    dueDate: string;
    status: "Paid" | "Unpaid";
}

interface InvoiceDetailsModalProps {
    invoice: InvoiceData;
    onClose: () => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
    invoice,
    onClose,
}) => {
    const formatAmount = (amount: number) =>
        `₹${amount.toLocaleString("en-IN")}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="invoice-details-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#292d39]"
                style={{
                    scrollbarWidth: "none" /* Firefox */,
                    msOverflowStyle: "none" /* IE and Edge */,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 
                  Tailwind doesn't have a native scrollbar-hide class in v3. 
                  We add a style tag here to target the webkit scrollbar for Chrome/Safari.
                */}
                <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {/* We apply the no-scrollbar class to the container */}
                <div className="no-scrollbar h-full w-full">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2
                            id="invoice-details-title"
                            className="text-xl font-semibold text-gray-900 dark:text-white"
                        >
                            Invoice Details
                        </h2>
                        <div className="flex items-center gap-3">
                            <span
                                className={`rounded-md px-3 py-1 text-xs font-medium ${invoice.status === "Paid"
                                    ? "bg-[#eafbf1] text-[#23803d] dark:bg-[#183c2b] dark:text-[#70e49a]"
                                    : "bg-[#fff0d9] text-[#d98200] dark:bg-[#49351d] dark:text-[#ffc46b]"
                                    }`}
                            >
                                {invoice.status}
                            </span>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a4050]"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Invoice Information */}
                    <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-[#454a5a]">
                        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                            Invoice Information
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Invoice No</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {invoice.invoiceNo}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Date</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {invoice.invoiceDate}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {invoice.dueDate}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Currency</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">INR ₹</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Payment Terms</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">NET 15</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-[#454a5a]">
                        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                            Invoice Items
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-[#4c6995] text-white">
                                        <th className="px-3 py-2.5 font-medium">NO</th>
                                        <th className="px-3 py-2.5 font-medium">Service</th>
                                        <th className="px-3 py-2.5 font-medium">Description</th>
                                        <th className="px-3 py-2.5 font-medium">Unit Price</th>
                                        <th className="px-3 py-2.5 font-medium">Tax</th>
                                        <th className="px-3 py-2.5 font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 dark:border-[#454a5a]">
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">1</td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                                            Enter the Description
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                                            Enter the Description
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">12,000.00</td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">18% GST</td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">12,000.00</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-[#454a5a]">
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">2</td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                                            Enter the Description
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">
                                            Enter the Description
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">12,000.00</td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">18% GST</td>
                                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">12,000.00</td>
                                    </tr>
                                    <tr className="bg-gray-100 dark:bg-[#343947]">
                                        <td colSpan={3} className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">
                                            Total
                                        </td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">24,000.00</td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">36% GST</td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">24,000.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-[#454a5a]">
                        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                            Payment Information
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                <p className="flex items-center gap-1 font-medium text-green-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    Paid
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                                <p className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                    UPI
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Sep, 12 2023</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">IOB0000......</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Attachments */}
                    <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-[#454a5a]">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                            Notes &amp; Attachments
                        </h3>
                        <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Notes</p>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            Please make the payment before the due date to avoid service interruption.
                        </p>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-[#343947]">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-100 text-red-500">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                </svg>
                            </div>
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                                INV.001.pdf (234)
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-[#4c6995] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#3d587f]"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;