"use client";

import React, {useState} from "react";
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  Users,
  Check,
  Info,
  CloudUpload,
} from "lucide-react";

const CurrentSubscription = () => {
  const adminFeatures = [
    "Manage Students",
    "Manage Teachers",
    "Teacher Salary",
    "Student Attendance",
    "Fees Management",
    "Reports",
  ];

  const studentFeatures = [
    "View Profile",
    "View Timetable",
    "Attendance",
    "Study Materials",
    "Assignments",
    "Exam Results",
  ];

  const teacherFeatures = [
    "Manage Classes",
    "Student Attendance",
    "Assignments",
    "Student Attendance",
    "Study Materials",
    "Marks Entry",
  ];
  const [showBackupModal, setShowBackupModal] = useState(false);

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.8fr_0.9fr_0.9fr]">
        {/* Current Plan */}
        <div className="relative flex min-h-[120px] items-center overflow-hidden rounded-xl bg-gradient-to-r from-[#5067d7] to-[#6d80eb] px-3 py-3 text-white shadow-md">
          <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-xl bg-white/15">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute h-10 w-10 rotate-45 rounded-[5px] bg-white" />

              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#6478df]">
                <span className="text-[24px] text-white">★</span>
              </div>
            </div>
          </div>

          <div className="ml-3 min-w-0">
            <p className="text-[11px] text-white/90">
              Current Plan
            </p>

            <h2 className="mt-1 text-[17px] font-semibold">
              Enterprise
            </h2>

            <p className="mt-1 max-w-[420px] text-[10px] leading-[14px] text-white/90">
              Our most powerful subscription plan designed for large
              organizations with advanced features, higher resource limits,
              and priority support.
            </p>
          </div>

          <span className="absolute right-3 top-3 rounded bg-[#dff8dc] px-2 py-[3px] text-[9px] font-medium text-[#36a53a]">
            Active
          </span>
        </div>

        {/* Billing Cycle */}
        <div className="flex min-h-[120px] items-center rounded-xl bg-white px-4 shadow-[0_3px_16px_rgba(0,0,0,0.06)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5edff]">
            <CreditCard className="h-6 w-6 text-[#3670e7]" />
          </div>

          <div className="ml-4">
            <p className="text-[14px] text-gray-500">
              Billing Cycle
            </p>

            <h3 className="mt-1 text-[19px] font-semibold text-[#292929]">
              Monthly
            </h3>

            <p className="mt-2 text-[12px] text-gray-500">
              ₹4,999 / Month
            </p>
          </div>
        </div>

        {/* Renewal Date */}
        <div className="flex min-h-[120px] items-center rounded-xl bg-white px-4 shadow-[0_3px_16px_rgba(0,0,0,0.06)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5f7e9]">
            <CalendarDays className="h-6 w-6 text-[#35b866]" />
          </div>

          <div className="ml-4">
            <p className="text-[14px] text-gray-500">
              Renewal Date
            </p>

            <h3 className="mt-1 text-[18px] font-semibold text-[#292929]">
              28 Aug 2026
            </h3>

            <p className="mt-2 text-[12px] text-gray-500">
              23 days left
            </p>
          </div>
        </div>
      </div>

      {/* Usage + Summary */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Usage */}
        <div className="rounded-lg border border-[#dce1eb] bg-white p-3">
          <h3 className="text-[14px] font-semibold text-[#10204a]">
            Usage & Limits
          </h3>

          <div className="mt-4 space-y-3">
            {/* Students */}
            <UsageRow
              icon={<GraduationCap className="h-4 w-4" />}
              label="Students"
              percentage="72%"
              value="420 / 500"
            />

            {/* Users */}
            <UsageRow
              icon={<Users className="h-4 w-4" />}
              label="Users"
              percentage="72%"
              value="420 / 500"
            />
          </div>

          <div className="mt-4 flex items-center rounded-md bg-[#e5ebff] px-3 py-2">
            <Info className="h-3.5 w-3.5 text-[#536abf]" />

            <span className="ml-2 text-[10px] text-[#29375f]">
              Users are created and managed by the Super Admin.
            </span>
          </div>
        </div>

        {/* Subscription Summary */}
        <div className="rounded-lg border border-[#dce1eb] bg-white p-3">
          <h3 className="text-[14px] font-semibold text-[#10204a]">
            Subscription Summary
          </h3>

          <div className="mt-4">
            <SummaryRow
              label="Plan Price"
              value="₹4,237.29"
            />

            <SummaryRow
              label="GST (18%)"
              value="₹761.71"
            />

            <SummaryRow
              label="Total Amount"
              value="₹4,999.00"
              bold
            />

            <SummaryRow
              label="Next Billing Date"
              value="25 Aug 2026"
            />
          </div>
        </div>
      </div>

      {/* Features + Backup */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[3fr_1fr]">
        {/* Features */}
        <div className="rounded-lg border border-[#dce1eb] bg-white p-3">
          <h3 className="text-[14px] font-semibold text-[#10204a]">
            Included Portal & Features
          </h3>

          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureColumn
              title="Admin"
              features={adminFeatures}
            />

            <FeatureColumn
              title="Students"
              features={studentFeatures}
            />

            <FeatureColumn
              title="Teachers"
              features={teacherFeatures}
            />
          </div>
        </div>

        {/* Backup */}
        <div className="flex min-h-[215px] flex-col items-center justify-center rounded-lg bg-[#f8eaff] px-4 text-center">
          <CloudUpload className="mb-3 h-14 w-14 text-[#d177ef]" />

          <h3 className="text-[11px] font-semibold text-[#17182e]">
            Backup Request
          </h3>

          <p className="mt-1 max-w-[210px] text-[9px] leading-4 text-[#4c4560]">
            Request a Backup for your data and ensure data safety
          </p>

          <button
  type="button"
  onClick={() => setShowBackupModal(true)}
  className="mt-3 rounded-md bg-white px-4 py-1.5 text-[10px] font-medium text-[#252944] shadow-sm transition hover:bg-gray-50"
>
  Backup Request
</button>
        </div>
      </div>

      {/* Backup Request Modal */}
{showBackupModal && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
    <div
      className="relative w-full max-w-[620px] rounded-[9px] bg-white px-[18px] py-[20px] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <h2 className="mb-[14px] text-[15px] font-semibold text-[#111111]">
        Backup Request
      </h2>

      {/* Form Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          console.log("Backup request submitted");

          setShowBackupModal(false);
        }}
        className="rounded-[10px] border border-[#dce1eb] px-[16px] pb-[16px] pt-[14px]"
      >
        {/* Backup Date */}
        <div className="mb-[15px]">
          <label className="mb-[7px] block text-[13px] font-medium text-[#101b3d]">
            Backup Date
          </label>

          <div className="grid grid-cols-2 gap-[5px]">
            <div className="relative">
              <input
                type="date"
                defaultValue="2020-01-20"
                className="h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[10px] pr-[20px] text-[12px] text-[#253252] outline-none focus:border-[#5870c5]"
              />
            </div>

            <div className="relative">
              <input
                type="date"
                defaultValue="2020-01-24"
                className="h-[30px] w-full rounded-[5px] border border-[#d1d1d1] bg-white px-[10px] pr-[20px] text-[12px] text-[#253252] outline-none focus:border-[#5870c5]"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-[13px]">
          <label className="mb-[7px] block text-[13px] font-medium text-[#101b3d]">
            Additional Notes
          </label>

          <textarea
            rows={5}
            placeholder="Enter any additional information..."
            className="h-[105px] w-full resize-none rounded-[5px] border border-[#d1d1d1] bg-white px-[10px] py-[9px] text-[12px] text-[#253252] outline-none placeholder:text-[#253252] focus:border-[#5870c5]"
          />
        </div>

        {/* Info */}
        <div className="flex h-[39px] items-center rounded-[6px] bg-[#E5EBFF] px-[10px]">
          <div className="mr-[9px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-[#5870c5] text-[12px] font-semibold text-white">
            i
          </div>

          <p className="text-[12px] text-[#17213f]">
            Backup is available only for data from the last 30 days.
          </p>
        </div>
      </form>

      {/* Divider */}
      <div className="my-[17px] h-px w-full bg-[#dddddd]" />

      {/* Buttons */}
      <div className="flex justify-end gap-[18px]">
        <button
          type="button"
          onClick={() => setShowBackupModal(false)}
          className="h-[38px] min-w-[93px] rounded-[6px] border border-[#5870c5] bg-white px-[18px] text-[13px] font-semibold text-[#5870c5] transition hover:bg-[#f4f6ff]"
        >
          Cancel
        </button>

        <button
          type="submit"
          onClick={() => {
            console.log("Backup request submitted");
            setShowBackupModal(false);
          }}
          className="h-[38px] min-w-[93px] rounded-[6px] bg-[#5870c5] px-[18px] text-[13px] font-semibold text-white transition hover:bg-[#4d63b5]"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

interface UsageRowProps {
  icon: React.ReactNode;
  label: string;
  percentage: string;
  value: string;
}

const UsageRow = ({
  icon,
  label,
  percentage,
  value,
}: UsageRowProps) => {
  return (
    <div className="flex items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e8edff] text-[#526dc8]">
        {icon}
      </div>

      <span className="ml-3 w-[95px] text-[13px] text-[#18213c]">
        {label}
      </span>

      <div className="flex flex-1 items-center gap-3">
        <div className="h-[10px] flex-1 overflow-hidden rounded-full bg-[#c5d0ed]">
          <div
            className="h-full rounded-full bg-[#5870c5]"
            style={{ width: percentage }}
          />
        </div>

        <span className="w-[62px] text-right text-[12px] text-[#101a3c]">
          {value}
        </span>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

const SummaryRow = ({
  label,
  value,
  bold = false,
}: SummaryRowProps) => {
  return (
    <div className="flex items-center justify-between border-b border-[#edf0f5] py-2 last:border-b-0">
      <span
        className={`text-[12px] ${
          bold
            ? "font-medium text-[#17203d]"
            : "text-[#17203d]"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-[12px] ${
          bold
            ? "font-medium text-[#17203d]"
            : "text-[#17203d]"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

interface FeatureColumnProps {
  title: string;
  features: string[];
}

const FeatureColumn = ({
  title,
  features,
}: FeatureColumnProps) => {
  return (
    <div>
      <h4 className="text-[13px] font-medium text-[#14203e]">
        {title}
      </h4>

      <div className="mt-2 space-y-2">
        {features.map((feature, index) => (
          <div
            key={`${feature}-${index}`}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4 shrink-0 text-[#2dbb63]" />

            <span className="text-[12px] text-[#17203d]">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentSubscription;