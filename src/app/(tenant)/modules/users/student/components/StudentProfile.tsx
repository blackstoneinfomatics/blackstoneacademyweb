
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { BsPersonPlus } from "react-icons/bs";
import { IoDiamondSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaWhatsappSquare } from "react-icons/fa";
import { IoLogoLinkedin } from "react-icons/io";
import { RiExternalLinkFill } from "react-icons/ri";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


export interface IStudentInvoice {
  _id: string;
  student: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    country: string;
    city: string;
  };
  courseName: string;
  amount: number;
  invoiceStatus: string;
  packageType: string;
  itemDescription: string;
  duration: string;
  rate: string;
  description: string;
  status: string;
  dueDate: string; // ISO date string
  createdDate: string; // ISO date string
  paymentDate: string; // ISO date string
  paymentStatus: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  __v: number;
}

const StudentProfile = () => {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentImage, setStudentImage] = useState<string | null>(null);
  const router = useRouter();

  const [invoices, setInvoices] = useState<IStudentInvoice[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);

  const paymentStatus = "Pending";

  const [showShareOptions, setShowShareOptions] = useState(false);

const [referenceId, setReferenceId] = useState<string>("");

useEffect(() => {
  const fetchReferenceId = async () => {
    try {
      const loginStudentId = localStorage.getItem("StudentPortalId");
      const token = localStorage.getItem("StudentAuthToken");
      const courseName = localStorage.getItem("StudentcourseName");
      const res = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${loginStudentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     console.log("res",res);
      const students = res.data?.studentDetails || [];
  console.log("rege student",students)
      

      // If found, set their refernceId
      if (students?.refernceId) {
        console.log("referal code", students.refernceId)
        setReferenceId(students.refernceId);
      } else {
        console.warn("Student does not have refernceId");
      }
    } catch (error) {
      console.error("Error fetching referenceId:", error);
    }
  };

  fetchReferenceId();
}, []);

  
const shareUrl = `https://alfweb.vercel.app/StudentForm?refernceId=${referenceId}`;
  const message = encodeURIComponent(
    `Check this out! Join me here: ${shareUrl}`
  );

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  useEffect(() => {
    const studentId = localStorage.getItem("StudentPortalId");
    const token = localStorage.getItem("StudentAuthToken");
    const courseName = localStorage.getItem("StudentcourseName");

    // Fetch student details from API and set name/email
    const fetchStudentDetails = async () => {
      if (!studentId || !token) {
        console.warn("Missing studentId or token for fetching student details", {
          studentId,
          tokenPresent: !!token,
          courseName,
        });
        return;
      }

      try {
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // API sometimes returns the student document directly or wrapped
        const payload = res.data?.studentDetails ?? res.data;
        console.log("Using student payload:", payload);
        setStudentName(payload?.username || null);
        setStudentEmail(payload?.student?.studentEmail || payload?.studentEmail || null);
      } catch (err) {
        console.error("Failed to fetch student details", err);
      }
    };

    fetchStudentDetails();

    // Also try to fetch only familyId from local backend (useful during local dev)
    const fetchFamilyIdLocal = async () => {
      if (!studentId) return;
      try {
        const localToken = localStorage.getItem("StudentAuthToken");
        const res = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}/${studentId}`,
          {
            headers: localToken ? { Authorization: `Bearer ${localToken}` } : {},
          }
        );

        // Response may be the student doc or wrapped. Try both.
        const payload = res.data?.studentDetails ?? res.data;
        console.log("Local student payload:", payload);
        const fid = payload?.familyId ?? payload?.student?.familyId ?? null;
        if (fid) setFamilyId(fid);
      } catch (err) {
        console.warn("Failed to fetch familyId from local API", err);
      }
    };

    fetchFamilyIdLocal();

    const fetchStudentInvoices = async () => {
      try {
        if (!studentId || !token || !courseName) {
          console.warn("Missing studentId or token in localStorage");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.STUDENT_INVOICE_BYID}`,
          {
            params: { studentId, paymentStatus, courseName }, // Include paymentStatus here
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API responseeeeee:", response.data);

        // Check if the response contains data
        if (response.data.data && Array.isArray(response.data.data)) {
          setInvoices(response.data.data); // Set the invoices state
          console.log("Invoices:", response.data.data); // Log the invoices
        } else {
          console.warn("Invalid data format from API:", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchStudentInvoices();
  }, []);
  const [dashboardCounts, setDashboardCounts] = useState({
    totalLevel: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("StudentAuthToken")
            : null;

        if (!token) {
          console.error("❌ StudentAuthToken not found");
          return;
        }

        const studentId = localStorage.getItem("StudentPortalId");
        const courseName = localStorage.getItem("StudentCourseName");

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.DASHBOARD_STUDENT_COUNTS}`,
          {
            params: { studentId, courseName },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response:", response.data);
        setDashboardCounts({
          totalLevel: Number(response.data.totalLevel) || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-[310px] flex flex-col gap-4">
      <div
        className="rounded-xl shadow-lg bg-white h-[300px] dark:bg-[#343434] p-4 relative cursor-pointer"
        onClick={() => router.push("student-profile")}
      >
        <h3 className="text-[#010E30] font-semibold text-[16px] mb-2 dark:text-white">
          Student Profile
        </h3>
        <div className="mt-6">
          <img
            src={studentImage || "/assets/images/stpr.svg"}
            alt="profile"
            className="w-20 h-20 rounded-full mx-auto mb-2"
          />

          <h3 className="text-[#010E30] font-bold text-[16px] dark:text-white text-center">
            {studentName ?? "Loading..."}
          </h3>
          <p className="text-[#4b5563] text-[11px] text-center mt-1">
            {studentEmail ?? "Loading..."}
          </p>
          <p className="text-[#4b5563] text-[13px] mb-2 text-center mt-2">
           <span className="font-bold">Level</span>  : &nbsp;{dashboardCounts.totalLevel}
          </p>
        

          <div className="flex justify-center space-x-1 mb-2">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-xl">
                ★
              </span>
            ))}
            <span className="text-gray-300 text-lg">★</span>
          </div>
        </div>
      </div>

      {/* Payment Item */}
      <div
        className="rounded-xl shadow-lg bg-white dark:bg-[#343434] p-4 h-[185px] mt-1 w-full cursor-pointer"
        onClick={() => router.push("payment")}
      >
        <h3 className="text-[#010E30] font-semibold text-[16px] mb-2 dark:text-white">
          Upcoming Payments
        </h3>

        {invoices.filter((i) => i.invoiceStatus === "PENDING").length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-12 align-middle">
            No pending payments found
          </p>
        ) : (
          invoices
            .filter((i) => i.paymentStatus === "PENDING")
            .slice(0, 2)
            .map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/images/uppayment.svg"
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[#010E30] text-[13px] dark:text-white">
                      {invoice.itemDescription || "Class Invoice"}
                    </p>
                    <p className="text-[#010E30] text-[13px] font-semibold dark:text-white">
                      ${invoice.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-gray-400 text-[11px]">
                    {invoice.invoiceStatus}
                  </p>
                  <p className="text-gray-400 text-[12px]">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Payment Item */}
      <div
        className="rounded-xl shadow-lg bg-white dark:bg-[#343434] mt-1 h-[185px] p-4 w-full cursor-pointer"
        onClick={() => router.push("payment")}
      >
        <h3 className="text-[#010E30] font-semibold text-[16px] mb-2 dark:text-white">
          Recent Payments
        </h3>

        {invoices.filter((i) => i.invoiceStatus === "PAID" || i.invoiceStatus === "Paid").length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-12 align-middle">
            No paid payments found
          </p>
        ) : (
          invoices
            .filter((i) => i.invoiceStatus === "PAID" || i.invoiceStatus === "Paid")
            .slice(0, 2)
            .map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between py-2 overflow-scroll scrollbar-none h-[60px] border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/images/uppayment.svg"
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[#010E30] text-[12px] dark:text-white">
                      {invoice.itemDescription || "Class Invoice"}
                    </p>
                    <p className="text-[#010E30] text-[11px] font-semibold dark:text-white">
                      ${invoice.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[#377E36] text-[11px]">
                    {invoice.invoiceStatus}
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    {new Date(invoice.paymentDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Gradient Action Cards - Example 1 */}
      <div
        className="flex items-center justify-between p-4 mt-1 rounded-xl mb-0 bg-gradient-to-r from-[#7e57c2] to-[#5c6bc0] text-white cursor-pointer relative"
        onClick={() => setShowShareOptions(!showShareOptions)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full w-10 h-10 flex items-center justify-center">
            <BsPersonPlus />
          </div>

          <div>
            <p className="text-sm font-semibold">Refer a Friend</p>
            <p className="text-[10px] opacity-80">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.
            </p>
          </div>
        </div>

        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {showShareOptions && (
          <div
            className="absolute top-full left-0 -mt-6 ml-16 w-60 rounded-2xl shadow-xl 
      bg-white/80 dark:bg-[#2c2c2c]/80 backdrop-blur-xl border border-white/20 
      z-50 animate-fadeIn p-3"
          >
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Share via
            </p>

            {/* WhatsApp */}
            <div className="flex">
            <button
              onClick={handleWhatsAppShare}
              className=" items-center gap-2 px-3 py-2 rounded-full 
      hover:bg-text-100 dark:hover:bg-green-900/30 transition-all duration-200"
            >
              
              <FaWhatsappSquare
                className="w-6 h-6 bg-green-600 ml-2"
              />
              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                WhatsApp
              </span>
              
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleLinkedInShare}
              className=" items-center gap-2 px-3 py-2 rounded-full 
      hover:bg-text-100 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <IoLogoLinkedin
                className="w-6 h-6 bg-blue-600 ml-2"
              />
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                LinkedIn
              </span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className=" items-center gap-2 px-3 py-2 rounded-full 
      hover:bg-text-200 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <RiExternalLinkFill
                className="w-6 h-6 dark:invert opacity-80 bg-gray-600 text-center ml-2"
              />
              <span className="text-[10px] font-medium text-gray-900 dark:text-white">
                Copy
              </span>
            </button>
            
            </div>
            
          </div>
        )}
      </div>

      {/* Gradient Action Cards - Example 2 */}
      <Link
        href="https://alfweb.vercel.app/pricing"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 mt-[3px] rounded-xl bg-gradient-to-r from-[#ef5350] via-[#ec407a] to-[#ab47bc] text-white mb-3 cursor-pointer no-underline"
      >
        <div className="flex items-center gap-4">
          {/* Image icon in circle */}
          <div className="bg-white bg-opacity-20 p-3 rounded-full w-10 h-10 flex items-center justify-center">
            <IoDiamondSharp />
          </div>

          {/* Text content */}
          <div>
            <p className="text-sm font-semibold">Upgrade Packages</p>
            <p className="text-[11px] opacity-80">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.
            </p>
          </div>
        </div>

        {/* Right arrow */}
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
};

export default StudentProfile;