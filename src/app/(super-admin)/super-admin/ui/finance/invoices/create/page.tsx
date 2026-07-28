"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "@/app/(super-admin)/super-admin/components/SuperAdminHeader";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePickerInput from "@/app/(super-admin)/super-admin/components/DatePickerInput";

interface InvoiceItem {
  service: string;
  description: string;
  unitPrice: number;
  tax: number;
  amount: number;
}

export default function CreateInvoicePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({
    tenant: "",
    plan: "Enterprise",
    billingCycle: "Month",
    invoiceNumber: "SUB-INV-2024-000146",
    invoiceDate: null as Date | null,
    dueDate: null as Date | null,
    currency: "INR - Indian Rupee (₹)",
    paymentTerms: "15",
    notes: "Thank you for choosing Blackstone Nexus.",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      service: "",
      description: "",
      unitPrice: 12000,
      tax: 18,
      amount: 12000,
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        ...form,
        items,
      };

      console.log(payload);

      // await axios.post("/api/invoices", payload);

      alert("Invoice Created Successfully");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        service: "",
        description: "",
        unitPrice: 0,
        tax: 18,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: field === "unitPrice" || field === "tax" ? Number(value) : value,
    };

    updated[index].amount =
      updated[index].unitPrice +
      (updated[index].unitPrice * updated[index].tax) / 100;

    setItems(updated);
  };

  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Invoices" />
      <div className="mx-auto w-full max-w-[1600px] p-[clamp(14px,2vw,24px)] bg-[#ffffff]">
        {/* Header */}

        <div className="mb-6 flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/super-admin/ui/finance?tab=invoice")}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white transition hover:bg-[#F9FAFB]"
          >
            <ArrowLeft size={20} className="text-[#344054]" />
          </button>

          <div>
            <h1
              className="font-medium leading-tight text-[#010E30]"
              style={{
                fontSize: "clamp(18px,1.3vw,20px)",
              }}
            >
              Create Custom Service Invoice
            </h1>

            <p
              className="mt-1 max-w-3xl leading-6 text-[#667085]"
              style={{
                fontSize: "clamp(13px,0.9vw,14px)",
              }}
            >
              Generate an invoice for custom features, updates, or special
              requests raised by a tenant.
            </p>
          </div>
        </div>

        {/* Tenant & Subscription Details */}
        <section className="mt-1 rounded-xl border-2 border-[#E4E8EF] bg-[#ffffff] p-[clamp(16px,1.8vw,20px)]">
          <h2
            className="font-medium leading-6 text-[#010E30]"
            style={{
              fontSize: "clamp(15px,1.1vw,18px)",
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
                  className="h-11 w-full appearance-none rounded-lg border border-[#D4D4D4] bg-white px-4 pr-10 text-[#010E30E5]/90 outline-none transition-colors focus:border-[#576CBC]"
                  style={{
                    fontSize: "clamp(13px,0.9vw,14px)",
                  }}
                >
                  <option value="">Select Tenant</option>
                  <option>Blackstone Institute</option>
                  <option>Alpha Academy</option>
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
                className="h-11 w-full rounded-lg border border-[#D4D4D4] bg-[#F9FAFB] px-4 text-[#010E30E5]/90"
                style={{
                  fontSize: "clamp(13px,0.9vw,14px)",
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
                Billing Cycle
              </label>

              <input
                readOnly
                value={form.billingCycle}
                className="h-11 w-full rounded-lg border border-[#D4D4D4] bg-[#F9FAFB] px-4 text-[#010E30E5]/90"
                style={{
                  fontSize: "clamp(13px,0.9vw,14px)",
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
              fontSize: "clamp(15px,1.1vw,18px)",
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
                  fontSize: "clamp(12px,0.8vw,13px)",
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
                className="w-full rounded-md border border-[#D0D5DD] px-3 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
                style={{
                  height: "clamp(38px,2.7vw,42px)",
                  fontSize: "clamp(12px,0.9vw,14px)",
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
                inputClassName="w-full rounded-md border border-[#D4D4D4] px-3 pr-10 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
                style={{
                  width: "clamp(280px, 35vw, 390px)",

                  height: "clamp(38px,2.7vw,42px)",
                  fontSize: "clamp(12px,0.9vw,14px)",
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
                inputClassName="w-full rounded-md border border-[#D4D4D4] px-3 pr-10 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
                style={{
                  width: "clamp(280px, 35vw, 390px)",
                  height: "clamp(38px,2.7vw,42px)",
                  fontSize: "clamp(12px,0.9vw,14px)",
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
                value={form.currency}
                onChange={handleChange}
                className="w-full rounded-md border border-[#D4D4D4] bg-[#F9FAFB] px-3 text-[#344054] outline-none"
                style={{
                  height: "clamp(38px,2.7vw,42px)",
                  fontSize: "clamp(12px,0.9vw,14px)",
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

              <div className="relative">
                <select
                  name="paymentTerms"
                  value={form.paymentTerms}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-md border border-[#D4D4D4] bg-white px-3 pr-10 text-[#344054] outline-none transition-all focus:border-[#576CBC]"
                  style={{
                    height: "clamp(38px,2.7vw,42px)",
                    fontSize: "clamp(12px,0.9vw,14px)",
                  }}
                >
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="45">45 Days</option>
                  <option value="60">60 Days</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                />
              </div>
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
              onClick={addItem}
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

          <div className="overflow-x-auto ">
            <table
              className="w-full border-separate border-spacing-0"
              style={{
                tableLayout: "fixed",
                minWidth: "100%",
              }}
            >
              <thead className="sticky top-0 z-20 bg-[#5A76A3]">
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
                  <tr key={index} className="border-b border-[#D4D4D4]">
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
                      <div className="relative">
                        <select
                          className="w-full appearance-none rounded-md border text-[#010E30CC]/80 border-[#D4D4D4] bg-white px-4 pr-11 outline-none transition focus:border-[#5C73B8]"
                          style={{
                            height: "clamp(46px,3vw,50px)",
                            fontSize: "clamp(14px,.9vw,16px)",
                          }}
                        >
                          <option value="">Enter the service</option>{" "}
                        </select>

                        <ChevronDown
                          size={20}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]"
                        />
                      </div>
                    </td>

                    {/* Description */}
                    <td
                      style={{
                        padding: "clamp(10px,0.85vw,12px)",
                      }}
                    >
                      <input
                        placeholder="Enter the Description"
                        className="w-full rounded-md border border-[#D4D4D4] px-4 text-[#010E30] placeholder:text-[#010E30CC] outline-none transition focus:border-[#5C73B8]"
                        style={{
                          height: "clamp(46px,3vw,50px)",
                          fontSize: "clamp(14px,.9vw,16px)",
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
                        fontSize: "clamp(12px,.85vw,16px)",
                      }}
                      className="font-semibold text-[#626262]"
                    >
                      {item.tax}% GST
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
                      fontSize: "clamp(12px,.85vw,16px)",
                    }}
                  >
                    {items.reduce((sum, item) => sum + item.tax, 0)}% GST
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
            onClick={() => router.push("/super-admin/ui/finance?tab=invoice")}
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
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </BaseSuperLayout>
  );
}
