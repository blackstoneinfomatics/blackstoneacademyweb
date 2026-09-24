"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

type CustomPaymentClientProps = {
  readonly invoice: any;
  readonly id: string;
};

export default function PaymentClient({
  invoice,
  id,
}: CustomPaymentClientProps) {
  const [invoiceShow, setInvoiceShow] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CUSTOM_SERVICE_INVOICE.PAYMENT(id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: { invoiceId: id } }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Payment creation failed");
      }

      const secret =
        data?.data?.clientSecret ??
        data?.clientSecret ??
        data?.data?.client_secret;
      if (!secret) {
        throw new Error(
          data?.message || "Payment setup did not return a client secret",
        );
      }

      setClientSecret(secret);
      setShowPayment(true);
      setInvoiceShow(false);
    } catch (error) {
      console.error("Custom invoice payment API error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {invoiceShow && (
        <div className="flex w-full flex-row items-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="w-full rounded-lg bg-[#576CBC] py-3 text-center font-semibold text-white shadow-sm transition hover:bg-[#4a5ca8]"
          >
            {loading ? "Starting payment..." : "Pay Now"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-3 text-center text-sm text-red-600">
          {message}
        </p>
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
