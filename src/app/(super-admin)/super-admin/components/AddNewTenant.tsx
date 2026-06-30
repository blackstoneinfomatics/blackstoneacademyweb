"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { UploadCloud, FileText ,Trash2,Check } from "lucide-react";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { Info, CloudUpload } from "lucide-react";
type Props = {
  readonly onClose: () => void;
};

type ReviewProps = {
  label: string;
  value: string;
};

type TenantFormData = {
  companyName: string;
  comments: string;
  email: string;
  phone: string;
  domain: string;
  gstNo: string;
  panNo: string;
  faxNo: string;
  website: string;
  status: string;
  timeZone: string;
  plan: string;
  currency: string;
  country: string;
  state: string;
  city: string;
  street: string;
  landmark: string;
  pincode: string;
  tenantBackup: boolean;
  logo: File | null;
  gstCertificate: File | null;
  registrationCertificate: File | null;
  addressProof: File | null;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
};

function DocumentRow({
  name,
}: {
  name?: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2">

        <FileText
          size={16}
          className="text-[#5967E8]"
        />

        <span className="text-sm">
          {name || "-"}
        </span>

      </div>

      <Check
        size={16}
        className="text-green-500"
      />

    </div>
  );
}


function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[120px_10px_1fr]">

      <span className="text-[#6B7280]">
        {label}
      </span>

      <span>:</span>

      <span className="font-medium">
        {value || "-"}
      </span>

    </div>
  );
}
type UploadCardProps = {
  title: string;
  name: keyof Pick<
    TenantFormData,
    "logo" | "gstCertificate" | "registrationCertificate" | "addressProof"
  >;
  accept?: string;
  file: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<TenantFormData>>;
};

function UploadCard({
  title,
  name,
  file,
  accept = ".pdf,.png,.jpg,.jpeg",
  handleFileUpload,
  setFormData,
}: UploadCardProps) {
  return (
    <div className="border rounded-xl p-5 bg-white">

      <h4 className="font-semibold mb-4">{title}</h4>

<label className="w-full border border-dashed border-[#5967E8] rounded-lg h-20 flex flex-col justify-center items-center cursor-pointer bg-[#F8F9FF] hover:bg-[#EEF2FF] transition">
        <UploadCloud
          size={28}
          className="text-[#5967E8]"
        />

<p className="text-gray-500 mt-1 text-xs">          Click or Drag & Drop
        </p>

        <input
          hidden
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileUpload}
        />

      </label>

      {file && (

        <div className="mt-4 flex items-center justify-between border rounded-lg px-3 py-2 bg-white">

          <div className="flex items-center gap-3 min-w-0">

            <FileText
              size={18}
              className="text-[#5967E8] flex-shrink-0"
            />

            <span className="text-sm truncate">
              {file.name}
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              setFormData((prev: any) => ({
                ...prev,
                [name]: null,
              }))
            }
            className="text-[#6B7280] hover:text-red-500 transition"
          >
            <Trash2 size={18} />
          </button>

        </div>

      )}

    </div>
  );
}
export default function AddNewTenant({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    domain: "",
    gstNo: "",
    panNo: "",
    faxNo: "",
    website: "",
comments:"",
    status: "",
    timeZone: "",
    plan: "",
    currency: "",

    country: "",
    state: "",
    city: "",
    street: "",
    landmark: "",
    pincode: "",

    tenantBackup: false,

    logo: null as File | null,
    gstCertificate: null as File | null,
    registrationCertificate: null as File | null,
    addressProof: null as File | null,

    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const next = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const previous = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const steps = [
    "Basic Information",
    "Upload Documents",
    "Review",
    "Invite Admin",
  ];

  const handleSubmit = async () => {
    try {
      // API Call
      // await axios.post(...);

      setSuccessMessage("Tenant has been created successfully.");
      setSuccess(true);

      onClose(); // optional if you want to close the wizard
    } catch (error: any) {
      setFailedMessage(
        error?.response?.data?.message || "Failed to create tenant.",
      );
      setFailed(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (!files || files.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[92vh] overflow-hidden">
        {" "}
        {/* Header */}
        <div className="flex justify-between items-center border-b px-8 py-5">
          <div>
            <h2 className="text-2xl font-semibold">Add New Tenant</h2>

            <p className="text-sm text-gray-500 mt-1">
              Create a new tenant for your platform.
            </p>
          </div>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        {/* Body */}
        <div className="p-8 h-[calc(92vh-82px)] overflow-y-auto overflow-x-hidden">
          {" "}
          {/* Stepper */}
<div className="w-full overflow-hidden">
 <div className="w-full mb-12">
  <div className="grid grid-cols-4 gap-6">

    {steps.map((item, index) => {
      const step = index + 1;

      return (
        <div key={step} className="flex flex-col items-center relative">

          {index !== steps.length - 1 && (
            <div
              className={`absolute top-4 left-1/2 w-full h-[3px]
              ${currentStep > step ? "bg-[#5967E8]" : "bg-gray-300"}`}
            />
          )}

          <div
            className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-semibold
            ${
              currentStep >= step
                ? "bg-[#5967E8] text-white"
                : "bg-[#D9D9D9] text-[#666]"
            }`}
          >
            {step}
          </div>

          <p
            className={`mt-3 text-center text-xs leading-4
            ${
              currentStep === step
                ? "text-[#5967E8] font-semibold"
                : "text-gray-500"
            }`}
          >
            {item}
          </p>

        </div>
      );
    })}

  </div>
</div>
          {/* ========================= */}
          {/* STEP CONTENT START */}
          {/* ========================= */}
          {currentStep === 1 && (
            <>
              <h3 className="text-xl font-semibold mb-8">Basic Information</h3>

              <div className="space-y-10">
                {/* Company Information */}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-[#1F2937] mb-6">
                    Company Information
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInput}
                        placeholder="Enter company name"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-[#5967E8]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInput}
                        placeholder="Enter email"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-[#5967E8]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInput}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Domain
                      </label>

                      <input
                        type="text"
                        name="domain"
                        value={formData.domain}
                        onChange={handleInput}
                        placeholder="company.com"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GST Number
                      </label>

                      <input
                        type="text"
                        name="gstNo"
                        value={formData.gstNo}
                        onChange={handleInput}
                        placeholder="GST Number"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        PAN Number
                      </label>

                      <input
                        type="text"
                        name="panNo"
                        value={formData.panNo}
                        onChange={handleInput}
                        placeholder="PAN Number"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fax Number
                      </label>

                      <input
                        type="text"
                        name="faxNo"
                        value={formData.faxNo}
                        onChange={handleInput}
                        placeholder="Fax Number"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Website URL
                      </label>

                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInput}
                        placeholder="https://example.com"
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Tenant Configuration */}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-[#1F2937] mb-6">
                    Tenant Configuration
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Status
                      </label>

                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInput}
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      >
                        <option value="">Select Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Time Zone
                      </label>

                      <select
                        name="timeZone"
                        value={formData.timeZone}
                        onChange={handleInput}
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      >
                        <option value="">Select Time Zone</option>
                        <option>Asia/Kolkata</option>
                        <option>UTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subscription Plan
                      </label>

                      <select
                        name="plan"
                        value={formData.plan}
                        onChange={handleInput}
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      >
                        <option>Select Plan</option>
                        <option>Basic</option>
                        <option>Standard</option>
                        <option>Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Currency
                      </label>

                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInput}
                        className="w-full h-11 border border-gray-300 rounded-lg px-4"
                      >
                        <option>Select Currency</option>
                        <option>INR</option>
                        <option>USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="tenantBackup"
                      checked={formData.tenantBackup}
                      onChange={handleInput}
                      className="w-5 h-5"
                    />

                    <span className="text-sm">
                      Enable Automatic Tenant Backup
                    </span>
                  </div>
                </div>

                {/* Address */}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold mb-6">
                    Address Information
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleInput}
                      placeholder="Country"
                      className="h-11 border rounded-lg px-4"
                    />

                    <input
                      name="state"
                      value={formData.state}
                      onChange={handleInput}
                      placeholder="State"
                      className="h-11 border rounded-lg px-4"
                    />

                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInput}
                      placeholder="City"
                      className="h-11 border rounded-lg px-4"
                    />

                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInput}
                      placeholder="Pincode"
                      className="h-11 border rounded-lg px-4"
                    />
                  </div>

                  <div className="mt-6">
                    <input
                      name="street"
                      value={formData.street}
                      onChange={handleInput}
                      placeholder="Street Address"
                      className="w-full h-11 border rounded-lg px-4"
                    />
                  </div>

                  <div className="mt-6">
                    <input
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInput}
                      placeholder="Landmark"
                      className="w-full h-11 border rounded-lg px-4"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
         {currentStep === 2 && (
  <div>
    <h3 className="text-2xl font-semibold mb-2">
      Upload Documents
    </h3>

    {/* Info Box */}
    <div className="mb-5 rounded-lg bg-[#EEF2FF] p-4">
      <div className="flex items-center gap-3 mb-2">
        <CloudUpload size={16} className="text-[#5967E8]" />
        <span className="text-sm text-[#374151]">
          Please upload the required documents to create tenant account.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Info size={16} className="text-[#5967E8]" />
        <span className="text-sm text-[#374151]">
          Accepted formats: PDF, JPG, PNG (Max size: 5MB each)
        </span>
      </div>
    </div>

    {/* Upload List */}
    <div className="space-y-6">

      <UploadCard
        title="Company Logo"
        name="logo"
        file={formData.logo}
        accept=".png,.jpg,.jpeg"
        handleFileUpload={handleFileUpload}
        setFormData={setFormData}
      />

      <UploadCard
        title="GST Certificate"
        name="gstCertificate"
        file={formData.gstCertificate}
        handleFileUpload={handleFileUpload}
        setFormData={setFormData}
      />

      <UploadCard
        title="Registration Certificate"
        name="registrationCertificate"
        file={formData.registrationCertificate}
        handleFileUpload={handleFileUpload}
        setFormData={setFormData}
      />

      <UploadCard
        title="Address Proof"
        name="addressProof"
        file={formData.addressProof}
        handleFileUpload={handleFileUpload}
        setFormData={setFormData}
      />

    </div>
  </div>
)}
          {currentStep === 3 && (
  <div>

    <h3 className="text-2xl font-semibold mb-6">
      Review Details
    </h3>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Tenant Information */}

      <div className="border rounded-lg p-5">

        <h4 className="font-semibold text-[#1F2937] mb-5">
          Tenant Information
        </h4>

        <div className="space-y-4 text-sm">

          <ReviewRow
            label="Company Name"
            value={formData.companyName}
          />

          <ReviewRow
            label="Email"
            value={formData.email}
          />

          <ReviewRow
            label="Phone"
            value={formData.phone}
          />

          <ReviewRow
            label="Domain"
            value={formData.domain}
          />

          <ReviewRow
            label="Plan"
            value={formData.plan}
          />

          <ReviewRow
            label="Time Zone"
            value={formData.timeZone}
          />

          <ReviewRow
            label="Currency"
            value={formData.currency}
          />

          <ReviewRow
            label="Address"
            value={`${formData.city}, ${formData.country}`}
          />

        </div>

      </div>

      {/* Documents */}

      <div className="border rounded-lg p-5">

        <h4 className="font-semibold text-[#1F2937] mb-5">
          Documents
        </h4>

        <div className="space-y-4">

          <DocumentRow
            name={formData.logo?.name}
          />

          <DocumentRow
            name={formData.gstCertificate?.name}
          />

          <DocumentRow
            name={formData.registrationCertificate?.name}
          />

          <DocumentRow
            name={formData.addressProof?.name}
          />

        </div>

      </div>

    </div>

  </div>
)}
          {currentStep === 4 && (
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Invite Tenant Admin
              </h3>

              <p className="text-gray-500 mb-8">
                Create the primary administrator account for this tenant.
              </p>

              <div className="border rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Full Name */}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Admin Name
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleInput}
                      placeholder="Enter full name"
                      className="w-full h-11 border rounded-lg px-4"
                    />
                  </div>

                  {/* Email */}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Admin Email
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleInput}
                      placeholder="admin@company.com"
                      className="w-full h-11 border rounded-lg px-4"
                    />
                  </div>

 {/* Role */}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Designation
                    </label>

                    <input
                      value="Tenant Admin"
                      disabled
                      className="w-full h-11 border rounded-lg px-4 bg-gray-100"
                    />
                  </div>
                  {/* Phone */}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      name="adminPhone"
                      value={formData.adminPhone}
                      onChange={handleInput}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full h-11 border rounded-lg px-4"
                    />
                  </div>

 {/* Role */}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Comments
                    </label>

                    <input
                      value="Share Your Comments"
                      disabled
                      className="w-full h-20  px-4 rounded-lg border bg-[#F8F9FF]"
                    />
                  </div>
                  {/* Phone */}

                 
                 
                </div>



                {/* <div className="mt-8 rounded-lg border bg-[#F8F9FF] p-5">
                  <p className="text-sm text-gray-600 leading-7">
                    An invitation email will be sent to the tenant
                    administrator.
                    <br />
                  </p>
                </div> */}
              </div>
            </div>
          )}
          {/* Footer */}
          <div className="flex justify-between mt-12 border-t pt-6">
            <button
              onClick={currentStep === 1 ? onClose : previous}
              className="border border-[#5967E8] text-[#5967E8] px-8 py-2 rounded-lg flex items-center gap-2"
            >
              <ChevronLeft size={18} />

              {currentStep === 1 ? "Cancel" : "Back"}
            </button>

            <button
              onClick={() => {
                if (currentStep === 4) {
                  setShowSuccess(true);

                  return;
                }

                next();
              }}
              className="bg-[#5967E8] text-white px-8 py-2 rounded-lg flex items-center gap-2"
            >
              {currentStep === 4 ? "Send Invite" : "Next"}

              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {success && (
          <SuccessPopup
            onClose={() => setSuccess(false)}
            title={successMessage}
          />
        )}
        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </div>
      </div>
    </div>
  );
}
