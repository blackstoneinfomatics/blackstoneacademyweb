"use client";

import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementChangeEvent } from "@stripe/stripe-js";
import {
  Check,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type LocalCardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "rupay"
  | "unknown";

interface CustomCheckoutFormProps {
  readonly clientSecret: string;
  readonly invoice?: any;
  readonly onClose?: () => void;
}

const getCardLogo = (brand: LocalCardBrand) =>
  ({
    visa: "https://img.icons8.com/color/48/visa.png",
    mastercard: "https://img.icons8.com/color/48/mastercard-logo.png",
    amex: "https://img.icons8.com/color/48/amex.png",
    discover: "https://img.icons8.com/color/48/discover.png",
    diners: "https://img.icons8.com/color/48/diners-club.png",
    jcb: "https://img.icons8.com/color/48/jcb.png",
    unionpay: "https://img.icons8.com/color/48/unionpay.png",
    rupay: "/assets/images/icons8-rupay-48.png",
    unknown: "",
  })[brand];

const detectBrand = (
  event: StripeCardNumberElementChangeEvent,
): LocalCardBrand => {
  const value = (event as any)?.value || "";
  const bin = value.replace(/\D/g, "").slice(0, 6);
  if (
    event.brand === "unionpay" ||
    event.brand === "unknown" ||
    /^(508|60|65|6521|6522|81|82)/.test(bin)
  ) {
    return "rupay";
  }
  return event.brand as LocalCardBrand;
};

export default function CheckoutForm({
  clientSecret,
  invoice,
  onClose,
}: CustomCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cardBrand, setCardBrand] = useState<LocalCardBrand>("unknown");
  const [zip, setZip] = useState("");
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [upiId, setUpiId] = useState("");

  const amount = Number(invoice?.totalAmount || 0);
  const currency = invoice?.currency || "INR";
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
  const invoiceNumber = invoice?.invoiceNumber || invoice?._id || "Invoice";
  const serviceName = invoice?.items?.[0]?.service || "Custom service";
  const invoiceId = invoice?.invoiceId;
  const paymentEndpoint = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CUSTOM_SERVICE_INVOICE.PAYMENT(invoiceId)}`;

  const handleSubmit = async (event: React.FormEvent) => {
    console.log("clicked " ,"hanblde ");
    event.preventDefault();
     console.log("stripe:", stripe);
console.log("elements:", elements);
console.log("invoiceId:", invoiceId);
console.log("invoice details",invoice);
    if (!stripe || !elements || !invoiceId) return;
   
    setLoading(true);
    setMessage("");

    const card = elements.getElement(CardNumberElement);
    const expiry = elements.getElement(CardExpiryElement);
    const cvc = elements.getElement(CardCvcElement);
    console.log("card:", card);
console.log("expiry:", expiry);
console.log("cvc:", cvc);
    if (!card || !expiry || !cvc) {
      setMessage("Payment elements not ready. Please try again.");
      setLoading(false);
      return;
    }

    try {
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card,
        billing_details: { address: { postal_code: zip } },
      },
    }
  );

  console.log("Stripe result:", { error, paymentIntent });

  // ✅ ALWAYS handle error FIRST
  if (error) {
    console.error("Stripe error:", error);
    setMessage(error.message || "Payment failed");
    return;
  }

  // Safety check
  if (!paymentIntent) {
    setMessage("No payment information returned.");
    return;
  }

  // ✅ SUCCESS
  if (paymentIntent.status === "succeeded") {
    const response = await fetch(paymentEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  paymentIntentResponse: paymentIntent
}),
    });

    console.log("Backend response:", response);

    setMessage(
      response.ok
        ? "Payment successful!"
        : "Payment succeeded but backend failed."
    );
    return;
  }

  // 🟡 PROCESSING
  if (paymentIntent.status === "processing") {
    setMessage("Payment is processing. Please wait...");
    return;
  }

  // 🔴 OTHER STATES
  setMessage(`Payment status: ${paymentIntent.status}`);
} catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpiPay = async () => {
    if (!upiId) {
      setMessage("Please enter a valid UPI ID.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(paymentEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: {
            invoiceId,
            amount: amount * 100,
            currency: currency.toLowerCase(),
            payment_method_type: "upi",
            upi_id: upiId,
          },
        }),
      });
      const data = await response.json();
      setMessage(
        response.ok
          ? data?.message ||
              "UPI payment initiated. Follow the instructions sent to your UPI app."
          : data?.message || "Failed to initiate UPI payment.",
      );
    } catch {
      setMessage("Failed to start UPI payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#101b36]/0 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-payment-title"
    >
      <button
        type="button"
        aria-label="Close payment window"
        className="absolute inset-0 h-full w-full cursor-default bg-[#101b36]/55 backdrop-blur-md"
        onClick={() => onClose?.()}
      />
      <div className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:max-h-[calc(100vh-4rem)]">
        <div className="grid min-h-[420px] lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="relative overflow-hidden bg-[#223857] p-4 text-white sm:p-5">
            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#53aaf6] text-lg font-black text-black">
                  B
                </div>
                <div>
                  <p className="text-sm font-bold tracking-wide">BLACKSTONE</p>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
                    Academia
                  </p>
                </div>
              </div>
              <div className="mt-14">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#53aaf6]">
                  Secure checkout
                </p>
                <h2 className="mt-3 max-w-xs text-xl font-semibold leading-tight">
                  Complete your service payment.
                </h2>
                <p className="mt-6 max-w-xs text-[13px] leading-6 text-white/65">
                  Pay securely for your Blackstone service invoice.
                </p>
              </div>
              <div className="mt-auto border-t border-white/15 pt-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Due today
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {formattedAmount}
                </p>
                <p className="mt-4 text-xs text-white/50">{invoiceNumber}</p>
              </div>
            </div>
          </aside>
          <section className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="custom-payment-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-[#101b36]"
                >
                  Complete your payment
                </h3>
                <p className="mt-2 text-sm text-slate-500">{serviceName}</p>
              </div>
              <button
                type="button"
                onClick={() => onClose?.()}
                aria-label="Close"
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${method === "card" ? "bg-white text-[#223857] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${method === "upi" ? "bg-white text-[#223857] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Smartphone className="h-4 w-4" /> UPI
              </button>
            </div>
            {method === "card" && (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Card number
                  </label>
                  <div className="relative flex min-h-[35px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5">
                    <CardNumberElement
                      options={{
                        style: {
                          base: {
                            fontSize: "12px",
                            color: "#2d3748",
                            "::placeholder": { color: "#a0aec0" },
                          },
                          invalid: { color: "#e53e3e" },
                        },
                      }}
                      onChange={(event) => setCardBrand(detectBrand(event))}
                      className="w-full"
                    />
                    {cardBrand !== "unknown" && getCardLogo(cardBrand) && (
                      <img
                        src={getCardLogo(cardBrand)}
                        alt={cardBrand}
                        className="absolute right-3 top-1/2 h-5 w-auto max-w-[40px] -translate-y-1/2"
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Expiry date
                    </label>
                    <div className="flex min-h-[35px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5">
                      <CardExpiryElement
                        options={{
                          style: {
                            base: { fontSize: "12px", color: "#2d3748" },
                          },
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Security code
                    </label>
                    <div className="flex min-h-[35px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5">
                      <CardCvcElement
                        options={{
                          style: {
                            base: { fontSize: "12px", color: "#2d3748" },
                          },
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Billing ZIP code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="\d{6}"
                    required
                    value={zip}
                    onChange={(event) =>
                      setZip(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    className="min-h-[35px] w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  onSubmit={handleSubmit}
                  disabled={!stripe || loading}
                  className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#223857] px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      Pay {formattedAmount} <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
            {method === "upi" && (
              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="example@bank"
                  className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleUpiPay}
                  disabled={loading}
                  className="mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#223857] px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                >
                  {loading ? (
                    "Initiating UPI..."
                  ) : (
                    <>
                      Continue with UPI <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
            {message && (
              <p
                className={`mt-5 rounded-lg px-3 py-3 text-center text-sm ${message.toLowerCase().includes("success") || message.toLowerCase().includes("initiated") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
              >
                {message}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5" /> Encrypted payment
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Secured by Stripe
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
