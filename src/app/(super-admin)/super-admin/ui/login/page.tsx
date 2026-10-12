
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CryptoJS from "crypto-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  FileText,
  Wallet,
  BarChart3,
  LoaderCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

const secretKey = "my-secret-key";

const slides = [
  "Complete Control. Total Visibility.",
  "Manage your platform from one secure hub.",
  "Simplify administration with confidence.",
];


const SignIn: React.FC = () => {
  const router = useRouter();
  const googleLoginRef = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [username1, setUsername1] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!error) return;

    setShowError(true);

    const timeout = setTimeout(() => {
      setShowError(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [error]);

  const signIn = async (username: string, password: string) => {
    const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.AUTH.LOGIN}`;
    const encrypted = CryptoJS.AES.encrypt(password, secretKey).toString();

    const response = await axios.post(url, {
      username,
      password: encrypted,
    });

    return response.data;
  };

  const saveSession = (data: any) => {
    const {
      accessToken,
      role,
      _id,
      tenantId,
      tenantJobCode,
      tenantCode,
    } = data;

    const userId = data.userId ?? data.user?.userId ?? data.user?.id;
    const portalName = data.userName ?? data.username ?? "";
    const email = data.email ?? data.userEmail ?? "";

    localStorage.setItem("SuperAdminAuthToken", accessToken);
    localStorage.setItem("SuperAdminPortalId", _id ?? data.id ?? "");
    localStorage.setItem("SuperAdminPortalName", portalName);
    localStorage.setItem("SuperAdminPortalEmail", email);
    localStorage.setItem("SuperAdminRole", role ?? "");

    if (userId) {
      localStorage.setItem("SuperAdminUserId", userId);
    } else {
      localStorage.removeItem("SuperAdminUserId");
    }

    if (tenantId) {
      localStorage.setItem("tenantId", tenantId);
    }

    const code = tenantJobCode ?? tenantCode;

    if (code) {
      localStorage.setItem("tenantCode", code);
    }

    if (!/SUPER[\s_-]*ADMIN/i.test(String(role ?? ""))) {
      const message = "Only Super Admin users are allowed to log in.";
      toast.error(message);
      setError(message);
      return false;
    }

    router.push(
      tenantId
        ? `/super-admin/ui/dashboard?tenantId=${tenantId}`
        : "/super-admin/ui/dashboard"
    );

    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signIn(username1, password);
      saveSession(data);
    } catch (err: any) {
      if (err.response) {
        const message =
          err.response.status === 404
            ? AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL
            : err.response.data?.message ??
              AppValidationMessages.ERROR_MESSAGES.LOGIN_FAILED;

        setError(message);
        toast.error(message);
      } else {
        const message =
          AppValidationMessages.ERROR_MESSAGES.LOGIN_FAILED;

        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEmail = async (email: string) => {
    try {
      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CHECKMAIL.CREATE_CHECK}`,
        { email }
      );

      if (response.status === 200) {
        return { message: "Email exists", data: response.data };
      }

      return { message: "Email verification failed" };
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error("Email not found");
        return { message: "Email not found" };
      }

      if (err.response?.status === 500) {
        toast.error(AppFailureToastMessages.SERVER_ERROR);
        return { message: "Internal Server Error" };
      }

      toast.error(
        AppFailureToastMessages.UNEXPECTED_ERROR +
          (err.message ? ` ${err.message}` : "")
      );

      return { message: "Unknown error occurred" };
    }
  };

  const getGoogleUserInfo = async (credential: string) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${credential}`,
          },
        }
      );

      return response.data;
    } catch (err) {
      // GoogleLogin normally returns an ID token credential.
      try {
        const payload = credential.split(".")[1];

        if (!payload) return null;

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(base64);
        const json = decodeURIComponent(
          Array.from(decoded)
            .map((character) =>
              "%" +
              character.charCodeAt(0).toString(16).padStart(2, "0")
            )
            .join("")
        );

        return JSON.parse(json);
      } catch {
        return null;
      }
    }
  };

  const handleGoogleSuccess = async (
    response: CredentialResponse
  ) => {
    if (!response.credential) {
      toast.error(AppFailureToastMessages.UNEXPECTED_ERROR);
      return;
    }

    setLoading(true);

    try {
      const userInfo = await getGoogleUserInfo(response.credential);

      if (!userInfo?.email) {
        throw new Error("Unable to retrieve your Google account.");
      }

      const result = await checkEmail(userInfo.email);

      if (result?.data?.success === true) {
        saveSession(result.data);
      } else {
        const message =
          result?.message ??
          AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL;

        setError(message);
        toast.error(message);
      }
    } catch (err: any) {
      const message =
        err.message ??
        AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR;

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error(AppFailureToastMessages.UNEXPECTED_ERROR);
  };

  return (
    <main>
      <div className="grid min-h-[calc(100vh-14px)] overflow-hidden bg-white lg:grid-cols-[60%_40%]">

        {/* LEFT PANEL */}
        <section className="relative flex min-h-[480px] flex-col overflow-hidden bg-[#F0F1FF] px-6 py-7 sm:px-10 lg:min-h-0 lg:px-8 lg:py-5 xl:px-10">

          {/* Soft background decoration */}
          <div className="pointer-events-none absolute -right-20 top-[34%] h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-96 rounded-full bg-[#DCE2FF]/60 blur-3xl" />

          {/* Logo */}
          <div className="relative z-10">
            <Image
              src="/assets/images/bsicon.png"
              alt="Blackstone Academy"
              width={120}
              height={38}
              priority
              className="h-auto w-[112px] object-contain object-left"
            />
          </div>

          {/* Heading */}
          <div className="relative z-10 mt-7 lg:mt-6">
            <h1 className="text-[23px] font-bold leading-tight tracking-[-0.7px] text-[#071638] sm:text-[25px]">
              Super Admin
            </h1>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="mt-1 text-[14px] font-medium leading-5 text-[#4568FF] sm:text-[15px]"
              >
                {slides[currentIndex]}
              </motion.p>
            </AnimatePresence>

            <p className="mt-1.5 max-w-[360px] text-[11px] leading-[16px] text-[#53596A]">
              Manage tenants, subscriptions, users and platform operations
              from one secure and powerful hub.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative mx-auto mt-5 flex w-full flex-1 items-center justify-center lg:mt-1">
            <Image
              src="/assets/images/superSign-Photoroom.png"
              alt="Super Admin platform illustration"
              width={600}
              height={600}
              priority
              className="object-contain"
            />
          </div>
        </section>

        {/* RIGHT PANEL */}
<section className="relative flex min-h-[550px] items-center justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10 lg:min-h-0 lg:px-10 lg:py-8 xl:px-14">
          {/* Error toast */}
          <AnimatePresence>
            {showError && error && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-red-100 bg-white px-4 py-3 shadow-lg"
              >
                <AlertCircle
                  size={20}
                  className="shrink-0 text-red-500"
                />
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => setShowError(false)}
                  className="ml-auto text-gray-400 hover:text-gray-700"
                  aria-label="Close error"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

<div className="w-full max-w-[500px] px-2 sm:px-4">            {/* Login headings */}
            <div className="text-center">
              <p className="text-[16px] font-bold text-[#586FC0]">
                Log in
              </p>

<h2 className="mt-4 text-[22px] font-bold tracking-[0.2px] text-[#071638]">
  Welcome Back, Super Admin
</h2>

              <p className="mt-1 text-[11px] leading-4 text-[#858585]">
                Sign in to access your administration portal
              </p>
            </div>

            {/* Login form */}
<form onSubmit={handleFormSubmit} className="mt-10 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-[12px] font-medium text-[#657797]"
                >
                  User Name
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  suppressHydrationWarning
                  value={username1}
                  onChange={(e) => setUsername1(e.target.value)}
                  placeholder="example@gmail.com"
className="h-[44px] w-full rounded-[8px] border border-[#DCE2EC] bg-white px-3 text-[13px] text-[#374151] outline-none transition placeholder:text-[#68758B] focus:border-[#5A70C7] focus:ring-2 focus:ring-[#5A70C7]/10"                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[12px] font-medium text-[#657797]"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    suppressHydrationWarning
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
className="h-[44px] w-full rounded-[8px] border border-[#DCE2EC] bg-white px-3 text-[13px] text-[#374151] outline-none transition placeholder:text-[#68758B] focus:border-[#5A70C7] focus:ring-2 focus:ring-[#5A70C7]/10"                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex w-8 items-center justify-center border-l border-[#E7EAF0] text-[#77849A] transition hover:text-[#4F67B5]"
                  >
                    {showPassword ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex cursor-pointer items-center gap-1.5 text-[9px] text-[#7D8CA6]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-[10px] w-[10px] rounded-sm border-[#D5DBE6] accent-[#586FC0]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => router.push("/super-admin/forgot-password")}
                  className="text-[9px] font-medium text-[#4D68D2] underline underline-offset-2 hover:text-[#304DBA]"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-[33px] w-full items-center justify-center rounded-[11px] bg-[#586FC0] text-[10px] font-semibold text-white transition duration-200 hover:bg-[#465DAE] focus:outline-none focus:ring-2 focus:ring-[#586FC0]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle size={14} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Log in"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-[#D1D8E5]" />
                <span className="text-[8px] text-[#78849A]">OR</span>
                <div className="h-px flex-1 bg-[#D1D8E5]" />
              </div>

              {/* Hidden Google OAuth button */}
              <div
                ref={googleLoginRef}
                className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
                aria-hidden="true"
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap={false}
                  auto_select={false}
                />
              </div>

              {/* Google login */}
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const googleButton =
                    googleLoginRef.current?.querySelector(
                      'div[role="button"]'
                    ) as HTMLElement | null;

                  googleButton?.click();
                }}
                className="relative flex h-[34px] w-full items-center justify-center rounded-full border border-[#DCE2EC] bg-white text-[10px] font-medium text-[#586783] transition hover:bg-[#F8F9FC] disabled:opacity-60"
              >
                <svg
                  className="absolute left-3 h-[14px] w-[14px]"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
                  />
                </svg>

                Continue with Google
              </button>
            </form>

            {/* Register */}
            <p className="mt-4 text-center text-[9px] text-[#858585]">
              Don&apos;t have an Account?{" "}
              <button
                type="button"
                onClick={() => router.push("/super-admin/ui/login")}
                className="font-medium text-[#4D68D2] underline underline-offset-2"
              >
                Register
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignIn;
