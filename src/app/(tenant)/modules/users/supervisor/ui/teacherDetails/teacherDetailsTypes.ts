export interface TeacherProfile {
  _id: string;
  teacherId?: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  candidateEmail?: string;
  candidatePhoneNumber?: number | string;
  phoneCountryCode?: string;
  candidateCountry?: string;
  candidateCity?: string;
  positionApplied?: string;
  currency?: string;
  expectedSalary?: number;
  preferedWorkingHours?: string;
  uploadResume?: { type: string; data: number[] } | string;
  applicationStatus?: string;
  overallRating?: number;
  status?: string;
  applicationDate?: string;
  dateOfJoining?: string;
  createdDate?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  highestQualification?: string;
  qualification?: string;
  specialization?: string;
  university?: string;
  completionYear?: string | number;
  experience?: string | number;
  teachingExperience?: string | number;
  experienceType?: string;
  employmentType?: string;
  skills?: string | string[];
  [key: string]: unknown;
}

export interface TeacherStats {
  totalstudents?: number;
  totalclasses?: number;
  totalhours?: number;
  totalearnings?: number;
  overallPerformance?: number;
}

export interface TeacherClass {
  _id?: string;
  classId?: string;
  course?: { courseName?: string };
  sessionClassType?: string;
  scheduleStatus?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string[];
  endTime?: string[];
  classDay?: string[];
}

export type TeacherDetailsTabId =
  | "overview"
  | "personal"
  | "documents"
  | "classes"
  | "salary";

export interface TeacherDetailsTabProps {
  teacher: TeacherProfile;
  stats: TeacherStats | null;
  classes: TeacherClass[];
  classesLoading: boolean;
}

export interface TeacherOverviewProps extends TeacherDetailsTabProps {
  onChangeTab: (tab: TeacherDetailsTabId) => void;
}

export interface TeacherDocumentsProps extends TeacherDetailsTabProps {
  onViewResume: () => void;
}
