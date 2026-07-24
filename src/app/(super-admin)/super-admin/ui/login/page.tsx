"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { toast } from "react-toastify";
import { AlertCircle, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";

const slides = [
  {
    text: "Start your Super Admin journey with a single secure sign-in.",
  },
  {
    text: "Manage tenants, users, and insights from one powerful dashboard.",
  },
  {
    text: "Take control of your platform and lead with confidence.",
  },
];

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username1, setUsername1] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const googleLoginRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
  }, [error]);

  const signIn = async (username: string, password: string) => {
    const url = `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.AUTH.LOGIN}`;
    const payload = {
      username,
      password,
    };

    const response = await axios.post(url, payload);
    return response.data;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signIn(username1, password);
      const { accessToken, role, _id } = data;
      const portalName: string = data.userName ?? data.username ?? "";
      const userEmail: string = data.email ?? data.userEmail ?? "";
      const tenantId: string | null = data.tenantId ?? null;
      const tenantCode: string | null = data.tenantJobCode ?? data.tenantCode ?? null;

      localStorage.setItem("SuperAdminAuthToken", accessToken);
      localStorage.setItem("SuperAdminPortalId", _id);
      localStorage.setItem("SuperAdminPortalName", portalName);
      localStorage.setItem("SuperAdminPortalEmail", userEmail);
      localStorage.setItem("SuperAdminRole", role);
      if (!/SUPER[_\s-]*ADMIN/i.test(String(role ?? ""))) {
        const permissionMessage = "Only Super Admin users are allowed to log in.";
        toast.error(permissionMessage);
        setError(permissionMessage);
        return;
      }
      if (tenantId) {
        localStorage.setItem("tenantId", tenantId);
      }
      if (tenantCode) {
        localStorage.setItem("tenantCode", tenantCode);
      }
      // localStorage saved for authenticated session.
      router.push(
        tenantId
          ? `/super-admin/ui/dashboard?tenantId=${tenantId}`
          : "/super-admin/ui/dashboard"
      );
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 404) {
          toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL);
          setError(AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL);
        } else {
          const msg = data.message || AppValidationMessages.ERROR_MESSAGES.LOGIN_FAILED;
          setError(msg);
          toast.error(msg);
        }
      } else {
        toast.error(AppValidationMessages.ERROR_MESSAGES.LOGIN_FAILED);
        setError(AppValidationMessages.ERROR_MESSAGES.LOGIN_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEmail = async (email: string) => {
    try {
      const response = await axios.post(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CHECKMAIL.CREATE_CHECK_EMAIL}`, {
        email,
      });

      if (response.status === 200) {
        return { message: "Email exists", data: response.data };
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("Email not found");
          return { message: "Email not found" };
        }

        if (error.response.status === 500) {
          toast.error(AppFailureToastMessages.SERVER_ERROR);
          return { message: "Internal Server Error" };
        }
      }

      toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + (error.message ? ` ${error.message}` : ""));
      return { message: "Unknown error occurred" };
    }
  };

  const getGoogleUserInfo = async (accessToken: string) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data; // contains email, name, picture, etc.
    } catch (err) {
      console.error("Failed to fetch Google user:", err);
      // Fallback: Try to decode as JWT ID token
      try {
        const base64Url = accessToken.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        }
      } catch (decodeError) {
        console.error("Failed to decode JWT:", decodeError);
      }
      return null;
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    const { credential } = response;
      if (!credential) {
        toast.error(AppFailureToastMessages.UNEXPECTED_ERROR);
        return;
      }
    const emaildata = await getGoogleUserInfo(credential);

    if (!emaildata) {
      toast.error(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      setError(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      return;
    }

    const email: any = emaildata.email;

    try {
      setLoading(true);
      const result = await checkEmail(email);
      const role = result?.data?.role;

      if (result?.message === "Email exists" && role?.includes("Student")) {
        let course = result.data.course || result.data.courseName || result.data.student?.course || result.data.student?.courseName || (Array.isArray(result.data.courses) ? result.data.courses[0] : "");
        let portalName = result.data.username || result.data.username1 || result.data.student?.username || result.data.student?.studentName || "";

        if (!course) {
              try {
            const studentId = result.data.id;
            const token = result.data.accessToken;
            const detailRes = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${studentId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            

            const details = detailRes.data?.studentDetails || detailRes.data;
            course = details?.course || details?.courseName || details?.student?.course || details?.student?.courseName || "";

            if (!portalName) {
              portalName = details?.username || details?.student?.username || details?.student?.studentName || "";
            }

          } catch (fetchErr) {
            toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + " Failed to retrieve student profile.");
          }
        }

        localStorage.setItem("SuperAdminAuthToken", result.data.accessToken);
        localStorage.setItem("SuperAdminPortalId", result.data.id);
        localStorage.setItem("SuperAdminPortalName", portalName);
        localStorage.setItem("SuperAdminPackage", result.data.package);
        localStorage.setItem("SuperAdmincourseName", course);
        if (result.data.tenantId) {
          localStorage.setItem("tenantId", result.data.tenantId);
        }
        if (result.data.tenantJobCode || result.data.tenantCode) {
          localStorage.setItem("tenantCode", result.data.tenantJobCode ?? result.data.tenantCode);
        }
        console.log("superAdmin sign-in localStorage:", {
          SuperAdminAuthToken: result.data.accessToken,
          SuperAdminPortalId: result.data.id,
          SuperAdminPortalName: portalName,
          SuperAdminPackage: result.data.package,
          SuperAdmincourseName: course,
          FullData: result.data // Log full object
        });
        router.push(
          result.data.tenantId
            ? `/super-admin/ui/dashboard?tenantId=${result.data.tenantId}`
            : "/super-admin/ui/dashboard"
        );
      } else {
        toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL);
        setError(AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL);
        console.log(result?.message);
      }
      } catch (error) {
        toast.error(AppFailureToastMessages.UNEXPECTED_ERROR + " Please try again.");
        setError(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      } finally {
      setLoading(false);
    }
  };



  interface GoogleError {
    error: string;
    details?: string;
  }

  const handleGoogleFailure = (error: GoogleError) => {
    toast.error(AppFailureToastMessages.UNEXPECTED_ERROR);
  };

  const errorWrapper = () => {
    const error: GoogleError = { error: "Some error message" };
    handleGoogleFailure(error);
  };

  const newuserclick = () => {
    router.push("/super-admin");
  };

  return (
      
<div className="h-screen overflow-hidden grid grid-cols-[1.5fr_1fr] ">
  {showError && error && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-4 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-md border border-white/10"
          >
            <div className="p-2 bg-white/20 rounded-full">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-wide">Error</span>
              <span className="text-sm opacity-90">{error}</span>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="ml-3 text-white/80 hover:text-white text-sm font-medium transition"
            >
              ✕
            </button>
          </motion.div>
        </AnimatePresence>
      )}
  {/* ================= LEFT SIDE ================= */}
  
 <div className="h-screen bg-[#EDEFFD] flex flex-col px-10 py-8">

  {/* Logo */}
  <Image
    src="/assets/images/bsicon.png"
    alt="Logo"
    width={150}
    height={45}
    className="mb-4"
  />

  {/* Heading */}
  <div>
    <h1 className="text-[38px] font-bold text-[#13254B]">
      Super Admin
    </h1>

    <h2 className=" text-[20px] font-semibold text-[#5575F6]">
      Complete Control. Total Visibility.
    </h2>

    <p className="text-[14px]  text-[#5B6475]">
      Manage tenants, subscriptions, users and platform operations
      
      from one secure and powerful hub.
    </p>
  </div>

  {/* Illustration */}
  <div className="flex-1 flex items-center justify-center  ">
    <Image
      src="/assets/images/superSign-Photoroom.png"
      alt="Super Admin"
      width={600}
      height={500}
      priority
    />
  </div>

  {/* Slide carousel */}
  <div className="pb-2">
    <AnimatePresence mode="wait">
      <motion.p
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="min-h-[48px] text-center text-[15px] font-medium text-[#374151]"
      >
        {slides[currentIndex].text}
      </motion.p>
    </AnimatePresence>

    <div className="mt-4 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() =>
          setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="flex h-6 w-6 items-center justify-center text-[#8C9AD6] transition hover:text-[#5575F6]"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex ? "w-4 bg-[#5575F6]" : "w-2 bg-[#C7D0FA]"
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
        className="flex h-6 w-6 items-center justify-center text-[#8C9AD6] transition hover:text-[#5575F6]"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>

</div>
{/* ================= RIGHT SIDE ================= */}

  <div className="h-screen bg-white flex items-center justify-center overflow-y-auto">

  <div className=" mr-10">

  

    <h2 className="text-center text-[38px] font-bold text-[#1D1D1F]">
      Welcome Back,
      <br />
      Super Admin
    </h2>

    <p className="text-center text-[#6B7280] mt-4 mb-12">
      Sign in to access your administration portal
    </p>

    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#374151]">
          Username
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
          placeholder="Enter your username"
          className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#5575F6] focus:bg-white focus:ring-2 focus:ring-[#5575F6]/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#374151]">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            suppressHydrationWarning
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 pr-12 text-sm text-[#111827] outline-none transition focus:border-[#5575F6] focus:bg-white focus:ring-2 focus:ring-[#5575F6]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
          <input type="checkbox" className="h-4 w-4 rounded border-[#D1D5DB] text-[#5575F6] focus:ring-[#5575F6]" />
          Remember me
        </label>
        <a href="#" className="text-sm font-medium text-[#5575F6] hover:text-[#3f63d7]">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-2xl bg-[#5575F6] py-3 text-sm font-semibold text-white transition hover:bg-[#3f63d7] ${loading ? "cursor-not-allowed opacity-70" : ""}`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing in...
          </div>
        ) : (
          "Sign in as Super Admin"
        )}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E7EB]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-[#6B7280]">or</span>
        </div>
      </div>

      <div ref={googleLoginRef} className="pointer-events-none absolute h-[1px] w-[1px] overflow-hidden opacity-0">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={errorWrapper} useOneTap={false} auto_select={false} />
      </div>

      <button
        type="button"
        onClick={() => {
          const googleButton = googleLoginRef.current?.querySelector('div[role="button"]') as HTMLElement;
          if (googleButton) {
            googleButton.click();
          }
        }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
    </form>

    </div>
    </div>
    </div>
    
  );
};

export default SignIn;