"use client";
import { FaStar } from "react-icons/fa";
import TabbedTable from "../../components/studenttab";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface StudentResponse {
  students: StudentItem[];
}

interface StudentItem {
  avatar: string;
  rating: number;
  percentage: any;
  _id: string;
  username: string;
  userId: string;
  password: string;
  role: string;
  status: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
  classScheduleCount: number;
  student: StudentDetails;
}

interface StudentDetails {
  studentId: string;
  studentEmail: string;
  studentPhone: number;
  course: string;
  package: string;
  city: string;
  country: string;
  gender: string;
}

interface PaymentHistory {
  paymentId: string;
  paymentDate: string;
  paymentAmount: number;
  paymentStatus: string;
  userId: string;
}

export default function StudentList() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");

  const [student, setStudent] = useState<StudentItem | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }

    if (studentId) {
      fetchAndFilterStudent(token);
    }
  }, [studentId]);

  const fetchAndFilterStudent = async (token: string) => {
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allStudents: StudentItem[] = response.data.students;

      const filteredStudent = allStudents.find((s) => s._id === studentId);

      setStudent(filteredStudent || null);
      console.log("Filtered student:", filteredStudent);

      // Fetch payment history if userId exists
      if (filteredStudent && filteredStudent.userId) {
        fetchPaymentHistory(filteredStudent.userId, token);
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchPaymentHistory = async (userId: string, token: string) => {
    setLoadingPayments(true);
    setPaymentError(null);
    try {
      const response = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.GET_STUDENT_PAYMENT_HISTORY}?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data && response.data.paymentDetails) {
        setPaymentHistory(response.data.paymentDetails);
      } else {
        setPaymentHistory([]);
      }
    } catch (error: any) {
      setPaymentError("Failed to fetch payment history");
      setPaymentHistory([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Student" showBackPath="/modules/users/admin-main/ui/student" showBackButton/>
      {student && (
        <div className="p-4 w-full overflow-hidden">
          <div
            key={student._id}
            className="col-span-3 bg-[#5E6578] text-white px-4 py-3 rounded-lg shadow-sm flex flex-row"
          >
              <div className="flex flex-col items-center w-[20%] pr-4 py-6 border-r border-[#BCBCBC] gap-y-2">
                <div className="rounded-full overflow-hidden p-2 border-white">
                  <img
                    src={
                      student.avatar?.trim()
                        ? student.avatar
                        : "/assets/images/student-portfolio.svg"
                    }
                    alt={student.username}
                    className="w-20 h-20 rounded-full"
                  />
                </div>
                <h2 className="text-[12px] font-semibold text-center mt-2">
                  {student.username}
                </h2>
                <p className="text-[11px] text-gray-300 text-center flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < student.rating
                          ? "text-yellow-500 text-xs"
                          : "text-gray-300 text-xs"
                      }
                    />
                  ))}
                </p>
                <span className="text-gray-300 text-center text-[10px]">
                  Completion: {student.percentage || "0%"}
                </span>
              </div>

              <div className="flex flex-col md:w-1/2 gap-4 px-3 border-r border-[#BCBCBC]">
                <h4 className="text-[13px] font-semibold mb-2">
                  Contact & Details
                </h4>
                <div className="text-xs">
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Student ID</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.studentId}
                    </span>
                  </div>
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Email:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.studentEmail}
                    </span>
                  </div>
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Gender:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.gender}
                    </span>
                  </div>
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Courses:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.course}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:w-1/2 gap-4 px-3">
                <h4 className="text-[13px] font-semibold mb-2">
                  {/* Educational Information */}
                </h4>
                <div className="text-xs">
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Country:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.country}
                    </span>
                  </div>
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">City:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.city}
                    </span>
                  </div>
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Phone:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.studentPhone}
                    </span>
                  </div>
                  <div className="py-2 flex flex-row justify-between">
                    <span className="text-gray-200">Packages:</span>{" "}
                    <span className="text-gray-200 px-2 text-[10px]">
                      {student.student.package}
                    </span>
                  </div>
                </div>
              </div>
          </div>

          {/* Tabbed Table Section */}
          <div className="w-full overflow-hidden">
            <TabbedTable
              studentId={student._id||student.student.studentId}
              courseName={student.student.course}
              userId={paymentHistory[0]?.userId || ""}
            />
          </div>
        </div>
      )}
    </BaseLayout4>
  );
}