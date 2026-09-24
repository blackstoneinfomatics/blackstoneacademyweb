"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AppFailureToastMessages,
  AppSuccessToastMessages,
} from "@/app/_components/contents/toast_message";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Props = {
  readonly onClose: () => void;
};

interface BillingPeriod {
  billingPeriodId: string;
  billingPeriod: string;
  duration: number;
  price: number;
  discount: number;
  gstRate: number;
  taxAmount: number;
  totalAmount: number;
}

interface Plan {
  _id: string;
  planId: string;
  planName: string;
  planDescription?: string;
  billingPeriods: BillingPeriod[];
  status: string;
  gstAndTax: number;
}

interface Tenant {
  _id: string;
  tenantName: string;
  tenantCode?: string;
}

interface TenantSubscription {
  _id: string;
  tenantId: string | Tenant;
  planId: string | Plan;
  planName: string;
  subscriptionCode: string;
  billingCycle?: string;
  status: string;
  paymentStatus: string;
  startDate: string | null;
  endDate: string | null;
  nextRenewalDate: string | null;
  autoRenew: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
  tenant?: Tenant;
  plan?: Plan;
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
  attachments: File[];
  selectedBillingPeriod: string;
}

interface InvoiceLine {
  id: string;
  planName: string;
  description: string;
  unitPrice: number;
  quantity: number;
  taxPercent: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  amount: number;
  totalAmount: number;
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
    currency: "INR",
    paymentTerms: "15",
    notes: "Thank you for choosing Blackstone Nexus.",
    attachments: [],
    selectedBillingPeriod: "",
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
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSubscription = tenantSubscriptions.find(
    (subscription) => subscription._id === formData.tenant
  );

  // Get plan object - could be directly or nested
  const getPlan = (subscription: TenantSubscription): Plan | null => {
    if (!subscription) return null;
    if (subscription.plan && typeof subscription.plan === 'object') {
      return subscription.plan as Plan;
    }
    if (subscription.planId && typeof subscription.planId === 'object') {
      return subscription.planId as Plan;
    }
    return null;
  };

  // Get tenant name - could be from tenant object or tenantId string
  const getTenantName = (subscription: TenantSubscription): string => {
    if (!subscription) return "Unknown Tenant";

    // If tenant object exists with tenantName
    if (subscription.tenant && typeof subscription.tenant === 'object') {
      return (subscription.tenant as Tenant).tenantName || "Unknown Tenant";
    }

    // If tenantId is an object with tenantName
    if (subscription.tenantId && typeof subscription.tenantId === 'object') {
      return (subscription.tenantId as Tenant).tenantName || "Unknown Tenant";
    }

    // Fallback to tenantId string or subscription ID
    return subscription.tenantId as string || subscription._id || "Unknown Tenant";
  };

  // Get tenant ID
  const getTenantId = (subscription: TenantSubscription): string => {
    if (!subscription) return "";

    // If tenantId is a string
    if (typeof subscription.tenantId === 'string') {
      return subscription.tenantId;
    }

    // If tenantId is an object with _id
    if (subscription.tenantId && typeof subscription.tenantId === 'object') {
      return (subscription.tenantId as any)._id || (subscription.tenantId as any).tenantId || "";
    }

    // If tenant exists with _id
    if (subscription.tenant && typeof subscription.tenant === 'object') {
      return (subscription.tenant as any)._id || "";
    }

    return "";
  };

  const plan = selectedSubscription ? getPlan(selectedSubscription) : null;

  const selectedBillingPeriod = plan?.billingPeriods?.find(
    (bp) => bp.billingPeriodId === formData.selectedBillingPeriod
  );

  const [invoiceItems, setInvoiceItems] = useState<InvoiceLine[]>([]);

  useEffect(() => {
    if (!selectedSubscription || !selectedBillingPeriod) {
      setInvoiceItems([]);
      return;
    }

    const item: InvoiceLine = {
      id: selectedSubscription._id,
      planName: plan?.planName || selectedSubscription.planName || "",
      description: plan?.planDescription || "",
      unitPrice: selectedBillingPeriod.price || 0,
      quantity: 1,
      taxPercent: selectedBillingPeriod.gstRate || 0,
      taxAmount: selectedBillingPeriod.taxAmount || 0,
      discountPercent: selectedBillingPeriod.discount || 0,
      discountAmount: (selectedBillingPeriod.price * (selectedBillingPeriod.discount || 0)) / 100,
      amount: selectedBillingPeriod.price - (selectedBillingPeriod.price * (selectedBillingPeriod.discount || 0)) / 100,
      totalAmount: selectedBillingPeriod.totalAmount || 0,
    };

    setInvoiceItems([item]);
  }, [selectedSubscription, selectedBillingPeriod, plan]);

  const fetchTenantSubscriptions = async () => {
    try {
      setLoadingTenants(true);
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_SUBSCRIPTION.GET}`,
      );

      console.log("API Response:", response.data);

      // Extract tenants array from response
      let tenants = [];
      if (response.data?.data?.tenants) {
        tenants = response.data.data.tenants;
      } else if (response.data?.tenants) {
        tenants = response.data.tenants;
      } else if (Array.isArray(response.data)) {
        tenants = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        tenants = response.data.data;
      }

      console.log("Extracted tenants:", tenants);
      setTenantSubscriptions(tenants);
    } catch (error) {
      console.error("Error fetching tenant subscriptions:", error);
      toast.error("Failed to fetch tenant subscriptions");
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
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);

        setFormData((prev) => ({
          ...prev,
          tenant: subscription._id,
          plan: typeof subscription.planId === 'object' ? (subscription.planId as Plan)._id : "",
          billingStartDate: startDate,
          billingEndDate: "",
          selectedBillingPeriod: "",
          invoiceDate: new Date().toISOString().slice(0, 10),
          dueDate: "",
        }));
      }
    }

    if (name === "selectedBillingPeriod") {
      const billingPeriod = plan?.billingPeriods?.find(
        (bp) => bp.billingPeriodId === value
      );

      if (billingPeriod) {
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);

        // Calculate end date based on duration (in months)
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + (billingPeriod.duration || 0));
        const endDateStr = endDate.toISOString().slice(0, 10);

        setFormData((prev) => ({
          ...prev,
          billingStartDate: startDate,
          billingEndDate: endDateStr,
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

  // Calculate totals
  const subtotal = invoiceItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const totalDiscount = invoiceItems.reduce((s, it) => s + it.discountAmount, 0);
  const taxAmount = invoiceItems.reduce((s, it) => s + it.taxAmount, 0);
  const totalAmount = invoiceItems.reduce((s, it) => s + it.totalAmount, 0);

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
      }));
    }
    // Reset the input value so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-[#F0F2F9] p-4 text-slate-700">
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
                    <option key={subscription._id} value={subscription._id}>
                      {getTenantName(subscription)}
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
              <input
                type="text"
                value={plan?.planName || selectedSubscription?.planName || ""}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-gray-50 px-3 py-2 text-xs text-slate-700"
                placeholder="Select tenant first"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Billing Period
              </label>
              <div className="relative">
                <select
                  name="selectedBillingPeriod"
                  value={formData.selectedBillingPeriod}
                  onChange={handleChange}
                  disabled={!selectedSubscription}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Period</option>
                  {plan?.billingPeriods?.map((bp) => (
                    <option key={bp.billingPeriodId} value={bp.billingPeriodId}>
                      {bp.billingPeriod} ({bp.duration} months)
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Plan Amount
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {selectedBillingPeriod ? `₹ ${selectedBillingPeriod.price.toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Period
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {selectedBillingPeriod?.billingPeriod || "-"}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Start Date
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {formData.billingStartDate ? formatDate(formData.billingStartDate) : "-"}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                End Date
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {formData.billingEndDate ? formatDate(formData.billingEndDate) : "-"}
              </span>
            </div>
            <div className="rounded-lg bg-[#EAEAEA] p-3">
              <span className="block text-[11px] font-medium text-slate-600">
                Duration
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-800">
                {selectedBillingPeriod ? `${selectedBillingPeriod.duration} months` : "-"}
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
                className="w-full rounded-lg border border-slate-200 bg-gray-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                readOnly
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
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs text-slate-700 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <Calendar
                  className="absolute right-2.5 bottom-2.5 h-4 w-4 cursor-pointer text-slate-400"
                  onClick={() => invoiceDateRef.current?.showPicker()}
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
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs text-slate-700 [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <Calendar
                  className="absolute right-2.5 bottom-2.5 h-4 w-4 cursor-pointer text-slate-400"
                  onClick={() => dueDateRef.current?.showPicker()}
                />
              </div>
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
                Payment Terms (Days)
              </label>
              <div className="relative">
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 30, 45, 60, 90].map((days) => (
                    <option key={days} value={days}>{days}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Next Reminder Date
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
                  onClick={() => nextReminderDateRef.current?.showPicker()}
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
                  <th className="px-4 py-3 font-medium rounded-tl-md">#</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                  <th className="px-4 py-3 text-center font-medium">Discount</th>
                  <th className="px-4 py-3 text-center font-medium">Tax</th>
                  <th className="px-4 py-3 text-right font-medium rounded-tr-md">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-[#e2e2e23c]">
                {invoiceItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                      Select a tenant and billing period to load invoice items.
                    </td>
                  </tr>
                ) : (
                  invoiceItems.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="px-4 py-4 rounded-b-md">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium">{it.planName}</td>
                      <td className="px-4 py-4 text-slate-500">{it.description || "-"}</td>
                      <td className="px-4 py-4 text-right">₹ {it.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-4 text-center">{it.discountPercent > 0 ? `${it.discountPercent}%` : "-"}</td>
                      <td className="px-4 py-4 text-center">{it.taxPercent}%</td>
                      <td className="px-4 py-4 text-right font-medium rounded-b-md">₹ {it.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section - Clean format without boxes */}
          {invoiceItems.length > 0 && (
            <div className="mt-4 flex flex-col items-end space-y-1.5 text-xs">
              <div className="flex items-center justify-end w-full max-w-xs">
                <span className="w-32 text-right font-medium text-slate-600">Subtotal:</span>
                <span className="w-28 text-right font-medium text-slate-800">₹ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-end w-full max-w-xs">
                <span className="w-32 text-right font-medium text-slate-600">Total Discount:</span>
                <span className="w-28 text-right font-medium text-green-600">- ₹ {totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-end w-full max-w-xs">
                <span className="w-32 text-right font-medium text-slate-600">Tax Amount:</span>
                <span className="w-28 text-right font-medium text-slate-800">₹ {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-end w-full max-w-xs border-t border-slate-200 pt-1.5 mt-0.5">
                <span className="w-32 text-right font-semibold text-slate-800">Total Amount:</span>
                <span className="w-28 text-right font-bold text-slate-900">₹ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Notes & Attachments */}
        <div className="rounded-xl border border-[#E4E8EF] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1E293B]">Notes</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Customer Notes (Visible to Tenant)
              </label>
              <textarea
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 text-xs font-medium text-indigo-600 underline"
                  >
                    Choose a file
                  </button>
                  {formData.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.attachments.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md bg-white px-2 py-1">
                          <span className="max-w-[200px] truncate text-[11px] text-slate-600">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
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
            disabled={isSubmitting}
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

              if (!selectedBillingPeriod) {
                toast.error("Please select a billing period.");
                return;
              }

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

              setIsSubmitting(true);

              try {
                // Get the tenant ID
                const tenantId = getTenantId(selectedSubscription);

                // Prepare payload without attachments to avoid the "Invalid Attachment URL" error
                const payload = {
                  subscriptionId: selectedSubscription._id,
                  tenantId: tenantId,
                  planId: plan?._id || selectedSubscription.planId,
                  billingPeriodId: formData.selectedBillingPeriod,
                  invoiceNumber: formData.invoiceNumber,
                  invoiceDate: new Date(formData.invoiceDate).toISOString(),
                  dueDate: new Date(formData.dueDate).toISOString(),
                  currency: formData.currency || "INR",
                  paymentTerms: Number(formData.paymentTerms || 15),
                  discountPercent: selectedBillingPeriod.discount || 0,
                  subtotal: subtotal,
                  taxAmount: taxAmount,
                  totalAmount: totalAmount,
                  nextReminderDate: formData.nextReminderDate
                    ? new Date(formData.nextReminderDate).toISOString()
                    : new Date(formData.dueDate).toISOString(),
                  billingStartDate: formData.billingStartDate
                    ? new Date(formData.billingStartDate).toISOString()
                    : new Date().toISOString(),
                  billingEndDate: formData.billingEndDate
                    ? new Date(formData.billingEndDate).toISOString()
                    : new Date().toISOString(),
                  notes: formData.notes || "Thank you for choosing Blackstone Nexus.",
                  createdBy: "SUPER_ADMIN",
                  status: "DRAFT",
                  paymentStatus: "PENDING",
                  items: invoiceItems.map((it) => ({
                    planName: it.planName,
                    description: it.description || "",
                    unitPrice: it.unitPrice,
                    quantity: it.quantity,
                    taxPercent: it.taxPercent,
                    taxAmount: it.taxAmount,
                    discountPercent: it.discountPercent,
                    discountAmount: it.discountAmount,
                    amount: it.amount,
                    totalAmount: it.totalAmount,
                    billingPeriod: selectedBillingPeriod.billingPeriod,
                    duration: selectedBillingPeriod.duration,
                  })),
                  billingCycle: selectedBillingPeriod.billingPeriod.toUpperCase(),
                  planName: plan?.planName || selectedSubscription.planName || "",
                  subscriptionCode: selectedSubscription.subscriptionCode || "",
                };

                console.log("Sending payload:", payload);

                const res = await axios.post("http://localhost:5001/subscription-invoices", payload);
                toast.success(res.data?.message || AppSuccessToastMessages.CREATE_PLAN_SUCCESS || "Invoice created successfully");
                setTimeout(() => onClose(), 400);
              } catch (err: any) {
                console.error("Error details:", err);
                console.error("Response data:", err.response?.data);
                console.error("Response status:", err.response?.status);

                const errorMessage = err.response?.data?.message ||
                  err.response?.data?.error ||
                  AppFailureToastMessages.INVOICE_CREATE_FAILED ||
                  "Failed to create invoice";
                toast.error(errorMessage);
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-lg bg-[#4E709D] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#3d597e] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Send Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}