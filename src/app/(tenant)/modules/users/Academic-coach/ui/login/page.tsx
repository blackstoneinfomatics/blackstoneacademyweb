"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CredentialResponse,
  GoogleOAuthProvider,
  useGoogleLogin,
} from "@react-oauth/google";
import axios from "axios";
import { AlertCircle, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

export interface RoleModuleAccess {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface AdminModules {
  dashboard: RoleModuleAccess;
  evaluation: RoleModuleAccess;
  student: RoleModuleAccess;
  employees: RoleModuleAccess;
  courses: RoleModuleAccess;
  classes: RoleModuleAccess;
  invoice: RoleModuleAccess;
  analytics: RoleModuleAccess;
  messages: RoleModuleAccess;
  settings: RoleModuleAccess;
  meetings: RoleModuleAccess;
}

export interface AcademicModules {
  dashboard: RoleModuleAccess;
  scheduledevaluation: RoleModuleAccess;
  scheduledtrail: RoleModuleAccess;
  students: RoleModuleAccess;
  teachers: RoleModuleAccess;
  messages: RoleModuleAccess;
  support: {
    read: boolean;
    write: boolean;
  };
}

export interface SupervisorModules {
  dashboard: RoleModuleAccess;
  recuirement: RoleModuleAccess;
  meeting: RoleModuleAccess;
  teachers: RoleModuleAccess;
  messages: RoleModuleAccess;
  support: RoleModuleAccess;
}

export interface StudentModules {
  dashboard: RoleModuleAccess;
  classes: RoleModuleAccess;
  assignments: RoleModuleAccess;
  payments: RoleModuleAccess;
  knowledgebase: RoleModuleAccess;
  support: RoleModuleAccess;
}

export interface TeacherModules {
  dashboard: RoleModuleAccess;
  liveclasses: RoleModuleAccess;
  scheduledclasses: RoleModuleAccess;
  assignments: RoleModuleAccess;
  messages: RoleModuleAccess;
  analytics: RoleModuleAccess;
  support: RoleModuleAccess;
}

export interface RoleAccess {
  admin: boolean;
  adminmodules: AdminModules;
  academicCoach: boolean;
  academicmodules: AcademicModules;
  supervisor: boolean;
  supervisormodules: SupervisorModules;
  student: boolean;
  studentmodules: StudentModules;
  teacher: boolean;
  teachermodules: TeacherModules;
}

export interface EmployeeAccessData {
  _id: string;
  employeeId: string;
  employeeName: string;
  contact: string;
  designation: string[];
  dateOfJoining: string;
  roleAccess: RoleAccess;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  __v: number;
}

export interface AccessApiResponse {
  success: boolean;
  data: EmployeeAccessData;
}

const SignIn: React.FC = () => {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
  }, [error]);

  const signIn = async (username: string, password: string) => {
    return axios.post(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.AUTH.LOGIN}`, {
      username,
      password,
    });
  };

  const fetchrolebasedaccesscontrol = async (
    id: string,
    token: string,
    role?: string
  ) => {
    try {
      const response = await axios.get<AccessApiResponse>(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RBAC.GET_ACCESS}/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const roleAccess = response.data.data.roleAccess;

        console.log("Original Role Access from backend:", roleAccess);

        if (role?.includes("ACADEMICCOACH")) {
          roleAccess.academicCoach = true;
          roleAccess.admin = false;

          localStorage.setItem(
            "AcademicRolePermission",
            JSON.stringify(roleAccess.academicmodules)
          );

          console.log(
            "Stored only academicmodules after overriding admin flag"
          );
        } else {
          console.warn(
            "User is not an Academic Coach. Ignoring academicmodules."
          );
        }
      } else {
        throw new Error("Failed to fetch role-based access control");
      }
    } catch (error) {
      console.log("Error fetching role-based access:", error);
    }
  };

  const setLoginError = (message: string) => {
    setError(message);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await signIn(username, password);
      const data = response.data;
      const { accessToken, role, _id, userName } = data;
      const userEmail: string = data.email ?? data.userEmail ?? "";

      if (!role?.includes("ACADEMICCOACH")) {
        toast.error(AppValidationMessages.ERROR_MESSAGES.PERMISSION_DENIED);
        setError(AppValidationMessages.ERROR_MESSAGES.PERMISSION_DENIED);
        return;
      }

      localStorage.setItem("AcademicCoachAuthToken", accessToken);
      localStorage.setItem("AcademicCoachPortalId", _id);
      localStorage.setItem("AcademicCoachPortalName", userName);
      localStorage.setItem("AcademicCoachPortalEmail", userEmail);
      localStorage.setItem("AcademicCoachPortalRole", role);

      await fetchrolebasedaccesscontrol(_id, accessToken, role);

router.push("/modules/users/Academic-coach/ui/dashboard");
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          toast.error(AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL);
          setError(AppValidationMessages.ERROR_MESSAGES.MISSING_EMAIL);
        } else if (status === 401) {
          const errorMsg = data.message ?? "User already logged in on another device/session";
          toast.error(errorMsg);
          setError(errorMsg);
        } else {
          const errorMsg = data.message ?? AppValidationMessages.ERROR_MESSAGES.LOGIN_FAILED;
          toast.error(errorMsg);
          setError(errorMsg);
        }
      } else {
        toast.error(AppValidationMessages.ERROR_MESSAGES.NETWORK_ERROR);
        setError(AppValidationMessages.ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
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

      return response.data;
    } catch (err) {
      console.error("Failed to fetch Google user:", err);
      return null;
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    const { credential } = response;
    if (!credential) {
      console.error("Google login failed: No credential received");
      toast.error(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      setError(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      return;
    }
    const emaildata = await getGoogleUserInfo(credential);
    const email: any = emaildata.email;

    const checkEmail = async (email: string) => {
      try {
        const response = await axios.post(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CHECKMAIL.CREATE_CHECK}`,
          { email }
        );

        if (response.status === 200) {
          console.log("Email exists:", response.data);
          return { message: "Email exists", data: response.data };
        }
      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 404) {
            console.log("Email not found");
            return { message: "Email not found" };
          }

          if (error.response.status === 500) {
            console.log("Internal Server Error");
            return { message: "Internal Server Error" };
          }
        }

        console.log("Error occurred:", error.message ?? "Unknown error");
        return { message: "Unknown error occurred" };
      }
    };

    try {
      setLoading(true);
      const result = await checkEmail(email);
      const role = result?.data?.role;

      if (result?.message === "Email exists" && role?.includes("ACADEMICCOACH")) {
        localStorage.setItem("AcademicCoachAuthToken", result.data.accessToken);
        localStorage.setItem("AcademicCoachPortalId", result.data.id);
        localStorage.setItem("AcademicCoachPortalName", result.data.username);
router.push("/modules/users/Academic-coach/ui/dashboard");
      } else {
        toast.error(AppValidationMessages.ERROR_MESSAGES.PERMISSION_DENIED);
        setError(AppValidationMessages.ERROR_MESSAGES.PERMISSION_DENIED);
      }
    } catch (error) {
      console.error("Error during email verification:", error);
      toast.error(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
      setError(AppValidationMessages.ERROR_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };



  const handleGoogleFailure = (error?: any) => {
    console.error("Google login failed:", error);
    toast.error(AppValidationMessages.ERROR_MESSAGES.GOOGLE_LOGIN_FAILED);
    setError(AppValidationMessages.ERROR_MESSAGES.GOOGLE_LOGIN_FAILED);
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      handleGoogleSuccess({ credential: tokenResponse.access_token } as CredentialResponse);
    },
    onError: handleGoogleFailure,
  });

  return (
    <GoogleOAuthProvider clientId="45636645803-6arfjuthmcvfj3r6e6qep23dlpfntrc7.apps.googleusercontent.com">
      <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
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

        {/* Left Section - Sign In Form */}
        <div className="w-full lg:w-1/2 h-auto lg:h-screen bg-white flex flex-col overflow-hidden order-2 lg:order-1">
          <div className="px-4 sm:px-6 lg:px-8 py-1">
            <Image
              src="/assets/images/bsicon.png"
              alt="logo"
              width={150}
              height={160}
              priority
              style={{ height: 'auto' }}
              className='justify-left ml-0 sm:ml-[38px] mt-4 sm:mt-5 p-0'
            />
          </div>

          <div
            className="
    flex-1
    flex items-center justify-center
    px-4 sm:px-6 lg:px-8
    overflow-auto scrollbar-none
    py-6
  "
          >
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-[32px] font-bold text-black mb-10 text-center lg:text-left">Sign in</h2>
              {/* <p className="text-[#718096] mb-6 sm:mb-8 text-sm sm:text-[14px] text-center lg:text-left">
                Don't have an account?{' '}
                <a href="#" className="text-[#5A73B3] hover:text-[#4d6295] underline">
                  Create now
                </a>
              </p> */}

              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-[#718096] mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-[#4A5568] focus:ring-2 focus:ring-[#5A73B3] focus:border-transparent outline-none transition-all text-sm sm:text-base"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-[#718096] mb-2">
                    Password
                  </label>
                  <div className="relative text-[#4A5568]">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5A73B3] focus:border-transparent outline-none transition-all pr-12 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3 h-3 rounded border-gray-300 text-[#5A73B3] focus:ring-[#5A73B3]"
                    />
                    <span className="text-xs sm:text-[12px] text-[#718096]">Remember me</span>
                  </label>
                  <a href="#" className="text-xs sm:text-[12px] text-[#5A73B3] hover:text-[#4d6295] underline">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[#5A73B3] hover:bg-[#4d6299] text-white font-medium py-3 rounded-2xl transition-colors mb-4 text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#718096]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-[#718096]">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => login()}
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-3 bg-white border border-[#CBD5E0] hover:bg-gray-50 text-[#67728A] font-medium py-3 rounded-2xl transition-all mb-4 shadow-sm text-sm sm:text-base ${loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-md"
                    }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {loading ? "Signing in..." : "Continue with Google"}
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white border border-[#CBD5E0] hover:bg-gray-50 text-[#67728A] font-medium py-3 rounded-2xl transition-colors text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative w-full lg:w-1/2 h-96 lg:h-screen overflow-hidden order-1 lg:order-2">
          <Image
            src="/assets/images/Frame 2147226048.svg"
            alt="right-bg"
            width={1920}
            height={1080}
            priority
            className="w-full h-full object-cover absolute inset-0"
          />

          <div className="absolute inset-0 bg-black/25"></div>

          <div className="relative z-10 flex flex-col justify-between w-full h-full px-4 sm:px-6 lg:px-10 py-6">

            {/* TOP CARD */}
            <div className="
    bg-white rounded-xl shadow-lg
    p-4 sm:p-5 lg:p-6
    w-full 
    max-w-sm sm:max-w-md lg:max-w-xl
    mx-auto
    mt-14 sm:mt-28 lg:mt-32
  ">              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-1 text-left w-full">
                  <h2 className="text-lg sm:text-xl lg:text-[19px] font-bold leading-snug text-[#576CBC] mb-4 sm:mb-6">
                    Connecting You to Qur'an,<br />
                    Arabic, and the Wisdom of<br />
                    Islam
                  </h2>
                  <p className="text-[#808080] text-xs sm:text-[14px] lg:text-[14px] leading-relaxed mb-4 sm:mb-6">
                    And We have certainly made the Qur'an easy for remembrance, so is there is any who will remember ?
                  </p>
                  <p className="text-[#808080] text-xs sm:text-sm lg:text-[16px] font-medium">
                    Surah Al-Qamar (54:17)
                  </p>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto">
                  <img
                    src="/assets/images/close-up-hands-holding-diplomas-caps.svg"
                    alt="academic-coach"
                    className="w-40 h-40 sm:w-48 sm:h-48 lg:w-[245px] lg:h-[245px] object-cover rounded-xl mx-auto"
                  />
                </div>
              </div>
            </div>

            <div className="text-center text-white mx-auto mt-3 sm:mt-6 mb-10">
              <h2 className="text-lg sm:text-xl lg:text-[22px] font-semibold mb-2">Academic Coach Dashboard</h2>

              <p className="text-[#CFD9E0] text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-md mx-auto mb-2 sm:mb-4">
                Manage your entire educational platform with powerful administrative tools,
                user management systems, and comprehensive analytics dashboards.
              </p>

              <div className="flex items-center justify-center gap-4 mt-8 sm:mt-16">
                <button className="w-6 h-6 flex items-center justify-center text-[#A6B4E2] hover:text-white">
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#A6B4E2]" />
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#E8EBF9]" />
                    <div className="absolute w-full h-full rounded-full border-[3px] border-[#E8EBF9] border-t-transparent rotate-[25deg]" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#A6B4E2]" />
                </div>

                <button className="w-6 h-6 flex items-center justify-center text-[#A6B4E2] hover:text-white">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn;