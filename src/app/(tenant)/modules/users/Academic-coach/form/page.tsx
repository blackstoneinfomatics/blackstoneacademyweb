"use client";

import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { CountryDropdown } from "react-country-region-selector";
import { FcNext } from "react-icons/fc";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Replace TypeScript types with JSDoc type definitions
/**
 * @typedef {Date | null} ValuePiece
 * @typedef {ValuePiece | [ValuePiece, ValuePiece]} Value
 * @typedef {{ success: boolean, message: string }} ApiResponse
 * @typedef {{ countryCode: string }} PhoneChangeData
 */

const countryCityMap = {
  us: ["New York", "Los Angeles", "Chicago"],
  ca: ["Toronto", "Vancouver", "Montreal"],
  gb: ["London", "Manchester", "Birmingham"],
  // Add more countries and their cities as needed
};

const MultiStepForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [country, setCountry] = useState("USA");
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const countriesCities = require("countries-cities");

  // Basic Information States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");

  // Learning Interest States
  const [learningInterest, setLearningInterest] = useState<string[]>([]);
  const [iqraUsageOther, setIqraUsageOther] = useState("");
  const [numberOfStudents, setNumberOfStudents] = useState("");
  const [preferredTeacher, setPreferredTeacher] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [referralSourceOther, setReferralSourceOther] = useState("");

  // Schedule States
  const [startDate, setStartDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [preferredFromTime, setPreferredFromTime] = useState("");
  const [preferredToTime, setPreferredToTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const generateReferralId = () => {
    const specialChars = 'ALF-REFID-';
    const randomNum = Math.floor(10000 + Math.random() * 90000); // Ensures a 5-digit number
    return specialChars + randomNum;
    };

    // Initialize the referral ID when the component is loaded
    const [referral, setReferral] = useState(generateReferralId());

  /**
   * Handles phone number changes
   * @param {string} value - The phone number value
   * @param {PhoneChangeData} data - The phone change data object
   */
  const handlePhoneChange = (value:any, data:any) => {
    // Log the value to understand what is being passed
    console.log("Phone input value:", value);

    // Ensure value contains only digits (strip non-numeric characters)
    const numericValue = value.replace(/\D/g, ""); // Keep only numeric characters

    // Update state with numericValue
    setPhoneNumber(numericValue);
    setCountryCode(data.countryCode || ""); // Set countryCode, fallback to empty string
  };

  /**
   * Handles date changes
   * @param {Value} value - The selected date value
   */
  const handleDateChange = (value:any) => {
    if (value instanceof Date) {
      setStartDate(value);
      setToDate(value); // Set toDate to the same as startDate
      loadAvailableTimes();
    }
  };

  const loadAvailableTimes = () => {
    const defaultTimes = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
    ];
    setAvailableTimes(defaultTimes);
    setPreferredFromTime("");

  };

  const validateStep1 = () => {
    if (!firstName.trim() || firstName.length < 3) {
      return { isValid: false, field: "First Name (minimum 3 characters)" };
    }
    if (!lastName.trim() || lastName.length < 3) {
      return { isValid: false, field: "Last Name (minimum 3 characters)" };
    }
    if (!email.trim()) {
      return { isValid: false, field: "Email" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, field: "Email Format" };
    }

    if (!countryCode) {
      return { isValid: false, field: "Country Code" };
    }
    if (!phoneNumber) {
      return { isValid: false, field: "Phone Number" };
    }
    if (!country) {
      return { isValid: false, field: "Country" };
    }

    return { isValid: true, field: null };
  };

  const validateStep2 = () => {
    if (learningInterest.length !== 1) return false;
    if (!numberOfStudents) return false;
    if (!preferredTeacher) return false;
    if (!referralSource) return false;
    return true;
  };

  const validateStep3 = () => {
    if (!startDate || !toDate) return false;
    if (!preferredFromTime || !preferredToTime) return false;
    return !!preferredFromTime;
  };

  const nextStep = () => {
    const validation = validateStep1();
    if (!validation.isValid) {
      alert(`Please fill in the ${validation.field} field correctly.`);
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields before submission
      if (!validateStep1().isValid || !validateStep2() || !validateStep3()) {
        alert("Please fill in all required fields");
        setIsLoading(false);
        return;
      }
      // Clean and format the phone number - remove any non-numeric characters
      // const cleanPhoneNumber = phoneNumber.toString().replace(/\D/g, '');

      const formattedData = {
        id: uuidv4(),
        firstName: firstName.trim().padEnd(3),
        lastName: lastName.trim().padEnd(3),
        email: email.trim().toLowerCase(),
        gender: "Male",
        phoneNumber: Number(phoneNumber),
        country: country.length >= 3 ? country : country.padEnd(3, " "),
        countryCode: countryCode.toLowerCase(),
        city: city,
        learningInterest: learningInterest[0],
        numberOfStudents: Number(numberOfStudents),
        preferredTeacher: preferredTeacher,
        preferredFromTime: preferredFromTime,
        preferredToTime: preferredToTime,
        referralSource: referralSource,
        referralDetails: referralSourceOther || referral || "",
        startDate: startDate.toISOString(),
        endDate: toDate.toISOString(),
        evaluationStatus: "PENDING",
        refernceId: referral,
        status: "Active",
        createdBy: "SYSTEM",
        lastUpdatedBy: "SYSTEM",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Debug log to check the data being sent
      console.log("Sending data:", formattedData);
    
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          
        },
        body: JSON.stringify(formattedData, null, 2),
        mode: "cors",
      });

      // Log the raw response
      console.log("Raw response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          errorData.message || `Server returned ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Success response:", data);

      // Reset form and redirect on success
      alert("Form submitted successfully!");
      router.push("/thank-you");
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Failed to submit form: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Checks if a calendar tile should be disabled
   * @param {{ date: Date }} param0 - The tile date
   * @returns {boolean}
   */
  const isTileDisabled = ({ date }: { date: Date; }): boolean => {
    return date < new Date();
  };

  /**
   * Function to get country code based on selected country
   * @param {string} country - The country code
   * @returns {string} The corresponding phone country code
   */
 

  /**
   * Handles country selection changes
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  

  const formatTime24 = (hours: number, minutes: number): string => {
  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${paddedHours}:${paddedMinutes}`;
};

const calculatePreferredToTime = (fromTime: string) => {
  try {
    const [timePart, period] = fromTime.trim().split(" ");
    if (!timePart || !period) return "00:00";

    const [hourStr, minuteStr] = timePart.split(":");
    const rawHours = parseInt(hourStr, 10);
    const rawMinutes = parseInt(minuteStr, 10);

    if (isNaN(rawHours) || isNaN(rawMinutes)) return "00:00";

    // Convert to 24-hour format
    let hours = rawHours % 12;
    if (period.toUpperCase() === "PM") hours += 12;

    const totalMinutes = hours * 60 + rawMinutes + 30; // Add 30 mins
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return formatTime24(newHours, newMinutes);
  } catch (error) {
    return "00:00";
  }
};

  

  useEffect(() => {
    const fetchedCities = countriesCities.getCities(country);
    setCities(fetchedCities);
    setCity("");
  }, [country]);

  return (
    <div className="max-w-[40%] mx-auto justify-center mt-8 p-4 rounded-br-[20px] rounded-tl-[20px] rounded-bl-[10px] rounded-tr-[10px] shadow-md bg-gradient-to-r from-[#e3e8f4] via-[#94b3fa52] to-[#e3e8f4]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">Contact</div>
        <div className="text-sm font-medium">{step * 33}%</div>
      </div>
      <div className="w-full bg-[#fff] rounded-full h-2.5 mb-6">
        <div
          className="bg-[#293552] h-2.5 rounded-full"
          style={{ width: `${step * 33}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <div className="flex items-center justify-center mb-4 p-2">
              <Image
                src="/assets/images/alf.png"
                alt="Logo"
                width={160}
                height={160}
                className="mr-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label
                  htmlFor="First Name"
                  className="text-[14px] text-[#293453]"
                >
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  minLength={3}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#293552] bg-gray-100`}
                />
              </div>

              <div>
                <label
                  htmlFor="Last Name"
                  className="text-[14px] text-[#293453]"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  minLength={3}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#293552] bg-gray-100`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="Email" className="text-[14px] text-[#293453]">
                  Email
                </label>
                <br />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  minLength={3}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#293552] bg-gray-100`}
                />
              </div>
              <div>
                <label
                  htmlFor="Phone Number"
                  className="text-[14px] text-[#293453]"
                >
                  Phone Number
                </label>
                <PhoneInput
                  country={countryCode.toLowerCase()}
                  value={phoneNumber ? String(phoneNumber) : ""}
                  onChange={handlePhoneChange}
                  inputClass="w-full rounded-lg focus:outline-none focus:ring-1 focus:ring-[#293552] "
                  containerClass="w-full py-1"
                  buttonStyle={{
                    backgroundColor: "rgb(243 244 246)",
                    borderColor: "#e5e7eb",
                  }}
                  inputStyle={{
                    backgroundColor: "rgb(243 244 246)",
                    width: "100%",
                    borderColor: "#e5e7eb",
                  }}
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="Country" className="text-[14px] text-[#293453]">
                  Country
                </label>
                <CountryDropdown
                  value={country}
                  onChange={(val) => {
                    setCountry(val);
                  }}
                  className="w-full px-4 py-[12px] rounded-lg text-[12px] text-[#293552] border border-gray-300 focus:ring-1 focus:ring-[#293552] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="City" className="text-[14px] text-[#293453]">
                  City
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-[12px] rounded-lg text-[#293552] text-[12px] border border-gray-300 focus:ring-1 focus:ring-[#293552] focus:outline-none"
                >
                  <option value="">Select a city</option>
                  {cities?.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="Referral Code"
                className="text-[14px] text-[#293453]"
              >
                Referral Code
              </label>
              <br />
              <input
                type="text"
                placeholder="Referral Code"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#293552] bg-gray-100 w-1/2"
              />
            </div>
            <button
              type="button"
              onClick={nextStep}
              className="justify-end mt-10 ml-[240px] text-[16px] p-2 align-middle py-2 px-4 bg-[#293552] text-white font-semibold hover:shadow-inner rounded-full shadow-lg flex"
            >
              Next &nbsp; <FcNext className="mt-1 text-[#fff]" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              type="button"
              onClick={prevStep}
              aria-label="Go back to previous step"
              className="text-gray-500 mb-4"
            >
              ←Back
            </button>
            <h2 className="text-[14px] text-center font-bold mb-4 text-[#293552]">
              What will you use AL Furquan for?
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4 text-[13px]">
              {["Quran", "Islamic Studies", "Arabic"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLearningInterest([option])}
                  className={`hover:transition-all duration-500 ease-in-out rounded-xl p-3 text-black shadow-md ${
                    learningInterest[0] === option
                      ? "bg-[#3c85fa2e]"
                      : "bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {learningInterest.includes("Other") && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Please specify your course"
                  value={iqraUsageOther}
                  onChange={(e) => setIqraUsageOther(e.target.value)}
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#293552] bg-gray-100"
                />
              </div>
            )}

            <h2 className="text-center font-bold mb-4 text-[#293552] text-[14px]">
              How many students will join?
            </h2>
            <div className="grid grid-cols-5 gap-4 mb-6 rounded-xl text-[13px]">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumberOfStudents(count.toString())}
                  className={`p-3 hover:transition-all duration-500 ease-in-out rounded-xl text-[#000] ${
                    numberOfStudents === count.toString()
                      ? "bg-[#3c85fa2e]"
                      : "bg-gray-100"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            <h2 className="text-[14px] text-center font-bold mb-4 text-[#293552]">
              Which teacher would you like?
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6 text-[13px]">
              {["Male", "Female", "Either"].map((preference) => (
                <button
                  key={preference}
                  type="button"
                  onClick={() => setPreferredTeacher(preference)}
                  className={`p-3 hover:transition-all duration-500 ease-in-out rounded-xl text-[#000] ${
                    preferredTeacher === preference
                      ? "bg-[#3c85fa2e]"
                      : "bg-gray-100"
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <h2 className="text-[14px] text-center font-bold mb-4 text-[#293552]">
                Where did you hear about AL Furquan?
              </h2>
              <div className="grid grid-cols-5 gap-4 mb-6 text-[13px]">
                {["Friend", "Social Media", "E-Mail", "Google", "Other"].map(
                  (source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setReferralSource(source)}
                      className={`p-3 hover:transition-all duration-500 ease-in-out rounded-xl text-[#000] ${
                        referralSource === source
                          ? "bg-[#3c85fa2e]"
                          : "bg-gray-100"
                      }`}
                    >
                      {source}
                    </button>
                  )
                )}
              </div>

              {referralSource === "Other" && (
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Please specify where you heard about us"
                    value={referralSourceOther}
                    onChange={(e) => setReferralSourceOther(e.target.value)}
                    className="w-full p-4 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#293552] bg-gray-100"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="justify-end mt-10 ml-[240px] text-[16px] p-2 align-middle py-2 px-4 bg-[#293552] text-white font-semibold hover:shadow-inner rounded-full shadow-lg flex"
            >
              Next &nbsp; <FcNext className="mt-1 text-[#fff]" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 rounded-3xl">
            <button
              type="button"
              onClick={prevStep}
              className="text-gray-500 mb-4 hover:text-gray-700 transition-colors"
            >
              Back
            </button>

            <div className="text-center mb-6">
              <h2 className="text-[18px] font-bold text-[#293552]">
                Select a Date and Time
              </h2>
            </div>

            <div className="flex md:flex-cols-2 gap-6">
              {/* Calendar Section */}
              <div className="p-2 rounded-[20px] shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                        .react-calendar {
                            width: 100% !important;
                            background-color: rgb(229, 231, 235) !important;
                            border: none !important;
                            border-radius: 20px !important;
                            padding:15px !important;
                        }
                        
                        .react-calendar .react-calendar__month-view__days__day {
                            font-size: 10px !important;
                            color: black !important;
                        }

                        .react-calendar .react-calendar__month-view__days__day--weekend:nth-child(7n + 1) {
                            color: #ef4444 !important;
                        }
                        
                        .react-calendar .react-calendar__tile--active,
                        .react-calendar .selected-date {
                            background-color: #293552 !important;
                            color: white !important;
                            border-radius: 6px !important;
                        }
                        
                        .react-calendar .react-calendar__tile--active.react-calendar__month-view__days__day--weekend:nth-child(7n + 1),
                        .react-calendar .selected-date.react-calendar__month-view__days__day--weekend:nth-child(7n + 1) {
                            color: white !important;
                        }
                    `,
                  }}
                />
                <Calendar
                  onChange={handleDateChange}
                  value={startDate}
                  tileDisabled={isTileDisabled}
                  className="mx-auto custom-calendar"
                  selectRange={false}
                  minDate={new Date()}
                  tileClassName={({ date, view }) =>
                    view === "month" &&
                    date.toDateString() === startDate.toDateString()
                      ? "selected-date"
                      : null
                  }
                />
              </div>
              {/* Available Times Section */}
              <div className="p-2 rounded-[20px] w-60 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
                <h3 className="text-[13px] text-center align-middle font-semibold mb-4 text-[#293552] p-2">
                  Available Time Slots
                </h3>
                <div className="grid grid-cols-1 text-center gap-4 mb-4">
                  <div>
                    {/* <p className="text-sm font-medium mb-2">From</p> */}
                    <div className="max-h-[250px] overflow-y-auto scrollbar-none">
                      <div className="grid grid-cols-1 gap-3 text-[11px]">
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            type="button"
                            value={preferredFromTime}
                            onClick={() => {
                              const fromTime = time;

                              // Check if fromTime is a valid string
                              if (
                                typeof fromTime === "string" &&
                                fromTime.includes(":")
                              ) {
                                setPreferredFromTime(fromTime);
                                const toTime =calculatePreferredToTime(fromTime);
                                setPreferredToTime(toTime);
                              } else {
                                console.error(
                                  "Invalid fromTime format:",
                                  fromTime
                                );
                                // Optionally, handle the error (e.g., show a message to the user)
                              }
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              preferredFromTime === time
                                ? "bg-[#293552] text-white shadow-lg transform scale-100 p-2 text-[10px]"
                                : "bg-gray-200 hover:bg-gray-100 p-2 text-[#293552] text-[10px]"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`justify-center ml-48 mt-8 text-[14px] p-2 align-middle py-2 px-4 bg-[#293552] text-white font-semibold hover:shadow-inner rounded-full shadow-lg flex ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MultiStepForm;
