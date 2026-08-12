import React from "react";
import Link from "next/link";
import Image from "next/image";

type Props = {
  params: { id: string };
};

async function getInvoice(id: string) {
  try {
    if (!process.env.FRONTEND_URL) return null;
    const res = await fetch(`${process.env.FRONTEND_URL}/api/invoices/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function Page({ params }: Props) {
  const { id } = params;
  const invoice = (await getInvoice(id)) ?? {
    _id: id,
    organization: {
      name: "Blackstone School",
      tenantId: "TEN-2026-00124",
      adminName: "Robert James",
      adminEmail: "john@blackstoneacademy.com",
      domain: "blackstoneschool.com",
      phone: "+91 98456 73433",
    },
    subscription: {
      plan: "Basic Plan",
      billingCycle: "Monthly",
      planPrice: 4999,
      studentLimit: 500,
      storageLimit: "50 GB",
      workspaceBackup: "Enabled",
    },
    items: [
      { desc: "Basic Subscription", amount: 4999 },
      { desc: "GST (%)", amount: 900 },
    ],
  };

  const total = (invoice.items || []).reduce(
    (s: number, it: any) => s + (it.amount || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#EEF0FD] py-12 px-4 relative text-slate-700">
      <div className="max-w-3xl mx-auto relative">
        {/* Top Logo & Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/images/bsicon.png"
              alt="Blackstone Academy Logo"
              width={200}
              height={200}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
            Welcome to{" "}
            <span className="text-[#0D3FC1]">BLACKSTONE ACADEMY</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Your organization has been successfully registered.
            <br />
            Complete your subscription payment to activate your workspace.
          </p>
        </header>

        <main className="space-y-5">
            {/* Invoice Details */}
                      <section className="bg-white rounded-xl p-6 shadow-sm border border-[#CECECE]">
            <h3 className="text-base font-semibold text-[#010E30] mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-2 text-xs">
              <div>
                <div className="text-[#010E30] font-medium mb-1">Invoice ID</div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.tenantId}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-medium mb-1">
                  Invoice Date
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.adminName}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-medium mb-1">
                  Due Date
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.adminEmail}
                </div>
              </div>
            </div>
          </section>
          {/* Organization Information */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-[#CECECE]">
            <h3 className="text-base font-semibold text-[#010E30] mb-4">
              Organization Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-2 text-xs">
              <div>
                <div className="text-[#010E30] font-medium mb-1">
                  Organization Name
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.name}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-medium mb-1">Tenant ID</div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.tenantId}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-medium mb-1">
                  Admin Email
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.adminEmail}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-medium mb-1">Domain</div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.domain}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-medium mb-1">
                  Phone Number
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.organization.phone}
                </div>
              </div>
            </div>
          </section>

          {/* Subscription Details */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-[#CECECE]">
            <h3 className="text-base font-semibold text-[#010E30] mb-4">
              Subscription Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-2 text-xs">
              <div>
                <div className="text-[#010E30] font-semibold mb-1">Plan</div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.subscription.plan}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-semibold mb-1">
                  Billing Cycle
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  {invoice.subscription.billingCycle}
                </div>
              </div>
              <div>
                <div className="text-[#010E30] font-semibold mb-1">
                  Plan Price
                </div>
                <div className="font-medium text-[#343e59] text-[11px]">
                  ₹{invoice.subscription.planPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </section>

          {/* Invoice Summary */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-[#CECECE]">
            <h3 className="text-base font-semibold text-[#010E30] mb-4">
              Invoice Summary
            </h3>
            <div className="overflow-hidden rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#DDE2F8] text-slate-600 font-bold">
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(invoice.items || []).map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {it.desc}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        ₹{it.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#DDE2F8] font-bold text-[#093DC5] text-sm">
                    <td className="px-4 py-3.5">Total Payable</td>
                    <td className="px-4 py-3.5 text-right">
                      ₹{total.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <Link
              href={`/api/payments/checkout?invoiceId=${encodeURIComponent(id)}`}
              className="w-full max-w-sm text-center py-3 bg-[#576CBC] hover:bg-[#4a5ca8] text-white font-semibold rounded-lg shadow-sm transition"
            >
              Pay Now
            </Link>
            <Link
              href={`/subscription-invoices/${id}`}
              className="w-full max-w-sm text-center py-3 bg-[#dfe3f6] hover:bg-[#c2c9e0] text-[#576CBC] font-semibold rounded-lg border border-[#576CBC] transition"
            >
              View Invoice
            </Link>
          </div>

          {/* Important Information */}
          <section className="bg-indigo-50/50 border border-[#ACC0F6] rounded-xl p-5 mt-6 text-xs text-slate-600 space-y-2">
            <h4 className="font-semibold text-[#010E30] text-sm mb-2">
              Important Information
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>
                Your workspace will be activated after successful payment.
              </li>
              <li>
                Payment link is valid for{" "}
                <strong className="text-[#353535]">7 days</strong>.
              </li>
              <li>
                Invitation link is valid for{" "}
                <strong className="text-[#353535]">7 days</strong>.
              </li>
              <li>
                Refund requests must be submitted within{" "}
                <strong className="text-slate-800">7 days</strong> of the
                payment date. Requests received after the{" "}
                <strong className="text-slate-800">7-day refund</strong> window
                will not be eligible for a refund.
              </li>
            </ul>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-400 space-y-3">
          <div className="flex justify-center gap-3 text-blue-600">
            <a
              href="#"
              className="w-6 h-6 rounded-full bg-[#093DC5] text-white flex items-center justify-center font-bold text-sm"
            >
              f
            </a>
            <a
              href="#"
              className="w-6 h-6 rounded-full bg-[#093DC5] text-white flex items-center justify-center font-bold text-xs"
            >
              in
            </a>
            <a
              href="#"
              className="w-6 h-6 rounded-full bg-[#093DC5] text-white flex items-center justify-center font-bold text-xs"
            >
              🌐
            </a>
          </div>
          <div>
            <div className="font-bold text-slate-800 tracking-wider">
              BLACKSTONE ACADEMY
            </div>
            <div className="text-[11px] text-slate-500">
              Enterprise SaaS Platform
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-[11px]">
            <div className="text-[#373737]">2026 BLACKSTONE ACADEMY. All rights reserved.</div>
            <div className="space-x-2">
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              <span>|</span>
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
