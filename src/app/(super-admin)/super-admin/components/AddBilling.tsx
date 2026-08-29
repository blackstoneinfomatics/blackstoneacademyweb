"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import DatePickerInput from "./DatePickerInput";

interface AddBillingProps {
  readonly onClose: () => void;
}

type BillingForm = {
  billingName: string;
  paymentDate: string;
  amount: string;
  category: string;
  paymentMethod: string;
  addedBy: string;
  status: string;
};

const selectFields = [
  {
    key: "status",
    label: "Status",
    options: ["PAID", "PENDING", "OVERDUE", "CANCELLED"],
  },
] as const;

const emptyForm: BillingForm = {
  billingName: "",
  paymentDate: "",
  amount: "",
  category: "",
  paymentMethod: "",
  addedBy: "",
  status: "",
};

export default function AddBilling({ onClose }: AddBillingProps) {
  const [form, setForm] = useState<BillingForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof BillingForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectedPaymentDate = form.paymentDate
    ? new Date(`${form.paymentDate}T00:00:00`)
    : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.BILLING.CREATE}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billingName: form.billingName,
            paymentDate: form.paymentDate,
            amount: Number(form.amount),
            category: form.category,
            paymentMethod: form.paymentMethod,
            addedBy: form.addedBy,
            status: form.status,
          }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to add billing");
      }

      toast.success(result?.message || "Billing added successfully");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add billing",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#111827]">Billing</h2>
          <button
            type="button"
            aria-label="Close Add Billing dialog"
            onClick={onClose}
            className="rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm font-semibold text-[#101b36]">Add Expense</p>

        <div className="mt-4 space-y-3.5">
          <label className="block text-sm text-[#101b36]">
            Billing Name
            <input
              required
              value={form.billingName}
              onChange={(event) =>
                updateField("billingName", event.target.value)
              }
              className="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-2.5 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
            />
          </label>
          <label className="block text-sm text-[#101b36]">
            Payment Date
            <DatePickerInput
              value={selectedPaymentDate}
              onChange={(date) =>
                updateField(
                  "paymentDate",
                  date
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                    : "",
                )
              }
              placeholder="Select payment date"
              dateFormat="MMM dd, yyyy"
              inputClassName="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
            />
          </label>
          <label className="block text-sm text-[#101b36]">
            Amount
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-2.5 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
            />
          </label>
          <label className="block text-sm text-[#101b36]">
            Category
            <input
              required
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Enter category"
              className="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-2.5 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
            />
          </label>
          <label className="block text-sm text-[#101b36]">
            Payment Method
            <input
              required
              value={form.paymentMethod}
              onChange={(event) =>
                updateField("paymentMethod", event.target.value)
              }
              placeholder="Enter payment method"
              className="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-2.5 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
            />
          </label>
          <label className="block text-sm text-[#101b36]">
            Added By
            <input
              required
              value={form.addedBy}
              onChange={(event) => updateField("addedBy", event.target.value)}
              placeholder="Enter name"
              className="mt-1.5 h-9 w-full rounded-md border border-slate-300 px-2.5 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
            />
          </label>
          {selectFields.map(({ key, label, options }) => (
            <label key={key} className="block text-sm text-[#101b36]">
              {label}
              <select
                required
                value={form[key]}
                onChange={(event) => updateField(key, event.target.value)}
                className="mt-1.5 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 outline-none transition focus:border-[#576CBC] focus:ring-2 focus:ring-[#576CBC]/15"
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-200 pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#576CBC] px-7 py-2 text-sm font-semibold text-white transition hover:bg-[#4659a8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}
