"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
type LeaveFormProps = {
  readonly onClose: () => void;
};

export default function LeaveForm({ onClose }: LeaveFormProps) {
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    leaveType: "",
    leaveStatus: "WAITINGLIST",
    role: "Academiccoach",
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
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);

  useEffect(() => {
    const Id = localStorage.getItem("AcademicCoachPortalId") ?? "";
    const Name = localStorage.getItem("AcademicCoachPortalName") ?? "";
    setForm((prev) => ({
      ...prev,
      employeeId: Id,
      name: Name,
    }));

    // Fetch leave data from API
    if (Id) {
      const token = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;
      axios
        .get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.LEAVE.CREATE}?employeeId=${Id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const data = res.data;
          setLeaveSummary({
            sickLeave: data.sickLeave || 0,
            casualLeave: data.casualLeave || 0,
            paidLeave: data.paidLeave || 0,
            deductionDays: data.deductionDays || 0,
          });
          setLeaveRecords(data.records || []);
          // Pre-fill form with the latest record if available
          if (data.records && data.records.length > 0) {
            const latest = data.records[data.records.length - 1];
            setForm((prev) => ({
              ...prev,
              ...latest,
              fromDate: latest.fromDate ? latest.fromDate.slice(0, 10) : "",
              toDate: latest.toDate ? latest.toDate.slice(0, 10) : "",
              createdDate: latest.createdDate || new Date().toISOString(),
              UpdatedDate: latest.updatedDate || new Date().toISOString(),
            }));
          }
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;

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
      if (Number(status === 400)) {
        console.log("please >");
        setFailedMessage("Please check the form inputs.");
        setFailed(true);
      } else if (status === 401) {
        setFailedMessage("Please login again.");
        setFailed(true);
      } else if (status === 403) {
        setFailedMessage("You don't have permission to perform this action.");
        setFailed(true);
      } else if (status === 500) {
        setFailedMessage("Server error");
        setFailed(true);
      } else {
        setFailed(true);
        console.error(`Unexpected error: ${status}`);
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
                value="Academic Coach"
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
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C] dark:[color-scheme:dark]"
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
                className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C] dark:[color-scheme:dark]"
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
                className="w-full border rounded px-3 py-2 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
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
                className="w-full border rounded px-3 py-2 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
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
                className="w-full border rounded px-3 py-2 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
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
                className="w-full border rounded px-3 py-2 text-gray-800 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-[12px] rounded-md border border-[#576CBC] text-[#576CBC] font-medium hover:bg-[#EEF1FF] dark:hover:bg-[#343434]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-[12px] rounded-md bg-[#576CBC] text-white font-medium hover:bg-[#455bb1]"
          >
            Submit
          </button>
        </div>
      </form>
      {success && (
  <SuccessPopup
    onClose={() => {
      setSucces(false);
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
