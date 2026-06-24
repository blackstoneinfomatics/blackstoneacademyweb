"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useElements,
  useStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementChangeEvent } from "@stripe/stripe-js";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import axios from "axios";
import { Search } from "lucide-react";
import { MdTune } from "react-icons/md";
import StudentHeader from "../../components/StudentHeader";
import React from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

const stripePromise = loadStripe(
  "pk_test_51LilJwCsMeuBsi2YvvK4gor68JPLEOcF2KIt1GuO8qplGSzCSjKTI2BYZ7Z7XLKD1VA8riExXLOT73YHQIA8wbUJ000VrpQkNE"
);


interface Student {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string; // Changed to string because it's a phone number and might start with 0 or contain country codes
  country: string;
  state: string;
  city: string;
  pinCode: string;
}

interface Invoice {
  _id: string;
  courseName: string;
  amount: number;
  paymentDate: number;
  status: string;
  createdDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  invoiceStatus: string;
  student: Student;
  description: string;
  dueDate: string;
  duration: string;
  itemDescription: string;
  packageType: string;
  rate: string;
  __v: number;
  payments?: { amount: number; date: string }[]; // Added payments array
}



interface CheckoutFormProps {
  clientSecret: string;
  invoiceId: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (details: any) => void;
  onPaymentFailure: () => void;
  selectedInvoice: Invoice | null;
  downloadInvoice: () => void;
}

type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "rupay"
  | "unknown";

const getCardLogo = (brand: string) => {
  const logos: Record<CardBrand, string> = {
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
  return logos[brand as CardBrand] || "";
};

const detectBrandWithRupayOverride = (event: any) => {
  const value = event?.value || "";
  const bin = value.replace(/\D/g, "").slice(0);
  const stripeBrand = event.brand;
  if (
    stripeBrand === "unionpay" ||
    stripeBrand === "unknown" ||
    /^(508|60|65|6521|6522|81|82)/.test(bin)
  ) {
    return "rupay";
  }
  return stripeBrand;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  invoiceId,
  amount,
  currency,
  downloadInvoice,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [cardBrand, setCardBrand] = useState("unknown");
  const [zip, setZip] = useState("");

  useEffect(() => {
    // Initial check
    const checkDarkMode = () => {
      const isClassDark = document.documentElement.classList.contains("dark");
      setIsDark(isClassDark);
    };

    checkDarkMode();

    // Listen for system changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Re-check both class and system to be safe, or just system if class isn't used
      checkDarkMode();
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    // Listen for class changes on html element (Tailwind dark mode toggle)
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      observer.disconnect();
    };
  }, []);

  const handleCardChange = (event: StripeCardNumberElementChangeEvent) => {
    setCardBrand(detectBrandWithRupayOverride(event));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setMessage("Card details are required.");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            address: {
              postal_code: zip,
            },
          },
        },
      }
    );

    if (error) {
      setMessage(error.message ?? "Payment failed.");
    } else if (paymentIntent?.status === "succeeded") {
      try {
        const response = await axios.post(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_STUDENT_PAYMENT}`,
          {
            amount,
            currency,
            invoiceId,
            paymentIntentResponse: paymentIntent,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );


        setMessage("Payment successful!");
      } catch (error) {
        setMessage("Payment processing failed.");
      }
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-[#343434]"
    >
      <div className="mb-4 ">
        <label className="block text-xs font-medium text-gray-800 mb-1 dark:text-[#ffffff]">
          Card Number
        </label>
        <div className="relative border rounded-md px-3 py-2 flex items-center bg-white dark:bg-[#3C3C3C] dark:text-white">
          <CardNumberElement
            options={{
              style: {
                base: {
                  color: isDark ? "#ffffff" : "#222222",
                  fontSize: "14px",
                  "::placeholder": { color: isDark ? "#cccccc" : "#888888" },
                },
                invalid: {
                  color: "#ff6b6b",
                },
              },
            }}
            className="w-full dark:text-white"
            onChange={handleCardChange}
          />
          {cardBrand && cardBrand !== "unknown" && getCardLogo(cardBrand) && (
            <img
              src={getCardLogo(cardBrand)}
              alt={cardBrand}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-auto max-w-[40px]"
            />
          )}
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-800 mb-1 dark:text-[#ffffff]">
            Expiry
          </label>
          <div className="border rounded-md px-3 py-2 bg-white dark:bg-[#3C3C3C] dark:text-white">
            <CardExpiryElement
              options={{
                style: {
                  base: {
                    color: isDark ? "#ffffff" : "#222222",
                    fontSize: "14px",
                    "::placeholder": { color: isDark ? "#cccccc" : "#888888" },
                  },
                  invalid: {
                    color: "#ff6b6b",
                  },
                },
              }}
              className="w-full dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-800 mb-1 dark:text-[#ffffff]">
            CVC
          </label>
          <div className="border rounded-md px-3 py-2 bg-white dark:bg-[#3C3C3C] dark:text-white">
            <CardCvcElement
              options={{
                style: {
                  base: {
                    color: isDark ? "#ffffff" : "#222222",
                    fontSize: "14px",
                    "::placeholder": { color: isDark ? "#cccccc" : "#888888" },
                  },
                  invalid: {
                    color: "#ff6b6b",
                  },
                },
              }}
              className="w-full dark:text-white"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-2 px-4 rounded-lg text-white font-bold transition-colors text-[13px] ${!stripe || loading
          ? "bg-gray-400 cursor-not-allowed"
          : "cursor-pointer bg-[#2D6AE0] hover:bg-[#1B4FA0]"
          }`}
      >
        {loading ? "Processing..." : "Pay"}
      </button>
      {message && (
        <p className="text-center text-sm text-gray-700 dark:text-white">
          {message}
        </p>
      )}
    </form>
  );
};

const Invoice = () => {
  const [showModal, setShowModal] = useState(false); // Payment modal
  const [showFilterModal, setShowFilterModal] = useState(false); // Filter modal
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  // Add missing filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [positionApplied, setPositionApplied] = useState("Pending");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    null | "succeeded" | "failed"
  >(null);
  // Calculate total price based on selected invoice
  const calculateTotalPrice = () => {
    if (!selectedInvoice) return 0;
    const amount = Number(selectedInvoice.amount) || 0;
    const gst = 0; // Since GST is not in your API response
    const discount = 0; // Since discount is not in your API response
    return amount + gst - discount;
  };

  const totalPrice = calculateTotalPrice();
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const studentId = localStorage.getItem("StudentPortalId");
        const courseName = localStorage.getItem("StudentcourseName");
        if (!studentId || !courseName) {
          toast.error(AppValidationMessages.AUTH.STUDENT_REQUIRED);
          return;
        }

        const studentIdQuery = studentId;

        // Token check
        let token =
          localStorage.getItem("StudentAuthToken") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("userToken");

        if (!token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }

        // Parse JSON token if needed
        try {
          const parsed = JSON.parse(token);
          if (typeof parsed === "object") {
            token = parsed.token || parsed.accessToken || token;
          }
        } catch {
          // Token is plain string → use directly
        }

        // ✅ API call with query param
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.STUDENT_INVOICE_BYID}`,
          {
            params: { studentId: studentIdQuery, courseName: courseName },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        

        // Normalize response shape to an Invoice[] list
        const payload: any = response.data;
        const list: Invoice[] = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.invoice)
            ? payload.invoice
            : Array.isArray(payload)
              ? payload
              : [];

        // ✅ No filtering needed, backend already filters by studentId
        setInvoices(list);

        if (list.length > 0) {
          setSelectedInvoice(list[0]);
        }
      } catch (error: any) {
        console.error("❌ Failed to fetch invoices:", error);
        if (error.response?.status === 401) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
        } else {
          toast.error(AppFailureToastMessages.INVOICE_FETCH_FAILED);
        }
      }
    };

    fetchInvoices();
  }, []);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };
  const handleClick = async () => {
    if (!selectedInvoice) {
      toast.error(AppFailureToastMessages.INVOICE_SELECT_REQUIRED);
      return;
    }

    setShowModal(true);
    setShowFilterModal(false); // <-- Add this line
    const evaluationid = selectedInvoice._id;
    const totalprice = totalPrice;

    


    try {
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_STUDENT_PAYMENT}`,
        {
          amount: totalprice * 100,
          currency: "usd",
          invoiceId: evaluationid,
          paymentIntentResponse: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const clientSecret = response?.data?.clientSecret;
      

      if (clientSecret?.includes("_secret_")) {
        setClientSecret(clientSecret);
      } else {
        console.error("Invalid clientSecret received:", response.data);
        toast.error(AppFailureToastMessages.INVALID_PAYMENT_SESSION);
        setShowModal(false);
      }
    } catch (error: any) {
      if (error && error.response && error.response.data) {
        toast.error(AppFailureToastMessages.REQUEST_ERROR + JSON.stringify(error.response.data));
      } else {
        toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + " Check console for details.");
      }
      setShowModal(false);
    }
  };

  const downloadInvoice = () => {
    if (typeof window === "undefined") return;

    setIsGeneratingPDF(true);

    // Hide buttons during PDF generation
    const hideElements = [
      document.getElementById("hideDuringDownload"),
      document.getElementById("hideDuringDownloadFooter"),
    ];
    hideElements.forEach((el) => el?.classList.add("hidden"));

    const invoiceElement = document.getElementById("invoic");
    const options = {
      filename: "invoice.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    const html2pdf = require("html2pdf.js");
    html2pdf()
      .set(options)
      .from(invoiceElement)
      .save()
      .then(() => {
        // Show elements again after download
        hideElements.forEach((el) => el?.classList.remove("hidden"));
        setIsGeneratingPDF(false);
      });
  };

  const downloadReceipt = () => {
    if (typeof window === "undefined") return;

    setIsGeneratingPDF(true);

    const receiptElement = document.getElementById("receipt-content");
    const hideElements = [
      document.getElementById("hideDuringReceiptDownload"),
      document.getElementById("hideDuringReceiptDownloadClose")
    ];

    hideElements.forEach(el => el?.classList.add("hidden"));

    const options = {
      filename: "receipt.pdf",
      html2canvas: { scale: 2, backgroundColor: null }, // Preserve transparency/dark mode
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const html2pdf = require("html2pdf.js");
    html2pdf()
      .set(options)
      .from(receiptElement)
      .save()
      .then(() => {
        hideElements.forEach(el => el?.classList.remove("hidden"));
        setIsGeneratingPDF(false);
      });
  };

  function formatDateDMY(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Formats to: sep20 , 2025
  function formatDateMonDayYear(input?: string | number | Date) {
    if (input === undefined || input === null || input === "") return "";

    let date: Date | null = null;

    if (typeof input === "number") {
      // Treat as epoch seconds or ms based on magnitude
      const ms = input < 1e12 ? input * 1000 : input;
      date = new Date(ms);
    } else if (typeof input === "string") {
      const trimmed = input.trim();
      if (/^\d+$/.test(trimmed)) {
        // Numeric string → seconds or ms
        const num = Number(trimmed);
        const ms = num < 1e12 ? num * 1000 : num;
        date = new Date(ms);
      } else {
        // ISO or other parseable string
        date = new Date(trimmed);
      }
    } else if (input instanceof Date) {
      date = input;
    }

    if (!date || isNaN(date.getTime())) return "";

    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day} , ${year}`;
  }

  function toDateString(date: string) {
    return new Date(date).toISOString().slice(0, 10);
  }

  const getInvoiceDue = (invoice: Invoice) => {
    const paid =
      invoice.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const calculatedDue = Number(invoice.amount) - paid;
    const statusLower = (invoice.invoiceStatus || "").toLowerCase();
    if (statusLower === "paid") {
      return 0;
    }
    return calculatedDue < 0 ? 0 : calculatedDue;
  };



  // Filtering logic
  const handleFilter = () => {
    let filtered = invoices;
    if (fromDate) {
      filtered = filtered.filter(
        (inv) => toDateString(inv.createdDate) >= fromDate
      );
    }
    if (toDate) {
      filtered = filtered.filter(
        (inv) => toDateString(inv.createdDate) <= toDate
      );
    }
    if (positionApplied) {
      filtered = filtered.filter(
        (inv) => inv.invoiceStatus === positionApplied
      );
    }
    if (searchText.trim() !== "") {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.courseName.toLowerCase().includes(lower) ||
          inv._id.toLowerCase().includes(lower) ||
          toDateString(inv.createdDate).includes(lower) ||
          formatDateDMY(inv.createdDate).includes(lower) ||
          inv.invoiceStatus.toLowerCase().includes(lower)
      );
    }
    setFilteredInvoices(filtered);
    setShowFilterModal(false);
  };

  // Optionally, filter by searchText live (not just on filter submit)
  useEffect(() => {
    if (searchText.trim() === "" || searchText.trim() === ".") {
      setFilteredInvoices([]);
      return;
    }
    let filtered = invoices;
    if (searchText.trim() !== "" && searchText.trim() !== ".") {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.courseName.toLowerCase().includes(lower) ||
          inv._id.toLowerCase().includes(lower) ||
          toDateString(inv.createdDate).includes(lower) ||
          formatDateDMY(inv.createdDate).includes(lower) ||
          inv.invoiceStatus.toLowerCase().includes(lower)
      );
    }
    setFilteredInvoices(filtered);
  }, [searchText, invoices]);

  // Payment status modal (moved from CheckoutForm)
  const paymentStatusModal = paymentStatus && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="bg-white dark:bg-[#232323] p-6 rounded-xl shadow-xl w-96 relative"
        id="receipt-content"
      >
        {/* Close (X) button */}
        <button
          onClick={() => setPaymentStatus(null)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold focus:outline-none"
          aria-label="Close receipt modal"
          type="button"
          id="hideDuringReceiptDownloadClose"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          {/* Icon */}
          {paymentStatus === "succeeded" ? (
            <svg
              className="h-12 w-12 text-green-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="12" fill="#e6f9ed" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 13l3 3 7-7"
              />
            </svg>
          ) : (
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="mb-2"
            >
              <circle cx="24" cy="24" r="20" fill="#FDE8E8" />
              <circle cx="24" cy="24" r="16" fill="#E53935" />
              <path
                d="M30 18L18 30"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M18 18L30 30"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Title and subtext */}
          <h3
            className={`text-xl font-bold mt-2 ${paymentStatus === "succeeded"
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
              }`}
          >
            {paymentStatus === "succeeded"
              ? "Payment Success"
              : "Payment Failed"}
          </h3>
          <p
            className={`text-sm mt-1 ${paymentStatus === "succeeded"
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
              }`}
          >
            {paymentStatus === "succeeded"
              ? "Your payment has been successfully done"
              : "Your payment has been Failed"}
          </p>
          <div
            className={`w-full border-b-2 my-4 ${paymentStatus === "succeeded"
              ? "border-green-500 dark:border-green-500"
              : "border-red-500 dark:border-red-500"
              }`}
          ></div>

          {/* Total Payment */}
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
            Total Payment
          </h4>
          <div className="flex items-center justify-center gap-3 mb-2 w-full">
            <img
              src="/assets/images/rec.png"
              alt="Course"
              className="h-10 w-10 p-1 bg-white rounded-full dark:bg-black"
            />
            <div className="flex flex-col items-start">
              <span className="font-semibold text-black dark:text-white text-sm">
                {selectedInvoice?.courseName}
              </span>
              <div className="flex gap-4 text-xs mt-1">
                <span className="text-gray-700 dark:text-gray-300">
                  Month:{" "}
                  <span className="font-bold">
                    {(() => {
                      const date = paymentDetails?.createdDate
                        ? new Date(paymentDetails.createdDate)
                        : new Date();
                      return date.toLocaleString("default", { month: "short" });
                    })()}
                  </span>
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Year:{" "}
                  <span className="font-bold">
                    {(() => {
                      const date = paymentDetails?.createdDate
                        ? new Date(paymentDetails.createdDate)
                        : new Date();
                      return date.getFullYear();
                    })()}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ${((paymentDetails?.paymentAmount || 0) / 100).toFixed(2)}
          </div>

          {/* Info boxes */}
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            <div className="bg-gray-50 dark:bg-[#232323] rounded-lg py-3 px-2 text-center border border-gray-200 dark:border-gray-100">
              <p className="text-xs dark:text-gray-400">Ref Number</p>
              <p className="text-xs font-medium text-gray-400 break-all dark:text-gray-400">
                {paymentDetails?.paymentResponseId
                  ? (() => {
                    const ref = paymentDetails.paymentResponseId;
                    const mid = Math.ceil(ref.length / 2);
                    return (
                      <>
                        {ref.slice(0, mid)}
                        <br />
                        {ref.slice(mid)}
                      </>
                    );
                  })()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[#232323] rounded-lg py-3 px-2 text-center border border-gray-200 dark:border-gray-100">
              <p className="text-xs dark:text-gray-400">Payment Time</p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-400">
                {(() => {
                  const date = paymentDetails?.createdDate
                    ? new Date(paymentDetails.createdDate)
                    : new Date();
                  const day = date.getDate().toString().padStart(2, "0");
                  const month = date.toLocaleString("default", {
                    month: "short",
                  });
                  const year = date.getFullYear();
                  const hour = date.getHours().toString().padStart(2, "0");
                  const min = date.getMinutes().toString().padStart(2, "0");
                  return `${day} ${month} ${year}, ${hour}:${min}`;
                })()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[#232323] rounded-lg py-3 px-2 text-center border border-gray-200 dark:border-gray-100">
              <p className="text-xs dark:text-gray-400">Payment Method</p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-400">
                Online
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-[#232323] rounded-lg py-3 px-2 text-center border border-gray-200 dark:border-gray-100">
              <p className="text-xs dark:text-gray-400">Sender Name</p>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-400">
                {selectedInvoice?.student.studentName || "N/A"}
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            id="hideDuringReceiptDownload"
            onClick={() => {
              downloadReceipt();
              setPaymentStatus(null);
            }}
            className="w-full mt-2 py-2 bg-[#576CBC] dark:bg-[#576CBC] rounded-lg text-white font-semibold flex items-center justify-center gap-2"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8"
              />
            </svg>
            Get PDF Receipt
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <BaseLayout2>
      <StudentHeader currentSection="Payment" />
      <div id="invoic" className="px-4 py-4 flex justify-center w-full ">
        <div className="w-full h-[480px] bg-white py-4 px-0 rounded-lg shadow dark:bg-[#343434]">
          {/* Header Section */}
          <div className="p-2">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <h1 className="text-md font-semibold dark:text-[#ffffff]">
                Invoice
              </h1>
              <img
                src="/assets/images/bsicon.png"
                alt="Al Furqan Academy"
                className="w-40 block dark:hidden"
              />

              {/* Dark mode logo */}
              <img
                src="/assets/images/blackstone.png"
                alt="Al Furqan Academy"
                className="w-40 hidden dark:block"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              {/* <div className="flex items-center mb-2 md:mb-0">
                
              </div> */}
              <div className="justify-between flex text-xs w-full">
                <div>
                  <p>
                    <span className="font-semibold text dark:text-[#ffffff]">
                      Reg&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
                    </span>{" "}
                    <span> {selectedInvoice?._id || ""}</span>
                  </p>
                  <p>
                    <span className="font-semibold text dark:text-[#ffffff]">
                      Email Id
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
                    </span>{" "}
                    <span>{selectedInvoice?.student.studentEmail || ""}</span>
                  </p>
                  <p>
                    <span className="font-semibold text dark:text-[#ffffff]">
                      Phone number &nbsp;&nbsp;:{" "}
                    </span>{" "}
                    <span>{selectedInvoice?.student.studentPhone || ""}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold dark:text-[#ffffff]">
                      Invoice Number &nbsp; :
                    </span>{" "}
                    <span>{selectedInvoice?._id || ""}</span>
                  </p>
                  <p>
                    <span className="font-semibold dark:text-[#ffffff]">
                      Invoice Date
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                    </span>{" "}
                    <span>{formatDateDMY(selectedInvoice?.createdDate)}</span>
                  </p>
                  <p>
                    <span className="font-semibold dark:text-[#ffffff]">
                      Due
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                    </span>{" "}
                    <span>{formatDateDMY(selectedInvoice?.dueDate)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice + Payment Summary */}
            {/* Invoice + Payment Summary */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 ">
              {/* Left Table */}
              <div className="w-full md:w-3/4 bg-gray-100 text-xs rounded-lg overflow-hidden dark:bg-[#343434]">
                <table className="w-full text-xs border">
                  <thead className="bg-[#505050] text-white">
                    <tr>
                      <th className="p-2 border text-left">Description</th>
                      <th className="p-2 border text-left">Quantity</th>
                      <th className="p-2 border text-left">Price</th>
                      <th className="p-2 border text-left">Discount</th>
                      <th className="p-2 border text-left">GST</th>
                      <th className="p-2 border text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="p-2 border font-semibold text-left">
                        {selectedInvoice?.courseName}
                      </td>
                      <td className="p-2 border text-left">1</td>
                      <td className="p-2 border text-left">
                        ${selectedInvoice ? getInvoiceDue(selectedInvoice) : 0}
                      </td>
                      <td className="p-2 border text-left">0.00</td>
                      <td className="p-2 border text-left">0.00</td>
                      <td className="p-2 border text-left">
                        ${selectedInvoice ? getInvoiceDue(selectedInvoice) : 0}
                      </td>
                    </tr>
                    {/* Show payments if any */}
                    {selectedInvoice?.payments &&
                      selectedInvoice.payments.length > 0 &&
                      selectedInvoice.payments.map((payment, pidx) => (
                        <tr key={pidx} className="text-center bg-gray-50">
                          <td className="p-2 border text-left pl-8">
                            Payment on {formatDateDMY(payment.date)}
                          </td>
                          <td className="p-2 border"></td>
                          <td className="p-2 border text-left">
                            -${payment.amount}
                          </td>
                          <td className="p-2 border"></td>
                          <td className="p-2 border"></td>
                          <td className="p-2 border text-left">
                            -${payment.amount}
                          </td>
                        </tr>
                      ))}
                    <tr>
                      <td className="p-2 border font-semibold">
                        Sub total (Excl. GST):
                      </td>
                      <td colSpan={4} className="p-2 border"></td>
                      <td className="p-2 border text-left">
                        ${selectedInvoice ? getInvoiceDue(selectedInvoice) : 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-semibold">Total GST:</td>
                      <td colSpan={4} className="p-2 border"></td>
                      <td className="p-2 border text-left">$0.00</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-semibold">
                        Amount due on :{" "}
                        {formatDateDMY(selectedInvoice?.dueDate)}
                      </td>
                      <td colSpan={4} className="p-2 border"></td>
                      <td className="p-2 border text-left">
                        ${selectedInvoice ? getInvoiceDue(selectedInvoice) : 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Payment Summary */}
              <div className="w-full md:w-1/4 bg-gray-100 rounded-lg  text-xs dark:bg-[#343434]">
                <div className="bg-[#505050] text-white px-3 py-2 rounded-t">
                  Payment Details
                </div>
                <div className="divide-y text-sm">
                  <div className="flex justify-between px-2 py-2">
                    <span className="text-xs text-left">Payment Type</span>
                    <span className="text-[#010E30] font-semibold text-xs text-left dark:text-white">
                      Online
                    </span>
                  </div>
                  <div className="flex flex-1 justify-between px-2 py-2 text-left">
                    <span className="text-xs text-left">Total Amount</span>
                    <span className="text-[#010E30] font-semibold text-xs px-4 dark:text-white">
                      ${selectedInvoice ? getInvoiceDue(selectedInvoice) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Instructions + Actions */}
            <div className="relative   p-1 rounded text-xs mb-8 -mt-5">
              <div
                id="hideDuringDownload"
                className="absolute top-1 right-0 flex items-center gap-2"
              >
                <button
                  onClick={handleClick}
                  className="bg-[#576CBC] text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                >
                  Pay Online
                </button>
                <span className="text-[10px]">with</span>
                <img
                  src="/assets/images/stripe.png"
                  alt="Stripe"
                  className="h-7 ml-[61px]"
                />
              </div>
              <div className="text-[11px] leading-relaxed pr-40">
                <h3 className="font-bold text-[#223857] mb-1 dark:text-[#ffffff]">
                  Payment Instructions
                </h3>
                <div className="space-y-[2px]">
                  <p>
                    <strong>Name</strong> &nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    : 1234567890
                  </p>
                  <p>
                    <strong>Bank Name</strong>&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                    contact@alfurqan.academy
                  </p>
                  <p>
                    <strong>Swift / Iban</strong>{" "}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    : GB0021030012
                  </p>
                  <p>
                    <strong>Account Number</strong>&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 12-1234-123456-12
                  </p>
                </div>
                <p className="mt-2 text-[10px] font-semibold uppercase">
                  Please use INV-0205 as a reference number
                </p>
                <p className="text-[10px]">
                  For any questions please contact us at{" "}
                  <span className="font-bold">contact@alfurqan.academy</span>
                </p>
              </div>
              <div className="absolute bottom-2 right-0">
                <button
                  id="hideDuringDownloadFooter"
                  onClick={downloadInvoice}
                  className="bg-[#576CBC] text-white text-xs px-4 py-2 rounded hover:bg-blue-600"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>

          {!isGeneratingPDF && (
            <div>
              <h3 className="text-[17px] font-semibold text-gray-800 dark:text-[#ffffff]">
                Latest Transactions
              </h3>
              <br />
              <div className="w-full h-[300px]  bg-[#FAFAFB] rounded-lg dark:bg-[#343434]">
                <div className="flex justify-between items-center px-4 py-0 rounded-md dark:bg-[#343434]">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent outline-none text-[15px] w-52 py-3"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  <div
                    className="flex items-center gap-2 text-sm text-gray-400 dark:border-[#606060] py-2 border-r-2 border-l-2 px-48 -ml-60 cursor-pointer"
                    onClick={() => setShowFilterModal(true)}
                  >
                    {/* <BsFilterLeft /> */}
                    <MdTune className="w-4 h-4" />
                    <span>Filter</span>
                  </div>
                  {/* Modal */}
                  {showFilterModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                      <div className="bg-white p-6 rounded-lg w-[500px] relative dark:bg-[#252525]">
                        {/* Close Icon */}
                        <button
                          className="absolute top-2 right-3 text-gray-400 text-xl"
                          onClick={() => setShowFilterModal(false)}
                        >
                          &times;
                        </button>

                        <h2 className="text-lg font-semibold mb-4">
                          Filter by
                        </h2>

                        {/* Date Input */}
                        <div className="mb-4">
                          <label className="text-sm font-medium mb-1 dark:text-[#D6D6D6]">
                            Date Range
                          </label>

                          <div className="flex gap-2 mb-2">
                            <input
                              type="date"
                              className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                            />
                            <input
                              type="date"
                              className="w-1/2 px-3 py-2 border rounded text-xs text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Position Applied */}
                        <div className="mb-4">
                          <label
                            htmlFor="position"
                            className="block text-sm font-medium mb-1"
                          >
                            Status
                          </label>
                          <select
                            className="w-full border rounded-md p-2 text-[12px] dark:bg-[#343434] dark:text-[#D6D6D6] dark:border-[#565656]"
                            value={positionApplied}
                            onChange={(e) => setPositionApplied(e.target.value)}
                          >
                            <option>Pending</option>
                            <option>Paid</option>
                          </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowFilterModal(false)}
                            className="px-4 py-1 rounded-md border border-[#576CBC] text-[#576CBC] font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-1 rounded-md bg-[#576CBC] text-white font-medium"
                            onClick={handleFilter}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[14px] text-gray-400 dark:text-gray-400">
                    <span className="text-left -ml-60 ">
                      Showing {5} of {5}
                    </span>
                  </div>
                </div>
                <table
                  className="table-auto w-full"
                  style={{ width: "100%", tableLayout: "fixed" }}
                >
                  <thead className="text-[12px] bg-[#4C6993] text-white dark:bg-[#6087C0]">
                    <tr className="font-medium">
                      <th className="w-32 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Invoice Date
                      </th>
                      <th className="w-44 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Invoice Number
                      </th>
                      <th className="w-32 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Course Name
                      </th>

                      <th className="w-28 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Payment Amount
                      </th>
                      <th className="w-32 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Payment Date
                      </th>
                      <th className="w-24 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Status
                      </th>
                      <th className="w-20 text-left px-3 py-3 font-medium border border-[#4C6993] dark:border-[#6087C0]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredInvoices.length > 0 ? filteredInvoices : invoices)
                      .slice() // copy array
                      .sort(
                        (a, b) =>
                          new Date(b.createdDate).getTime() -
                          new Date(a.createdDate).getTime()
                      )
                      .slice(0, 5)
                      .map((invoice, index) => (
                        <React.Fragment key={invoice._id || index}>
                          <tr
                            onClick={() => {
                              handleInvoiceClick(invoice);
                            }}
                            className={`text-[12px] ${index % 2 === 0
                              ? "bg-[#fff] dark:bg-[#2C2C2C]"
                              : "bg-[#F8F8F8] dark:bg-[#303030]"
                              } cursor-pointer`}
                          >
                            <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap border-b border-gray-200 rounded-l-lg dark:text-[#ffffff]">
                              {formatDateDMY(invoice.createdDate) ||
                                formatDateMonDayYear(invoice.lastUpdatedDate)}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap border-b border-gray-200 dark:text-[#ffffff]">
                              {invoice._id}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap border-b border-gray-200 dark:text-[#ffffff]">
                              {invoice.courseName}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap border-b border-gray-200 dark:text-[#ffffff]">
                              {invoice.amount}{" "}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap border-b border-gray-200 dark:text-[#ffffff]">
                              {invoice.paymentDate
                                ? formatDateMonDayYear(invoice.paymentDate)
                                : formatDateMonDayYear(invoice.lastUpdatedDate)}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-700 whitespace-nowrap  border-b border-gray-200 dark:text-[#ffffff]">
                              {(() => {
                                const statusLower = (
                                  invoice.invoiceStatus || ""
                                ).toLowerCase();
                                const cls =
                                  statusLower === "paid"
                                    ? "bg-[#ECFDF3] text-[#377E36] border border-green-600 dark:bg-[#377E3633] dark:text-[#377E36]"
                                    : statusLower === "pending"
                                      ? "bg-[#FDF6EC] text-[#F0AD4E] border border-orange-600 dark:bg-[#F0AD4E33] dark:text-[#F0AD4E]"
                                      : "bg-gray-100 text-gray-600 border border-gray-400";
                                return (
                                  <span
                                    className={`${cls} py-0.5 px-1  rounded-sm text-[10px] min-w-[70px] inline-block text-center`}
                                  >
                                    {invoice.invoiceStatus}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap border-b border-gray-200 rounded-r-lg relative">
                              <button
                                className="focus:outline-none dark:text-[#ffffff]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpen(
                                    actionMenuOpen === invoice._id
                                      ? null
                                      : invoice._id
                                  );
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 20,
                                    verticalAlign: "middle",
                                  }}
                                >
                                  ⋮
                                </span>
                              </button>
                              {actionMenuOpen === invoice._id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10 dark:bg-[#343434]">
                                  {(
                                    invoice.invoiceStatus || ""
                                  ).toLowerCase() === "paid" ? (
                                    <button
                                      className="block w-full text-left px-4 py-2 text-xs dark:text-[#ffffff]"
                                      onClick={() => {
                                        setSelectedInvoice(invoice);
                                        setPaymentDetails({
                                          paymentAmount: invoice.amount * 100,
                                          paymentResponseId: invoice._id,
                                          createdDate: invoice.paymentDate
                                            ? new Date(
                                              invoice.paymentDate
                                            ).toISOString()
                                            : new Date().toISOString(),
                                        });
                                        setPaymentStatus("succeeded");
                                        setActionMenuOpen(null);
                                      }}
                                    >
                                      View Receipt
                                    </button>
                                  ) : (
                                    invoice.invoiceStatus || ""
                                  ).toLowerCase() === "failed" ? (
                                    <button
                                      className="block w-full text-left px-4 py-2 text-xs dark:text-[#ffffff]"
                                      onClick={() => {
                                        setSelectedInvoice(invoice);
                                        setPaymentDetails({
                                          paymentAmount: invoice.amount * 100,
                                          paymentResponseId: invoice._id,
                                          createdDate: invoice.paymentDate
                                            ? new Date(
                                              invoice.paymentDate
                                            ).toISOString()
                                            : new Date().toISOString(),
                                        });
                                        setPaymentStatus("failed");
                                        setActionMenuOpen(null);
                                      }}
                                    >
                                      View Receipt
                                    </button>
                                  ) : (
                                    <button
                                      className="block w-full text-left px-4 py-2 text-xs text-gray-400 cursor-not-allowed dark:text-gray-500"
                                      disabled
                                    >
                                      View Receipt
                                    </button>
                                  )}
                                  <button
                                    className="block w-full text-left px-4 py-2 text-xs dark:text-[#ffffff]"
                                    onClick={() => setActionMenuOpen(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {/* Show payments if any */}
                          {invoice.payments &&
                            invoice.payments.length > 0 &&
                            invoice.payments.map((payment, pidx) => (
                              <tr key={pidx} className="text-center bg-gray-50">
                                <td className="px-3 py-2 text-[#17243E] dark:text-[#ffffff]">
                                  Payment on {formatDateDMY(payment.date)}
                                </td>
                                <td className="px-3 py-2 text-[#17243E] dark:text-[#ffffff]">
                                  {payment.amount}
                                </td>
                                <td className="px-3 py-2 text-[#17243E] dark:text-[#ffffff]">
                                  {payment.amount}
                                </td>
                                <td className="px-3 py-2 text-[#17243E] dark:text-[#ffffff]">
                                  {payment.amount}
                                </td>
                                <td className="px-3 py-2 text-[#17243E] dark:text-[#ffffff]">
                                  {payment.amount}
                                </td>
                                <td className="px-3 py-2 text-[#17243E] dark:text-[#fff]">
                                  -${payment.amount}
                                </td>
                                <td></td>
                              </tr>
                            ))}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <Link
                  href="/modules/users/student/ui/allstudentsinvoice"
                  className="text-[#576CBC] text-[10px] border border-[#576CBC] px-3 py-1 rounded-md bg-white dark:bg-[#3C3C3C]"
                >
                  View All
                </Link>
              </div>
            </div>
          )}
          {/* Modal for Payment Form */}
          {showModal && clientSecret && clientSecret.includes("_secret_") && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg w-[600px] relative dark:bg-[#343434]">
                {/* X Close Icon */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                  aria-label="Close payment modal"
                  type="button"
                >
                  ×
                </button>
                <h2 className="text-lg font-bold mb-4">
                  Complete Your Payment
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    invoiceId={selectedInvoice?._id ?? ""}
                    amount={
                      selectedInvoice?.amount ? selectedInvoice.amount * 100 : 0
                    }
                    currency="usd"
                    selectedInvoice={selectedInvoice}
                    downloadInvoice={downloadInvoice}
                    onPaymentSuccess={(details) => {
                      setPaymentDetails(details);
                      setPaymentStatus("succeeded");
                      setShowModal(false);
                    }}
                    onPaymentFailure={() => {
                      setPaymentStatus("failed");
                    }}
                  />
                </Elements>
                {/* Close button removed as requested */}
              </div>
            </div>
          )}
        </div>

        {paymentStatusModal}
      </div>
    </BaseLayout2>
  );
};

export default Invoice;
