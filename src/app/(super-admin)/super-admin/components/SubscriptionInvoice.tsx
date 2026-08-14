"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AppFailureToastMessages,
  AppSuccessToastMessages,
} from "@/app/_components/contents/toast_message";

type Props = {
  readonly onClose: () => void;
};

interface Tenant {
  _id: string;
  tenantName: string;
  tenantCode?: string;
}

interface Plan {
  planName: string;
  _id: string;
  name: string;
  amount?: number;
}

interface TenantSubscription {
  _id: string;
  tenantId: Tenant;
  planId: Plan;
  planName: string;
  subscriptionCode: string;
  billingCycle: string;
  status: string;
  paymentStatus: string;
  startDate: string | null;
  endDate: string | null;
}

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
  nextReminderDate: string;
  attachments: string[];
}

interface InvoiceLine {
  id: string;
  planName: string;
  description: string;
  unitPrice: number;
  quantity: number;
  taxPercent: number;
  amount: number;
}

export default function SubscriptionInvoice({ onClose }: Props) {
const [formData, setFormData] = useState<InvoiceFormData>({
  tenant: "",
  plan: "",
  billingStartDate: "",
  billingEndDate: "",
  invoiceNumber: generateInvoiceNumber(),
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  nextReminderDate: "",
  currency: "",
  paymentTerms: "15",
  notes: "Thank you for choosing Blackstone Nexus.",
  attachments: [],

});

  function generateInvoiceNumber(): string {
    const currentYear = new Date().getFullYear();

    const randomNumber = Math.floor(10000 + Math.random() * 90000);

    return `SUB-INV-${currentYear}-${randomNumber}`;
  }

  const invoiceDateRef = useRef<HTMLInputElement>(null);  
  const dueDateRef = useRef<HTMLInputElement>(null);  
  const nextReminderDateRef = useRef<HTMLInputElement>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tenantSubscriptions, setTenantSubscriptions] = useState<
  TenantSubscription[]
>([]);

const selectedSubscription = tenantSubscriptions.find(
  (subscription) => subscription._id === formData.tenant
);

const planDisplayName = selectedSubscription
  ? `${selectedSubscription.planId?.planName ?? selectedSubscription.planId?.name ?? "Plan"}`
  : "";

const [invoiceItems, setInvoiceItems] = useState<InvoiceLine[]>([]);

useEffect(() => {
  if (!selectedSubscription) {
    setInvoiceItems([]);
    return;
  }

  const plan: any = selectedSubscription.planId;
  const cycle = (selectedSubscription.billingCycle || plan.billingCycle || "MONTHLY").toUpperCase();
  const unitPrice = Number(cycle === "YEARLY" ? plan.yearlyPrice ?? plan.monthlyPrice : plan.monthlyPrice ?? plan.yearlyPrice) || 0;
  const taxPercent = Number(plan.gstAndTax ?? 0) || 0;

  const item: InvoiceLine = {
    id: selectedSubscription._id,
    planName: plan.planName || plan.name || "",
    description: `${plan.planName || plan.name || "Plan"} - ${cycle.toLowerCase()} subscription`,
    unitPrice,
    quantity: 1,
    taxPercent,
    amount: unitPrice,
  };

  setInvoiceItems([item]);
}, [selectedSubscription]);

const [, setLoadingTenants] = useState(false);

const fetchTenantSubscriptions = async () => {
  try {
    setLoadingTenants(true);

    const response = await axios.get(
      "http://localhost:5001/tenantsubscription"
    );

    const responseData = response.data?.data ?? response.data;

    const tenantItems = Array.isArray(responseData)
      ? responseData
      : responseData?.tenants ?? [];

    setTenantSubscriptions(tenantItems);
    console.log("fetched tenant subscriptions:", response.data);
  } catch (error) {
    console.error("Error fetching tenant subscriptions:", error);
  } finally {
    setLoadingTenants(false);
  }
};

useEffect(() => {
  fetchTenantSubscriptions();
}, []);

  const handleChange = (
  e: ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >
) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "tenant") {
    const subscription = tenantSubscriptions.find(
      (item) => item._id === value
    );


    if (subscription) {
      setFormData((prev) => ({
        ...prev,
        tenant: subscription._id,
        plan: subscription.planId?._id ?? "",
        billingStartDate: formatDate(subscription.startDate),
        billingEndDate: formatDate(subscription.endDate),
        // set invoice defaults (leave dueDate blank so user chooses)
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
      }));
    }
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// derived display values from selected subscription
const planAmountDisplay = (() => {
  if (!selectedSubscription?.planId) return "-";
  const plan: any = selectedSubscription.planId;
  const subCycle = selectedSubscription.billingCycle || plan.billingCycle;
  const amount = subCycle === "YEARLY" ? plan.yearlyPrice ?? plan.monthlyPrice : plan.monthlyPrice ?? plan.yearlyPrice;
  if (amount == null) return "-";
  // format number with commas
  try {
    return `₹ ${Number(amount).toLocaleString()}`;
  } catch (error) {
    console.error("Error formatting plan amount:", error);
    return `₹ ${amount}`;
  }
})();

const cycleDisplay = selectedSubscription?.billingCycle ?? selectedSubscription?.planId?.billingCycle ?? "-";
const startDateDisplay = selectedSubscription?.startDate ? formatDate(selectedSubscription.startDate) : "-";
const endDateDisplay = selectedSubscription?.endDate ? formatDate(selectedSubscription.endDate) : "-";

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
  <option value="">Select Tenant</option>

  {tenantSubscriptions.map((subscription) => (
    <option
      key={subscription._id}
      value={subscription._id}
    >
      {subscription.tenantId?.tenantName} 
    </option>
  ))}
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
  <option value="">Select Plan</option>

  {selectedSubscription && (
    <option value={selectedSubscription.planId._id}>
      {planDisplayName}
    </option>
  )}
</select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

<div>
  <label className="mb-1.5 block text-xs font-medium text-slate-600">
    Billing Cycle
  </label>

  <input
    type="text"
    value={selectedSubscription?.billingCycle ?? "-"}
    readOnly
    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
  />
</div>
          </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Plan Amount
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {planAmountDisplay}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Cycle
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {cycleDisplay}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Start Date
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {startDateDisplay}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                End Date
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {endDateDisplay}
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
      ref={invoiceDateRef}
      type="date"
      name="invoiceDate"
      value={formData.invoiceDate}
      onChange={handleChange}
      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs text-slate-700
        [&::-webkit-calendar-picker-indicator]:hidden"
    />

    <Calendar
      className="absolute right-2.5 bottom-2.5 h-4 w-4 cursor-pointer text-slate-400"
      onClick={() => {
        invoiceDateRef.current?.showPicker();
      }}
    />
  </div>
</div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Due Date
              </label>
              <div className="relative">
                <input
                ref={dueDateRef}
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs text-slate-700
        [&::-webkit-calendar-picker-indicator]:hidden"
    />
    <Calendar
      className="absolute right-2.5 bottom-2.5 h-4 w-4 cursor-pointer text-slate-400"
      onClick={() => {
        dueDateRef.current?.showPicker();
      }}
    />              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
     <div>
  <label className="mb-1.5 block text-xs font-medium text-slate-600">
    Currency
  </label>

  <div className="relative">
    <select
      name="currency"
      value={formData.currency}
      onChange={handleChange}
      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
    >
      <option value="INR">INR - Indian Rupee (₹)</option>
      <option value="USD">USD - US Dollar ($)</option>
      <option value="EUR">EUR - Euro (€)</option>
      <option value="GBP">GBP - British Pound (£)</option>
      <option value="AED">AED - UAE Dirham (د.إ)</option>
    </select>

    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
  </div>
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
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
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
                  ref={nextReminderDateRef}
                  type="date"
                  name="nextReminderDate"
                  value={formData.nextReminderDate}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs text-slate-700 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <Calendar
                  className="absolute right-2.5 bottom-2.5 h-4 w-4 cursor-pointer text-slate-400"
                  onClick={() => {
                    nextReminderDateRef.current?.showPicker();
                  }}
                />
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
                {invoiceItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                      Select a tenant subscription to load invoice items.
                    </td>
                  </tr>
                ) : (
                  invoiceItems.map((it, idx) => {
                    const taxLabel = `${it.taxPercent}% GST`;
                    return (
                      <tr key={it.id}>
                        <td className="px-4 py-4 rounded-b-md">{idx + 1}</td>
                        <td className="px-4 py-4 font-medium">{it.planName}</td>
                        <td className="px-4 py-4 text-slate-500">{it.description}</td>
                        <td className="px-4 py-4 text-right">{Number(it.unitPrice).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td className="px-4 py-4 text-center">{taxLabel}</td>
                        <td className="px-4 py-4 text-right font-medium rounded-b-md">{Number(it.amount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                      </tr>
                    );
                  })
                )}
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

    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-slate-700">
          Upload Files
        </span>

        <span className="text-[10px] text-slate-400">
          PDF, DOC, PPT, JPG, PNG
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);

          const fileNames = files.map((file) => file.name);

          setFormData((prev) => ({
            ...prev,
            attachments: fileNames,
          }));
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-1 text-xs font-medium text-indigo-600 underline"
      >
        Choose a file
      </button>

      {/* Selected files */}
      {formData.attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {formData.attachments.map((file, index) => (
            <div
              key={`${file}-${index}`}
              className="flex items-center justify-between rounded-md bg-white px-2 py-1"
            >
              <span className="max-w-[250px] truncate text-[11px] text-slate-600">
                {file}
              </span>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    attachments: prev.attachments.filter(
                      (_, i) => i !== index
                    ),
                  }));
                }}
                className="ml-2 text-[11px] text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
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
            onClick={async () => {
              if (!selectedSubscription) {
                toast.error("Please select a tenant subscription first.");
                return;
              }

              // basic date validation
              const invDate = new Date(formData.invoiceDate);
              const due = new Date(formData.dueDate);
              if (Number.isNaN(invDate.getTime()) || Number.isNaN(due.getTime())) {
                toast.error("Invalid invoice or due date");
                return;
              }

              if (due < invDate) {
                toast.error("Due date must be greater than or equal to invoice date.");
                return;
              }

              // compute amounts from invoice items
              const subtotal = invoiceItems.reduce((s, it) => s + Number(it.unitPrice) * it.quantity, 0);
              const taxAmount = invoiceItems.reduce((s, it) => s + Math.round((Number(it.unitPrice) * it.quantity * (it.taxPercent || 0)) / 100), 0);
              const totalAmount = subtotal + taxAmount;

              const payload = {
                planId: selectedSubscription?.planId?._id,
                subscriptionId: selectedSubscription?._id,
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: new Date(formData.invoiceDate).toISOString(),
                dueDate: new Date(formData.dueDate).toISOString(),
                currency: formData.currency || "INR",
                paymentTerms: Number(formData.paymentTerms || 15),
                discountAmount: 0,
                subtotal,
                taxAmount,
                totalAmount,
                nextReminderDate: formData.nextReminderDate ? new Date(formData.nextReminderDate).toISOString() : new Date(formData.dueDate).toISOString(),
                notes: formData.notes,
                attachments: [],
                createdBy: "SUPER_ADMIN",
                items: invoiceItems.map((it) => ({
                  description: it.description,
                  unitPrice: it.unitPrice,
                  quantity: it.quantity,
                  taxPercent: it.taxPercent,
                  amount: it.amount,
                })),
              };

              try {
                const res = await axios.post("http://localhost:5001/subscription-invoices", payload);
                toast.success(res.data?.message || AppSuccessToastMessages.CREATE_PLAN_SUCCESS || "Invoice created successfully");
                setTimeout(() => onClose(), 400);
              } catch (err: any) {
                console.error(err);
                const message = err.response?.data?.message || AppFailureToastMessages.INVOICE_CREATE_FAILED || "Failed to create invoice";
                toast.error(message);
              }
            }}
            className="rounded-lg bg-[#4E709D] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#3d597e]"
          >
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
