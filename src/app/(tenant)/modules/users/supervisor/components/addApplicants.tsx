"use client";

import axios, { AxiosError } from "axios";
import { Paperclip } from "lucide-react";
import React, { useEffect, useState } from "react";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import {
  Country,
  State,
  City,
  ICountry,
  ICity,
  IState,
} from "country-state-city";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast, ToastContainer } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { appSuccessToastMessages, AppFailureToastMessages } from "@/app/_components/contents/toast_message";
type Props = {
  readonly onClose: () => void;
};

interface Experience {
  jobRole: string;
  organizationName: string;
  jobLocation: string;
  fromDate: string;
  toDate: string;
  jobDescription: string;
}

interface AddApplicantFormData {
  applicationDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  gender: string;
  city: string;
  skills: string;
  position: string;
  expectedSalary: string;
  workingHours: string;
  professionalExperience: Experience[];
  skillList: string[];
  resume: File | null | undefined;
  comment: string;
}

export default function AddApplicants({ onClose }: Props) {
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [addApplicantForm, setAddApplicantForm] =
    useState<AddApplicantFormData>({
      applicationDate: new Date().toISOString().split("T")[0],
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      country: "",
      state: "",
      city: "",
      position: "Arabic Teacher",
      expectedSalary: "",
      workingHours: "",
      skills: "",
      professionalExperience: [],
      skillList: [],
      resume: null,
      comment: "",
    });
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      jobRole: "",
      organizationName: "",
      jobLocation: "",
      fromDate: "",
      toDate: "",
      jobDescription: "",
    },
  ]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [startHour, setStartHour] = useState("");
const [startMinute, setStartMinute] = useState("");

const [endHour, setEndHour] = useState("");
const [endMinute, setEndMinute] = useState("");

const updateWorkingHours = (sh : any, sm : any, eh: any, em: any) => {
  if (!sh || !sm || !eh || !em) return;

  const start = `${sh}:${sm}`;
  const end = `${eh}:${em}`;

  setAddApplicantForm(prev => ({
    ...prev,
    workingHours: `${start} - ${end}`
  }));
};
const hours = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);

const minutes = ["00", "30"];


  const handleChange1 = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  // Add a new empty experience form
  const addExperienceForm = () => {
    setExperiences((prev) => [
      ...prev,
      {
        jobRole: "",
        organizationName: "",
        jobLocation: "",
        fromDate: "",
        toDate: "",
        jobDescription: "",
      },
    ]);
  };
  const removeExperienceForm = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  // You might want to validate here or on submit
  const canAddNewForm = experiences.every(
    (exp) =>
      exp.jobRole &&
      exp.organizationName &&
      exp.jobLocation &&
      exp.fromDate &&
      exp.toDate
  );

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setAddApplicantForm((prev) => ({ ...prev, [name]: value }));
  }
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);
  useEffect(() => {
    if (addApplicantForm.country) {
      const selectedCountry = countries.find(
        (c) => c.name === addApplicantForm.country
      );
      if (selectedCountry) {
        const allStates = State.getStatesOfCountry(selectedCountry.isoCode);
        const allCities = allStates.flatMap((state) =>
          City.getCitiesOfState(selectedCountry.isoCode, state.isoCode)
        );

        // 🔥 Deduplicate by city name
        const uniqueCities = Array.from(
          new Map(allCities.map((city) => [city.name, city])).values()
        );

        setCities(uniqueCities);
      } else {
        setCities([]);
      }
    }
  }, [addApplicantForm.country, countries]);

const validateForm = () => {
  if (!addApplicantForm.firstName.trim()) {
    toast.error(
      AppValidationMessages.APPLICANT.FIRST_NAME.required
    );
    return false;
  }

  if (!addApplicantForm.lastName.trim()) {
    toast.error(
      AppValidationMessages.APPLICANT.LAST_NAME.required
    );
    return false;
  }

  if (!addApplicantForm.email.trim()) {
    toast.error(
      AppValidationMessages.APPLICANT.EMAIL.required
    );
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(addApplicantForm.email)) {
    toast.error(
      AppValidationMessages.APPLICANT.EMAIL.pattern
    );
    return false;
  }

  if (!addApplicantForm.phone.trim()) {
    toast.error(
      AppValidationMessages.APPLICANT.PHONE.required
    );
    return false;
  }

  if (!/^[0-9]{8,15}$/.test(addApplicantForm.phone)) {
    toast.error(
      AppValidationMessages.APPLICANT.PHONE.pattern
    );
    return false;
  }

  if (!addApplicantForm.city.trim()) {
    toast.error(
      AppValidationMessages.APPLICANT.CITY.required
    );
    return false;
  }

  if (!addApplicantForm.country.trim()) {
    toast.error(
      AppValidationMessages.APPLICANT.COUNTRY.required
    );
    return false;
  }

  if (!addApplicantForm.gender) {
    toast.error(
      AppValidationMessages.APPLICANT.GENDER.required
    );
    return false;
  }

  if (!addApplicantForm.expectedSalary) {
    toast.error(
      AppValidationMessages.APPLICANT.EXPECTED_SALARY.required
    );
    return false;
  }

  if (!addApplicantForm.workingHours) {
    toast.error(
      AppValidationMessages.APPLICANT.WORKING_HOURS.required
    );
    return false;
  }

  if (addApplicantForm.skillList.length === 0) {
    toast.error(
      AppValidationMessages.APPLICANT.SKILLS.required
    );
    return false;
  }

  if (!addApplicantForm.resume) {
    toast.error(
      AppValidationMessages.APPLICANT.RESUME.required
    );
    return false;
  }

  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate first
  if (!validateForm()) {
    return;
  }

  const formData = new FormData();

  formData.append("applicationDate", addApplicantForm.applicationDate);
  formData.append("candidateFirstName", addApplicantForm.firstName);
  formData.append("candidateLastName", addApplicantForm.lastName);
  formData.append("candidateEmail", addApplicantForm.email);
  formData.append("candidatePhoneNumber", addApplicantForm.phone);
  formData.append("candidateCountry", addApplicantForm.country);
  formData.append("candidateCity", addApplicantForm.city);
  formData.append("positionApplied", addApplicantForm.position);
  formData.append("gender", addApplicantForm.gender);
  formData.append("skills", addApplicantForm.skillList.join(","));
  formData.append("currency", "$");
  formData.append("duration", "0");
  formData.append("meetingminutes", "");
  formData.append(
    "professionalExperience",
    JSON.stringify(experiences)
  );
  formData.append(
    "expectedSalary",
    addApplicantForm.expectedSalary
  );
  formData.append(
    "preferedWorkingHours",
    addApplicantForm.workingHours
  );
  formData.append("comments", addApplicantForm.comment);
  formData.append("applicationStatus", "NEWAPPLICATION");
  formData.append("overallRating", "1");
  formData.append("status", "Active");

  if (addApplicantForm.resume) {
    formData.append(
      "uploadResume",
      addApplicantForm.resume
    );
  }

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;

    if (!token) {
      toast.error(
        AppValidationMessages.AUTH.TOKEN_REQUIRED
      );
      return;
    }

    const response = await axios.post(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RECRUITMENT.CREATE_SUPERVISOR_RECRUIT}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if ([200, 201].includes(response.status)) {
      toast.success(
        appSuccessToastMessages.APPLICANT_CREATE
      );

      setSucces(true);

      setAddApplicantForm({
        applicationDate: new Date()
          .toISOString()
          .split("T")[0],
        firstName: "",
        lastName: "",
        email: "",
        state: "",
        phone: "",
        country: "USA",
        city: "",
        gender: "",
        position: "Arabic Teacher",
        expectedSalary: "",
        workingHours: "",
        skills: " ",
        skillList: [],
        professionalExperience: [],
        resume: null,
        comment: "",
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    }
  } catch (err) {
    const error = err as AxiosError;
    const status = error.response?.status;

    if (status === 400) {
      toast.error(
        AppFailureToastMessages.BAD_REQUEST
      );

      setFailedMessage(
        AppFailureToastMessages.BAD_REQUEST
      );

      setFailed(true);
    } else if (status === 401) {
      toast.error(
        AppFailureToastMessages.UNAUTHORIZED
      );

      setFailedMessage(
        AppFailureToastMessages.UNAUTHORIZED
      );

      setFailed(true);
    } else if (status === 403) {
      toast.error(
        AppFailureToastMessages.FORBIDDEN
      );

      setFailedMessage(
        AppFailureToastMessages.FORBIDDEN
      );

      setFailed(true);
    } else if (status === 500) {
      toast.error(
        AppFailureToastMessages.SERVER_ERROR
      );

      setFailedMessage(
        AppFailureToastMessages.SERVER_ERROR
      );

      setFailed(true);
    } else {
      toast.error(AppFailureToastMessages.APPLICANT_CREATE_FAILED);

      setFailedMessage(AppFailureToastMessages.APPLICANT_CREATE_FAILED);

      setFailed(true);

      console.error(`Unexpected error: ${status}`);
    }
  }
};
  useEffect(() => {
    if (addApplicantForm.country) {
      const selectedCountry = countries.find(
        (c) => c.name === addApplicantForm.country
      );

      if (selectedCountry) {
        const allStates = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(allStates);
        setCities([]); // clear cities when country changes
        console.log("📍 States:", allStates);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [addApplicantForm.country, countries]);

  // 🔹 Load cities when state changes
  useEffect(() => {
    if (addApplicantForm.country && addApplicantForm.state) {
      const selectedCountry = countries.find(
        (c) => c.name === addApplicantForm.country
      );
      const selectedState = states.find(
        (s) => s.name === addApplicantForm.state
      );

      if (selectedCountry && selectedState) {
        const allCities = City.getCitiesOfState(
          selectedCountry.isoCode,
          selectedState.isoCode
        );

        // 🔥 Deduplicate cities by name
        const uniqueCities = Array.from(
          new Map(allCities.map((city) => [city.name, city])).values()
        );

        setCities(uniqueCities);
        console.log("🏙️ Cities:", uniqueCities);
      }
    } else {
      setCities([]);
    }
  }, [addApplicantForm.state, addApplicantForm.country, states]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        setFailedMessage(AppFailureToastMessages.UPLOAD_INVALID_FORMAT);
        setFailed(true);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFailedMessage(AppFailureToastMessages.UPLOAD_FILE_TOO_LARGE);
        setFailed(true);
        return;
      }

      setAddApplicantForm((prev) => ({
        ...prev,
        resume: file,
      }));
    }
  };
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddApplicantForm((prev) => ({
      ...prev,
      skills: e.target.value,
    }));
  };
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && addApplicantForm.skills.trim()) {
      e.preventDefault();
      const newSkill = addApplicantForm.skills.trim();

      if (!addApplicantForm.skillList.includes(newSkill)) {
        setAddApplicantForm((prev) => ({
          ...prev,
          skillList: [...prev.skillList, newSkill],
          skills: "", // clear input
        }));
      }
    }
  };
  const removeSkill = (skillToRemove: string) => {
    setAddApplicantForm((prev) => ({
      ...prev,
      skillList: prev.skillList.filter((skill) => skill !== skillToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 ">
      <form
        className="bg-white dark:bg-[#1D1D1D] rounded-lg shadow-xl p-5 w-full max-w-4xl mx-3 text-sm scrollbar-none"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h1 className="text-lg font-semibold mt-2 text-black mb-3 dark:text-[#FFFFFF]">
          Add Applicant
        </h1>

        {/* Applicant Date */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}

          <div className="space-y-3">
            <div>
              <label
                htmlFor="inonoin"
                className="block text-sm font-normal text-black mb-1 dark:text-[#FFFFFF]"
              >
                Applicant Date
              </label>
              <input
                name="fromDate"
                value={addApplicantForm.applicationDate}
                onChange={handleChange}
                type="date"
                className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div>
              <label
                htmlFor="inonoin"
                className="block mb-1 text-black dark:text-white"
              >
                First Name
              </label>
              <input
                name="firstName"
                value={addApplicantForm.firstName}
                onChange={handleChange}
                type="text"
                className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div>
              <label
                htmlFor="inonoin"
                className="block mb-1 text-black dark:text-white"
              >
                Last Name
              </label>
              <input
                name="lastName"
                value={addApplicantForm.lastName}
                onChange={handleChange}
                type="text"
                className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div>
              <label
                htmlFor="inonoin"
                className="block mb-1 text-black dark:text-white"
              >
                Email
              </label>
              <input
                name="email"
                value={addApplicantForm.email}
                onChange={handleChange}
                type="email"
                className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              />
            </div>
            <div>
              <label
                htmlFor="Phone"
                className="block mb-1 text-black dark:text-white text-sm"
              >
                Phone Number
              </label>

              <div className="flex items-center w-full   text-xs dark:text-white dark:bg-[#343434] ">
               <PhoneInput
  defaultCountry="IN"
  value={addApplicantForm.phone}
  onChange={(value) => {
    // value = "+919876543210"

    if (!value) {
      setAddApplicantForm(prev => ({ ...prev, phone: "" }));
      setPhoneError(AppValidationMessages.APPLICANT.PHONE.pattern);
      return;
    }

    // Extract only digits (remove +)
    const digitsOnly = value.replace(/\D/g, ""); // "919876543210"

    // Remove the country code (first N digits)
    // For India (IN) dial code is 91
    const localNumber = digitsOnly.startsWith("91")
      ? digitsOnly.substring(2)
      : digitsOnly; // fallback

    setAddApplicantForm(prev => ({
      ...prev,
      phone: localNumber, // store only local number
    }));

    // Validation
    if (localNumber.length < 10) {
      setPhoneError(AppValidationMessages.APPLICANT.PHONE.pattern);
    } else {
      setPhoneError("");
    }
  }}
  className="w-full"
  inputClassName="!border-0 !outline-none !shadow-none !w-full dark:!bg-transparent text-xs"
/>

              </div>

              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="position"
                className="block mb-1 text-black dark:text-white"
              >
                Position Applied
              </label>
              <select
                name="position"
                value={addApplicantForm.position}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              >
                <option value="">Select Position</option>
                <option value="Quran Teacher">Quran Teacher</option>
                <option value="Arabic Teacher">Arabic Teacher</option>
                <option value="Islamic Teacher">Islamic Teacher</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="jbjb"
                className="block mb-2 text-black dark:text-white"
              >
                Upload Resume
              </label>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="resumeUpload"
                  className="cursor-pointer mb-2 inline-flex items-center px-3 py-1.5 bg-[#576CBC] text-white text-xs rounded hover:bg-blue-700 transition "
                >
                  <Paperclip size={14} className="mr-1" />
                  Upload Resume
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {addApplicantForm.resume
                    ? addApplicantForm.resume.name
                    : "No file chosen"}
                </span>
                <input
                  id="resumeUpload"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Country */}
            <div>
              <label className="block text-black dark:text-white">
                Country
              </label>
              <Listbox
                value={addApplicantForm.country}
                onChange={(val) =>
                  setAddApplicantForm({ ...addApplicantForm, country: val })
                }
              >
                <div className="relative mt-1">
                  <ListboxButton className="w-full h-9 border rounded px-3 py-2 text-left text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]">
                    {addApplicantForm.country || "Select Country"}
                  </ListboxButton>

                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#343434] shadow-lg">
                    {countries.map((c) => (
                      <ListboxOption
                        key={c.isoCode}
                        value={c.name}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {c.name}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>

            {/* State */}
            <div>
              <label className="text-sm text-[#010E30] dark:text-white">
                State
              </label>
              <Listbox
                value={addApplicantForm.state}
                onChange={(val) =>
                  setAddApplicantForm({
                    ...addApplicantForm,
                    state: val,
                    city: "",
                  })
                }
                disabled={!addApplicantForm.country}
              >
                <div className="relative mt-1">
                  <ListboxButton
                    className={`w-full h-8 border rounded px-3 py-2 text-left text-xs
            ${!addApplicantForm.country ? "opacity-50 cursor-not-allowed" : ""}
           border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]`}
                  >
                    {addApplicantForm.country
                      ? addApplicantForm.state || "Select State"
                      : "Select Country First"}
                  </ListboxButton>

                  {addApplicantForm.country && (
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#343434] shadow-lg">
                      {states.length > 0 ? (
                        states.map((state) => (
                          <ListboxOption
                            key={state.isoCode}
                            value={state.name}
                            className="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            {state.name}
                          </ListboxOption>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                          No states available
                        </div>
                      )}
                    </ListboxOptions>
                  )}
                </div>
              </Listbox>
            </div>

            {/* City */}
            <div>
              <label className="block text-black dark:text-white">City</label>
              <Listbox
                value={addApplicantForm.city}
                onChange={(val) =>
                  setAddApplicantForm({ ...addApplicantForm, city: val })
                }
                disabled={!addApplicantForm.state}
              >
                <div className="relative mt-1">
                  <ListboxButton className="w-full h-8 border rounded px-3 py-2 text-left text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]">
                    {addApplicantForm.city || "Select City"}
                  </ListboxButton>

                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#343434] shadow-lg">
                    {cities.map((city) => (
                      <ListboxOption
                        key={city.name}
                        value={city.name}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {city.name}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-black dark:text-white">Gender</label>
              <select
                name="gender"
                value={addApplicantForm.gender}
                onChange={handleChange}
                className="w-full border mt-1 rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-black dark:text-white">
                Expected Salary / Hour
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs  text-gray-900 dark:text-white">
                  $
                </span>
                <input
                  name="expectedSalary"
                  value={addApplicantForm.expectedSalary}
                  onChange={handleChange}
                  type="number"
                  className="w-full border pl-6 rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                />
              </div>
            </div>

            {/* Working Hours */}
        <div>
  <label className="block text-black dark:text-white">Preferred Working Hours</label>

  <div className="flex items-center gap-2 mt-1">

    {/* Start Hour */}
    <select
      value={startHour}
      onChange={(e) => {
        setStartHour(e.target.value);
        updateWorkingHours(e.target.value, startMinute, endHour, endMinute);
      }}
      className="border rounded px-2 py-2 text-xs w-16 dark:text-white dark:bg-[#343434]"
    >
      <option value="">HH</option>
      {hours.map((h) => (
        <option key={h} value={h}>{h}</option>
      ))}
    </select>

    {/* Start Minute */}
    <select
      value={startMinute}
      onChange={(e) => {
        setStartMinute(e.target.value);
        updateWorkingHours(startHour, e.target.value, endHour, endMinute);
      }}
      className="border rounded px-2 py-2 text-xs w-16 dark:text-white dark:bg-[#343434]"
    >
      <option value="">MM</option>
      {minutes.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>

    <span className="text-black dark:text-white">-</span>

    {/* End Hour */}
    <select
      value={endHour}
      onChange={(e) => {
        setEndHour(e.target.value);
        updateWorkingHours(startHour, startMinute, e.target.value, endMinute);
      }}
      className="border rounded px-2 py-2 text-xs w-16 dark:text-white dark:bg-[#343434]"
    >
      <option value="">HH</option>
      {hours.map((h) => (
        <option key={h} value={h}>{h}</option>
      ))}
    </select>

    {/* End Minute */}
    <select
      value={endMinute}
      onChange={(e) => {
        setEndMinute(e.target.value);
        updateWorkingHours(startHour, startMinute, endHour, e.target.value);
      }}
      className="border rounded px-2 py-2 text-xs w-16 dark:text-white dark:bg-[#343434]"
    >
      <option value="">MM</option>
      {minutes.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  </div>

  <input type="hidden" name="workingHours" value={addApplicantForm.workingHours} />

  <p className="text-xs text-gray-500 dark:text-gray-400">
    Selected: {addApplicantForm.workingHours || "None"}
  </p>
</div>


          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-4">
          <label
            htmlFor="skills"
            className="block mb-1 text-black dark:text-white"
          >
            Skills
          </label>
          <input
            name="skills"
            value={addApplicantForm.skills}
            onChange={handleSkillChange}
            onKeyDown={handleSkillKeyDown}
            type="text"
            placeholder="Type a skill and press Enter"
            className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          />

          {/* Show added skills below */}
          <div className="mt-2 flex flex-wrap gap-2">
            {addApplicantForm.skillList.map((skill, idx) => (
              <button
                key={skill}
                className="bg-[#576CBC] text-white text-xs px-2 py-1 rounded cursor-pointer"
                onClick={() => removeSkill(skill)}
              >
                {skill} ✕
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label
            htmlFor="vhviuv"
            className="text-sm text-black dark:text-white mb-2 block"
          >
            Add Experience
          </label>
          <div
            style={{ maxHeight: "700px" }} // adjust height as you want
            className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
          >
            {/* Render multiple experience input forms */}
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="mb-4 p-5 border rounded border-[#5C5C5C] dark:border-[#5C5C5C] dark:text-white relative"
              >
                <button
                  type="button"
                  onClick={() => removeExperienceForm(index)}
                  className="absolute top-1  text-2xl  right-1 text-red-500 font-semibold hover:text-red-700"
                >
                  ×
                </button>

                <input
                  placeholder="Role"
                  className="w-full mb-2 px-3 py-2 border rounded text-xs border-[#5C5C5C] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={exp.jobRole}
                  onChange={(e) =>
                    handleChange1(index, "jobRole", e.target.value)
                  }
                />
                <input
                  placeholder="Organization"
                  className="w-full mb-2 px-3 py-2 border rounded text-xs border-[#5C5C5C] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={exp.organizationName}
                  onChange={(e) =>
                    handleChange1(index, "organizationName", e.target.value)
                  }
                />
                <input
                  placeholder="Place"
                  className="w-full mb-2 px-3 py-2 border rounded text-xs border-[#5C5C5C] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={exp.jobLocation}
                  onChange={(e) =>
                    handleChange1(index, "jobLocation", e.target.value)
                  }
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    className="w-1/2 px-3 py-2 border rounded text-xs border-[#5C5C5C] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                    value={exp.fromDate}
                    onChange={(e) =>
                      handleChange1(index, "fromDate", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    className="w-1/2 px-3 py-2 border rounded text-xs border-[#5C5C5C] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                    value={exp.toDate}
                    onChange={(e) =>
                      handleChange1(index, "toDate", e.target.value)
                    }
                  />
                </div>
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-xs border-[#5C5C5C] text-[#343434] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  value={exp.jobDescription}
                  onChange={(e) =>
                    handleChange1(index, "jobDescription", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          {/* Add new experience form button */}
          <button
            type="button"
            onClick={addExperienceForm}
            disabled={!canAddNewForm}
            className={`px-4 py-1 rounded text-white ${
              canAddNewForm
                ? "bg-[#576CBC] hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Add Another Experience
          </button>
        </div>

        <div className="mt-4">
          <label
            htmlFor="inonoin"
            className="block mb-1 text-black dark:text-white"
          >
            Comments
          </label>
          <textarea
            name="comment"
            value={addApplicantForm.comment}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 text-xs border-[#5C5C5C] dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition "
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>

      {success && (
        <SuccessPopup onClose={() => setSucces(false)} title="Applicant" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
    </div>
  );
}
