import React from "react";
import Link from "next/link";
import Image from "next/image";
import PaymentClient from "./PaymentClient";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type ObjectIdValue = { $oid?: string };

type Invoice = {
  _id?: string | ObjectIdValue;
  invoiceId?: string;
  invoiceNumber?: string;
  tenant: {
    tenantId: string;
    tenantName: string;
    email?: string;
    phoneNumber?: string;
    status?: string;
    domainName?: string;
  };
  subscriptionPlan: {
    planId?: string | ObjectIdValue;
    planName?: string;
    duration?: string;
    gstAndTax?: number;
    discount?: number;
  };
  subscription: { subscriptionId?: string | ObjectIdValue };
  invoiceDate?: string | { $date?: string };
  dueDate?: string | { $date?: string };
  currency?: string;
  paymentTerms?: number;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  status?: string;
  notes?: string;
  attachments?: unknown[];
  createdBy?: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  createdAt?: string | { $date?: string };
  updatedAt?: string | { $date?: string };
};

type Props = { params: { id: string } };

const getObjectId = (value: string | ObjectIdValue | undefined): string => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.$oid || "-";
};

const getDateValue = (value?: string | { $date?: string }): string => {
  if (!value) return "-";
  const dateString = typeof value === "string" ? value : value.$date;
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount?: number, currency = "INR") => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

async function getInvoice(id: string): Promise<Invoice | null> {
  try {
    const res = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.GET_SUPERADMIN_SUBSCRIPTION}/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const result = await res.json();
    return result?.data || result;
  } catch (e) {
    console.error("Error fetching invoice", e);
    return null;
  }
}

export default async function Page({ params }: Props) {
  const { id } = params;
  const invoice = await getInvoice(id);
  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#EEF0FD] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#CECECE] p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Invoice Not Found
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            We couldn't retrieve the subscription invoice. Please check the
            invoice ID and try again.
          </p>
        </div>
      </div>
    );
  }

  const invoiceId =
    typeof invoice._id === "string" ? invoice._id : getObjectId(invoice._id);
  const planId = getObjectId(invoice.subscriptionPlan.planId);
  // const subscriptionId = getObjectId(invoice.subscription.subscriptionId);
  const currency = invoice.currency || "INR";
  const subtotal = Number(invoice.subtotal || 0);
  const discount = Number(invoice.subscriptionPlan.discount || 0);
  const tax = Number(invoice.taxAmount || 0);
  const total = Number(invoice.totalAmount || 0);

  return (
    <div className="min-h-screen bg-[#eef1f6] py-8 sm:py-12 px-3 sm:px-6 text-slate-800">
      {/* Invoice Container */}
      <div className="max-w-[900px] mx-auto">
        <div className="bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)] border border-slate-200 rounded-lg">
          <div className="px-7 sm:px-12 pt-9 sm:pt-12 pb-8">
            <div className="flex flex-col sm:flex-row justify-between gap-8">
              {/* Company */}
              <div className="flex items-start gap-4">
                <div>
                  <Image
                    src="/assets/images/bsicon.png"
                    alt="Blackstone Academy"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Invoice Heading */}
              <div className="sm:text-right">
                <h1 className="text-[38px] leading-none font-black tracking-[0.08em] text-[#0D3FC1]">
                  INVOICE
                </h1>

                <div className="mt-4 space-y-1">
                  <p className="text-xs text-slate-400">Invoice Number</p>

                  <p className="text-sm font-bold text-slate-900">
                    {invoice.invoiceNumber || invoice.invoiceId || invoiceId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Blue divider */}
          <div className="h-[3px] bg-[#0D3FC1]" />

          {/* ================= BILLING ================= */}
          <div className="px-7 sm:px-12 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* From */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-[#0D3FC1]" />

                  <h3 className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-slate-500">
                    From
                  </h3>
                </div>

                <p className="text-sm font-bold text-[#101b36]">
                  BLACKSTONE ACADEMY
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Enterprise SaaS Platform
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Blackstone Infomatics
                </p>
              </div>

              {/* Bill To */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-[#0D3FC1]" />

                  <h3 className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-slate-500">
                    Bill To
                  </h3>
                </div>

                <p className="text-sm font-bold text-[#101b36]">
                  {invoice.tenant?.tenantName || "-"}
                </p>

                {invoice.tenant?.email && (
                  <p className="text-xs text-slate-500 mt-1">
                    {invoice.tenant.email}
                  </p>
                )}

                {invoice.tenant?.phoneNumber && (
                  <p className="text-xs text-slate-500 mt-1">
                    {invoice.tenant.phoneNumber}
                  </p>
                )}

                {invoice.tenant?.domainName && (
                  <p className="text-xs text-slate-500 mt-1">
                    {invoice.tenant.domainName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ================= SUBSCRIPTION INFO ================= */}
          <div className="mx-7 sm:mx-12 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-[#f7f8fc] px-5 py-3 border-b border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.12em] font-extrabold text-slate-500">
                Subscription Details
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3">
              <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-slate-200">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  Billing Cycle
                </p>

                <p className="text-sm font-bold text-slate-800 mt-1">
                  <p className="text-[11px] font-semibold text-slate-800 mt-0.5">
                    {invoice.subscriptionPlan.duration || "N/A"} Months
                  </p>
                </p>
              </div>

              <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-slate-200">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  Invoice Date
                </p>

                <p className="text-[11px] font-semibold text-slate-800 mt-1 capitalize">
                  {getDateValue(invoice.invoiceDate)}
                </p>
              </div>

              <div className="px-5 py-4">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  Due Date
                </p>

                <p className="text-[11px] font-semibold text-slate-700 mt-1 break-all">
                  {getDateValue(invoice.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* ================= ITEMS ================= */}
          <div className="px-7 sm:px-12 pt-10">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#101c38] text-white">
                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold">
                      Description
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] uppercase tracking-wider font-bold w-[180px]">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-5 py-3">
                      <p className="text-[11px] text-slate-400">Plan</p>
                      <p className="text-sm mt-1 font-bold text-slate-800">
                        {invoice.subscriptionPlan?.planName
                          ? invoice.subscriptionPlan.planName
                              .charAt(0)
                              .toUpperCase() +
                            invoice.subscriptionPlan.planName.slice(1)
                          : "Subscription Plan"}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800">
                      {formatCurrency(subtotal, currency)}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-200">
                    <td className="px-5 py-3 text-sm text-slate-600">
                      Discount (%)
                    </td>

                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800">
                      {invoice.subscriptionPlan.discount}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      Tax ({invoice.subscriptionPlan.gstAndTax} %)
                    </td>

                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800">
                      {formatCurrency(tax, currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= TOTAL ================= */}
          <div className="px-7 sm:px-12 py-8">
            <div className="flex justify-end">
              <div className="w-full sm:w-[330px]">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-semibold text-slate-800">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>

                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Discount (%)</span>

                  <span className="font-semibold text-slate-800">
                    {invoice.subscriptionPlan.discount}
                  </span>
                </div>

                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Tax (%)</span>

                  <span className="font-semibold text-slate-800">
                    {formatCurrency(tax, currency)}
                  </span>
                </div>

                <div className="border-t-2 border-[#101c38] mt-3 pt-4 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-[#101c38]">
                    Total Due
                  </span>

                  <span className="text-xl font-black text-[#0D3FC1]">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PAYMENT ================= */}
          <div className="mx-7 sm:mx-12 mb-8 rounded-lg bg-[#f7f9ff] border border-[#dce4ff]">
            <div className="px-5 py-4 border-b border-[#dce4ff]">
              <h3 className="text-sm font-bold text-[#101c38]">Payment</h3>

              <p className="text-[11px] text-slate-500 mt-1">
                Complete your payment securely using the available payment
                options.
              </p>
            </div>

            <div className="px-5 py-6 flex justify-center">
              <PaymentClient invoice={invoice} id={id} />
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="border-t border-slate-200 px-7 sm:px-12 py-7">
            <div className="flex flex-col sm:flex-row justify-between gap-5">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Thank you for your business.
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  This invoice was generated by Blackstone Infomatics.
                </p>
              </div>

              <div className="sm:text-right text-[10px] text-slate-400">
                <p>
                  Powered by{" "}
                  <Link
                    href="https://blackstoneinfomatics.com/"
                    className="font-bold"
                  >
                    Blackstone Infomatics
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="text-center mt-5">
          <p className="text-[10px] text-slate-400">
            BLACKSTONE ACADEMY • Enterprise SaaS Platform
          </p>
        </div>
      </div>
    </div>
  );
}
