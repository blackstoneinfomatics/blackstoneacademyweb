"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import type { E164Number } from "libphonenumber-js";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import schedule from "@/app/(tenant)/modules/users/admin-main/components/schedule";
import {
  CalendarDays,
  Trash2,
  Clock3,
  CheckCircle,
  PlusCircle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import { getSocket } from "@/app/utils/socket";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type LeaveFormProps = {
  readonly onClose: () => void;
};

type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: string[];
  children?: React.ReactNode;
  disabled?: boolean;
};

export interface StudentForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: E164Number | undefined;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  language: string;
  preferredTeacher: string;
  preferredDate: string;
  preferredHours: string;
  classType: string;
  selectTeacher: string;
  guardianName: string;
  guardianPhone: E164Number | undefined;
  guardianEmail: string;
  studentStatus: string;
  timeZone: string;
  course: string;
  level: string;
  preferredPackage: string;
  classStatus: string;
  preferredTime: { day: string; from: string; to: string }[];
}
interface Teacher {
  _id: string;
  userName: string;
  email: string;
  password: string;
  role: string[]; // Array of roles, e.g., "TEACHER"
  profileImage: string | null; // Could be a URL or null
  status: string; // Active/Inactive status
  createdBy: string; // Who created the record
  lastUpdatedBy: string; // Who last updated the record
  userId: string; // Unique ID for the user
  lastLoginDate: string; // Last login timestamp
  createdDate: string; // Creation timestamp
  lastUpdatedDate: string; // Last update timestamp
}
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  day: string;
  times: TimeSlot[];
  isSelected: boolean;
}
interface TeacherList {
  teacherId: string;
  teacherName: string;
}
interface Teacher {
  _id: string;
  userName: string;
  email: string;
  password: string;
  role: string[];
  profileImage: string | null;
  status: string;
  createdBy: string;
  lastUpdatedBy: string;
  userId: string;
  lastLoginDate: string;
  createdDate: string;
  lastUpdatedDate: string;
}
type WeeklySlotMap = {
  [day: string]: { from: string; to: string }[];
};
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleItem {
  day: string;
  times: TimeSlot[];
  isSelected: boolean;
}
export default function LeaveForm({ onClose }: LeaveFormProps) {
  const [form, setForm] = useState<StudentForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: undefined,
    country: "",
    city: "",
    state: "",
    language: "",
    preferredTeacher: "",
    preferredDate: "",
    preferredHours: "",
    countryCode: "+91",
    classType: "",
    selectTeacher: "",
    guardianName: "",
    guardianPhone: undefined,
    guardianEmail: "",
    studentStatus: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    course: "",
    level: "",
    preferredPackage: "",
    classStatus: "",
    preferredTime: [],
  });
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [teachers, setTeachers] = useState<TeacherList[]>([]);
  const handleNext = () => setCurrentStep((s) => s + 1);
  const handleBack = () => setCurrentStep((s) => s - 1);
  const packageRates: { [key: string]: number } = {
    Simple: 8,
    Essential: 9,
    Pro: 11,
    Elite: 16,
  };
  useEffect(() => {
    const rate = packageRates[form.preferredPackage] || 0;
    setTotalAmount(rate * Number(form.preferredHours) * 4);
  }, [form.preferredPackage, form.preferredHours]);

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
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);
  const timeZones = useMemo(() => {
    return (
      Intl.supportedValuesOf("timeZone")
        .map((tz) => {
          const parts = Intl.DateTimeFormat(undefined, {
            timeZone: tz,
            timeZoneName: "shortOffset",
          }).formatToParts();

          const offsetPart = parts.find((part) => part.type === "timeZoneName");

          return {
            name: tz,
            label: tz.replace("_", " ").replace("/", " / "),
            offset: offsetPart?.value ?? "",
          };
        })
        // Optional: Sort by offset then name
        .sort((a, b) => {
          if (a.offset !== b.offset) return a.offset.localeCompare(b.offset);
          return a.name.localeCompare(b.name);
        })
    );
  }, []);
  useEffect(() => {
    if (form.country) {
      const selectedCountry = countries.find((c) => c.name === form.country);

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
  }, [form.country, countries]);

  useEffect(() => {
    if (form.country && form.state) {
      const selectedCountry = countries.find((c) => c.name === form.country);
      const selectedState = states.find((s) => s.name === form.state);

      if (selectedCountry && selectedState) {
        const allCities = City.getCitiesOfState(
          selectedCountry.isoCode,
          selectedState.isoCode
        );

        const uniqueCities = Array.from(
          new Map(allCities.map((city) => [city.name, city])).values()
        );

        setCities(uniqueCities);
        console.log("🏙️ Cities:", uniqueCities);
      }
    } else {
      setCities([]);
    }
  }, [form.state, form.country, states]);

  const [selectedTeacher, setSelectedTeacher] = useState<TeacherList | null>(
    null
  );
  const [startDate, setStartDate] = useState("");
  const [trailStartDate, setTrailStartDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [fromHour, setFromHour] = useState("");
  const [fromMinute, setFromMinute] = useState("");
  const [suggestedSlots, setSuggestedSlots] = useState<WeeklySlotMap>({});
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      times: [],
      isSelected: false,
    }))
  );
  const weeklyHourLimit = form.preferredHours;
  const isGroupClass = form.classType === "GROUPCLASS";
  const buildWeeklySlots = () => {
    const map: WeeklySlotMap = {};
    schedule.forEach((item) => {
      if (item.isSelected && item.times.length > 0) {
        map[item.day] = item.times.map((t) => ({
          from: t.startTime,
          to: t.endTime,
        }));
      }
    });
    return map;
  };

  const calculateTotalHours = () => {
    let totalHours = 0;

    schedule.forEach((item) => {
      if (item.isSelected) {
        item.times.forEach((time) => {
          if (time.startTime && time.endTime) {
            const start = new Date(`2023-01-01T${time.startTime}`);
            const end = new Date(`2023-01-01T${time.endTime}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            totalHours += diff;
          }
        });
      }
    });

    return totalHours;
  };
  const showRemainingHoursPopup = () => {
    const totalHours = calculateTotalHours();
    const remainingHours = Number(weeklyHourLimit) - totalHours;

    if (remainingHours === 0) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT, {
        className:
          "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-yellow-600 text-white",
      });
    } else {
      toast.info(
        `You have ${remainingHours.toFixed(2)} hours remaining this week.`,
        {
          className:
            "w-[340px] px-4 py-3 text-sm rounded-lg shadow bg-blue-600 text-white",
        }
      );
    }
  };

  useEffect(() => {
    if (!trailStartDate || !fromTime) return;
    const calculatedToTime = moment(fromTime, "HH:mm")
      .add(30, "minutes")
      .format("HH:mm");
    setToTime(calculatedToTime);
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId || !trailStartDate) return;
    const socket = getSocket(academicId);
    const position =
      form.course === "Islamic Studies"
        ? "Islamic Teacher"
        : `${form.course} Teacher`;
    console.log("📤 Sending academicTrailClassTeacherListRequest");
    console.log("📤 Sending with payload:", {
      startDate: trailStartDate,
      from: fromTime,
      to: calculatedToTime,
      position: position,
    });
    socket.emit("academicTrailClassTeacherListRequest", {
      requestId: academicId,
      startDate: trailStartDate,
      from: fromTime,
      to: calculatedToTime,
      position: position,
    });

    const handleResponse = (data: Record<string, string>) => {
      const teacherArray = Object.entries(data).map(
        ([teacherId, teacherName]) => ({
          teacherId,
          teacherName,
        })
      );
      setTeachers(teacherArray);
    };

    socket.on("academicTrailClassTeacherListResponse", handleResponse);
    return () => {
      socket.off("academicTrailClassTeacherListResponse", handleResponse);
    };
  }, [trailStartDate, fromTime]);
  useEffect(() => {
    const academicId =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    if (!academicId || !startDate) return;
    const socket = getSocket(academicId);
    console.log("📤 Sending academicTeacherWeeklySlotsListRequest");
    socket.emit("academicTeacherWeeklySlotsListRequest", {
      requestId: academicId,
      startDate: startDate,
      teacherId: selectedTeacher?.teacherId,
    });

    const handleResponse = (data: WeeklySlotMap) => {
      console.log("weekyl", data);
      setSuggestedSlots(data);
    };

    socket.on("academicTeacherWeeklySlotsListResponse", handleResponse);
    return () => {
      socket.off("academicTeacherWeeklySlotsListResponse", handleResponse);
    };
  }, [startDate, selectedTeacher]);

  const normalizeTime = (time: string) => time.slice(0, 5);

  const handleAddSuggestedSlot = (day: string, from: string, to: string) => {
    if (calculateTotalHours() >= Number(weeklyHourLimit)) {
      toast.warning(AppValidationMessages.EVALUATION.WEEKLY_HOUR_LIMIT);
      return;
    }
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];
    const times = updated[index].times;

    const isDuplicate = times.some(
      (t) =>
        normalizeTime(t.startTime) === normalizeTime(from) &&
        normalizeTime(t.endTime) === normalizeTime(to)
    );

    if (isDuplicate) {
      toast.error(AppValidationMessages.EVALUATION.DUPLICATE_SLOT);
      return;
    }

    updated[index].isSelected = true;
    updated[index].times.push({
      startTime: normalizeTime(from),
      endTime: normalizeTime(to),
    });

    updated[index].times.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleRemoveSlot = (day: string, from: string, to: string) => {
    const index = schedule.findIndex((item) => item.day === day);
    if (index === -1) return;

    const updated = [...schedule];

    updated[index].times = updated[index].times.filter(
      (t) =>
        !(
          normalizeTime(t.startTime) === normalizeTime(from) &&
          normalizeTime(t.endTime) === normalizeTime(to)
        )
    );

    if (updated[index].times.length === 0) {
      updated[index].isSelected = false;
    }

    setSchedule(updated);
    showRemainingHoursPopup();
  };

  const handleTimeChange = (
    dayIndex: number,
    timeIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].times[timeIndex][field] = value;
    setSchedule(updatedSchedule);
  };
  const handleTimeChange1 = (hour: any, minute: any) => {
    setFromHour(hour);
    setFromMinute(minute);

    if (hour && minute) {
      setFromTime(`${hour}:${minute}`);
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AcademicCoachPortalId")
        : null;
    const now = new Date();
    const isoDate = now.toISOString(); // returns in UTC

    const hours = String(now.getHours()).padStart(2, "0"); // 00–23
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const currentTime = `${hours}:${minutes}`;

    const isGroupClass = form.classType === "GROUPCLASS";
    const classEndDate = new Date(startDate);

    classEndDate.setDate(classEndDate.getDate() + 28); // add 28 days

    const isoEndDate = classEndDate.toISOString();
    const submitData = {
      academicCoachId: token,
      student: {
        studentId: "",
        studentFirstName: form.firstName,
        studentLastName: form.lastName,
        studentEmail: form.email,
        studentPhone: Number(form.phoneNumber),
        studentCity: form.city ?? "N/A",
        studentCountry: form.country,
        studentCountryCode: form.countryCode,
        learningInterest: form.course,
        numberOfStudents: 1,
        preferredTeacher: form.preferredTeacher,
        preferredFromTime: currentTime,
        preferredToTime: currentTime,
        timeZone: form.timeZone,
        referralSource: "Google",
        preferredDate: isoDate,
        evaluationStatus: "COMPLETED",
        status: "Active",
        createdDate: isoDate,
        createdBy: "Academic Coach",
      },
      joiningDate: isGroupClass ? new Date() : startDate,
      preferredTrialDate: trailStartDate,
      preferredTrialFromTime: fromTime,
      preferredTrialToTime: toTime,
      weeklySlots: buildWeeklySlots(),
      teacher: {
        teacherId: selectedTeacher?.teacherId ?? "",
        teacherName: selectedTeacher?.teacherName ?? "",
        teacherEmail: "demoteacher@gmail.com",
      },
      classDay: isGroupClass
        ? []
        : schedule
            .filter((item) => item.isSelected)
            .map((item) => ({ label: item.day, value: item.day })),
      startTime: isGroupClass
        ? []
        : schedule
            .filter((item) => item.isSelected)
            .flatMap((item) =>
              item.times.map((time) => ({
                label: time.startTime,
                value: time.startTime,
              }))
            ),
      endTime: isGroupClass
        ? []
        : schedule
            .filter((item) => item.isSelected)
            .flatMap((item) =>
              item.times.map((time) => ({
                label: time.endTime,
                value: time.endTime,
              }))
            ),
      isLanguageLevel: false,
      languageLevel: "1",
      isReadingLevel: false,
      readingLevel: "1",
      isGrammarLevel: false,
      grammarLevel: "1",
      hours: Number(form.preferredHours),
      subscription: {
        subscriptionName: form.preferredPackage,
      },
      planTotalPrice: totalAmount,
      classType: form.classType,
      classStartDate: startDate,
      classEndDate: isoEndDate,
      classStartTime: currentTime,
      classEndTime: currentTime,
      accomplishmentTime: (Number(form.preferredHours) * 4).toString(),
      studentRate: Number(form.preferredHours),
      expectedFinishingDate: isoEndDate,
      gardianName: form.guardianName,
      gardianEmail: form.guardianEmail,
      gardianPhone: form.guardianPhone?.toString(),
      gardianCity: form.city,
      gardianCountry: form.country,
      gardianTimeZone: form.timeZone,
      gardianLanguage: form.language,
      assignedTeacher: selectedTeacher?.teacherName ?? " N/A",
      studentStatus: form.studentStatus,
      classStatus: form.classStatus,
      trialClassStatus: "Pending",
      status: "Active",
      createdDate: isoDate,
      createdBy: token,
      updatedDate: new Date().toISOString(),
      updatedBy: "system", // or replace with the current user's email/ID
    };
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AcademicCoachAuthToken")
          : null;
      console.log("submit", submitData);
      const response = await axios.post(
       `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.CREATE}`,
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if ([200, 201].includes(response.status)) {
        setTimeout(() => {
          onClose();
        }, 3000);
        setSucces(true);
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: undefined,
          country: "",
          countryCode: "IN",
          city: "",
          state: "",
          language: "",
          preferredTeacher: "",
          preferredDate: "",
          preferredHours: "",
          classType: "",
          selectTeacher: "",
          guardianName: "",
          guardianPhone: undefined,
          guardianEmail: "",
          studentStatus: "",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          course: "",
          level: "",
          preferredPackage: "",
          classStatus: "",
          preferredTime: [],
        });
        setTeachers([]);
      }
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      if (Number(status === 400)) {
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
        className="bg-white rounded-lg shadow-xl p-5 w-full max-w-4xl mx-3 scrollbar-none text-sm dark:bg-[#1D1D1D]"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h1 className="text-lg font-semibold mt-2 text-black mb-3 dark:text-[#FFFFFF]">
          Add Student
        </h1>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Left Section */}
              <div>
                <Input
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <label
                  htmlFor="country"
                  className="text-sm text-[#010E30] dark:text-white mb-1 "
                >
                  Country
                </label>
                <Listbox
                  value={form.country}
                  onChange={(val) => setForm({ ...form, country: val })}
                >
                  <div className="relative mt-1 mb-2">
                    {/* Button */}
                    <ListboxButton className="w-full h-10 border rounded px-3 py-2 text-left border-[#5C5C5C] text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]">
                      {form.country || "Select Country"}
                    </ListboxButton>

                    {/* Options */}
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#343434] shadow-lg">
                      {countries.map((country) => (
                        <ListboxOption
                          key={country.isoCode}
                          value={country.name}
                          className="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {country.name}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>

                <label
                  htmlFor="country"
                  className="text-sm text-[#010E30] dark:text-white mb-1"
                >
                  City
                </label>
                <Listbox
                  value={form.city}
                  onChange={(val) => setForm({ ...form, city: val })}
                >
                  <div className="relative mt-1 mb-2">
                    {/* Button */}
                    <ListboxButton className="w-full h-10 border rounded px-3 py-2 text-left border-[#5C5C5C] text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]">
                      {form.city || "Select City"}
                    </ListboxButton>

                    {/* Options */}
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

                <div className="mb-4">
                  <label
                    htmlFor="preferredTeacher"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Preferred Teacher
                  </label>
                  <select
                    name="preferredTeacher"
                    id="preferredTeacher"
                    value={form.preferredTeacher}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Preferred Teacher</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="preferredHours"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Preferred Hours / week
                  </label>
                  <select
                    name="preferredHours"
                    id="preferredHours"
                    value={form.preferredHours}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Hours</option>
                    <option value="1">1 hr/week</option>
                    <option value="1.5">1.5 hr/week</option>
                    <option value="2">2 hrs/week</option>
                    <option value="2.5">2.5 hrs/week</option>
                    <option value="3">3 hrs/week</option>
                    <option value="4">4 hrs/week</option>
                    <option value="5">5 hrs/week</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="classType"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Class Type
                  </label>
                  <select
                    name="classType"
                    id="classType"
                    value={form.classType}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Class Type</option>
                    <option value="REGULARCLASS">Regular Class</option>
                    <option value="GROUPCLASS">Group Class</option>
                  </select>
                </div>

                <Input
                  label="Guardian Name"
                  name="guardianName"
                  value={form.guardianName}
                  onChange={handleChange}
                />
                <label
                  htmlFor="guardianPhone"
                  className="text-[14px] text-[#293453] dark:text-white mb-1"
                >
                  Guardian Phone
                </label>
                <PhoneInput
                  id="guardianPhone"
                  defaultCountry="IN"
                  value={form.guardianPhone}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, guardianPhone: value }));
                    if (!value || !isValidPhoneNumber(value)) {
                      setPhoneError("Invalid phone number");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  className="PhoneInput w-full mb-3 mt-2 border "
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
                <div className="mb-4">
                  <label
                    htmlFor="studentStatus"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Student Status
                  </label>
                  <select
                    name="studentStatus"
                    id="studentStatus"
                    value={form.studentStatus}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Status</option>
                    <option value="JOINED">Joined</option>
                    <option value="NOT JOINED">Not Joined</option>
                  </select>
                </div>
              </div>

              {/* Right Section */}
              <div>
                <Input
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
                <label
                  htmlFor="Phone"
                  className="text-[14px] text-[#293453] dark:text-white mb-1"
                >
                  Phone Number
                </label>
                <PhoneInput
                  id="phonenumber"
                  defaultCountry="IN"
                  value={form.phoneNumber}
                  onChange={(value) => {
                    setForm((prev) => ({
                      ...prev,
                      phoneNumber: value,
                    }));

                    if (!value || !isValidPhoneNumber(value)) {
                      setPhoneError("Invalid phone number");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  className="PhoneInput w-full mb-4 mt-1"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}

                <label
                  htmlFor="state"
                  className="text-sm text-[#010E30] dark:text-white mb-1"
                >
                  State
                </label>

                <Listbox
                  value={form.state}
                  onChange={(val) => setForm({ ...form, state: val, city: "" })}
                  disabled={!form.country} // disable if no country selected
                >
                  <div className="relative mt-1 mb-2">
                    {/* Button */}
                    <ListboxButton
                      className={`w-full h-10 border rounded px-3 py-2 text-left text-xs
        ${!form.country ? "opacity-50 cursor-not-allowed" : ""}
        border-[#5C5C5C] dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]`}
                    >
                      {form.country
                        ? form.state || "Select State"
                        : "Select Country First"}
                    </ListboxButton>

                    {/* Options */}
                    {form.country && (
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

                <div className="w-full mb-3">
                  <label
                    htmlFor="timeZone"
                    className="text-sm text-[#010E30] dark:text-white mb-1 block"
                  >
                    Time Zone
                  </label>

                  <Listbox
                    value={form.timeZone}
                    onChange={(val) => setForm({ ...form, timeZone: val })}
                  >
                    <div className="relative mt-1 mb-2">
                      {/* Button */}
                      <ListboxButton className="w-full h-10 border rounded px-3 py-2 text-left text-xs border-[#555] dark:border-[#666] text-[#010E30] dark:text-white bg-white dark:bg-[#343434]">
                        {form.timeZone
                          ? timeZones.find((tz) => tz.name === form.timeZone)
                              ?.label +
                            " (" +
                            timeZones.find((tz) => tz.name === form.timeZone)
                              ?.offset +
                            ")"
                          : "Select Timezone"}
                      </ListboxButton>

                      {/* Options */}
                      <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#343434] shadow-lg scrollbar-none">
                        {timeZones.map(({ name, label, offset }) => (
                          <ListboxOption
                            key={name}
                            value={name}
                            className="cursor-pointer px-3 py-2 text-xs text-[#010E30] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            {label} ({offset})
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="course"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Course
                  </label>
                  <select
                    name="course"
                    id="course"
                    value={form.course}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Course</option>
                    <option value="Quran">Quran</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Islamic">Islamic</option>
                  </select>
                </div>

                <Input
                  label="Language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                />

                <div className="mb-4">
                  <label
                    htmlFor="preferredPackage"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Preferred Package
                  </label>
                  <select
                    name="preferredPackage"
                    id="preferredPackage"
                    value={form.preferredPackage}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Package</option>
                    {Object.keys(packageRates).map((pkg) => (
                      <option key={pkg} value={pkg}>
                        {pkg} (₹{packageRates[pkg]}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Guardian Email"
                  name="guardianEmail"
                  value={form.guardianEmail}
                  onChange={handleChange}
                />
                <Input
                  label="Level"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                />
                <div className="mb-4">
                  <label
                    htmlFor="classStatus"
                    className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
                  >
                    Class Status
                  </label>
                  <select
                    name="classStatus"
                    id="classStatus"
                    value={form.classStatus}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
                  >
                    <option value="">Select Status</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="NOT COMPLETED">NOT COMPLETED</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className=""
            >
              <div className="p-8 border-[#576CBC] border rounded-md">
                <div className="flex items-center mb-5">
                  <h2 className="text-[18px] font-medium text-gray-900 dark:text-gray-100">
                    Trial Class
                  </h2>
                </div>

                <div className="flex flex-wrap gap-4 justify-between items-center">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="ugcuc"
                      className="font-medium text-gray-900 dark:text-gray-100 text-sm"
                    >
                      Date:
                    </label>
                    <input
                      type="date"
                      id="ugcuc"
                      className="border rounded text-xs px-1 py-1 bg-white dark:bg-gray-800 border-[#555] dark:border-gray-600 text-gray-900 dark:text-gray-200 dark:[color-scheme:dark]"
                      value={trailStartDate}
                      onChange={(e) => setTrailStartDate(e.target.value)}
                    />
                  </div>

                  {/* From Time */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="fromTime"
                      className="font-medium text-gray-900 dark:text-gray-100 text-sm"
                    >
                      From:
                    </label>

                    <Listbox
                      value={fromHour}
                      onChange={(val) => handleTimeChange1(val, fromMinute)}
                    >
                      <div className="relative mt-1 mb-1">
                        {/* Button */}
                        <ListboxButton className="h-8 w-16 rounded px-2 text-left text-sm rounded border border-[#555] dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-[#555]">
                          {fromHour || "HH"}
                        </ListboxButton>

                        {/* Options */}
                        <ListboxOptions className="absolute z-10 mt-1 max-h-60 overflow-auto scrollbar-none w-full text-sm rounded border border-[#555] dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-[#555]">
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0");
                            return (
                              <ListboxOption
                                key={hour}
                                value={hour}
                                className="cursor-pointer px-3 py-2 text-xs text-[#010E30] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                {hour}
                              </ListboxOption>
                            );
                          })}
                        </ListboxOptions>
                      </div>
                    </Listbox>

                    {/* Minutes Dropdown */}
                    <select
                      value={fromMinute}
                      onChange={(e) =>
                        handleTimeChange1(fromHour, e.target.value)
                      }
                      className="h-8 w-16 text-sm px-2 rounded border border-[#555] dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-[#555]"
                    >
                      <option value="">MM</option>
                      <option value="00">00</option>
                      <option value="30">30</option>
                    </select>
                  </div>

                  {/* Teacher Dropdown */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="teacher"
                      className="font-medium text-gray-900 dark:text-gray-100 text-sm"
                    >
                      Teacher:
                    </label>
                    <Listbox
                      value={selectedTeacher}
                      onChange={setSelectedTeacher}
                    >
                      <div className="relative">
                        {/* Button */}
                        <ListboxButton className="relative w-full cursor-default rounded border border-[#555] dark:border-gray-600 bg-white dark:bg-gray-800 py-1 pl-3 pr-10 text-left text-xs text-gray-900 dark:text-gray-200">
                          <span className="block truncate">
                            {selectedTeacher
                              ? selectedTeacher.teacherName
                              : "Select a Teacher"}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                          </span>
                        </ListboxButton>

                        {/* Options */}
                        <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#555] dark:border-gray-600 bg-white dark:bg-gray-800 text-xs shadow-lg focus:outline-none">
                          {teachers.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400">
                              🔍 No Teacher
                            </div>
                          ) : (
                            teachers.map((teacher) => (
                              <ListboxOption
                                key={teacher.teacherId}
                                value={teacher}
                                className={({ selected }) =>
                                  `relative cursor-default  w-full select-none py-2 pl-8 pr-3 ${
                                    selected
                                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                      : "text-gray-900 dark:text-gray-200"
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {teacher.teacherName}
                                    </span>
                                    {selected && (
                                      <span className="absolute inset-y-0 left-2 flex items-center text-blue-500">
                                        <Check className="h-4 w-4" />
                                      </span>
                                    )}
                                  </>
                                )}
                              </ListboxOption>
                            ))
                          )}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                </div>

                {/* Schedule Classes */}
                <div className="flex items-center justify-between my-5">
                  <h2 className="text-[18px] font-medium text-gray-900 dark:text-gray-100">
                    Schedule Classes
                  </h2>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="ugcuc"
                      className="font-medium text-gray-900 dark:text-gray-100 text-sm"
                    >
                      Join Date:
                    </label>
                    <input
                      type="date"
                      id="ugcuc"
                      className="border rounded text-xs px-1 py-1 bg-white dark:bg-gray-800 border-[#555] dark:border-gray-600 text-gray-900 dark:text-gray-200 dark:[color-scheme:dark]"
                      value={startDate}
                      disabled={isGroupClass}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
                    form.classType === "GROUPCLASS"
                      ? "pointer-events-none opacity-30"
                      : ""
                  }`}
                >
                  {schedule.map((item, index) => (
                    <div
                      key={item.day}
                      className="flex flex-col justify-between bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl p-4 shadow-lg transition-transform hover:scale-[1.01] duration-200"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-sm tracking-wide">
                          <CalendarDays size={18} className="text-blue-500" />
                          {item.day}
                        </div>
                      </div>

                      {/* Added Slots */}
                      {item.times.length > 0 && (
                        <div className="flex flex-col gap-2 mb-3 max-h-28 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                          {item.times.map((time, timeIndex) => (
                            <div
                              key={`${time.startTime}-${timeIndex}`}
                              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl"
                            >
                              <input
                                type="time"
                                value={time.startTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    index,
                                    timeIndex,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 text-xs rounded-lg px-1 py-1 w-15 focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-gray-600 dark:text-gray-300 text-xs">
                                ⏤
                              </span>
                              <input
                                type="time"
                                value={time.endTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    index,
                                    timeIndex,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 text-xs rounded-lg px-1 py-1 w-15 focus:ring-2 focus:ring-blue-500"
                              />

                              {/* Remove Button */}
                              <button
                                onClick={() =>
                                  handleRemoveSlot(
                                    item.day,
                                    time.startTime,
                                    time.endTime
                                  )
                                }
                                className="ml-auto text-xs px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                                title="Remove slot"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggested Slots */}
                      {suggestedSlots[item.day] && (
                        <div className="flex flex-col gap-2 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                          {suggestedSlots[item.day].map((slot, i) => {
                            const isAlready = item.times.some(
                              (t) =>
                                normalizeTime(t.startTime) ===
                                  normalizeTime(slot.from) &&
                                normalizeTime(t.endTime) ===
                                  normalizeTime(slot.to)
                            );

                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl"
                              >
                                <div className="flex items-center gap-1 text-gray-900 dark:text-gray-200 text-xs">
                                  <Clock3 size={14} className="text-blue-500" />
                                  {slot.from} - {slot.to}
                                </div>
                                <button
                                  type="button"
                                  disabled={isAlready}
                                  onClick={() =>
                                    handleAddSuggestedSlot(
                                      item.day,
                                      slot.from,
                                      slot.to
                                    )
                                  }
                                  className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg transition-all ${
                                    isAlready
                                      ? "bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700 text-white"
                                  }`}
                                >
                                  {isAlready ? (
                                    <>
                                      <CheckCircle size={14} /> Added
                                    </>
                                  ) : (
                                    <>
                                      <PlusCircle size={14} /> Add
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333]"
            >
              Back
            </button>
          )}

          {currentStep < 2 ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] rounded hover:bg-[#E6E9F5] dark:hover:bg-[#333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
              >
                Next
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
            >
              Submit
            </button>
          )}
        </div>
      </form>
      {success && (
        <SuccessPopup onClose={() => setSucces(false)} title="Form Submitted" />
      )}
      {failed && (
        <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
      )}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-normal text-[#010E30]  mb-1 dark:text-[#FFFFFF]"
      >
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
      />
    </div>
  );
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options = [],
  children,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-normal text-[#010E30] mb-1 dark:text-white"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border rounded px-3 py-2 border-[#5C5C5C] text-xs dark:text-white dark:bg-[#343434] dark:border-[#5C5C5C]"
      >
        {children ??
          options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
    </div>
  );
};

function MultiSelect({ label, name, value, onChange, disabled }: any) {
  // Placeholder: Replace with proper multi-day, from-time/to-time dropdown logic
  return (
    <div className="mb-4">
      <label className="block text-sm font-normal text-[#010E30] mb-1 dark:text-[#FFFFFF]">
        {label}
      </label>
      <input
        type="text"
        value={value.join(", ")}
        readOnly
        disabled={disabled}
        className="w-full border rounded px-3 py-2 text-xs dark:text-[#FFFFFF] dark:bg-[#343434] dark:border-[#5C5C5C]"
      />
    </div>
  );
}
