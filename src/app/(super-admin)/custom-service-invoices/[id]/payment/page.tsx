import Image from "next/image";
import Link from "next/link";
import PaymentClient from "./PaymentClient";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type Props = { readonly params: { readonly id: string } };

type CustomInvoiceItem = {
  service?: string;
  description?: string;
  unitPrice?: number;
  taxRate?: number;
  taxAmount?: number;
  amount?: number;
};

type CustomInvoice = {
  _id?: string;
  invoiceNumber?: string;
  tenantId?: string;
  subscriptionId?: string;
  planId?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  paymentTerms?: number;
  items?: CustomInvoiceItem[];
  subTotal?: number;
  totalTax?: number;
  totalAmount?: number;
  customerNotes?: string;
  invoiceStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
  tenant?: {
    tenantName?: string;
    tenantId?: string;
    tenantCode?: string;
    emailId?: string;
    phoneNumber?: string;
    organizationName?: string;
  };
};

type TenantSubscription = {
  _id: string;
  tenantId?: string;
  tenantName?: string;
  tenant?: {
    tenantId?: string;
    tenantCode?: string;
    tenantName?: string;
    emailId?: string;
    phoneNumber?: string;
    organizationName?: string;
  };
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatCurrency = (value = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

async function getInvoice(id: string): Promise<CustomInvoice | null> {
  try {
    const response = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CUSTOM_SERVICE_INVOICE.GET_BY_ID}/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const result = await response.json();
    const data = result?.data?.invoice ?? result?.data ?? result;
    if (Array.isArray(data?.items) && data.items[0]?._id) {
      return data.items.find((item: CustomInvoice) => item._id === id) ?? null;
    }
    return data;
  } catch (error) {
    console.error("Custom invoice payment page error:", error);
    return null;
  }
}

async function getTenantSubscription(tenantId?: string) {
  if (!tenantId) return null;

  try {
    const response = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.TENANT_SUBSCRIPTION.GET}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const result = await response.json();
    const subscriptions: TenantSubscription[] = result?.data?.tenants ?? [];
    return (
      subscriptions.find(
        (subscription) =>
          subscription.tenantId === tenantId ||
          subscription.tenant?.tenantId === tenantId ||
          subscription.tenant?.tenantCode === tenantId,
      ) ?? null
    );
  } catch (error) {
    console.error("Tenant details error:", error);
    return null;
  }
}

export default async function CustomInvoicePaymentPage({ params }: Props) {
  const invoice = await getInvoice(params.id);

  if (!invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f6] p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Invoice Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This custom service invoice could not be loaded.
          </p>
        </div>
      </main>
    );
  }

  const currency = invoice.currency || "INR";
  const items = invoice.items ?? [];
  const tenantSubscription = await getTenantSubscription(invoice.tenantId);
  const tenantDetails = invoice.tenant ?? tenantSubscription?.tenant;
  const tenantName =
    tenantDetails?.tenantName ??
    tenantSubscription?.tenantName ??
    tenantDetails?.tenantId ??
    "-";
  const tenantId =
    invoice.tenantId ??
    tenantDetails?.tenantId ??
    tenantDetails?.tenantCode ??
    tenantSubscription?.tenantId ??
    "-";

  return (
    <main className="min-h-screen bg-[#eef1f6] px-3 py-8 text-slate-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[900px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col justify-between gap-6 px-7 pb-8 pt-9 sm:flex-row sm:px-12 sm:pt-12">
          <Image
            src="/assets/images/bsicon.png"
            alt="Blackstone Academy"
            width={120}
            height={120}
            className="object-contain"
          />
          <div className="sm:text-right">
            <h1 className="text-4xl font-black tracking-[0.08em] text-[#0D3FC1]">
              INVOICE
            </h1>
            <p className="mt-3 text-sm font-bold text-slate-900">
              {invoice.invoiceNumber ?? params.id}
            </p>
          </div>
        </div>
        <div className="h-[3px] bg-[#0D3FC1]" />

        <div className="grid grid-cols-1 gap-6 px-7 py-8 sm:grid-cols-3 sm:px-12">
          <div>
            <p className="text-[11px] uppercase text-slate-500">Invoice Date</p>
            <p className="mt-1 text-xs font-semibold">
              {formatDate(invoice.invoiceDate)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-slate-500">Due Date</p>
            <p className="mt-1 text-xs font-semibold">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-slate-500">Payment Status</p>
            <p className="mt-1 text-xs font-semibold">
              {invoice.paymentStatus ?? "PENDING"}
            </p>
          </div>
        </div>

        <div className="mx-7 mb-8 overflow-hidden rounded-lg border border-slate-200 sm:mx-12">
          <div className="border-b border-slate-200 bg-[#f7f8fc] px-5 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
              Tenant Details
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase  text-slate-500">Tenant Name</p>
              <p className="mt-1 text-sm font-semibold">{tenantName}</p>
              {tenantDetails?.organizationName && (
                <p className="mt-1 text-xs text-slate-500">
                  {tenantDetails.organizationName}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">Tenant ID</p>
              <p className="mt-1 break-all text-xs font-semibold">{tenantId}</p>
            </div>
            {tenantDetails?.emailId && (
              <div>
                <p className="text-[10px] uppercase text-slate-400">Email</p>
                <p className="mt-1 break-all text-xs font-semibold">
                  {tenantDetails.emailId}
                </p>
              </div>
            )}
            {tenantDetails?.phoneNumber && (
              <div>
                <p className="text-[10px] uppercase text-slate-400">Phone</p>
                <p className="mt-1 text-xs font-semibold">
                  {tenantDetails.phoneNumber}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase text-slate-400">Currency</p>
              <p className="mt-1 text-xs font-semibold">{currency}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">
                Invoice Status
              </p>
              <p className="mt-1 text-xs font-semibold">
                {invoice.invoiceStatus ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">
                Created Date
              </p>
              <p className="mt-1 text-xs font-semibold">
                {formatDate(invoice.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-7 sm:px-12">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse">
              <thead className="bg-[#101c38] text-left text-xs uppercase text-white">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={`${item.service}-${index}`}
                    className="border-b border-slate-200 text-sm"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {item.service ?? "Service"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.description ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(
                        item.amount ?? item.unitPrice ?? 0,
                        currency,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end px-7 py-8 sm:px-12">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatCurrency(invoice.subTotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax</span>
              <span>{formatCurrency(invoice.totalTax, currency)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-[#101c38] pt-3 text-base font-extrabold">
              <span>Total Due</span>
              <span className="text-[#0D3FC1]">
                {formatCurrency(invoice.totalAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-7 mb-8 rounded-lg border border-[#dce4ff] bg-[#f7f9ff] sm:mx-12">
          <div className="border-b border-[#dce4ff] px-5 py-4">
            <h2 className="font-bold text-[#101c38]">Payment</h2>
            <p className="mt-1 text-xs text-slate-500">
              Pay securely by card or UPI.
            </p>
          </div>
          <div className="px-5 py-6">
            <PaymentClient
              invoice={invoice}
              id={params.id}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 px-7 py-6 text-xs text-slate-400 sm:px-12">
          <p>{invoice.customerNotes ?? "Thank you for your business."}</p>
          <p className="mt-2">
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
    </main>
  );
}
