"use client";

import axios, { AxiosError } from "axios";
import { Paperclip } from "lucide-react";
import React, { useEffect, useState } from "react";
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import {
  Country,
  ICountry,
} from "country-state-city";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import { appSuccessToastMessages, AppFailureToastMessages } from "@/app/_components/contents/toast_message";
type Props = {
  readonly onClose: () => void;
};

type SkillCategory = "technicalSkills" | "teachingSkills" | "languageProficiency";

type SkillGroups = Record<SkillCategory, string[]>;
type SkillDrafts = Record<SkillCategory, string>;
export enum RecruitmentDays {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

export enum RecruitmentPositions {
  DEVELOPER = "developer",
  UI_UX = "ui/ux",
}

type RecruitmentDay = RecruitmentDays;
const recruitmentDays = Object.values(RecruitmentDays);
const recruitmentPositions = Object.values(RecruitmentPositions);

type ParsedResumeData = {
  fields: Partial<AddApplicantFormData>;
  skills: SkillGroups;
};

interface AddApplicantFormData {
  applicationDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  dateOfBirth: string;
  address: string;
  highestQualification: string;
  specialization: string;
  universityInstitution: string;
  completionYear: string;
  teachingExperienceLevel: "fresher" | "experienced";
  teachingExperienceYears: string;
  teachingExperienceMonths: string;
  previousInstitutionName: string;
  previousDesignation: string;
  employmentType: string;
  teachingMode: string;
  availableWorkingDays: RecruitmentDay[];
  currentSalary: string;
  joiningAvailability: string;
  confirmedInformation: boolean;
  gender: string;
  position: string;
  expectedSalary: string;
  resume: File | null | undefined;
}

const resumeSectionHeadings =
  /^(education(?:al)?(?: details)?|academic|experience|employment|work history|skills?|technical skills|teaching skills|language(?:s| proficiency)?|personal details|personal particulars|contact(?: info)?|certifications?|references?)\s*:?\s*$/i;

function findLabeledValue(text: string, labels: string[]): string {
  const escapedLabels = labels.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const match = text.match(
    new RegExp(
      `^\\s*(?:${escapedLabels.join("|")})\\s*[:\\-]\\s*(.+?)\\s*$`,
      "im"
    )
  );
  return match?.[1]?.trim() ?? "";
}

function parseResumeDate(value: string): string {
  const isoDate = value.match(/\b(19|20)\d{2}[-/]\d{1,2}[-/]\d{1,2}\b/);
  if (isoDate) {
    const [year, month, day] = isoDate[0].split(/[-/]/);
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const textDate = value.match(
    /\b(\d{1,2})\s+([A-Za-z]{3,9})[,]?\s+((?:19|20)\d{2})\b/
  );
  if (textDate) {
    const monthIndex = new Date(`${textDate[2]} 1, 2000`).getMonth();
    if (!Number.isNaN(monthIndex)) {
      return `${textDate[3]}-${String(monthIndex + 1).padStart(2, "0")}-${textDate[1].padStart(2, "0")}`;
    }
  }

  const numericDate = value.match(
    /\b(\d{1,2})[/. -](\d{1,2})[/. -]((?:19|20)\d{2})\b/
  );
  if (numericDate) {
    const [, day, month, year] = numericDate;
    if (Number(day) <= 31 && Number(month) <= 12) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
  return "";
}

function findSectionText(text: string, headings: string[]): string {
  const lines = text.split(/\r?\n/);
  const headingPattern = new RegExp(`^(?:${headings.join("|")})\\s*:?\\s*$`, "i");
  const start = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (start < 0) return "";

  const sectionLines: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (resumeSectionHeadings.test(line.trim())) break;
    sectionLines.push(line);
  }
  return sectionLines.join("\n").trim();
}

function skillsFromSection(section: string): string[] {
  return Array.from(
    new Set(
      section
        .split(/[,;|\n•●▪]+/)
        .map((skill) =>
          skill
            .replace(/^[-*]\s*/, "")
            .replace(/\s*:\s*\d{1,3}%?\s*$/, "")
            .trim()
        )
        .filter((skill) => skill.length > 1 && skill.length <= 60)
    )
  );
}

function parseResumeText(
  text: string,
  knownPhoneCodes: string[]
): ParsedResumeData {
  const normalizedText = text.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ");
  const fields: ParsedResumeData["fields"] = {};
  const firstName = findLabeledValue(normalizedText, ["first name", "given name"]);
  const lastName = findLabeledValue(normalizedText, ["last name", "surname", "family name"]);
  const fullName = findLabeledValue(normalizedText, ["full name", "name"]);

  if (firstName) fields.firstName = firstName.split(/\s+/)[0];
  if (lastName) fields.lastName = lastName;
  if (fullName && !firstName && !lastName) {
    const nameParts = fullName.split(/\s+/);
    fields.firstName = nameParts.shift() ?? "";
    fields.lastName = nameParts.join(" ");
  } else if (!firstName && !lastName && !fullName) {
    const firstLine = normalizedText.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    if (
      firstLine &&
      firstLine.split(/\s+/).length <= 5 &&
      !/resume|curriculum vitae|profile|contact|teacher/i.test(firstLine)
    ) {
      const nameParts = firstLine.split(/\s+/);
      fields.firstName = nameParts.shift() ?? "";
      fields.lastName = nameParts.join(" ");
    }
  }

  const email = normalizedText.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
  if (email) fields.email = email;

  const labeledPhone = findLabeledValue(normalizedText, [
    "phone",
    "phone number",
    "mobile",
    "mobile number",
    "mobile no",
    "mobile no.",
    "contact number",
    "residence no",
    "residence no.",
  ]);
  const phone =
    labeledPhone.match(/(?:\+\s?\d{1,3}[\s().-]*)?(?:\d[\s().-]*){8,14}\d/)?.[0] ??
    normalizedText.match(/\+\s?\d{1,3}(?:[\s().-]*\d){8,14}/)?.[0];
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    const explicitCountryCode = phone.trim().startsWith("+");
    const countryCode = explicitCountryCode
      ? phoneCountryCodesForDigits(digits, knownPhoneCodes)
      : { code: "", digits: "" };
    if (!explicitCountryCode || countryCode.code) {
      fields.phoneCountryCode = countryCode.code || fields.phoneCountryCode;
      fields.phone = countryCode.code
        ? digits.slice(countryCode.digits.length)
        : digits;
    }
  }

  const birthDate = findLabeledValue(normalizedText, [
    "date of birth",
    "birth date",
    "dob",
  ]);
  if (birthDate) fields.dateOfBirth = parseResumeDate(birthDate);

  const gender = findLabeledValue(normalizedText, ["gender", "sex"]).toLowerCase();
  if (/\b(male|female|other)\b/.test(gender)) {
    fields.gender = gender.match(/\b(male|female|other)\b/)?.[1] ?? "";
  }

  const address = findLabeledValue(normalizedText, [
    "address",
    "current address",
    "location",
  ]);
  if (address) fields.address = address;

  const qualificationText =
    findLabeledValue(normalizedText, [
      "highest qualification",
      "qualification",
      "degree",
      "education",
    ]) ||
    findSectionText(normalizedText, [
      "education",
      "education details",
      "educational qualification",
    ]);
  const qualificationOptions: Array<[string, RegExp]> = [
    ["Ph.D.", /\b(?:ph\.?\s*d\.?|doctorate)\b/i],
    ["M.E.", /\bm\.?\s*e\.?\b|\bm\.?\s*tech\b/i],
    ["M.Ed", /\bm\.?\s*ed\.?\b/i],
    ["M.A.", /\bm\.?\s*a\.?\b/i],
    ["MCA", /\bmca\b/i],
    ["B.Ed", /\bb\.?\s*ed\.?\b/i],
    ["Master's Degree", /\bmasters?\b|\bm\.?\s*(?:sc|com|tech|ca)\.?\b/i],
    ["Bachelor's Degree", /\bbachelors?\b|\bb\.?\s*(?:a|sc|com|tech)\.?\b/i],
    ["Diploma", /\bdiploma\b/i],
    ["High School", /\bhigh school\b/i],
  ];
  const qualification = qualificationOptions.find(([, pattern]) =>
    pattern.test(qualificationText)
  )?.[0];
  if (qualification) fields.highestQualification = qualification;

  const specialization = findLabeledValue(normalizedText, [
    "specialization",
    "major",
    "subject",
  ]);
  const educationLines = findSectionText(normalizedText, [
    "education",
    "education details",
    "educational qualification",
  ]).split(/\r?\n/);
  const educationEntry = educationLines.find((line) =>
    /degree|diploma|bachelor|master|ph\.?d/i.test(line)
  );
  const educationSubject = educationEntry
    ?.match(/[:：]\s*(.+?)(?::\s*(?:19|20)\d{2}\b|$)/)?.[1]
    ?.trim();
  if (specialization || educationSubject) {
    fields.specialization = specialization || educationSubject || "";
  }

  const institution = findLabeledValue(normalizedText, [
    "university",
    "university / institution",
    "institution",
    "college",
  ]);
  const institutionLine = educationLines.find((line) =>
    /\b(?:university|college|institution)\b/i.test(line)
  );
  if (institution || institutionLine) {
    fields.universityInstitution = institution || institutionLine?.trim() || "";
  }

  const completionYear =
    findLabeledValue(normalizedText, ["completion year", "year of graduation", "graduation year"]) ||
    findSectionText(normalizedText, [
      "education",
      "education details",
      "educational qualification",
    ]).match(/\b(?:19|20)\d{2}\b/)?.[0];
  if (completionYear && /^\d{4}$/.test(completionYear)) {
    fields.completionYear = completionYear;
  }

  const experienceDuration = findLabeledValue(normalizedText, [
    "total teaching experience",
    "teaching experience",
    "total experience",
    "experience",
  ]);
  const yearMatch = experienceDuration.match(/(\d+)\s*(?:years?|yrs?)/i);
  const monthMatch = experienceDuration.match(/(\d+)\s*(?:months?|mos?)/i);
  if (yearMatch || monthMatch) {
    fields.teachingExperienceLevel = "experienced";
    fields.teachingExperienceYears = yearMatch?.[1].padStart(2, "0") ?? "00";
    fields.teachingExperienceMonths = monthMatch?.[1].padStart(2, "0") ?? "00";
  }
  const previousInstitution = findLabeledValue(normalizedText, [
    "previous institution",
    "previous employer",
    "organization",
    "school",
  ]);
  if (previousInstitution) fields.previousInstitutionName = previousInstitution;
  const designation = findLabeledValue(normalizedText, [
    "previous designation",
    "designation",
    "job title",
    "position",
  ]);
  if (designation) fields.previousDesignation = designation;

  const currentSalary = findLabeledValue(normalizedText, [
    "current salary",
    "current pay",
  ]);
  if (currentSalary) {
    const amount = currentSalary.replace(/[^\d.]/g, "");
    if (amount) fields.currentSalary = amount;
  }
  const expectedSalary = findLabeledValue(normalizedText, [
    "expected salary",
    "salary expectation",
    "salary expected",
  ]);
  if (expectedSalary) {
    const amount = expectedSalary.replace(/[^\d.]/g, "");
    if (amount) fields.expectedSalary = amount;
  }
  const employmentType = findLabeledValue(normalizedText, ["employment type"]);
  if (/full[\s-]?time/i.test(employmentType)) fields.employmentType = "Full Time";
  else if (/part[\s-]?time/i.test(employmentType)) fields.employmentType = "Part Time";
  else if (/contract/i.test(employmentType)) fields.employmentType = "Contract";

  const teachingMode = findLabeledValue(normalizedText, ["teaching mode", "work mode"]);
  if (/online/i.test(teachingMode)) fields.teachingMode = "Online";
  else if (/on[\s-]?site|in[\s-]?person/i.test(teachingMode)) {
    fields.teachingMode = "On-site";
  } else if (/hybrid/i.test(teachingMode)) fields.teachingMode = "Hybrid";

  const workingDays = findLabeledValue(normalizedText, [
    "available working days",
    "working days",
    "availability",
  ]);
  let parsedWorkingDays: RecruitmentDay[] = [];
  if (/monday\s*to\s*friday/i.test(workingDays)) {
    parsedWorkingDays = recruitmentDays.slice(0, 5);
  } else if (/monday\s*to\s*saturday/i.test(workingDays)) {
    parsedWorkingDays = recruitmentDays.slice(0, 6);
  } else if (/weekends?/i.test(workingDays)) {
    parsedWorkingDays = [RecruitmentDays.SATURDAY, RecruitmentDays.SUNDAY];
  } else {
    parsedWorkingDays = recruitmentDays.filter((day) =>
      new RegExp(`\\b${day}\\b`, "i").test(workingDays)
    );
  }
  if (parsedWorkingDays.length) {
    fields.availableWorkingDays = parsedWorkingDays;
  }

  const joiningAvailability = findLabeledValue(normalizedText, [
    "joining availability",
    "notice period",
    "availability to join",
  ]);
  if (/immediate/i.test(joiningAvailability)) {
    fields.joiningAvailability = "Immediate";
  } else if (/15\s*days?/i.test(joiningAvailability)) {
    fields.joiningAvailability = "Within 15 days";
  } else if (/30\s*days?/i.test(joiningAvailability)) {
    fields.joiningAvailability = "Within 30 days";
  } else if (/more than 30|over 30/i.test(joiningAvailability)) {
    fields.joiningAvailability = "More than 30 days";
  }

  const technicalSkills =
    findLabeledValue(normalizedText, ["technical skills"]) ||
    findSectionText(normalizedText, ["technical skills"]);
  const teachingSkills =
    findLabeledValue(normalizedText, ["teaching skills"]) ||
    findSectionText(normalizedText, ["teaching skills"]);
  const languageSkills =
    findLabeledValue(normalizedText, ["languages", "language proficiency"]) ||
    findSectionText(normalizedText, ["languages", "language proficiency"]);
  const generalSkills = findSectionText(normalizedText, ["skills", "key skills", "core skills"]);
  const parsedTechnicalSkills = skillsFromSection(technicalSkills);

  return {
    fields,
    skills: {
      technicalSkills:
        parsedTechnicalSkills.length > 0
          ? parsedTechnicalSkills
          : skillsFromSection(generalSkills),
      teachingSkills: skillsFromSection(teachingSkills),
      languageProficiency: skillsFromSection(languageSkills),
    },
  };
}

function phoneCountryCodesForDigits(
  phoneDigits: string,
  knownPhoneCodes: string[]
): { code: string; digits: string } {
  const matchedCode = knownPhoneCodes
    .map((code) => code.replace(/\D/g, ""))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .find((code) => phoneDigits.startsWith(code));
  return matchedCode
    ? { code: `+${matchedCode}`, digits: matchedCode }
    : { code: "", digits: "" };
}

function dateToIso(value: string): string {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : "";
}

export default function AddApplicants({ onClose }: Props) {
  const steps = [
    "Applicant details",
    "Educational Qualification",
    "Teaching Experience",
    "Skills & Expertise",
    "Job Preferences",
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParseMessage, setResumeParseMessage] = useState("");
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [isWorkingDaysPopupOpen, setIsWorkingDaysPopupOpen] = useState(false);
  const [addApplicantForm, setAddApplicantForm] =
    useState<AddApplicantFormData>({
      applicationDate: new Date().toISOString().split("T")[0],
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneCountryCode: "+91",
      dateOfBirth: "",
      address: "",
      highestQualification: "",
      specialization: "",
      universityInstitution: "",
      completionYear: "",
      teachingExperienceLevel: "fresher",
      teachingExperienceYears: "",
      teachingExperienceMonths: "",
      previousInstitutionName: "",
      previousDesignation: "",
      employmentType: "",
      teachingMode: "",
      availableWorkingDays: [],
      currentSalary: "",
      joiningAvailability: "",
      confirmedInformation: false,
      gender: "",
      position: "",
      expectedSalary: "",
      resume: null,
    });
const [skillGroups, setSkillGroups] = useState<SkillGroups>({
  technicalSkills: [],
  teachingSkills: [],
  languageProficiency: [],
});
const [skillDrafts, setSkillDrafts] = useState<SkillDrafts>({
  technicalSkills: "",
  teachingSkills: "",
  languageProficiency: "",
});
  const allSkills = Object.values(skillGroups).flat();
  const phoneCountry = countries.find(
    (country) =>
      country.phonecode === addApplicantForm.phoneCountryCode.replace(/^\+/, "")
  );
  const addressParts = addApplicantForm.address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const addressCountry = countries.find((country) =>
    addressParts.some(
      (part) => part.toLowerCase() === country.name.toLowerCase()
    )
  );
  const candidateCountry = addressCountry?.name || phoneCountry?.name || "";
  const candidateCity = addressParts[0] || "";
  const currency =
    (addressCountry || phoneCountry)?.currency || "";
  const phoneCountryCodes = Array.from(
    new Set([
      "91",
      ...countries.map((country) => country.phonecode).filter(Boolean),
    ])
  );
  const completionYears = Array.from({ length: 60 }, (_, index) =>
    String(new Date().getFullYear() - index)
  );
  const experienceYears = Array.from({ length: 41 }, (_, index) =>
    String(index).padStart(2, "0")
  );
  const experienceMonths = Array.from({ length: 12 }, (_, index) =>
    String(index).padStart(2, "0")
  );
  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    const updatedValue = name === "phone" ? value.replace(/\D/g, "") : value;
    if (name === "highestQualification") {
      setAddApplicantForm((prev) => ({ ...prev, highestQualification: value }));
      return;
    }
    setAddApplicantForm((prev) => ({ ...prev, [name]: updatedValue }));

    if (name === "phone") {
      setPhoneError(
        /^[0-9]{8,15}$/.test(updatedValue)
          ? ""
          : AppValidationMessages.APPLICANT.PHONE.pattern
      );
    }
  }
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);
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

  if (!addApplicantForm.gender) {
    toast.error(
      AppValidationMessages.APPLICANT.GENDER.required
    );
    return false;
  }

  if (
    addApplicantForm.teachingExperienceLevel === "experienced" &&
    (!addApplicantForm.teachingExperienceYears ||
      !addApplicantForm.teachingExperienceMonths ||
      !addApplicantForm.previousInstitutionName.trim() ||
      !addApplicantForm.previousDesignation.trim())
  ) {
    toast.error("Please complete your teaching experience details.");
    setCurrentStep(3);
    return false;
  }

  if (!addApplicantForm.expectedSalary) {
    toast.error(
      AppValidationMessages.APPLICANT.EXPECTED_SALARY.required
    );
    return false;
  }

  if (allSkills.length === 0) {
    toast.error(
      AppValidationMessages.APPLICANT.SKILLS.required
    );
    return false;
  }

  if (
    !addApplicantForm.employmentType ||
    !addApplicantForm.teachingMode ||
    addApplicantForm.availableWorkingDays.length === 0 ||
    !addApplicantForm.expectedSalary ||
    !addApplicantForm.joiningAvailability
  ) {
    toast.error("Please complete all job preference fields.");
    return false;
  }

  if (!addApplicantForm.confirmedInformation) {
    toast.error("Please confirm that the information provided is accurate.");
    return false;
  }

  // if (!addApplicantForm.resume) {
  //   toast.error(
  //     AppValidationMessages.APPLICANT.RESUME.required
  //   );
  //   return false;
  // }

  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isParsingResume) {
    toast.info("Please wait for resume reading to finish.");
    return;
  }

  if (currentStep < steps.length) {
    setCurrentStep((step) => step + 1);
    return;
  }

  // Validate first
  if (!validateForm()) {
    return;
  }

  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorAuthToken")
        : null;
    const tenantId =
      typeof window !== "undefined" ? localStorage.getItem("tenantId") : null;
    const createdBy =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalName")
        : null;
    const supervisorId =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalId")
        : null;
    const supervisorEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalEmail")
        : null;
    const supervisorRole =
      typeof window !== "undefined"
        ? localStorage.getItem("SupervisorPortalRole")
        : null;

    if (!token || !tenantId || !createdBy) {
      toast.error(!token
        ? AppValidationMessages.AUTH.TOKEN_REQUIRED
        : "Tenant or supervisor information is missing. Please sign in again.");
      return;
    }

    const experienceYears =
      addApplicantForm.teachingExperienceLevel === "experienced"
        ? Number(addApplicantForm.teachingExperienceYears || 0)
        : 0;
    const experienceMonths =
      addApplicantForm.teachingExperienceLevel === "experienced"
        ? Number(addApplicantForm.teachingExperienceMonths || 0)
        : 0;
    const employmentType = ({
      "Full Time": "full-time",
      "Part Time": "part-time",
      "half-time": "part-time",
      Contract: "contract",
    } as Record<string, string>)[addApplicantForm.employmentType] ||
      addApplicantForm.employmentType;
    const joiningAvailability = ({
      Immediate: "immediate",
      "Within 15 days": "15 days",
      "Within 30 days": "30 days",
      "More than 30 days": "more than 30 days",
    } as Record<string, string>)[addApplicantForm.joiningAvailability] ||
      addApplicantForm.joiningAvailability;
    const payload = {
      tenantId,
      candidateFirstName: addApplicantForm.firstName.trim(),
      candidateLastName: addApplicantForm.lastName.trim(),
      gender: addApplicantForm.gender,
      position: addApplicantForm.position.trim(),
      supervisor: {
        ...(supervisorId ? { supervisorId } : {}),
        supervisorName: createdBy,
        ...(supervisorEmail ? { supervisorEmail } : {}),
        ...(supervisorRole ? { supervisorRole } : {}),
      },
      dateOfBirth: dateToIso(addApplicantForm.dateOfBirth),
      address: addApplicantForm.address.trim(),
      highestQualification: addApplicantForm.highestQualification,
      specialization: addApplicantForm.specialization.trim(),
      university: addApplicantForm.universityInstitution.trim(),
      completionYear: Number(addApplicantForm.completionYear) || 0,
      experienceType: addApplicantForm.teachingExperienceLevel,
      teachingExperience: experienceYears + experienceMonths / 12,
      previousInstitutionName:
        addApplicantForm.teachingExperienceLevel === "experienced"
          ? addApplicantForm.previousInstitutionName.trim()
          : "",
      previousDesignation:
        addApplicantForm.teachingExperienceLevel === "experienced"
          ? addApplicantForm.previousDesignation.trim()
          : "",
      technicalSkills: skillGroups.technicalSkills,
      teachingSkills: skillGroups.teachingSkills,
      languages: skillGroups.languageProficiency,
      employmentType,
      teachingMode: addApplicantForm.teachingMode
        ? [addApplicantForm.teachingMode]
        : [],
      availableWorkingDays: addApplicantForm.availableWorkingDays,
      currentSalary: Number(addApplicantForm.currentSalary) || 0,
      joiningAvailability,
      applicationDate: dateToIso(addApplicantForm.applicationDate),
      candidateEmail: addApplicantForm.email.trim(),
      candidatePhoneNumber: Number(addApplicantForm.phone),
      candidateCountry,
      candidateCity,
      currency,
      expectedSalary: Number(addApplicantForm.expectedSalary),
      createdDate: new Date().toISOString(),
      createdBy,
    };

    const requestData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      requestData.append(
        key,
        value !== null && typeof value === "object"
          ? JSON.stringify(value)
          : String(value ?? "")
      );
    });
    if (addApplicantForm.resume) {
      requestData.append(
        "uploadResume",
        addApplicantForm.resume,
        addApplicantForm.resume.name
      );
    }

    const response = await axios.post(
      `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RECRUITMENT.CREATE_SUPERVISOR_RECRUIT}`,
      requestData,
      {
        headers: {
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
        phoneCountryCode: "+91",
        dateOfBirth: "",
        address: "",
        highestQualification: "",
        specialization: "",
        universityInstitution: "",
        completionYear: "",
        teachingExperienceLevel: "fresher",
        teachingExperienceYears: "",
        teachingExperienceMonths: "",
        previousInstitutionName: "",
        previousDesignation: "",
        employmentType: "",
        teachingMode: "",
        availableWorkingDays: [],
        currentSalary: "",
        joiningAvailability: "",
        confirmedInformation: false,
        phone: "",
        gender: "",
        position: "",
        expectedSalary: "",
        resume: null,
      });
      setSkillGroups({
        technicalSkills: [],
        teachingSkills: [],
        languageProficiency: [],
      });
      setSkillDrafts({
        technicalSkills: "",
        teachingSkills: "",
        languageProficiency: "",
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    }
  } catch (err) {
    const error = err as AxiosError<{ message?: string; error?: unknown }>;
    const status = error.response?.status;
    console.error("Applicant recruitment request failed", {
      status,
      responseMessage: error.response?.data?.message,
      message: error.message,
    });

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
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (![".pdf", ".doc", ".docx"].includes(extension)) {
      setFailedMessage(AppFailureToastMessages.UPLOAD_INVALID_FORMAT);
      setFailed(true);
      event.target.value = "";
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setFailedMessage(AppFailureToastMessages.UPLOAD_FILE_TOO_LARGE);
      setFailed(true);
      event.target.value = "";
      return;
    }

    setAddApplicantForm((prev) => ({ ...prev, resume: file }));
    setResumeParseMessage("");

    if (extension === ".doc") {
      setResumeParseMessage(
        "Resume attached. Automatic extraction is available for PDF and DOCX; enter details from this DOC file manually."
      );
      return;
    }

    setIsParsingResume(true);
    setResumeParseMessage("Reading resume and looking for form details...");

    try {
      let text = "";
      if (extension === ".pdf") {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.js",
          import.meta.url
        ).toString();
        const pdf = await pdfjs.getDocument({
          data: await file.arrayBuffer(),
        }).promise;

        try {
          const pages = await Promise.all(
            Array.from({ length: pdf.numPages }, async (_, index) => {
              const page = await pdf.getPage(index + 1);
              const content = await page.getTextContent();
              return content.items
                .map((item) => {
                  if (!("str" in item)) return "";
                  return `${item.str}${"hasEOL" in item && item.hasEOL ? "\n" : " "}`;
                })
                .join("");
            })
          );
          text = pages.join("\n");
        } finally {
          await pdf.destroy();
        }
      } else {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({
          arrayBuffer: await file.arrayBuffer(),
        });
        text = result.value;
      }

      if (!text.trim()) {
        setResumeParseMessage(
          "No selectable text was found. This may be a scanned resume; please enter the details manually."
        );
        return;
      }

      const parsed = parseResumeText(
        text,
        phoneCountryCodes.map((code) => code.replace(/^\+/, ""))
      );
      const fieldNames: (keyof AddApplicantFormData)[] = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "phoneCountryCode",
        "dateOfBirth",
        "address",
        "highestQualification",
        "specialization",
        "universityInstitution",
        "completionYear",
        "teachingExperienceLevel",
        "teachingExperienceYears",
        "teachingExperienceMonths",
        "previousInstitutionName",
        "previousDesignation",
        "currentSalary",
        "expectedSalary",
        "employmentType",
        "position",
        "teachingMode",
        "availableWorkingDays",
        "joiningAvailability",
        "gender",
      ];
      const fieldsFound = fieldNames.filter((field) => {
        const value = parsed.fields[field];
        return (
          (typeof value === "string" && value.trim().length > 0) ||
          (Array.isArray(value) && value.length > 0)
        );
      });
      setAddApplicantForm((previous) => {
        const updated = { ...previous };
        fieldsFound.forEach((field) => {
          const value = parsed.fields[field];
          const currentValue = previous[field];
          const isEmpty = Array.isArray(currentValue)
            ? currentValue.length === 0
            : !String(currentValue ?? "").trim();
          const isDefaultPhoneCode =
            field === "phoneCountryCode" && currentValue === "+91";
          if (
            ((typeof value === "string" && value.trim().length > 0) ||
              (Array.isArray(value) && value.length > 0)) &&
            (isEmpty || isDefaultPhoneCode)
          ) {
            Object.assign(updated, { [field]: value });
          }
        });
        return updated;
      });

      setSkillGroups((previous) => ({
        technicalSkills: Array.from(
          new Set([...previous.technicalSkills, ...parsed.skills.technicalSkills])
        ),
        teachingSkills: Array.from(
          new Set([...previous.teachingSkills, ...parsed.skills.teachingSkills])
        ),
        languageProficiency: Array.from(
          new Set([
            ...previous.languageProficiency,
            ...parsed.skills.languageProficiency,
          ])
        ),
      }));

      const skillsFound = Object.values(parsed.skills).some(
        (skills) => skills.length > 0
      );
      if (fieldsFound.length || skillsFound) {
        const count =
          fieldsFound.length +
          Object.values(parsed.skills).reduce(
            (total, skills) => total + skills.length,
            0
          );
        setResumeParseMessage(
          `Found ${count} detail${count === 1 ? "" : "s"} in your resume. Please review the fields and complete anything missing.`
        );
      } else {
        setResumeParseMessage(
          "Resume attached, but no recognizable details were found. Please enter the details manually."
        );
      }
    } catch (error) {
      console.error("Unable to extract resume details", error);
      setResumeParseMessage(
        "Resume attached, but it could not be read automatically. Please enter the details manually."
      );
    } finally {
      setIsParsingResume(false);
    }
  };
  const addSkill = (category: SkillCategory) => {
    const skill = skillDrafts[category].trim();
    if (!skill || skillGroups[category].includes(skill)) return;

    setSkillGroups((prev) => ({
      ...prev,
      [category]: [...prev[category], skill],
    }));
    setSkillDrafts((prev) => ({ ...prev, [category]: "" }));
  };

  const removeSkill = (category: SkillCategory, skillToRemove: string) => {
    setSkillGroups((prev) => ({
      ...prev,
      [category]: prev[category].filter((skill) => skill !== skillToRemove),
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 ">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1D1D1D] rounded-lg shadow-xl p-5 w-full max-w-3xl mx-3 text-sm scrollbar-none"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold mt-2 text-black mb-3 dark:text-[#FFFFFF]">
            Teacher Application
          </h1>
          <button className="cursor-pointer bg-gray-200 rounded-full w-6 h-6 text-sm" onClick={onClose}>
            x
          </button>
        </div>

L
        <div className="space-y-4">
          {currentStep === 1 && (
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:p-4">
              <div className="mb-4 rounded-lg bg-[#f3f3f3] p-3 dark:bg-[#292929]">
                <label
                  htmlFor="resumeUpload"
                  className="mb-2 block font-medium text-[#010E30] dark:text-white"
                >
                  Upload Your Resume
                </label>
                <label
                  htmlFor="resumeUpload"
                  className="flex min-h-10 cursor-pointer items-center justify-between rounded-md border border-[#E0E0E0] bg-[#f3f3f3] px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:bg-[#343434] dark:text-gray-300"
                >
                  <span>
                    {addApplicantForm.resume?.name ||
                      "PDF / DOC / DOCX (max 12 MB)"}
                  </span>
                  <Paperclip size={16} className="text-[#576CBC]" />
                </label>
                <input
                  id="resumeUpload"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={isParsingResume}
                  className="sr-only"
                />
                <p
                  aria-live="polite"
                  className={`mt-2 text-xs ${
                    resumeParseMessage.startsWith("Found")
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {isParsingResume ? "Reading resume..." : resumeParseMessage}
                </p>
              </div>

              <h2 className="mb-4 text-base font-medium text-[#010E30] dark:text-white">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={addApplicantForm.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={addApplicantForm.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={addApplicantForm.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    type="email"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      aria-label="Phone country calling code"
                      value={addApplicantForm.phoneCountryCode}
                      onChange={(event) =>
                        setAddApplicantForm((prev) => ({
                          ...prev,
                          phoneCountryCode: event.target.value,
                        }))
                      }
                      className="w-20 rounded-md border border-[#E0E4EA] bg-white px-2 py-2 text-xs text-[#343434] focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                    >
                      {phoneCountryCodes.map((code) => (
                        <option key={code} value={`+${code}`}>
                          +{code}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      value={addApplicantForm.phone}
                      onChange={handleChange}
                      placeholder="00000 00000"
                      type="tel"
                      className="min-w-0 flex-1 rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={addApplicantForm.dateOfBirth}
                    onChange={handleChange}
                    type="date"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <fieldset>
                  <legend className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white">
                    Gender
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {["male", "female", "other"].map((gender) => (
                      <label
                        key={gender}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-[#E0E4EA] px-2 py-2 text-xs capitalize text-gray-600 dark:border-gray-600 dark:text-gray-300"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={addApplicantForm.gender === gender}
                          onChange={handleChange}
                          className="h-4 w-4 accent-[#576CBC]"
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={addApplicantForm.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <section className="rounded-lg border border-[#E0E4EA] p-3 dark:border-gray-700 sm:p-4">
              <h2 className="mb-3 text-sm font-medium text-[#010E30] dark:text-white">
                Educational Qualification
              </h2>
              <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="highestQualification"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Highest Qualification
                  </label>
                  <select
                    id="highestQualification"
                    name="highestQualification"
                    value={addApplicantForm.highestQualification}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">Select qualification</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                    <option value="M.E.">M.E.</option>
                    <option value="B.Ed">B.Ed</option>
                    <option value="M.A.">M.A.</option>
                    <option value="M.Ed">M.Ed</option>
                    <option value="MCA">MCA</option>
                    <option value="Master's Degree">Master&apos;s Degree</option>
                    <option value="Ph.D.">Ph.D.</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="specialization"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    value={addApplicantForm.specialization}
                    onChange={handleChange}
                    placeholder="Enter specialization"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="universityInstitution"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    University / Institution
                  </label>
                  <input
                    id="universityInstitution"
                    name="universityInstitution"
                    value={addApplicantForm.universityInstitution}
                    onChange={handleChange}
                    placeholder="Enter university or institution"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="completionYear"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Completion Year
                  </label>
                  <select
                    id="completionYear"
                    name="completionYear"
                    value={addApplicantForm.completionYear}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">Select year</option>
                    {completionYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="rounded-lg border border-[#E0E4EA] p-3 dark:border-gray-700 sm:p-4">
              <h2 className="mb-3 text-sm font-medium text-[#010E30] dark:text-white">
                Teaching Experience
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-[#EEF0FA] p-1 dark:bg-[#292929]">
                {(["fresher", "experienced"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={addApplicantForm.teachingExperienceLevel === level}
                    onClick={() =>
                      setAddApplicantForm((prev) => ({
                        ...prev,
                        teachingExperienceLevel: level,
                      }))
                    }
                    className={`rounded-full border px-3 py-2 text-xs capitalize transition ${
                      addApplicantForm.teachingExperienceLevel === level
                        ? "border-[#576CBC] bg-white text-[#576CBC] dark:bg-[#343434]"
                        : "border-transparent text-gray-500 dark:text-gray-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <fieldset
                disabled={addApplicantForm.teachingExperienceLevel === "fresher"}
                className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 disabled:opacity-50"
              >
                <div>
                  <label
                    htmlFor="teachingExperienceYears"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Total Teaching Experience
                  </label>
                  <select
                    id="teachingExperienceYears"
                    name="teachingExperienceYears"
                    value={addApplicantForm.teachingExperienceYears}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">Years (YY)</option>
                    {experienceYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="teachingExperienceMonths"
                    className="mb-1 block text-xs font-medium text-transparent"
                  >
                    Experience months
                  </label>
                  <select
                    id="teachingExperienceMonths"
                    name="teachingExperienceMonths"
                    value={addApplicantForm.teachingExperienceMonths}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  >
                    <option value="">Months (MM)</option>
                    {experienceMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="previousInstitutionName"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Previous Institution Name
                  </label>
                  <input
                    id="previousInstitutionName"
                    name="previousInstitutionName"
                    value={addApplicantForm.previousInstitutionName}
                    onChange={handleChange}
                    placeholder="Enter institution name"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="previousDesignation"
                    className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                  >
                    Previous Designation
                  </label>
                  <input
                    id="previousDesignation"
                    name="previousDesignation"
                    value={addApplicantForm.previousDesignation}
                    onChange={handleChange}
                    placeholder="Enter designation"
                    type="text"
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] placeholder:text-gray-400 focus:border-[#576CBC] focus:outline-none dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  />
                </div>
              </fieldset>
            </section>
          )}

          {currentStep === 4 && (
            <section className="rounded-lg border border-[#E0E4EA] p-3 dark:border-gray-700 sm:p-4">
              <h2 className="mb-4 text-sm font-medium text-[#010E30] dark:text-white">
                Skills &amp; Expertise
              </h2>
              <div className="space-y-4">
                {([
                  ["technicalSkills", "Technical Skills"],
                  ["teachingSkills", "Teaching Skills"],
                  ["languageProficiency", "Language Proficiency"],
                ] as const).map(([category, label]) => (
                  <div key={category}>
                    <label
                      htmlFor={category}
                      className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                    >
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-md border border-[#E0E4EA] bg-white px-2 py-1 dark:border-gray-600 dark:bg-[#343434]">
                        {skillGroups[category].map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-full bg-[#E3E9FF] px-2.5 py-1 text-[11px] text-[#536AAE]"
                          >
                            {skill}
                            <button
                              type="button"
                              aria-label={`Remove ${skill} from ${label}`}
                              onClick={() => removeSkill(category, skill)}
                              className="font-semibold hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          id={category}
                          value={skillDrafts[category]}
                          onChange={(event) =>
                            setSkillDrafts((prev) => ({
                              ...prev,
                              [category]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addSkill(category);
                            }
                          }}
                          placeholder="Type a skill"
                          className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-xs text-[#343434] outline-none placeholder:text-gray-400 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addSkill(category)}
                        className="shrink-0 px-1 text-xs font-medium text-[#576CBC] hover:text-blue-700"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {currentStep === 5 && (
          <section className="rounded-lg border border-[#E0E4EA] p-3 dark:border-gray-700 sm:p-4">
            <h2 className="mb-4 text-sm font-medium text-[#010E30] dark:text-white">
              Job Preferences
            </h2>
            <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                <label
                  htmlFor="position"
                  className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                >
                  Position
                </label>
                <select
                  id="position"
                  name="position"
                  value={addApplicantForm.position}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                >
                  <option value="">Select position</option>
                  {recruitmentPositions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="employmentType"
                  className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                >
                  Employment Type
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={addApplicantForm.employmentType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                >
                  <option value="">Select employment type</option>
                  <option value="full-time">Full Time</option>
                  <option value="half-time">Part Time</option>
                  <option value="hourly">Hour Base</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="teachingMode"
                  className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                >
                  Teaching Mode
                </label>
                <select
                  id="teachingMode"
                  name="teachingMode"
                  value={addApplicantForm.teachingMode}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                >
                  <option value="">Select teaching mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <div className="relative">
                  <span className="mb-2 block text-xs font-medium text-[#010E30] dark:text-white">
                    Available Working Days
                  </span>
                  <button
                    type="button"
                    aria-expanded={isWorkingDaysPopupOpen}
                    aria-controls="availableWorkingDaysPopup"
                    onClick={() =>
                      setIsWorkingDaysPopupOpen((isOpen) => !isOpen)
                    }
                    className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-left text-xs text-[#343434] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                  >
                    {addApplicantForm.availableWorkingDays.length
                      ? addApplicantForm.availableWorkingDays.join(", ")
                      : "Select available working days"}
                  </button>
                  {isWorkingDaysPopupOpen && (
                    <fieldset
                      id="availableWorkingDaysPopup"
                      className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-[#E0E4EA] bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-[#343434]"
                    >
                      <legend className="sr-only">
                        Select available working days
                      </legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {recruitmentDays.map((day) => (
                          <label
                            key={day}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-[#979393] px-2 py-1.5 text-[10px] text-[#343434] dark:border-gray-600 dark:text-white"
                          >
                            <input
                              type="checkbox"
                              name="availableWorkingDays"
                              value={day}
                              checked={addApplicantForm.availableWorkingDays.includes(day)}
                              onChange={(event) =>
                                setAddApplicantForm((previous) => ({
                                  ...previous,
                                  availableWorkingDays: recruitmentDays.filter(
                                    (workingDay) =>
                                      event.target.checked
                                        ? workingDay === day ||
                                          previous.availableWorkingDays.includes(workingDay)
                                        : workingDay !== day &&
                                          previous.availableWorkingDays.includes(workingDay)
                                  ),
                                }))
                              }
                              className="h-3 w-3 accent-[#576CBC]"
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsWorkingDaysPopupOpen(false)}
                          className="rounded-md bg-[#576CBC] px-3 py-1.5 text-xs text-white"
                        >
                          Done
                        </button>
                      </div>
                    </fieldset>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="currentSalary"
                  className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                >
                  Current Salary
                </label>
                <div className="flex rounded-md border border-[#E0E4EA] dark:border-gray-600">
                  <span className="px-3 py-2 text-xs text-gray-500">
                    {currency || "Currency"}
                  </span>
                  <input
                    id="currentSalary"
                    name="currentSalary"
                    value={addApplicantForm.currentSalary}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    placeholder="Enter current salary"
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-[#343434] outline-none dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="expectedSalary"
                  className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                >
                  Expected Salary
                </label>
                <div className="flex rounded-md border border-[#E0E4EA] dark:border-gray-600">
                  <span className="px-3 py-2 text-xs text-gray-500">
                    {currency || "Currency"}
                  </span>
                  <input
                    id="expectedSalary"
                    name="expectedSalary"
                    value={addApplicantForm.expectedSalary}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    placeholder="Enter expected salary"
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-[#343434] outline-none dark:text-white"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="joiningAvailability"
                  className="mb-1 block text-xs font-medium text-[#010E30] dark:text-white"
                >
                  Joining Availability
                </label>
                <select
                  id="joiningAvailability"
                  name="joiningAvailability"
                  value={addApplicantForm.joiningAvailability}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E0E4EA] bg-white px-3 py-2 text-xs text-[#343434] dark:border-gray-600 dark:bg-[#343434] dark:text-white"
                >
                  <option value="">Select joining availability</option>
                  <option value="Immediate">Immediate</option>
                  <option value="Within 15 days">Within 15 days</option>
                  <option value="Within 30 days">Within 30 days</option>
                </select>
              </div>
              <label className="flex items-start gap-2 text-xs text-gray-500 sm:col-span-2 dark:text-gray-400">
                <input
                  type="checkbox"
                  name="confirmedInformation"
                  checked={addApplicantForm.confirmedInformation}
                  onChange={(event) =>
                    setAddApplicantForm((prev) => ({
                      ...prev,
                      confirmedInformation: event.target.checked,
                    }))
                  }
                  className="mt-0.5 accent-[#576CBC]"
                />
                <span>I confirm that all information provided is accurate.</span>
              </label>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-4 mt-4 flex justify-end gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((step) => step - 1)}
              className="px-3 py-1 border border-[#576CBC] rounded text-[#576CBC] hover:bg-gray-100 transition"
            >
              Back
            </button>
          )}
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep((step) => step + 1)}
              disabled={isParsingResume}
              className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isParsingResume}
              className="px-3 py-1 bg-[#576CBC] text-white rounded hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit
            </button>
          )}
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
