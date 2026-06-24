"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { toast } from "react-toastify";

type LeaveFormProps = {
  readonly onClose: () => void;
};

export default function LeaveForm({ onClose }: LeaveFormProps) {
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    leaveType: "",
    leaveStatus: "WAITINGLIST",
    role: "Teacher",
    fromDate: "",
    toDate: "",
    reason: "",
    status: "Active",
    createdDate: new Date().toISOString(),
    createdBy: "Admin",
    UpdatedDate: new Date().toISOString(),
    UpdatedBy: "Admin",
  });
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");

  // New state for leave summary and records
  const [leaveSummary, setLeaveSummary] = useState({
    sickLeave: 0,
    casualLeave: 0,
    paidLeave: 0,
    deductionDays: 0,
  });
  
  useEffect(() => {
    const Id = localStorage.getItem("TeacherId") ?? "";
    console.log("TeacherId from localStorage:", Id); // Debug log
    const Name = localStorage.getItem("TeacherPortalName") ?? "";
    setForm((prev) => ({
      ...prev,
      employeeId: Id,
      name: Name,
    }));

    // Fetch leave data from API
    if (Id) {
      const token = typeof window !== "undefined" ? localStorage.getItem("TeacherAuthToken") : null;
      axios
        .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.GET}?employeeId=${Id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          const data = res.data;
          setLeaveSummary({
            sickLeave: data.sickLeave || 0,
            casualLeave: data.casualLeave || 0,
            paidLeave: data.paidLeave || 0,
            deductionDays: data.deductionDays || 0,
          });
          // Do not set previous records into form state
        })
        .catch((err) => {
          // Optionally handle error
        });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
  if (!form.leaveType) {
    toast.error(
      AppValidationMessages.LEAVE.LEAVE_TYPE_REQUIRED
    );
    return false;
  }

  if (!form.fromDate) {
    toast.error(
      AppValidationMessages.LEAVE.FROM_DATE_REQUIRED
    );
    return false;
  }

  if (!form.toDate) {
    toast.error(
      AppValidationMessages.LEAVE.TO_DATE_REQUIRED
    );
    return false;
  }

  if (!form.reason.trim()) {
    toast.error(
      AppValidationMessages.LEAVE.REASON_REQUIRED
    );
    return false;
  }

  if (form.reason.trim().length < 5) {
    toast.error(
      AppValidationMessages.LEAVE.REASON_MIN_LENGTH
    );
    return false;
  }

  if (new Date(form.toDate) < new Date(form.fromDate)) {
    toast.error(
      AppValidationMessages.LEAVE.INVALID_DATE_RANGE
    );
    return false;
  }

  return true;
};

  const handleSubmit = async (e: any) => {
    e.preventDefault();

      if (!validateForm()) return false;

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("TeacherAuthToken")
          : null;

          if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}

      const response = await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.CREATE}`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Leave request submitted:", response.data);
      
      if ([200, 201].includes(response.status)) {
        setSucces(true);
      }
    } catch (err) {
      const error = err as AxiosError;

      const status = error.response?.status;
   if (status === 400) {
  toast.error(AppValidationMessages.LEAVE.INVALID_INPUTS);
} else if (status === 401) {
  toast.error(AppValidationMessages.LEAVE.LOGIN_REQUIRED);
} else if (status === 403) {
  toast.error(AppValidationMessages.LEAVE.ACCESS_DENIED);
} else if (status === 500) {
  toast.error(AppValidationMessages.LEAVE.SERVER_ERROR);
} else {
  toast.error(AppValidationMessages.LEAVE.UNEXPECTED_ERROR);
}
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-5 w-full max-w-3xl mx-3 text-sm dark:bg-[#1D1D1D]"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Section */}
          <div>
            <h1 className="text-lg font-normal text-gray-800 mb-3 dark:text-[#FFFFFF] ">
              Fill Details
            </h1>

            <div className="mb-4">
              <label
                htmlFor="employeeId"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Employee ID
              </label>
              <input
                name="employeeId"
                value={form.employeeId}
                readOnly
                type="text"
                className="w-full border  rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="employeeName"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Employee Name
              </label>
              <input
                name="employeeName"
                value={form.name}
                readOnly
                type="text"
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="designation"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Designation
              </label>
              <input
                name="designation"
                value="Teacher"
                readOnly
                type="text"
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="leaveType"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Leave Type
              </label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              >
                <option value="">Select Leave Type</option>
                <option value="SICK">SICK</option>
                <option value="CASUAL">CASUAL</option>
                <option value="PAID">PAID</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="fromDate"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                From Date
              </label>
              <input
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                type="date"
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="toDate"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                To Date
              </label>
              <input
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                type="date"
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
          </div>

          {/* Right Section */}
          <div>
            <h2 className="text-lg font-normal text-gray-800 mb-3 dark:text-[#FFFFFF]">
              Leave Records
            </h2>

            <div className="mb-4">
              <label
                htmlFor="sickLeave"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Sick Leave
              </label>
              <input
                type="text"
                value={leaveSummary.sickLeave}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="casualLeave"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Casual Leave
              </label>
              <input
                type="text"
                value={leaveSummary.casualLeave}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="paidLeave"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Paid Leave
              </label>
              <input
                type="text"
                value={leaveSummary.paidLeave}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="deductionDays"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Loss of Pay
              </label>
              <input
                type="text"
                value={leaveSummary.deductionDays}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="reason"
                className="block text-sm font-normal text-gray-600 mb-1 dark:text-[#FFFFFF]"
              >
                Reason For Leave
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={2}
                className="w-full border rounded px-3 py-3 h-full text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
          </div>
        </div>

        {/* Divider and Buttons */}
        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                leaveType: "",
                fromDate: "",
                toDate: "",
                reason: "",
              }));
              onClose();
            }}
            className="px-3 py-1 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition "
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
      {success && (
        <SuccessPopup
          onClose={() => {
            setSucces(false);
            setForm((prev) => ({
              ...prev,
              leaveType: "",
              fromDate: "",
              toDate: "",
              reason: "",
            }));
            onClose();
          }}
          title="Leave Request"
        />
      )}
      {failed &&  (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </div>
  );
}
