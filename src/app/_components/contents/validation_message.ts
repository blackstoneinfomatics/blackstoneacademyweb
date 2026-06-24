// app-validation-messages.ts

export const AppValidationMessages = Object.freeze({
  AUTH: {
    TOKEN_REQUIRED: "Please login again",
    STUDENT_REQUIRED: "Student information not found",
    COURSE_REQUIRED: "Course information not found",
    TEACHER_REQUIRED: "Teacher information not found",
    PERMISSION_REQUIRED: "Role permission information not found",
  },

  FILTER: {
    INVALID_ASSIGNED_DATE:"Assigned From Date cannot be greater than Assigned To Date",
    INVALID_DUE_DATE: "Due From Date cannot be greater than Due To Date",
    INVALID_DATE_RANGE: "From Date cannot be greater than To Date",
  },

  MEETING: {
    NO_MEETING_FOUND: "No upcoming meetings available",
    INVALID_MEETING_ID: "Meeting information is unavailable",
    
    TITLE_REQUIRED: "Meeting name is required",
    TITLE_MIN: "Meeting name must be at least 3 characters long",

    PARTICIPANT_REQUIRED: "Please select at least one participant",

    DATE_REQUIRED: "Meeting date is required",
    FUTURE_DATE_REQUIRED: "Please select a future date",

    START_TIME_REQUIRED: "Start time is required",
    END_TIME_REQUIRED: "End time is required",

    INVALID_TIME: "End time must be greater than start time",

    DESCRIPTION_REQUIRED: "Description is required",
    DESCRIPTION_MIN: "Description must be at least 10 characters long",
    FILL_ALL_FIELDS: "Please fill all fields",
  },

  RESCHEDULE: {
    REASON_REQUIRED: "Reason for reschedule is required",
    DATE_REQUIRED: "Reschedule date is required",
    TIME_REQUIRED: "Reschedule time is required",
  },

  CLASS: {
    NO_UPCOMING_CLASS: "No upcoming classes available",
    CLASS_LINK_REQUIRED: "Class link is not available",
    NO_CLASS_HOURS_FOUND: "No class hours data available",
    NO_CLASS_FOUND: "No upcoming classes found",
    NO_ANALYTICS_DATA: "No class analytics data found",

  },

  PAYMENT: {
    NO_PAYMENT_FOUND: "No payment records found",
  },

  COURSE: {
    NO_COURSE_OVERVIEW_DATA:"No course overview data available",
},

GROWTH: {
  NO_PROGRESS_DATA: "No learning progress data available",
},

EARNINGS: {
  NO_EARNINGS_DATA: "No earnings data found",
},

ASSIGNMENT: {
  TEACHER_REQUIRED: "Teacher information not found",
  NO_ASSIGNMENT_DATA: "No assignment data available",
  SELECT_REQUIRED: "Please select at least one assignment",
  ASSIGNMENT_NAME_REQUIRED: "Assignment name is required",
  ASSIGNMENT_TYPE_REQUIRED: "Assignment type is required",
  TRUE_FALSE_REQUIRED: "Please select True or False as the correct answer",
  QUESTION_REQUIRED: "Question is required",
  ANSWER_REQUIRED: "You must answer at least one question before submitting.",
  LEAVE_TYPE_REQUIRED: "Please select leave type",
  FROM_DATE_REQUIRED: "From date is required",
  TO_DATE_REQUIRED: "To date is required",
  REASON_REQUIRED: "Reason is required",
  REASON_MIN_LENGTH: "Reason must be at least 5 characters",
  INVALID_DATE_RANGE: "To date should be greater than from date",
  LOGIN_REQUIRED: "Please login again",
  ACCESS_DENIED: "You don't have permission to perform this action",
  SERVER_ERROR: "Server error occurred",
  INVALID_INPUTS: "Please check the form inputs",
  UNEXPECTED_ERROR: "Something went wrong"
},
  
STUDENT: {
  STUDENT_ID_REQUIRED: "Student information not found",
  STUDENT_DATA_NOT_FOUND: "Student details not available",
},

NEXT_SCHEDULED_CLASS: {
  NO_TEACHER_ID: "Teacher information not found",
  NO_TOKEN: "Please login again",
  NO_CLASS_FOUND: "No upcoming class found",
},

NEXT_MEETING: {
  NO_MEETING_FOUND: "No upcoming meetings available",
  MEETING_LINK_REQUIRED: "Meeting link is not available"
},

TRIAL_CLASS: {
  NO_TRIAL_CLASS_FOUND: "No upcoming trial classes available",
  MEETING_LINK_REQUIRED: "Meeting link is not available"
},

SCHEDULED_CLASSES: {
  NO_CLASSES_FOUND: "No scheduled classes found",
  FROM_DATE_REQUIRED: "Please select From Date",
  TO_DATE_REQUIRED: "Please select To Date",
  INVALID_DATE_RANGE: "To Date should be greater than From Date"
},

TEACHER_STUDENTS: {
  NO_STUDENTS_FOUND: "No students found"
},

TEACHER_MEETING: {
  NO_MEETINGS_FOUND: "No meetings found",
  RESCHEDULE_REASON_REQUIRED: "Please enter reschedule reason",
  RESCHEDULE_DATE_REQUIRED: "Please select reschedule date",
  RESCHEDULE_TIME_REQUIRED: "Please select reschedule time",
  MEETING_ID_REQUIRED: "Meeting ID is missing"
},

  EVALUATION: {
    PREFERRED_HOURS_REQUIRED: "Please select preferred hours first",
    WEEKLY_HOUR_LIMIT: "You've reached your weekly hour limit."
    ,
    DUPLICATE_SLOT: "Slot already added",
  },

  ACADEMIC_COACH: {
    NO_STUDENTS_FOUND: "No students found",
    NO_EVALUATION_DATA: "No evaluation data available",
  },

APPLICANT: {
    FIRST_NAME: {
      required: "First name is required",
    },

    LAST_NAME: {
      required: "Last name is required",
    },

    EMAIL: {
      required: "Email is required",
      pattern: "Invalid email address",
    },

    PHONE: {
      required: "Phone number is required",
      pattern: "Invalid phone number",
    },

    CITY: {
      required: "City is required",
    },

    COUNTRY: {
      required: "Country is required",
    },

    GENDER: {
      required: "Gender is required",
    },

    EXPECTED_SALARY: {
      required: "Expected salary is required",
    },

    WORKING_HOURS: {
      required: "Working hours is required",
    },

    SKILLS: {
      required: "Please select at least one skill",
    },

    RESUME: {
      required: "Resume is required",
    },
  },
  EXPENSE: {
    PAYMENT_DATE_REQUIRED: "Payment date is required",
    EXPENSE_TYPE_REQUIRED: "Expense type is required",
    AMOUNT_REQUIRED: "Amount is required",
    AMOUNT_POSITIVE: "Amount must be greater than 0",
    CATEGORY_REQUIRED: "Category is required",
    PAYMENT_METHOD_REQUIRED: "Payment method is required",
  },
  EMPLOYEE: {
    FIRST_NAME_REQUIRED: "First name is required",
    LAST_NAME_REQUIRED: "Last name is required",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Email is invalid",
    PHONE_REQUIRED: "Phone number is required",
    DESIGNATION_REQUIRED: "Designation is required",
    DEPARTMENT_REQUIRED: "Department is required",
    COMMENTS_REQUIRED: "Comments are required",
  },

  DATA_FETCH: {
    MISSING_CREDENTIALS: "Missing token or student ID",
    MISSING_TOKEN: "Authentication token not found",
    MISSING_ID: "Required ID not found",
    MISSING_DATA: "Required data is missing",
    FAILED_ASSIGNMENTS: "Failed to fetch assignments",
    FAILED_NOTIFICATIONS: "Failed to fetch notifications",
    FAILED_STUDENTS: "Failed to fetch students",
    FAILED_TEACHERS: "Failed to fetch teachers",
    FAILED_SCHEDULE: "Failed to fetch class schedule",
    FAILED_MEETINGS: "Failed to fetch meetings",
    FAILED_PROFILE: "Failed to fetch profile information",
    FAILED_INVOICES: "Failed to fetch invoices",
    FAILED_KNOWLEDGE: "Failed to fetch knowledge base",
    FAILED_RECORDED_CLASSES: "Failed to fetch recorded classes",
    INVALID_DATA_STRUCTURE: "Invalid data structure received from API",
  },

  ERROR_MESSAGES: {
    MISSING_STUDENT_ID: "Missing student ID",
    MISSING_TEACHER_ID: "Teacher ID not found",
    MISSING_ACADEMIC_COACH_ID: "Academic Coach ID not found",
    MISSING_AUTH_TOKEN: "Authentication token not found",
    MISSING_START_TIME: "Start time is missing",
    MISSING_END_TIME: "End time is missing",
    MISSING_CLASS_DATA: "Missing class data or start time",
    MISSING_DURATION: "Missing start or end time for duration calculation",
    MISSING_REQUIRED_FIELDS: "Please fill all required fields",
    MISSING_MEETING_ID: "No meeting found for this ID",
    MISSING_MEETING_DATA: "Meeting data is missing",
    MISSING_EMAIL: "Email not found",
    HTTP_ERROR: "HTTP error occurred",
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
    NETWORK_ERROR: "Network error. Please try again later.",
    SESSION_EXPIRED: "Session expired. Please login again.",
    PERMISSION_DENIED: "Permission denied",
    NOT_FOUND: "Resource not found",
    SERVER_ERROR: "Server error occurred",
    LOGIN_FAILED: "Login failed. Please try again later.",
    GOOGLE_LOGIN_FAILED: "Google login failed. Please try again.",
    FAILED_TO_UPDATE: "Failed to update. Please try again.",
    FAILED_TO_SAVE: "Failed to save changes. Please try again.",
    FAILED_TO_MARK_SEEN: "Failed to mark as seen",
    FAILED_TO_MARK_READ: "Failed to mark as read",
  },

  FORM: {
    FILL_ALL_FIELDS: "Please fill all required fields",
    CHECK_FORM_INPUTS: "Please check the form inputs",
    INVALID_FORM: "Invalid form data",
  },

  AUDIO: {
    PLAYBACK_FAILED: "Failed to play audio",
  },
});

