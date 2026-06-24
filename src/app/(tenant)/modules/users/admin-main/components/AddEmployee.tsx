"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Country, State, City, ICountry, ICity } from "country-state-city";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppFailureToastMessages, appSuccessToastMessages } from "@/app/_components/contents/toast_message";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | string;
  nationality: string;
  country: string;
  city: string;
  dateOfBirth: string;
  gender: string;
  residentialAddress: string;
  higherQualification: string;
  universityName: string;
  previousJob: string;
  experience: string;
  bankName: string;
  accountNumber: number | string;
  bankCode: string;
  passportNumber: string;
  languagesKnown: string[];
  emergencyContactNumber: number | string;
  relationshipWithEmployee: string;
  address: string;
  designation: string;
  department: string;
  preferedWorkingHours: number | string;
  preferedShiftFrom: string;
  preferedShiftTo: string;
  comments: string;
  profileImage: string | null;
  applicationDate: string;
  currency: string;
  expectedSalary: number | string;
  applicationStatus: string;
  preferedWorkingDays: string[];
  status: string;
}

interface AddEmployeeProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nationality: "",
    country: "",
    city: "",
    dateOfBirth: "",
    gender: "",
    residentialAddress: "",
    higherQualification: "",
    universityName: "",
    previousJob: "",
    experience: "",
    bankName: "",
    accountNumber: "",
    bankCode: "",
    passportNumber: "",
    languagesKnown: [],
    emergencyContactNumber: "",
    relationshipWithEmployee: "",
    address: "",
    designation: "",
    department: "",
    preferedWorkingHours: 8,
    preferedShiftFrom: "09:00",
    preferedShiftTo: "17:00",
    comments: "", // Make sure this is initialized as empty string, not null
    profileImage: null,
    applicationDate: new Date().toISOString(),
    currency: "USD",
    expectedSalary: "",
    applicationStatus: "Pending",
    preferedWorkingDays: [],
    status: "Active",
  });

  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [imageError, setImageError] = useState("");

  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      ["00", "30"].forEach((minute) => {
        const h = hour.toString().padStart(2, "0");
        times.push(`${h}:${minute}`);
      });
    }
    return times;
  };
  
  const timeOptions = generateTimeOptions();
  
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(c => c.name === formData.country);
      if (selectedCountry) {
        const allStates = State.getStatesOfCountry(selectedCountry.isoCode);
        const allCities = allStates.flatMap(state => City.getCitiesOfState(selectedCountry.isoCode, state.isoCode));
        setCities(allCities);
      } else {
        setCities([]);
      }
    }
  }, [formData.country, countries]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EmployeeFormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = AppValidationMessages.EMPLOYEE.FIRST_NAME_REQUIRED;
    if (!formData.lastName.trim()) newErrors.lastName = AppValidationMessages.EMPLOYEE.LAST_NAME_REQUIRED;
    if (!formData.email.trim()) {
      newErrors.email = AppValidationMessages.EMPLOYEE.EMAIL_REQUIRED;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = AppValidationMessages.EMPLOYEE.EMAIL_INVALID;
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = AppValidationMessages.EMPLOYEE.PHONE_REQUIRED;
    if (!formData.designation) newErrors.designation = AppValidationMessages.EMPLOYEE.DESIGNATION_REQUIRED;
    if (!formData.department) newErrors.department = AppValidationMessages.EMPLOYEE.DEPARTMENT_REQUIRED;
    if (!formData.comments.trim()) newErrors.comments = AppValidationMessages.EMPLOYEE.COMMENTS_REQUIRED; // Add comments validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formPayload = new FormData();
      
      // Add all fields individually to ensure proper formatting
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formPayload.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          // Ensure comments field is always sent as string, even if empty
          if (key === 'comments') {
            formPayload.append(key, value.toString() || ''); // Always send comments
          } else {
            formPayload.append(key, value.toString());
          }
        }
      });

      // Debug: log what we're sending
      console.log("Form data being sent:", Object.fromEntries(formPayload));

      await axios.post(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.OTHEREMPLOYEE.CREATE}`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(appSuccessToastMessages.EMPLOYEE_CREATED);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      if (error.response) {
        toast.error(error.response.data?.message || AppFailureToastMessages.EMPLOYEE_CREATE_FAILED);
      } else {
        toast.error(AppFailureToastMessages.NO_RESPONSE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    setImageError("")
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }

    if (!allowedTypes.includes(file.type)) {
      setImageError(AppFailureToastMessages.IMAGE_INVALID_FORMAT);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError(AppFailureToastMessages.IMAGE_TOO_LARGE);
      return;
    }
  };

  const handleCheckboxChange = (day: string) => {
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.preferedWorkingDays) 
        ? prev.preferedWorkingDays 
        : [];
      const days = new Set(currentDays);
      if (days.has(day)) {
        days.delete(day);
      } else {
        days.add(day);
      }
      return {
        ...prev,
        preferedWorkingDays: Array.from(days),
      };
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center overflow-auto">
      <div className="w-full max-w-4xl h-[90vh] bg-white dark:bg-[#1F1F1F] dark:text-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden m-4">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add Employee</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Phone Number
                </label>
                <input
                  type="number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="nationality" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C] [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option 
                      key={`${city.name}-${city.stateCode}-${city.countryCode}`} 
                      value={city.name}
                    >
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="residentialAddress" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Residential Address
                </label>
                <input
                  type="text"
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="higherQualification" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Highest Qualification
                </label>
                <input
                  type="text"
                  name="higherQualification"
                  value={formData.higherQualification}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="universityName" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  University/Institute Name
                </label>
                <input
                  type="text"
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="previousJob" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Previous Job Title
                </label>
                <input
                  type="text"
                  name="previousJob"
                  value={formData.previousJob}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Experience (in years)
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="bankName" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Account Number
                </label>
                <input
                  type="number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="bankCode" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Bank Code
                </label>
                <input
                  type="text"
                  name="bankCode"
                  value={formData.bankCode}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Passport Number
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="emergencyContactNumber" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Emergency Contact Number
                </label>
                <input
                  type="number"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="relationshipWithEmployee" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Relationship with Employee
                </label>
                <input
                  type="text"
                  name="relationshipWithEmployee"
                  value={formData.relationshipWithEmployee}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="designation" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Designation
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                >
                  <option value="">Select Designation</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="ACADEMICCOACH">ACADEMIC COACH</option>
                  <option value="TEACHER">TEACHER</option>
                </select>
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="preferedWorkingHours" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Preferred Working Hours
                </label>
                <input
                  type="number"
                  name="preferedWorkingHours"
                  value={formData.preferedWorkingHours}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="preferedShiftFrom" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Preferred Shift From
                </label>
                <select
                  name="preferedShiftFrom"
                  value={formData.preferedShiftFrom}
                  onChange={handleChange}
                  className="w-full dark:bg-[#343434] border border-gray-300 dark:border-[#5c5c5c] rounded-lg px-4 py-2 text-xs text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Time</option>
                  {timeOptions.map((time) => (
                    <option key={`from-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="preferedShiftTo" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Preferred Shift To
                </label>
                <select
                  name="preferedShiftTo"
                  value={formData.preferedShiftTo}
                  onChange={handleChange}
                  className="w-full dark:bg-[#343434] border border-gray-300 dark:border-[#5C5C5C] rounded-lg px-4 py-2 text-xs text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Time</option>
                  {timeOptions.map((time) => (
                    <option key={`to-${time}`} value={time}
                  disabled={time === formData.preferedShiftFrom}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="languagesKnown" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Languages Known
                </label>
                <input
                  type="text"
                  name="languagesKnown"
                  value={formData.languagesKnown.join(", ")}
                  onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                          ...prev,
                          languagesKnown: value ? value.split(",").map(lang => lang.trim()) : [],
                      }));
                  }}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                >
                  <option value="">Select Currency</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="AED">AED</option>
                </select>
              </div>
              <div>
                <label htmlFor="expectedSalary" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Expected Salary
                </label>
                <div className="flex gap-2">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="USD"> $</option>
                    <option value="INR"> ₹</option>
                    <option value="EUR"> €</option>
                    <option value="GBP"> £</option>
                    <option value="AED"> د.إ</option>
                  </select>
                  <input
                    type="number"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profileImage" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="w-full text-[10px] dark:bg-[#343434] border dark:border-[#5C5C5C] rounded-lg px-4 py-2"
                />
                <p className="text-[8px] text-gray-400 mt-1">
                  Allowed formats: JPG, PNG &nbsp; | &nbsp;  Max size: 2MB
                </p>
                {imageError && (
                  <p className="text-[10px] text-red-500 mt-1">{imageError}</p>
                )}
              </div>
              <div>
                <label htmlFor="preferedWorkingDays" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Preferred Working Days
                </label>
                <div className="flex flex-wrap gap-3 flex-col-6">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <label key={day} className="flex items-center space-x-2 text-xs">
                      <input
                        type="checkbox"
                        checked={formData.preferedWorkingDays.includes(day)}
                        onChange={() => handleCheckboxChange(day)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comments" className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]">
                  Additional Comments *
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  placeholder="Enter comments here..."
                  required
                />
                {errors.comments && <p className="text-red-500 text-xs mt-1">{errors.comments}</p>}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2  text-sm bg-[#576CBC] text-white rounded-lg hover:bg-[#4459A9] disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;