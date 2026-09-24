"use client";

import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementChangeEvent } from "@stripe/stripe-js";
import {
  BadgeCheck,
  Check,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface CheckoutFormProps {
  clientSecret: string;
  invoice?: any;
  onClose?: () => void;
}

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

const getCardLogo = (brand: LocalCardBrand): string => {
  const logos: Record<LocalCardBrand, string> = {
    visa: "https://img.icons8.com/color/48/visa.png",
    mastercard: "https://img.icons8.com/color/48/mastercard-logo.png",
    amex: "https://img.icons8.com/color/48/amex.png",
    discover: "https://img.icons8.com/color/48/discover.png",
    diners: "https://img.icons8.com/color/48/diners-club.png",
    jcb: "https://img.icons8.com/color/48/jcb.png",
    unionpay: "https://img.icons8.com/color/48/unionpay.png",
    rupay: "/assets/images/icons8-rupay-48.png",
    unknown: "",
  };
  return logos[brand] || "";
};

const detectBrandWithRupayOverride = (
  event: StripeCardNumberElementChangeEvent,
): LocalCardBrand => {
  const value = (event as any)?.value || "";
  const bin = value.replace(/\D/g, "").slice(0, 6);
  const stripeBrand = event.brand;

  if (
    stripeBrand === "unionpay" ||
    stripeBrand === "unknown" ||
    /^(508|60|65|6521|6522|81|82)/.test(bin)
  ) {
    return "rupay";
  }

  return stripeBrand as LocalCardBrand;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  invoice,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cardBrand, setCardBrand] = useState<LocalCardBrand>("unknown");
  const [zip, setZip] = useState("");
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [upiId, setUpiId] = useState("");

  const handleCardChange = (event: StripeCardNumberElementChangeEvent) => {
    const detected = detectBrandWithRupayOverride(event);
    setCardBrand(detected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const cardNumberElement = elements.getElement(CardNumberElement);
    const expiryElement = elements.getElement(CardExpiryElement);
    const cvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !expiryElement || !cvcElement) {
      setMessage("Payment elements not ready. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: { address: { postal_code: zip } },
          },
        },
      );

      if (error) {
        setMessage(error.message ?? "An unexpected error occurred.");
      } else if (paymentIntent?.status === "succeeded") {
        console.log("invoice._id", invoice);
        const payload = {
          invoiceId: invoice._id,
          paymentIntentResponse: paymentIntent,
        };
        console.log("Payment succeeded:", payload);
        const backendRes = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_SUPERADMIN_SUBSCRIPTION}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload: {
                invoiceId: invoice.invoiceId,
                paymentIntentResponse: paymentIntent,
              },
            }),
          },
        );

        if (backendRes.ok) setMessage("✅ Payment successful!");
        else setMessage("❌ Backend failed to confirm payment.");
      }
    } catch (err) {
      setMessage("❌ Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpiPay = async () => {
    setMessage("");
    if (!upiId) {
      setMessage("Please enter a valid UPI ID.");
      return;
    }

    setLoading(true);
    try {
      const amount = invoice?.totalAmount || 0;
      const payload = {
        amount: amount * 100,
        currency: "usd",
        payment_method_type: "upi",
        upi_id: upiId,
      };
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_SUPERADMIN_SUBSCRIPTION}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setMessage(
          "UPI payment initiated. Follow the instructions sent to your UPI app.",
        );
      } else if (!res.ok) {
        setMessage(data?.message || "Failed to initiate UPI payment.");
      } else {
        setMessage("UPI flow started. Complete payment in your UPI app.");
      }
    } catch (err) {
      setMessage("Failed to start UPI payment.");
    } finally {
      setLoading(false);
    }
  };

  const invoiceNumber =
    invoice?.invoiceNumber || invoice?.invoiceId || "Subscription invoice";
  const planName =
    invoice?.subscriptionPlan?.name ||
    invoice?.subscriptionPlan?.title ||
    "Academy subscription";
  const amount = Number(invoice?.totalAmount || 0);
  const currency = invoice?.currency || "INR";
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#101b36]/0 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
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
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#53aaf6] text-lg font-black text-[#000000]">
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
                  Invest in your next chapter.
                </h2>
                <p className="mt-6 max-w-xs text-[13px] leading-6 text-white/65">
                  Your subscription gives you uninterrupted access to all
                  platform.
                </p>
              </div>
              <div className="mt-auto pt-8">
                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                        Due today
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {formattedAmount}
                      </p>
                    </div>
                    <BadgeCheck className="mt-1 h-6 w-6 text-[#53aaf6]" />
                  </div>
                  <p className="mt-4 text-xs text-white/50">{invoiceNumber}</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="payment-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-[#101b36]"
                >
                  Complete your payment
                </h3>
                <p className="mt-2 text-sm text-slate-500">{planName}</p>
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
                  <div className="relative flex min-h-[35px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 transition focus-within:border-[#0D3FC1] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
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
                      onChange={handleCardChange}
                      className="w-full"
                    />
                    {cardBrand &&
                      cardBrand !== "unknown" &&
                      getCardLogo(cardBrand) && (
                        <img
                          src={getCardLogo(cardBrand)}
                          alt={cardBrand}
                          className="absolute right-3 top-1/2 h-5 w-auto max-w-[40px] -translate-y-1/2"
                        />
                      )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Expiry date
                    </label>
                    <div className="flex min-h-[35px] min-w-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 transition focus-within:border-[#0D3FC1] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                      <CardExpiryElement
                        options={{
                          style: {
                            base: {
                              fontSize: "12px",
                              color: "#2d3748",
                              "::placeholder": {
                                color: "#a0aec0",
                                fontSize: "12px",
                              },
                            },
                            invalid: { color: "#e53e3e" },
                          },
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Security code
                    </label>
                    <div className="flex min-h-[35px] min-w-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 transition focus-within:border-[#0D3FC1] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                      <CardCvcElement
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
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="min-h-[35px] w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0D3FC1] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#223857] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(13,63,193,0.2)] transition hover:bg-[#122034] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="example@bank"
                  className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0D3FC1] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={handleUpiPay}
                  disabled={loading}
                  className="mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#223857] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(13,63,193,0.2)] transition hover:bg-[#051746] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
                className={`mt-5 rounded-lg px-3 py-3 text-center text-sm ${message.includes("success") || message.includes("initiated") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
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
};

export default CheckoutForm;
