"use client";

import { useEffect, useState } from "react";
import { Check, Download, Upload, X } from "lucide-react";
import { IoMdInformationCircle } from "react-icons/io";
import type { RefundRow } from "./RefundTable";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface RefundDetailsModalProps {
  refund: RefundRow;
  onClose: () => void;
}

interface RefundDetails extends RefundRow {
  requestDateTime?: string;
  refundReason?: string;
  failureReason?: string | null;
  refundedAt?: string | null;
  processingFee?: number;
  tenantDetails?: {
    tenantName?: string;
    domain?: string;
    tenantId?: string;
    email?: string;
    phoneNumber?: string;
  };
  invoiceDetails?: {
    invoiceNumber?: string;
    invoiceDate?: string;
    totalAmount?: number;
  };
  paymentDetails?: {
    paymentNumber?: string;
    paymentMethod?: string;
    gateway?: string;
    amount?: string;
  };
  planDetails?: { planName?: string };
}

const formatDate = (value?: string | null) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "-";

const formatDateTime = (value?: string | null) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? `${new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })} ${new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    : "-";

const Detail = ({
  label,
  value,
  className = "",
  labelClassName = "text-[14px]",
}: {
  label: string;
  value: string | number;
  className?: string;
  labelClassName?: string;
}) => (
  <div className={className}>
    <p className={`${labelClassName} text-[#010e30] dark:text-[#fff]`}>
      {label}
    </p>
    <p className="mt-0.5 break-words font-medium text-[#343e59] dark:text-[#ccc]">
      {value || "-"}
    </p>
  </div>
);

const statusClass = (status: string) => {
  if (["APPROVED", "PAID", "SUCCESS"].includes(status)) {
    return "bg-[#E4F4E8] text-[#40BD5F]";
  }
  if (["REJECTED", "FAILED"].includes(status)) {
    return "bg-[#F6E0E0] text-[#EA4F4F]";
  }
  return "bg-[#F6ECDC] text-[#EFA133]";
};

const convertNumberToWords = (number: number): string => {
  if (number === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const underHundred = (value: number): string => {
    if (value < 10) return ones[value];
    if (value < 20) return teens[value - 10];
    const unit = value % 10;
    const ten = Math.floor(value / 10);
    return unit ? `${tens[ten]} ${ones[unit]}` : tens[ten];
  };

  const underThousand = (value: number): string => {
    if (value < 100) return underHundred(value);
    const hundred = Math.floor(value / 100);
    const remainder = value % 100;
    return remainder
      ? `${ones[hundred]} Hundred ${underHundred(remainder)}`
      : `${ones[hundred]} Hundred`;
  };

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const remainder = number % 1000;

  const parts: string[] = [];

  if (crore) parts.push(`${underThousand(crore)} Crore`);
  if (lakh) parts.push(`${underThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${underThousand(thousand)} Thousand`);
  if (remainder) parts.push(underThousand(remainder));

  return parts.join(" ");
};

const formatAmountInWords = (value?: number | string | null) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "Zero";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const rupeesWords = convertNumberToWords(rupees);
  const paiseWords = paise ? convertNumberToWords(paise) : "";

  const fullText = paise
    ? `${rupeesWords} and ${paiseWords} Paise`
    : `${rupeesWords} Only`;

  return fullText.charAt(0).toUpperCase() + fullText.slice(1);
};

export default function RefundDetailsModal({
  refund,
  onClose,
}: RefundDetailsModalProps) {
  const [details, setDetails] = useState<RefundDetails>(refund);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refundMethod, setRefundMethod] = useState<"gateway" | "manual">(
    "gateway",
  );

  const handleRefundAction = async (status: "APPROVED" | "REJECTED") => {
    const refundId = details.refundId || refund.id;

    if (!refundId) return;

    setIsUpdating(true);

    try {
      const endpoint = AppApiEndpoints.REFUND.UPDATE.replace(
        "${refundId}",
        encodeURIComponent(String(refundId)),
      );

      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refundId,
          refundMethod,
          status,
          refundStatus: status,
          paymentMethod:
            refundMethod === "gateway" ? "gateway" : "manual",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to update refund");
      }

      setDetails((prev) => ({
        ...prev,
        refundStatus: status,
        status,
      }));

      onClose();
    } catch (error) {
      console.error("Refund update API error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const endpoint = AppApiEndpoints.REFUND.GET_BY_ID.replace(
          "${refundId}",
          encodeURIComponent(refund.id),
        );
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${endpoint}`,
        );
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Failed to fetch refund details");
        }

        const item = result.data;
        setDetails({
          ...refund,
          requestDateTime: formatDateTime(item.requestedDate),
          refundId: item.refundNumber || refund.refundId,
          refundStatus: item.refundStatus || refund.refundStatus,
          status: item.status || refund.status,
          amount: Number(item.amount ?? refund.amount),
          paymentMethod: item.paymentMethod || refund.paymentMethod,
          paymentDate: formatDate(item.paymentDate),
          requestDate: formatDate(item.requestedDate),
          refundWindow: String(item.refundWindow ?? refund.refundWindow),
          refundReason: item.refundReason,
          failureReason: item.failureReason,
          refundedAt: item.refundedAt,
          processingFee: Number(item.processingFee ?? 0),
          tenant: item.tenant?.tenantName || refund.tenant,
          invoiceId: item.invoice?.invoiceNumber || refund.invoiceId,
          tenantDetails: item.tenant,
          invoiceDetails: item.invoice,
          paymentDetails: item.payment,
          planDetails: item.plan,
        });
      } catch (error) {
        console.error("Refund details API error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [refund]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white dark:bg-[#343434] p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between border-b border-gray-100 dark:border-[#454545] pb-4">
          <div>
            <h2 className="mt-1 text-base font-semibold text-[#101B41] dark:text-[#fff]">
              Refund Details
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Requested on {details.requestDateTime || details.requestDate}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close refund details"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-row items-center justify-between gap-4 rounded-xl bg-[#e8f0ff] dark:bg-[#252525] border border-[#E4E8EF] dark:border-[#454545] p-3.5 text-xs">
              <div className="max-w-[200px]">
                <p className="font-medium text-[#101B41] dark:text-[#fff]">
                  Refund Request Window
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-gray-500">
                  Refund requests must be raised within 7 days from the invoice
                  payment date.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[9px]">
                <Detail
                  label="Payment Date"
                  value={details.paymentDate}
                  labelClassName="text-[10px]"
                />
                <Detail
                  label="Request Deadline"
                  value={details.requestDate}
                  labelClassName="text-[10px]"
                />
                <div className="px-2 py-1  bg-[#f5fff5] dark:bg-[#343434] border border-[#d1f2d0] dark:border-[#454545] rounded-md">
                  {" "}
                  <Detail
                    label="Status"
                    value={`${details.refundWindow} Days Left to`}
                    labelClassName="text-[10px]"
                  />
                </div>
              </div>
            </div>

            <section className="rounded-xl border border-gray-200 dark:border-[#454545] p-3">
              <h3 className="mb-3 text-base font-medium text-[#101B41] dark:text-[#fff]">
                Tenant details
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <Detail
                  className="text-[11px]"
                  label="Tenant ID"
                  value={details.tenantDetails?.tenantId || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Tenant"
                  value={details.tenant}
                />
                <Detail
                  className="text-[11px]"
                  label="Domain"
                  value={details.tenantDetails?.domain || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Email"
                  value={details.tenantDetails?.email || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Phone Number"
                  value={details.tenantDetails?.phoneNumber || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Plan"
                  value={details.planDetails?.planName || "-"}
                />
              </div>
            </section>
            <section className="rounded-xl border border-gray-200 dark:border-[#454545] p-4">
              <h3 className="mb-3 text-base font-medium text-[#101B41] dark:text-[#fff]">
                Invoice Information
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <Detail
                  className="text-[11px]"
                  label="Invoice Number"
                  value={details.invoiceDetails?.invoiceNumber || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Invoice Date"
                  value={formatDate(details.invoiceDetails?.invoiceDate)}
                />
                <Detail
                  className="text-[11px]"
                  label="Invoice Amount"
                  value={details.invoiceDetails?.totalAmount || "-"}
                />
              </div>
            </section>
            <section className="rounded-xl border border-gray-200 dark:border-[#454545] p-4">
              <h3 className="mb-3 text-base font-medium text-[#101B41] dark:text-[#fff]">
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <Detail
                  className="text-[11px]"
                  label="Paid Amount"
                  value={details.amount || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Payment Method"
                  value={details.paymentMethod || "-"}
                />
                <Detail
                  className="text-[11px]"
                  label="Transaction Id"
                  value={details.paymentDetails?.paymentNumber || "-"}
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 dark:border-[#454545] p-4">
              <h3 className="mb-3 text-base font-medium text-[#101B41] dark:text-[#fff]">
                Refund request
              </h3>
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[#010e30] dark:text-[#fff]">
                    Reason
                  </p>
                  <div className="rounded-lg border border-gray-200 px-3 py-2 text-[#101B41] dark:text-[#fff]">
                    {details.refundReason || "-"}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[#010e30] dark:text-[#fff]">
                    Description
                  </p>
                  <div className="rounded-lg border border-gray-200 px-3 py-2 text-[#101B41] dark:text-[#fff]">
                    {details.failureReason || "-"}
                  </div>
                </div>
              </div>
              <h3 className="mb-3 mt-2 text-sm text-[#101B41] dark:text-[#fff]">
                Attachment
              </h3>
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div className="flex items-center gap-5 rounded-[12px] bg-[#F3F3F3] px-3 py-2">
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md bg-[#5B70C7] text-white">
                    <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white">
                      <Upload size={10} strokeWidth={3} color="#5b70c7" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-normal text-[#06123A]">
                      refund-request.pdf
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-[12px] text-[#576CBC] underline underline-offset-2 transition hover:text-[#3F52A4]"
                    >
                      156 KB
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Download refund request attachment"
                    className="shrink-0 p-2 text-[#050505] transition hover:text-[#576CBC]"
                  >
                    <Download size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-full lg:col-span-5">
            <section className="flex h-full flex-col justify-between gap-4 rounded-xl border border-gray-100 dark:border-[#454545] bg-white dark:bg-[#343434] p-4 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-base font-medium text-[#101B41] dark:text-[#fff]">
                  Process refund
                </h3>
                <div className="flex items-start gap-2 rounded-lg bg-[#E5EBFF] p-2.5 text-[11px] text-[#010e30]">
                  <IoMdInformationCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-[#576CBC]"
                  />
                  <p>
                    Review this request before approving or rejecting the
                    refund.
                  </p>
                </div>

                <div className="space-y-2 border border-collapse border-gray-200 dark:border-[#454545] p-3 rounded-lg">
                  <p className="mb-2 text-base font-medium text-[#101B41] dark:text-[#fff]">
                    Refund method
                  </p>

                  <label
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 dark:text-[#fff] ${
                      refundMethod === "gateway"
                        ? "border-[#576CBC] dark:border-[#e0e6ff]"
                        : "border-gray-700"
                    }`}
                  >
                    <span
                      className={`relative mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                        refundMethod === "gateway"
                          ? "border-[#576CBC] bg-[#576CBC]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={refundMethod === "gateway"}
                        onChange={() => setRefundMethod("gateway")}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      {refundMethod === "gateway" && (
                        <Check
                          className="h-3 w-3 text-[#fff]"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                    <span>
                      <strong className="block text-base font-medium text-[#101B41] dark:text-[#fff]">
                        Gateway refund (Stripe)
                      </strong>
                      <small className="text-[10px] text-[#343E59] dark:text-gray-300">
                        Amount will be refunded to this payment method
                        (UPI).{" "}
                      </small>
                    </span>
                  </label>

                  <label
                    className={`mt-2 flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 ${
                      refundMethod === "manual"
                        ? "border-[#576CBC] dark:border-[#e0e6ff]"
                        : "border-gray-700"
                    }`}
                  >
                    <span
                      className={`relative mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                        refundMethod === "manual"
                          ? "border-[#576CBC] bg-[#576CBC]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={refundMethod === "manual"}
                        onChange={() => setRefundMethod("manual")}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      {refundMethod === "manual" && (
                        <Check
                          className="h-3 w-3 text-[#fff]"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                    <span>
                      <strong className="block text-base font-medium text-[#101B41] dark:text-[#fff]">
                        Manual refund
                      </strong>
                      <small className="text-[10px] text-[#343E59] dark:text-gray-300">
                        Amount will be transferred to tenant's bank account.
                      </small>
                    </span>
                  </label>
                </div>

                <div className="space-y-2 border border-collapse border-gray-200 dark:border-[#454545] p-3 rounded-lg">
                  <p className="mb-2 *: text-base font-medium text-[#101B41] dark:text-[#fff]">
                    Refund summary
                  </p>
                  <div className="space-y-2 text-xs text-[#010e30] dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Paid Amount</span>
                      <div className="text-[#101B41] dark:text-[#fff]">
                        ₹{details.paymentDetails?.amount || "-"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Less: Non-Refundable Charges</span>
                      <div className="text-[#101B41] dark:text-[#fff]">
                        ₹{details.processingFee}
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 dark:border-[#454545] pt-2 font-semibold text-[#101B41] dark:text-gray-300">
                      <span>Total Amount</span>
                      <span>₹{details.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 border border-collapse border-[#4CB36F] bg-[#F1FDF5] p-3 rounded-lg">
                  <p className="mb-1 text-xs font-medium text-[#101B41]">
                    Total Refund Amount
                  </p>
                  <div className="space-y-2 text-xs text-[#010e30] dark:text-gray-300">
                    <div className="flex gap-x-3 font-semibold">
                      <span className="text-sm text-[#005B06]">
                        ₹{details.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] font-normal text-[#010e30]">
                        {formatAmountInWords(details.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg border border-indigo-200 bg-[#EEF2FF] py-2 text-xs font-medium text-[#4338CA] transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRefundAction("REJECTED")}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg border border-red-200 bg-[#FEF2F2] py-2 text-xs font-medium text-[#DC2626] transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? "Processing..." : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRefundAction("APPROVED")}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg bg-[#2E7D32] py-2 text-xs font-medium text-white transition hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? "Processing..." : "Approve"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
