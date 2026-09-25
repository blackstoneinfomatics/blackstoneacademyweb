"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "@/app/(super-admin)/super-admin/components/SuperAdminHeader";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePickerInput from "@/app/(super-admin)/super-admin/components/DatePickerInput";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";

interface InvoiceItem {
  service: string;
  description: string;
  unitPrice: number;
  taxRate: number;
  taxType: string;
  category: string;
  amount: number;
}

interface CreateInvoiceFormProps {
  readonly onClose?: () => void;
}

interface TenantSubscription {
  _id: string;
  tenantId?: string;
  tenantName?: string;
  planName?: string;
  duration?: number;
  billingCycle?: string;
  plan?: {
    planName?: string;
  };
  tenant?: {
    tenantCode?: string;
    tenantName?: string;
  };
}

interface TenantSubscriptionResponse {
  success: boolean;
  data: {
    tenants: TenantSubscription[];
  };
}

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `SUB-INV-${year}-${randomNumber}`;
};

export default function CreateInvoiceForm({ onClose }: CreateInvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [tenantSubscriptions, setTenantSubscriptions] = useState<
    TenantSubscription[]
  >([]);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    service: "",
    description: "",
    unitPrice: "",
    taxRate: "",
  });
  const [form, setForm] = useState({
    tenant: "",
    plan: "",
    billingCycle: "",
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: null as Date | null,
    dueDate: null as Date | null,
    currency: "INR",
    paymentTerms: "",
    notes: "Thank you for Choosing Blackstone.",
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    const fetchTenantSubscriptions = async () => {
      try {
        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_SUBSCRIPTION.GET}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tenant subscriptions");
        }

        const result: TenantSubscriptionResponse = await response.json();
        if (!result.success) {
          throw new Error("Unable to load tenant subscriptions");
        }

        setTenantSubscriptions(result.data.tenants);
      } catch (error) {
        console.error("Tenant subscriptions API error:", error);
      }
    };

    fetchTenantSubscriptions();
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    else router.push("/super-admin/ui/finance?tab=invoice");
  };

  const getBillingCycle = (subscription: TenantSubscription) => {
    if (subscription.billingCycle) {
      return subscription.billingCycle;
    }

    return subscription.duration
      ? `${subscription.duration} Month${subscription.duration === 1 ? "" : "s"}`
      : "-";
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    if (e.target.name === "tenant") {
      const selectedSubscription = tenantSubscriptions.find(
        (subscription) => subscription._id === e.target.value,
      );

      setForm((prev) => ({
        ...prev,
        tenant: e.target.value,
        plan:
          selectedSubscription?.planName ??
          selectedSubscription?.plan?.planName ??
          "-",
        billingCycle: selectedSubscription
          ? getBillingCycle(selectedSubscription)
          : "-",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const selectedSubscription = tenantSubscriptions.find(
        (subscription) => subscription._id === form.tenant,
      );

      if (!selectedSubscription) {
        throw new Error("Please select a tenant");
      }

      if (items.length === 0) {
        throw new Error("Please add at least one invoice item");
      }

      if (!form.invoiceDate || !form.dueDate) {
        throw new Error("Please select the invoice date and due date");
      }

      const currency = form.currency.trim().toUpperCase();
      const paymentTerms = Number(form.paymentTerms);

      if (currency.length !== 3 || paymentTerms <= 0) {
        throw new Error(
          "Currency must be a 3-character code and payment terms must be greater than zero",
        );
      }

      const payload = {
        tenantId:
          selectedSubscription.tenant?.tenantCode ??
          selectedSubscription.tenantId ??
          form.tenant,
        subscriptionId: selectedSubscription._id,
        invoiceNumber: form.invoiceNumber,
        invoiceDate: form.invoiceDate?.toISOString() ?? null,
        dueDate: form.dueDate?.toISOString() ?? null,
        currency,
        paymentTerms,
        items: items.map((item) => ({
          service: item.service,
          description: item.description,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxType: item.taxType,
          category: item.category || item.service,
        })),
        customerNotes: form.notes,
        attachments: [],
        createdBy: "SUPERADMIN",
      };

      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CUSTOM_SERVICE_INVOICE.CREATE}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      console.log("Payload sent to API:", payload);

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const validationMessage = Array.isArray(result?.errors)
          ? result.errors.join(", ")
          : result?.errors && typeof result.errors === "object"
            ? Object.values(result.errors).flat().join(", ")
            : null;

        throw new Error(
          validationMessage ??
            result?.message ??
            result?.error ??
            `Failed to create custom service invoice (${response.status})`,
        );
      }

      if (result?.success === false) {
        throw new Error(result.message ?? "Unable to send invoice");
      }

      toast.success("Invoice sent successfully");
      handleClose();
    } catch (err) {
      console.error("Custom service invoice API error:", err);
      toast.error(
        err instanceof Error ? err.message : "Unable to send invoice",
      );
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const unitPrice = Number(itemForm.unitPrice);
    const taxRate = Number(itemForm.taxRate);

    if (
      !itemForm.service.trim() ||
      !itemForm.description.trim() ||
      unitPrice <= 0
    ) {
      toast.error("Enter service, description, and a valid unit price");
      return;
    }

    setItems((previous) => [
      ...previous,
      {
        service: itemForm.service.trim(),
        description: itemForm.description.trim(),
        unitPrice,
        taxRate,
        taxType: "GST",
        category: itemForm.service.trim(),
        amount: unitPrice + (unitPrice * taxRate) / 100,
      },
    ]);
    setItemForm({ service: "", description: "", unitPrice: "", taxRate: "18" });
    setIsItemFormOpen(false);
  };

  return (
     <div className="mx-auto w-full max-w-[950px] p-4 bg-[#ffffff]">
      {/* Header */}

      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1
            className="font-medium leading-tight text-[#010E30]"
            style={{
              fontSize: "clamp(14px,1.3vw,16px)",
            }}
          >
            Create Custom Service Invoice
          </h1>

          <p
            className="mt-1 max-w-3xl leading-6 text-[#667085]"
            style={{
              fontSize: "clamp(11px,0.9vw,12px)",
            }}
          >
            Generate an invoice for custom features, updates, or special
            requests raised by a tenant.
          </p>
        </div>
        {/* <button
          type="button"
          onClick={() =>
            onClose
              ? onClose()
              : router.push("/super-admin/ui/finance?tab=invoice")
          }
          className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white transition hover:bg-[#F9FAFB]"
        >
          <ArrowLeft size={20} className="text-[#344054]" />
        </button> */}
      </div>

      {/* Tenant & Subscription Details */}
      <section className="mt-1 rounded-xl border-2 border-[#E4E8EF] bg-[#ffffff] p-4">
        <h2
          className="font-medium leading-6 text-[#010E30]"
          style={{
            fontSize: "clamp(12px,1.1vw,15px)",
          }}
        >
          Tenant & Subscription Details
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Tenant */}
          <div>
            <label
              className="mb-2 block font-medium text-[#010E30E5]/90"
              style={{
                fontSize: "clamp(13px,0.85vw,14px)",
              }}
            >
              Select Tenant
            </label>

            <div className="relative">
              <select
                name="tenant"
                value={form.tenant}
                onChange={handleChange}
                className="h-9 w-full appearance-none rounded-lg border border-[#D4D4D4] bg-white px-4 pr-10 text-[#010E30E5]/90 outline-none transition-colors focus:border-[#576CBC]"
                style={{
                  fontSize: "clamp(11px,0.9vw,12px)",
                }}
              >
                <option value="">Select Tenant</option>
                {tenantSubscriptions.map((subscription) => (
                  <option key={subscription._id} value={subscription._id}>
                    {subscription.tenantName ??
                      subscription.tenant?.tenantName ??
                      "Unnamed Tenant"}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#010E30E5]/90"
              />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label
              className="mb-2 block font-medium text-[#010E30E5]"
              style={{
                fontSize: "clamp(13px,0.85vw,14px)",
              }}
            >
              Plan
            </label>

            <input
              readOnly
              value={form.plan}
              className="h-9 w-full rounded-lg border border-[#D4D4D4] bg-[#F9FAFB] px-4 text-[#010E30E5]/90"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <label
              className="mb-2 block font-medium text-[#010E30]"
              style={{
                fontSize: "clamp(13px,0.85vw,14px)",
              }}
            >
              Billing Period
            </label>

            <input
              readOnly
              value={form.billingCycle}
              className="h-9 w-full rounded-lg border border-[#D4D4D4] bg-[#F9FAFB] px-4 text-[#010E30E5]/90"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Invoice Information */}
      {/* Invoice Information */}
      <section
        className="mt-3 rounded-lg border-2 border-[#E4E8EF] bg-[#ffffff]"
        style={{
          padding: "clamp(14px,1.6vw,20px)",
        }}
      >
        <h2
          className="font-medium text-[#010E30]"
          style={{
            fontSize: "clamp(12px,1.1vw,15px)",
          }}
        >
          Invoice Information
        </h2>

        {/* First Row */}
        <div className="mt-4 grid grid-cols-1 gap-[clamp(12px,1.2vw,18px)] md:grid-cols-2 xl:grid-cols-3">
          {/* Invoice Number */}
          <div>
            <label
              className="mb-1.5 block font-medium text-[#344054]"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            >
              Invoice Number
            </label>

            <input
              type="text"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-2026-001"
              className="h-9 w-full rounded-md border border-[#D0D5DD] px-3 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>

          {/* Invoice Date */}
          <div>
            <label
              className="mb-1.5 block font-medium text-[#344054]"
              style={{
                fontSize: "clamp(12px,0.8vw,13px)",
              }}
            >
              Invoice Date
            </label>

            <DatePickerInput
              value={form.invoiceDate}
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  invoiceDate: date,
                }))
              }
              className="w-full"
              inputClassName="h-9 w-full rounded-md border border-[#D4D4D4] px-3 pr-10 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>
          {/* Due Date */}
          <div>
            <label
              className="mb-1.5 block font-medium text-[#344054]"
              style={{
                fontSize: "clamp(12px,0.8vw,13px)",
              }}
            >
              Due Date
            </label>
            <DatePickerInput
              value={form.dueDate}
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  dueDate: date,
                }))
              }
              inputClassName="h-9 w-full rounded-md border border-[#D4D4D4] px-3 pr-10 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="mt-4 grid grid-cols-1 gap-[clamp(12px,1.2vw,18px)] md:grid-cols-2">
          {/* Currency */}
          <div>
            <label
              className="mb-1.5 block font-medium text-[#344054]"
              style={{
                fontSize: "clamp(12px,0.8vw,13px)",
              }}
            >
              Currency
            </label>

            <input
              type="text"
              name="currency"
              maxLength={3}
              minLength={3}
              value={form.currency}
              onChange={handleChange}
              placeholder="INR"
              className="h-9 w-full rounded-md border border-[#D4D4D4] bg-[#F9FAFB] px-3 text-[#344054] outline-none"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>

          {/* Payment Terms */}
          <div>
            <label
              className="mb-1.5 block font-medium text-[#344054]"
              style={{
                fontSize: "clamp(12px,0.8vw,13px)",
              }}
            >
              Payment Terms
            </label>

            <input
              type="number"
              name="paymentTerms"
              min="1"
              value={form.paymentTerms}
              onChange={handleChange}
              placeholder="15"
              className="h-9 w-full rounded-md border border-[#D4D4D4] bg-white px-3 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
              style={{
                fontSize: "clamp(11px,0.9vw,12px)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Invoice Items */}
      <section
        className="mt-6 w-full rounded-lg border-2 border-[#E4E8EF] bg-[#ffffff]"
        style={{
          padding: "clamp(14px,1.6vw,20px)",
        }}
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2
            className="font-semibold text-[#101828]"
            style={{
              fontSize: "clamp(15px,1.1vw,18px)",
            }}
          >
            Invoice Items
          </h2>
          <button
            type="button"
            onClick={() => setIsItemFormOpen(true)}
            className="rounded-lg bg-[#576CBC] text-[#ffffff] font-medium  hover:bg-[#475DB8] transition"
            style={{
              width: "clamp(58px,5vw,64px)",
              height: "clamp(28px,3vw,36px)",
              fontSize: "clamp(12px,.85vw,14px)",
            }}
          >
            Add
          </button>
        </div>

        {isItemFormOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="relative z-[10000] w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#101828]">
                  Add Invoice Item
                </h3>
                <button
                  type="button"
                  onClick={() => setIsItemFormOpen(false)}
                  className="text-sm text-[#667085] hover:text-[#344054]"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-xs font-medium text-[#344054]">
                  Service
                  <input
                    value={itemForm.service}
                    onChange={(event) =>
                      setItemForm((previous) => ({
                        ...previous,
                        service: event.target.value,
                      }))
                    }
                    placeholder="Custom Development"
                    className="mt-1 h-10 w-full rounded-md border border-[#D4D4D4] px-3 text-sm font-normal outline-none focus:border-[#576CBC]"
                  />
                </label>

                <label className="text-xs font-medium text-[#344054]">
                  Description
                  <input
                    value={itemForm.description}
                    onChange={(event) =>
                      setItemForm((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Custom feature development"
                    className="mt-1 h-10 w-full rounded-md border border-[#D4D4D4] px-3 text-sm font-normal outline-none focus:border-[#576CBC]"
                  />
                </label>

                <label className="text-xs font-medium text-[#344054]">
                  Unit Price
                  <input
                    type="number"
                    min="0"
                    value={itemForm.unitPrice}
                    onChange={(event) =>
                      setItemForm((previous) => ({
                        ...previous,
                        unitPrice: event.target.value,
                      }))
                    }
                    placeholder="25000"
                    className="mt-1 h-10 w-full rounded-md border border-[#D4D4D4] px-3 text-sm font-normal outline-none focus:border-[#576CBC]"
                  />
                </label>

                <label className="text-xs font-medium text-[#344054]">
                  Tax (%)
                  <input
                    type="number"
                    min="0"
                    value={itemForm.taxRate}
                    onChange={(event) =>
                      setItemForm((previous) => ({
                        ...previous,
                        taxRate: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-[#D4D4D4] px-3 text-sm font-normal outline-none focus:border-[#576CBC]"
                  />
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm font-semibold text-[#344054]">
                  Amount: ₹
                  {(
                    Number(itemForm.unitPrice || 0) *
                    (1 + Number(itemForm.taxRate || 0) / 100)
                  ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemFormOpen(false)}
                    className="rounded-md border border-[#D4D4D4] px-4 py-2 text-sm text-[#667085]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-md bg-[#576CBC] px-4 py-2 text-sm font-medium text-white hover:bg-[#475DB8]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto ">
          <table
            className="w-full border-separate border-spacing-0"
            style={{
              tableLayout: "fixed",
              minWidth: "100%",
            }}
          >
            <thead className="bg-[#5A76A3]">
              <tr
                className=" text-[#FFFFFF]"
                style={{
                  height: "clamp(46px,3vw,58px)",
                }}
              >
                <th className=" px-6 text-left font-medium w-[6%] text-[clamp(12px,.85vw,16px)]">
                  NO
                </th>

                <th className="px-6 text-left font-medium w-[22%] text-[clamp(12px,.85vw,16px)]">
                  Service
                </th>

                <th className="px-6 text-left font-medium w-[36%] text-[clamp(12px,.85vw,16px)]">
                  Description
                </th>

                <th className="px-6 text-left font-medium w-[11%] text-[clamp(12px,.85vw,16px)] whitespace-nowrap">
                  Unit Price
                </th>

                <th className="px-6 text-left font-medium w-[10%] text-[clamp(12px,.85vw,16px)]">
                  Tax
                </th>

                <th className=" px-6 text-left font-medium w-[15%] text-[clamp(12px,.85vw,16px)]">
                  Amount
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={`${item.service}-${item.description}`}
                  className="border-b border-[#D4D4D4]"
                >
                  {/* NO */}
                  <td
                    style={{
                      padding: "clamp(14px,1.2vw,20px)",
                      fontSize: "clamp(12px,.85vw,16px)",
                    }}
                    className="font-medium text-[#626262]"
                  >
                    {index + 1}
                  </td>

                  {/* Service */}
                  <td
                    style={{
                      padding: "clamp(10px,0.85vw,12px)",
                    }}
                  >
                    <input
                      readOnly
                      value={item.service}
                      className="h-9 w-full rounded-md border border-[#D4D4D4] bg-[#F9FAFB] px-4 text-[#010E30] outline-none"
                      style={{
                        fontSize: "clamp(11px,.9vw,12px)",
                      }}
                    />
                  </td>

                  {/* Description */}
                  <td
                    style={{
                      padding: "clamp(10px,0.85vw,12px)",
                    }}
                  >
                    <input
                      readOnly
                      value={item.description}
                      className="h-9 w-full rounded-md border border-[#D4D4D4] bg-[#F9FAFB] px-4 text-[#010E30] outline-none"
                      style={{
                        fontSize: "clamp(11px,.9vw,12px)",
                      }}
                    />
                  </td>

                  {/* Price */}
                  <td
                    style={{
                      padding: "clamp(14px,1.2vw,20px)",
                      fontSize: "clamp(12px,.85vw,16px)",
                    }}
                    className="font-semibold text-[#626262]"
                  >
                    ₹ {item.unitPrice.toLocaleString("en-IN")}
                  </td>

                  {/* Tax */}
                  <td
                    style={{
                      padding: "clamp(14px,1.2vw,20px)",
                      fontSize: "clamp(11px,.7vw,13px)",
                    }}
                    className="font-semibold text-[#626262]"
                  >
                    {item.taxRate}% GST
                  </td>

                  {/* Amount */}
                  <td
                    style={{
                      padding: "clamp(14px,1.2vw,20px)",
                      fontSize: "clamp(12px,.85vw,16px)",
                    }}
                    className="font-semibold text-[#626262]"
                  >
                    ₹ {item.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}

              {/* Total */}
              <tr>
                <td
                  colSpan={3}
                  className="rounded-bl-xl bg-[#E9E9E9] text-right font-semibold text-[#101828]"
                  style={{
                    padding: "clamp(14px,1.2vw,20px)",
                    fontSize: "clamp(12px,1vw,16px)",
                  }}
                >
                  Total
                </td>

                <td
                  className="bg-[#E9E9E9] font-medium text-[#242424]"
                  style={{
                    padding: "clamp(14px,1.2vw,20px)",
                    fontSize: "clamp(12px,.85vw,16px)",
                  }}
                >
                  ₹{" "}
                  {items
                    .reduce((sum, item) => sum + item.unitPrice, 0)
                    .toLocaleString("en-IN")}
                </td>

                <td
                  className="bg-[#E9E9E9] font-medium text-[#242424]"
                  style={{
                    padding: "clamp(14px,1.2vw,20px)",
                    fontSize: "clamp(11px,.7vw,13px)",
                  }}
                >
                  {items.reduce((sum, item) => sum + item.taxRate, 0)}% GST
                </td>

                <td
                  className="rounded-br-xl bg-[#E9E9E9] font-medium text-[#242424]"
                  style={{
                    padding: "clamp(14px,1.2vw,20px)",
                    fontSize: "clamp(12px,.85vw,16px)",
                  }}
                >
                  ₹{" "}
                  {items
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="mt-6 rounded-xl border-2 border-[#E4E8EF] bg-[#ffffff]"
        style={{
          padding: "clamp(14px,1.6vw,20px)",
        }}
      >
        {/* Title */}
        <h2
          className="font-semibold text-[#101828]"
          style={{
            fontSize: "clamp(15px,1.1vw,18px)",
          }}
        >
          Notes
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-2">
          {/* Customer Notes */}
          <div>
            <label
              className="mb-2 block font-normal text-[#010E30]"
              style={{
                fontSize: "clamp(13px,.9vw,15px)",
              }}
            >
              Customer Notes ( Visible to Tenant )
            </label>

            <textarea
              rows={3}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Thank you for choosing Blackstone Nexus."
              className="w-full resize-none rounded-md border border-[#D4D4D4] px-4 py-3 text-[#010E30CC]/80 placeholder:text-[#667085] outline-none focus:border-[#576CBC]"
              style={{
                minHeight: "70px",
                fontSize: "clamp(10px,.8vw,12px)",
              }}
            />
          </div>

          {/* Upload */}
          <div>
            <label
              className="mb-2 block font-normal text-[#010E30]"
              style={{
                fontSize: "clamp(13px,.9vw,15px)",
              }}
            >
              Currency
            </label>

            <label
              htmlFor="fileUpload"
              className="flex cursor-pointer items-center rounded-xl bg-[#F3F3F3]"
              style={{
                minHeight: "70px",
                padding: "clamp(14px,1.2vw,18px)",
              }}
            >
              {/* Icon */}
              <div
                className="mr-4 flex items-center justify-center rounded-xl bg-[#576CBC]"
                style={{
                  width: "42px",
                  height: "42px",
                }}
              >
                <img
                  src="/assets/images/Vector (4).svg"
                  alt=""
                  className="h-6 w-6"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span
                    className="font-normal text-[#010E30]"
                    style={{
                      fontSize: "clamp(14px,.95vw,16px)",
                    }}
                  >
                    Upload Files
                  </span>

                  <span
                    className="text-[#010E30]"
                    style={{
                      fontSize: "clamp(11px,.8vw,13px)",
                    }}
                  >
                    PDF, DOC, PPT, JPG, PNG
                  </span>
                </div>

                <span
                  className="mt-1 text-[#576CBC] underline"
                  style={{
                    fontSize: "clamp(13px,.9vw,14px)",
                  }}
                >
                  Choose a file
                </span>
              </div>

              <input id="fileUpload" type="file" className="hidden" />
            </label>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-2 flex justify-end gap-4  pt-5">
        <button
          onClick={() =>handleClose()}
          type="button"
          className="
      min-w-[140px]
      rounded-lg
      border
      border-[#576CBC]
      py-3
      px-4
      text-sm
      font-semibold
      text-[#576CBC]
      transition
      hover:bg-[#F5F7FF]
    "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="
      min-w-[180px]
      rounded-lg
      bg-[#576CBC]
      py-3
      px-4
      text-sm
      font-semibold
      text-white
      transition
      hover:bg-[#475DB8]
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
        >
          {loading ? "Sending..." : "Send Invoice"}
        </button>
      </div>
    </div>
  );
}
