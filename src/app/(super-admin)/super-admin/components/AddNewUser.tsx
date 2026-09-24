import React, { useState } from "react";

type AddNewUserProps = {
  onClose: () => void;
};

const AddNewUser = ({ onClose }: Readonly<AddNewUserProps>) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
const previousStep = () => setStep((prev) => Math.max(prev - 1, 1));
 const handleCreateUser = () => setIsSuccess(true);

  const [formData] = useState({
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  designation: "",
  reportingTo: "",
});

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
{isSuccess ? (
  <div className="py-4 flex flex-col items-center justify-center text-center w-full max-w-xs mx-auto">

    {/* Success Icon */}
    <div className="w-16 h-16 rounded-full bg-[#E8F8EE] flex items-center justify-center shadow-md">
      <div className="w-12 h-12 rounded-full bg-[#08B250] flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>

    {/* Heading */}
    <h2 className="mt-4 text-[20px] font-bold text-[#010E30] leading-tight">
      User Created Successfully
    </h2>

    {/* Description */}
    <p className="mt-2 text-[14px] text-[#010E30] leading-6">
      You have successfully
      <br />
      Created Admin
    </p>

    {/* Green Line */}
    <div className="w-28 h-[5px] rounded-full bg-[#08B250] mt-4"></div>

    {/* Close Button */}
    <button
      onClick={onClose}
      className="mt-6 w-64 h-11 rounded-xl bg-[#5C6BC0] text-white text-[16px] font-semibold hover:bg-[#4E5DB7] transition"
    >
      Close
    </button>

  </div>
) : (
          <>
            <div className="p-6">
<div className="mb-8">

  {/* Circles */}
  <div className="flex justify-between px-8 relative z-10">

    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-semibold transition-all ${
        step >= 1
          ? "bg-[#5C6BC0] text-white"
          : "bg-[#D9D9D9] text-[#555]"
      }`}
    >
      1
    </div>

    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-semibold transition-all ${
        step >= 2
          ? "bg-[#5C6BC0] text-white"
          : "bg-[#D9D9D9] text-[#555]"
      }`}
    >
      2
    </div>

  </div>

  {/* Progress Line */}
  <div className="flex mt-3 px-2">

    <div
      className={`flex-1 h-[5px] rounded-full transition-all duration-300 ${
        step === 2
          ? "bg-[#5C6BC0]"
          : "bg-[#D9D9D9]"
      }`}
    />

  </div>

</div>

              {step === 1 && (
                <div>
                  <h3 className="text-[20px] font-semibold text-[#1E2B50] mb-6">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label className="block mb-2 text-[14px]">Name</label>
                      <input className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]" defaultValue="ABI" />
                    </div>
                    <div>
                      <label className="block mb-2 text-[14px]">Email</label>
                      <input className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]" defaultValue="Blackstoneschool@gmail.com" />
                    </div>
                    <div>
                      <label className="block mb-2 text-[14px]">Phone Number</label>
                      <input className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]" defaultValue="+91 23456 87654" />
                    </div>
                    <div>
                      <label className="block mb-2 text-[14px]">Role</label>
                      <select className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]">
                        <option>Teacher</option>
                        <option>Admin</option>
                        <option>Student</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-[14px]">Department</label>
                      <select className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]">
                        <option>Java</option>
                        <option>Python</option>
                        <option>Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-[14px]">Designation</label>
                      <input className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]" defaultValue="Senior Teacher" />
                    </div>
                    <div>
                      <label className="block mb-2 text-[14px]">Reporting To</label>
                      <select className="w-full h-11 text-[14px] border border-gray-300 rounded-md px-4 outline-none focus:border-[#5C6BC0]">
                        <option>Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

{step === 2 && (
  <div>
    <h3 className="text-[20px] font-semibold text-[#1E2B50] mb-6">
      Review
    </h3>

    <div className="border border-gray-200 rounded-xl p-6">

      <div className="grid grid-cols-[220px_20px_1fr] gap-y-3 text-[14px]">

        <span className="text-[#334155]">Tenant ID</span>
        <span>:</span>
        <span>TEN-001</span>

        <span className="text-[#334155]">Tenant Name</span>
        <span>:</span>
        <span>Blackstone Academy</span>

        <span className="text-[#334155]">Name</span>
        <span>:</span>
        <span>{formData.name}</span>

        <span className="text-[#334155]">Email</span>
        <span>:</span>
        <span>{formData.email}</span>

        <span className="text-[#334155]">Phone Number</span>
        <span>:</span>
        <span>{formData.phone}</span>

        <span className="text-[#334155]">Role</span>
        <span>:</span>
        <span>{formData.role}</span>

        <span className="text-[#334155]">Department</span>
        <span>:</span>
        <span>{formData.department}</span>

        <span className="text-[#334155]">Designation</span>
        <span>:</span>
        <span>{formData.designation}</span>

        <span className="text-[#334155]">Reporting To</span>
        <span>:</span>
        <span>{formData.reportingTo}</span>

        <span className="text-[#334155]">Status</span>
        <span>:</span>
        <span className="text-green-600 font-medium">Active</span>

      </div>

    </div>
  </div>
)}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-300 px-5 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              {step > 1 && (
                <button
                  type="button"
                  onClick={previousStep}
                  className="border border-gray-300 px-5 py-2 rounded-md text-sm hover:bg-gray-50"
                >
                  Back
                </button>
              )}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#5C6BC0] text-white px-6 py-2 rounded-md text-sm hover:bg-[#4c5aac]"
                >
                  Next
                </button>
              ) : (
                <button
  type="button"
  onClick={handleCreateUser}
  className="bg-[#5C6BC0] text-white px-6 py-2 rounded-md text-sm hover:bg-[#4c5aac]"
>
  Create User
</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddNewUser;
