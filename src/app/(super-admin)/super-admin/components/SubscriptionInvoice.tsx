"use client";

import React, { useState, ChangeEvent } from "react";
import { Calendar, ChevronDown, Upload } from "lucide-react";

type Props = {
  readonly onClose: () => void;
};

interface InvoiceFormData {
  tenant: string;
  plan: string;
  billingStartDate: string;
  billingEndDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  notes: string;
}

export default function SubscriptionInvoice({ onClose }: Props) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    tenant: "For All Overdue Tenants",
    plan: "For All Overdue Tenants",
    billingStartDate: "Jan 20, 2020",
    billingEndDate: "Jan 24, 2020",
    invoiceNumber: "SUB-INV-2024-000146",
    invoiceDate: "Jan 20, 2020",
    dueDate: "Jan 20, 2020",
    currency: "INR - Indian Rupee (₹)",
    paymentTerms: "15",
    notes: "Thank you for choosing Blackstone Nexus.",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#F0F2F9] p-4 text-slate-700">
      {/* <h1 className="text-xl font-bold text-[#1E293B]">Invoices</h1> */}

      <div className="mx-auto max-w-6xl space-y-6 border border-[#E4E8EF] bg-white p-4 rounded-xl">
        {/* Header Section */}
        <div>
          <span className="text-base font-medium text-[#1E293B]">
            Subscription Invoice
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Create an invoice for a tenant based on their subscription plan.
          </p>
        </div>

        {/* Section 1: Tenant & Subscription Details */}
        <div className="space-y-5 rounded-xl border border-[#E4E8EF] bg-white p-6">
          <h2 className="text-base font-semibold text-[#1E293B]">
            Tenant & Subscription Details
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Select Tenant
              </label>
              <div className="relative">
                <select
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="For All Overdue Tenants">
                    For All Overdue Tenants
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Plan
              </label>
              <div className="relative">
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="For All Overdue Tenants">
                    For All Overdue Tenants
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Billing Cycle
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.billingStartDate}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700"
                  />
                  <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.billingEndDate}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700"
                  />
                  <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Plan Amount
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                ₹ 12,000.00
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Cycle
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                Monthly
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Start Date
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                May 01, 2024
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                End Date
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                May 31, 2024
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Invoice Information */}
        <div className="space-y-5 rounded-xl border border-[#E4E8EF] bg-white p-6">
          <h2 className="text-base font-semibold text-[#1E293B]">
            Invoice Information
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Invoice Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.invoiceDate}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700"
                />
                <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.dueDate}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700"
                />
                <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Payment Terms
              </label>
              <div className="relative">
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Next Remainder Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.dueDate}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700"
                />
                <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Invoice Items */}
        <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#1E293B]">
            Invoice Items
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#4E709D] text-white">
                  <th className=" px-4 py-3 font-medium rounded-tl-md">NO</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-center font-medium">Tax</th>
                  <th className="px-4 py-3 text-right font-medium rounded-tr-md">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-[#e2e2e23c]">
                <tr>
                  <td className="px-4 py-4 rounded-b-md">1</td>
                  <td className="px-4 py-4 font-medium">Enterprise Plan</td>
                  <td className="px-4 py-4 text-slate-500">
                    Enterprise Plan - Monthly Subscription
                  </td>
                  <td className="px-4 py-4 text-right">12,000.00</td>
                  <td className="px-4 py-4 text-center">18% GST</td>
                  <td className="px-4 py-4 text-right font-medium rounded-b-md">
                    12,000.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Notes & Attachments */}
        <div className="rounded-xl border border-[#E4E8EF] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1E293B]">Notes</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Customer Notes ( Visible to Tenant )
              </label>
              <textarea
                // rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full h-[78px] resize-none rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Attachments
              </label>
              <div className="flex items-center space-x-4 rounded-xl border border-slate-200 bg-[#F3F4F6] p-4">
                <div className="rounded-lg bg-[#4E709D] p-3 text-white">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Upload Files
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PDF, DOC, PPT, JPG, PNG
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-indigo-600 underline"
                  >
                    Choose a file
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-indigo-400 px-5 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#4E709D] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#3d597e]"
          >
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
