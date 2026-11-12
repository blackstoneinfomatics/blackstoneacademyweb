"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, FileText, X } from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface InvoiceData {
    id: number | string;
    invoiceNo: string;
    type: string;
    description: string;
    amount: number;
    invoiceDate: string;
    dueDate: string;
    status: "Paid" | "Unpaid";
}

interface TransactionDetail {
    paymentNumber?: string;
    paymentType?: string;
    paymentStatus?: string;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    transactionReference?: string;
    stripePaymentIntentId?: string;
    paymentDate?: string;
    failureReason?: string | null;
    transactionId?: string;
    tenant?: {
        tenantCode?: string;
        tenantName?: string;
    };
    invoice?: {
        invoiceNumber?: string;
        invoiceDate?: string;
        dueDate?: string;
    };
    subscription?: {
        subscriptionCode?: string;
        duration?: number;
        status?: string;
    };
    subscriptionPlan?: {
        planName?: string;
    };
}

interface InvoiceDetailsModalProps {
    invoice: InvoiceData;
    onClose: () => void;
}

const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          });
};

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
    invoice,
    onClose,
}) => {
    const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTransaction = async () => {
            const tenantId = localStorage.getItem("tenantId");
            if (!tenantId) {
                setError("Tenant ID not found. Please log in again.");
                setIsLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem("AdminAuthToken");
                const response = await fetch(
                    `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}${AppApiEndpoints.INVOICE.GET_FINANCE_TRANSACTION_BY_ID(
                        tenantId,
                        String(invoice.id),
                    )}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        signal: controller.signal,
                    },
                );
                const result: {
                    success: boolean;
                    message?: string;
                    data?: TransactionDetail;
                } = await response.json();

                if (!response.ok || !result.success || !result.data) {
                    throw new Error(result.message || "Failed to fetch transaction details.");
                }

                setTransaction(result.data);
            } catch (fetchError) {
                if (controller.signal.aborted) return;
                const message =
                    fetchError instanceof Error
                        ? fetchError.message
                        : "An unexpected error occurred.";
                setError(message);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchTransaction();
        return () => controller.abort();
    }, [invoice.id]);

    const amount = transaction?.amount ?? invoice.amount;
    const currency = transaction?.currency?.toUpperCase() || "INR";
    const status = transaction?.paymentStatus
        ? transaction.paymentStatus === "SUCCESS"
            ? "Paid"
            : transaction.paymentStatus.toLowerCase().replaceAll("_", " ")
        : invoice.status;
    const statusIsPaid = transaction?.paymentStatus
        ? transaction.paymentStatus === "SUCCESS"
        : invoice.status === "Paid";
    const formattedTransactionDate = formatDate(transaction?.paymentDate);
    const transactionDate =
        formattedTransactionDate !== "N/A" ? formattedTransactionDate : invoice.invoiceDate;
    const formattedInvoiceDate = formatDate(transaction?.invoice?.invoiceDate);
    const formattedDueDate = formatDate(transaction?.invoice?.dueDate);
    const service =
        transaction?.subscriptionPlan?.planName ||
        (transaction?.paymentType === "CUSTOM_SERVICE" ? "Custom Service" : invoice.type);
    const description =
        transaction?.subscription?.duration
            ? `${service} Plan - ${transaction.subscription.duration} Month(s)`
            : invoice.description;

    const formatAmount = (value: number) =>
        `${currency === "INR" ? "₹" : `${currency} `}${value.toLocaleString("en-IN")}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="invoice-details-title"
                className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-[#454a5a] dark:bg-[#22252f]"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#454a5a] sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef2f8] text-[#4c6995] dark:bg-[#343947] dark:text-blue-300">
                            <FileText size={20} />
                        </span>
                        <div className="min-w-0">
                            <h2 id="invoice-details-title" className="text-lg font-semibold text-[#10204a] dark:text-white">
                                Invoice Details
                            </h2>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {transaction?.invoice?.invoiceNumber || transaction?.paymentNumber || invoice.invoiceNo}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <span
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                statusIsPaid
                                    ? "bg-[#eafbf1] text-[#23803d] dark:bg-[#183c2b] dark:text-[#70e49a]"
                                    : "bg-[#fff0d9] text-[#d98200] dark:bg-[#49351d] dark:text-[#ffc46b]"
                            }`}
                        >
                            {status}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close invoice details"
                            className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#343947] dark:hover:text-white"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </header>

                <div className="overflow-y-auto px-4 py-5 sm:px-6">
                    {isLoading && (
                        <p role="status" className="mb-4 rounded-lg bg-[#f7f7f7] px-4 py-3 text-sm text-gray-600 dark:bg-[#30343f] dark:text-gray-300">
                            Loading transaction details...
                        </p>
                    )}
                    {error && (
                        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    <section className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-[#10204a] dark:text-white">
                            Invoice Information
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#454a5a]">
                            <dl className="grid grid-cols-1 divide-y divide-gray-200 text-sm dark:divide-[#454a5a] sm:grid-cols-2 sm:divide-y-0">
                                <div className="grid grid-cols-2 gap-3 bg-white px-4 py-3 dark:bg-[#2c2f3a] sm:border-b sm:border-r sm:border-gray-200 dark:sm:border-[#454a5a]">
                                    <dt className="text-gray-500 dark:text-gray-400">Invoice No</dt>
                                    <dd className="break-all text-right font-medium text-[#10204a] dark:text-gray-100">
                                        {transaction?.invoice?.invoiceNumber || transaction?.paymentNumber || invoice.invoiceNo}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-2 gap-3 bg-[#f7f7f7] px-4 py-3 dark:bg-[#30343f] sm:border-b sm:border-gray-200 dark:sm:border-[#454a5a]">
                                    <dt className="text-gray-500 dark:text-gray-400">Invoice Date</dt>
                                    <dd className="text-right font-medium text-[#426da8] dark:text-blue-300">
                                        {formattedInvoiceDate !== "N/A" ? formattedInvoiceDate : invoice.invoiceDate}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-2 gap-3 bg-[#f7f7f7] px-4 py-3 dark:bg-[#30343f] sm:border-r sm:border-gray-200 dark:sm:border-[#454a5a]">
                                    <dt className="text-gray-500 dark:text-gray-400">Due Date</dt>
                                    <dd className="text-right font-medium text-[#426da8] dark:text-blue-300">
                                        {formattedDueDate !== "N/A" ? formattedDueDate : invoice.dueDate}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-2 gap-3 bg-white px-4 py-3 dark:bg-[#2c2f3a]">
                                    <dt className="text-gray-500 dark:text-gray-400">Tenant</dt>
                                    <dd className="text-right font-medium text-[#10204a] dark:text-gray-100">
                                        {transaction?.tenant?.tenantName || transaction?.tenant?.tenantCode || "N/A"}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <section className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#10204a] dark:text-white">Invoice Items</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{currency}</span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#454a5a]">
                            <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="bg-[#4c6995] text-white">
                                        <th className="px-3 py-3 font-medium">No.</th>
                                        <th className="px-3 py-3 font-medium">Service</th>
                                        <th className="px-3 py-3 font-medium">Description</th>
                                        <th className="px-3 py-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white dark:bg-[#2c2c2c]">
                                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">01</td>
                                        <td className="px-3 py-3 font-medium text-[#10204a] dark:text-gray-100">{service}</td>
                                        <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{description}</td>
                                        <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-[#10204a] dark:text-gray-100">
                                            {formatAmount(amount)}
                                        </td>
                                    </tr>
                                    <tr className="bg-[#f7f7f7] dark:bg-[#303030]">
                                        <td colSpan={3} className="px-3 py-3 text-right font-semibold text-[#10204a] dark:text-white">
                                            Total
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-[#10204a] dark:text-white">
                                            {formatAmount(amount)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#10204a] dark:text-white">
                            <CreditCard size={16} className="text-[#4c6995] dark:text-blue-300" />
                            Payment Information
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#454a5a]">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="bg-[#4c6995] text-white">
                                        <th className="px-3 py-3 font-medium">Payment Method</th>
                                        <th className="px-3 py-3 font-medium">Payment Date</th>
                                        <th className="px-3 py-3 font-medium">Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white dark:bg-[#2c2c2c]">
                                        <td className="px-3 py-3 text-[#10204a] dark:text-gray-100">
                                            {transaction?.paymentMethod || "N/A"}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-[#426da8] dark:text-blue-300">
                                            {transactionDate}
                                        </td>
                                        <td className="max-w-[220px] break-all px-3 py-3 text-gray-600 dark:text-gray-300">
                                            {transaction?.transactionId || transaction?.transactionReference || transaction?.stripePaymentIntentId || invoice.id}
                                        </td>
                                    </tr>
                                    {transaction?.failureReason && (
                                        <tr className="bg-red-50 dark:bg-red-950/40">
                                            <td colSpan={3} className="px-3 py-3 text-red-700 dark:text-red-300">
                                                <span className="font-semibold">Failure reason: </span>
                                                {transaction.failureReason}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <footer className="flex justify-end border-t border-gray-200 bg-[#fafafa] px-5 py-4 dark:border-[#454a5a] dark:bg-[#292d39] sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4c6995] focus:ring-offset-2 dark:border-[#596071] dark:bg-[#343947] dark:text-gray-200 dark:hover:bg-[#3d4352] dark:focus:ring-offset-[#292d39]"
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;
