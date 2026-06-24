"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

interface AddStudentModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  isEditMode: boolean;
  onSave: () => void;
}
const AddTrailStudentModal = ({
  isOpen,
  onRequestClose,
  isEditMode,
  onSave,
}: AddStudentModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [learningInterest, setLearningInterest] = useState("");
  const [preferredToTime, setPreferredToTime] = useState("");
  const [numberOfStudents, setNumberOfStudents] = useState("");
  const [preferredTeacher, setPreferredTeacher] = useState("");
  const [startDate, setStartDate] = useState("");
  const [preferredFromTime, setPreferredFromTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const studentData = {
        firstName,
        lastName,
        email,
        phoneNumber: Number(phoneNumber),
        country,
        city,
        learningInterest,
        numberOfStudents: Number(numberOfStudents),
        preferredTeacher,
        preferredFromTime,
        preferredToTime,
        startDate,
        // evaluationStatus,
        status: "Active",
        createdBy: "SYSTEM",
        lastUpdatedBy: "SYSTEM",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referralSource: "Other" as
          | "Friend"
          | "Social Media"
          | "E-Mail"
          | "Google"
          | "Other",
        // startDate: formData.date,
        // evaluationStatus: (formData.evaluationStatus || "PENDING") as "PENDING" | "INPROGRESS" | "COMPLETED",
        // status: "Active" as "Active" | "Inactive" | "Deleted",
        // createdBy: "SYSTEM",
        // lastUpdatedBy: "SYSTEM",
      };

      if (!firstName || firstName.length < 3) {
        throw new Error("First name must be at least 3 characters long");
      }
      if (!lastName || lastName.length < 1) {
        throw new Error("Last name is required");
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Valid email is required");
      }
      if (!phoneNumber || phoneNumber.toString().length < 10) {
        throw new Error("Phone number must be at least 10 digits");
      }

      console.log("Sending data:", studentData);
     const token =
    typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
    return;
  }
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(studentData),
      });

      const responseData = await response.json();
      console.log("Response:", response.status, responseData);

      if (!response.ok) {
        throw new Error(
          `Server error: ${responseData.status ?? "Unknown error"}`
        );
      }

      onSave();
      onRequestClose();
      alert("Student saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to save student: ${error}`);
    }
  };
  const calculatePreferredToTime = (fromTime: string) => {
    const [hours, minutes] = fromTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 30; // Add 30 minutes
    const newHours = Math.floor(totalMinutes / 60) % 24; // Ensure hours wrap around after 24
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-2xl p-6 w-[600px] max-h-[100vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4">
          <h2 className="text-[18px] font-bold bg-gradient-to-r from-[#415075] via-[#1e273c] to-[#1e273c] text-transparent bg-clip-text">
            {isEditMode ? "Add Student" : "AddStudent"}
          </h2>
          <button
            onClick={onRequestClose}
            className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-5">
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block text-xs font-medium text-gray-700 mb-1.5"
              >
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Number of Students
              </label>
              <input
                type="number"
                value={numberOfStudents}
                onChange={(e) => setNumberOfStudents(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Preferred Teacher
              </label>
              <select
                value={preferredTeacher}
                onChange={(e) => setPreferredTeacher(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300  rounded-lg text-[11px] focus:border-[#293552] outline-none"
              >
                <option value="">Select Teacher</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Either">Either</option>
              </select>
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Learning Interest
              </label>
              <select
                value={learningInterest}
                onChange={(e) => setLearningInterest(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300  rounded-lg text-[11px] focus:border-[#293552] outline-none"
              >
                <option value="">Select Course</option>
                <option value="Quran">Quran</option>
                <option value="Islamic Studies">Islamic Studies</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Preferred Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300  rounded-lg text-[11px] focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="first-name"
                className="block mb-1 text-xs font-medium text-gray-700"
              >
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredFromTime}
                onChange={(e) => {
                  const fromTime = e.target.value;
                  setPreferredFromTime(fromTime);
                  const toTime = calculatePreferredToTime(fromTime);
                  setPreferredToTime(toTime);
                }}
                className="w-full px-4 py-2 bg-gray-200 border border-gray-300  rounded-lg text-[11px] focus:border-[#293552] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              onClick={onRequestClose}
              className="px-4 py-1.5 bg-gray-200 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#293552] text-white rounded-lg hover:bg-[#1e273c] text-sm"
            >
              {isEditMode ? "Save" : ""}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTrailStudentModal;
