"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/app/(super-admin)/subscription-invoices/[id]/payment/CheckoutForm";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import Link from "next/link";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
if (!stripePublishableKey) {
  console.warn(
    "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.",
  );
}
const stripePromise = loadStripe(stripePublishableKey);

export default function PaymentClient({
  invoice,
  id,
}: {
  invoice: any;
  id: string;
}) {
  const [invoiceShow, setInvoiceShow] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const handleClick = async () => {
  try {
    const res = await fetch(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_SUPERADMIN_SUBSCRIPTION}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: {
            invoiceId: id,
          },
        }),
      },
    );

    const data = await res.json();

    console.log("Full API Response:", data);
    console.log("Success:", data?.success);
    console.log("Client Secret:", data?.data?.clientSecret);

    if (!res.ok) {
      throw new Error(data?.message || "Payment creation failed");
    }

    const secret = data?.data?.clientSecret;
    const success = data?.success;

    if (!secret) {
      console.error("Client secret is missing:", data);
      return;
    }

    setClientSecret(secret);
    setShowPayment(success === true);
    setInvoiceShow(false);

  } catch (error) {
    console.error("Payment API Error:", error);
  }
};

  return (
    <>
      {invoiceShow && (
        <div className="flex flex-row items-center gap-3 pt-4 w-full">
          <button
            onClick={handleClick}
            className="w-full text-center py-3 bg-[#576CBC] hover:bg-[#4a5ca8] text-white font-semibold rounded-lg shadow-sm transition"
          >
            Pay Now
          </button>
        </div>
      )}

      {showPayment && clientSecret && (
        <div className="payment-form-container mt-6">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              clientSecret={clientSecret}
              invoice={invoice}
              onClose={() => {
                setShowPayment(false);
                setInvoiceShow(true);
              }}
            />
          </Elements>
        </div>
      )}
    </>
  );
}
