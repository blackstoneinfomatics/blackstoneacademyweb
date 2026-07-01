// components/GenerateInvoice.tsx
"use client";

import { useEffect, useState } from "react";
import { File, X, Upload } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoLocationSharp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { BsTelephoneFill } from "react-icons/bs";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppFailureToastMessages, appSuccessToastMessages } from "@/app/_components/contents/toast_message";

interface IStudent {
  student: {
    studentId: string;
    studentEmail: string;
    studentPhone: number;
    gender: string;
    package: string;
    course: string;
    city: string;
    country: string;
  };
  _id: string;
  username: string;
  password: string;
  role: "Student" | "Admin" | "Teacher";
  status: "Active" | "Inactive";
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  __v: number;
  classScheduleCount: number;
  evaluation?: Array<{
    _id: string;
    academicCoachId: string;
    student: {
      studentId: string;
      studentFirstName: string;
      studentLastName: string;
      studentEmail: string;
      studentGender: string;
      studentPhone: number;
      studentCity: string;
      studentCountry: string;
      studentCountryCode: string;
      learningInterest: string;
      numberOfStudents: number;
      preferredTeacher: string;
      preferredFromTime: string;
      preferredToTime: string;
      timeZone: string;
      referralSource: string;
      preferredDate: string;
      evaluationStatus: string;
      status: string;
      createdDate: string;
      createdBy: string;
    };
    classType: string;
    teacher?: {
      teacherId: string;
      teacherName: string;
      teacherEmail: string;
    };
    classDay: string[];
    startTime: string[];
    endTime: string[];
    isLanguageLevel: boolean;
    languageLevel: string;
    isReadingLevel: boolean;
    readingLevel: string;
    isGrammarLevel: boolean;
    grammarLevel: string;
    hours: number;
    subscription?: {
      subscriptionName: string;
    };
    planTotalPrice: number;
    classStartDate: string;
    classEndDate: string;
    classStartTime: string;
    classEndTime: string;
    accomplishmentTime: string;
    studentRate: number;
    gardianName: string;
    gardianEmail: string;
    gardianPhone: string;
    gardianCity: string;
    gardianCountry: string;
    gardianTimeZone: string;
    gardianLanguage: string;
    assignedTeacher: string;
    studentStatus: string;
    classStatus: string;
    comments: string;
    trialClassStatus: string;
    invoiceStatus: string;
    paymentLink: string;
    paymentStatus: string;
    teacherStatus: string;
    status: string;
    createdDate: string;
    createdBy: string;
    updatedDate: string;
    updatedBy: string;
    expectedFinishingDate: number;
    assignedTeacherId: string;
    assignedTeacherEmail: string;
    __v: number;
  }>;
}

export interface IStudentInvoice {
  student: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    country: string;
    city: string;
  };
  evaluationData?: any;
  paymentDate?: Date;
  courseName: string;
  amount: number;
  packageType: string;
  itemDescription: string;
  duration: string;
  rate: string;
  description: string;
  attachFile?: string;
  dueDate?: string;
  invoiceStatus: string;
  status: string;
  createdDate?: string;
  createdBy: string;
  lastUpdatedDate?: string;
  lastUpdatedBy: string;
  invoiceNumber?: number;
}

export default function GenerateInvoice({ onClose }: { onClose: () => void }) {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [invoiceData, setInvoiceData] = useState<IStudentInvoice>({
    student: {
      studentId: "",
      studentName: "",
      studentEmail: "",
      studentPhone: "",
      country: "",
      city: "",
    },
    courseName: "",
    amount: 0,
    invoiceNumber: 0,
    invoiceStatus: "Pending",
    packageType: "",
    itemDescription: "",
    duration: "",
    rate: "",
    description: "",
    attachFile: "",
    status: "Active",
    dueDate: "",
    createdBy: "Admin",
    lastUpdatedBy: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("AdminAuthToken");
    if (token) {
      fetchStudents(token);
    }
  }, []);

  const fetchStudents = async (token: string) => {
    try {
      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ALSTUDENTS.GET}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const uniqueStudentsMap = new Map();
      response.data.students.forEach((student: IStudent) => {
        uniqueStudentsMap.set(student.student.studentId, student);
      });
      const uniqueStudentsArray = Array.from(uniqueStudentsMap.values());
      setStudents(uniqueStudentsArray);
      console.log(uniqueStudentsArray);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    console.log("Invoice data reset to initial state:", invoiceData);
  }, [invoiceData]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
      console.log("Sending invoice data:", JSON.stringify(invoiceData, null, 2));

      const firstEvaluation = selectedStudent?.evaluation?.[0];
      const evaluationData = firstEvaluation
        ? {
            ...firstEvaluation,
            student: {
              ...firstEvaluation.student,
              studentId: invoiceData.student.studentId,
            },
          }
        : undefined;

      const payload = {
        ...invoiceData,
        studentId: invoiceData.student.studentId,
        evaluationData,
      };

      console.log("[GenerateInvoice] Using student ids:", {
        invoiceStudentId: invoiceData.student.studentId,
        evalStudentIdBefore: firstEvaluation?.student?.studentId,
        evalStudentIdAfter: evaluationData?.student?.studentId,
        topLevelStudentId: (payload as any).studentId,
      });

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.CREATE}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Full API response:", response);

      if (response.status === 201) {
        const invoiceWithEvaluation = {
          ...response.data.data,
          evaluationData: invoiceData.evaluationData,
        };

        console.log("Combined invoice data:", invoiceWithEvaluation);
        toast.success(appSuccessToastMessages.INVOICE_CREATED, {
          position: "top-right",
          autoClose: 3000,
        });

        setInvoiceData({
          student: {
            studentId: "",
            studentName: "",
            studentEmail: "",
            studentPhone: "",
            country: "",
            city: "",
          },
          courseName: "",
          amount: 0,
          invoiceNumber: 0,
          invoiceStatus: "Pending",
          packageType: "",
          itemDescription: "",
          duration: "",
          rate: "",
          description: "",
          attachFile: "",
          status: "Active",
          dueDate: "",
          createdBy: "Admin",
          lastUpdatedBy: "",
        });

        setSelectedStudent(null);
        setAttachedFile(null);
        onClose();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(AppFailureToastMessages.INVOICE_CREATE_FAILED, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        setInvoiceData({
          ...invoiceData,
          attachFile: base64String,
        });
        setAttachedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setInvoiceData({ ...invoiceData, attachFile: "" });
    setAttachedFile(null);
  };

  return (
    <div className="relative p-6 max-h-[90vh] overflow-y-auto dark:bg-[#1e1e1e] dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Generate Invoice</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Select Student */}
        <section>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 md:max-w-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] rounded-xl p-4">
              <label className="block text-gray-800 dark:text-gray-200 font-semibold mb-2 text-sm">
                Select Student
              </label>
              <select
                className="w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white dark:bg-[#333] dark:border-gray-600 dark:text-white"
                value={selectedStudent?._id ?? ""}
                onChange={(e) => {
                  const selected = students.find(
                    (stu) => stu._id === e.target.value
                  );
                  setSelectedStudent(selected || null);
                  if (selected) {
                    const firstEvaluation = selected.evaluation?.[0];
                    setInvoiceData((prev) => ({
                      ...prev,
                      lastUpdatedBy: new Date().toISOString(),
                      student: {
                        // Use business studentId (e.g., ALFST-010), not Mongo _id
                        studentId: selected.student.studentId,
                        studentName: selected.username,
                        studentEmail: selected.student.studentEmail,
                        studentPhone: String(selected.student.studentPhone),
                        country: selected.student.country,
                        city: selected.student.city,
                      },
                      courseName: selected.student.course,
                      packageType: selected.student.package,
                      itemDescription: "",
                      rate: "10",
                      duration: "30",
                      evaluationData: firstEvaluation
                        ? { ...firstEvaluation }
                        : undefined,
                    }));
                  }
                }}
              >
                <option value="" disabled>
                  Select a student
                </option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.username}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="flex gap-12 py-4 flex-1 flex-wrap">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] dark:bg-[#2d2d2d] rounded-full">
                    <IoLocationSharp className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                  </span>
                  <div>
                    <div className="font-medium text-[#181A20] dark:text-gray-200 text-base mb-1">
                      Address
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-[12px] leading-tight">
                      {selectedStudent.student.city}, {selectedStudent.student.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] dark:bg-[#2d2d2d] rounded-full">
                    <MdEmail className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                  </span>
                  <div>
                    <div className="font-medium text-[#181A20] dark:text-gray-200 text-base mb-1">
                      Email
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-[12px] leading-tight">
                      {selectedStudent.student.studentEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] dark:bg-[#2d2d2d] rounded-full">
                    <BsTelephoneFill className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                  </span>
                  <div>
                    <div className="font-medium text-[#181A20] dark:text-gray-200 text-base mb-1">
                      Phone
                    </div>
                    <div className="text-[#181A20] dark:text-gray-300 text-[11px] leading-tight">
                      {selectedStudent.student.studentPhone}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* General Info */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded-md text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                value={invoiceData.amount || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-xs mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full p-3 border rounded-md text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                value={invoiceData.dueDate || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </section>

        {/* Item Description */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Item Description
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[#4C6993] dark:bg-[#3a5a80] text-white text-xs">
                <tr>
                  <th className="p-3 text-left">Package Type</th>
                  <th className="p-3 text-left">Course</th>
                  <th className="p-3 text-left">Duration</th>
                  <th className="p-3 text-left">Currency</th>
                  <th className="p-3 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t dark:border-gray-700">
                  <td className="p-3">
                    <input
                      className="w-full border rounded p-2 text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                      value={selectedStudent?.student.package ?? ""}
                      readOnly
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full border rounded p-2 text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                      value={selectedStudent?.student.course ?? ""}
                      readOnly
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full border rounded p-2 text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                      value={30}
                      readOnly
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full border rounded p-2 text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                      value="Dollars"
                      readOnly
                    />
                  </td>
                  <td className="p-3 text-left">
                    <input
                      className="w-full border rounded p-2 text-left text-xs bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
                      value={invoiceData.amount || ""}
                      readOnly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <textarea
              className="w-full p-3 border rounded-md min-h-[80px] text-sm bg-[#F3F3F3] dark:bg-[#2d2d2d] dark:border-gray-600 dark:text-white"
              placeholder="Additional description..."
              value={invoiceData.itemDescription ?? ""}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  itemDescription: e.target.value,
                })
              }
            />
          </div>
        </section>

        {/* Attach Files */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Attach File
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 p-2 bg-[#F3F3F3] dark:bg-[#2d2d2d] border border-dashed border-green-200 dark:border-green-800 rounded-lg">
              <div className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] dark:bg-[#3d3d3d] rounded-full">
                <Upload className="w-5 h-5 text-blue-900 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300">Upload Files</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  PDF, DOC, PPT, JPG, PNG
                </p>
                <button
                  type="button"
                  className="mt-2 text-blue-900 dark:text-blue-400 text-xs underline"
                  onClick={triggerFileInput}
                >
                  Choose a file
                </button>
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.ppt,.jpg,.png"
                  onChange={handleFileChange}
                />
                {invoiceData.attachFile && (
                  <p className="text-xs mt-1 dark:text-gray-300">{attachedFile?.name}</p>
                )}
              </div>
            </div>

            {attachedFile && (
              <div className="flex-1 flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#F3F3F3] dark:bg-[#3d3d3d] rounded-full">
                    <File className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  </span>
                  <div>
                    <p className="text-xs font-medium dark:text-gray-300">
                      {attachedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {attachedFile.size} bytes
                    </p>
                  </div>
                </div>
                <button
                  className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"
                  onClick={removeFile}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg text-sm dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm dark:bg-blue-800 dark:hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Send Invoice
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}