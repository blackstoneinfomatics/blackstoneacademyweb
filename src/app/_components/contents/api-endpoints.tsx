import { environment } from "@/config/environment";

export const AppApiEndpoints = {
  API_END_POINT: environment.baseURL,

  AUTH: {
    LOGIN: "/signin",
    ADMIN_LOGIN: "/signin",
    LOGOUT :"/signout",
    STUDENTS_SIGNIN: "/studentsignin"
  },

  USER: {
    GET: "/users",
    CREATE: "/users",
    GET_TEACHER_STATUS_COUNT: "/teacher/statuscount",
    GET_TEACHER_GENDER_COUNT: "/teacher/gendercount",
    GET_OTHER_EMPLOYEES: "/otheremployees",
  },

  NOTIFICATION: {
    GET_LIST: "/notification/getlist",
    CREATE: "/notification",
    UPDATE: "/notification",
  },

  EVALUATION: {
    GET_LIST: "/evaluationlist",
    CREATE: "/evaluation",
    UPDATE: "/evaluation",
    GET_COUNTRIES_COUNT: "/countiescount",
    PREFERRED_TEACHERS: "/preferredteachers",
    STUDENT_COURSE: "/studentcourse",
    TEACHER_STATUS: "/teacherstatus",
  },

  STUDENT: {
    GET_LIST: "/studentlist",
    CREATE: "/student",
  },

  MEETING: {
    GET_LIST: "/meetinglist",
    CREATE: "/addMeeting",
    GET_SUPERVISOR_MEETING: "/allMeetings",
    GET_SUPERVISOR_MEET: "/meeting"
  },

  INVOICE: {
    GET_LIST: "/invoice",
    TOTAL_GET_LIST: "/totalinvoice",
    CREATE: "/invoice/send",
    INVOICE_DUE_BY_DATES: "/invoiceduebydates",
    STUDENT_INVOICE: "/studentinvoice",
    STUDENT_INVOICE_LIST: "/studentinvoice/list",
    INVOICE_COUNTS: "/invoicecounts",
    STUDENT_INVOICE_BYID:"/studentinvoiceById"
  },

  CALENDAR: {
    GET: "/meetingSchedulelist",
  },

  GROUPCLASS: {
    CREATE: "/groupclassschedule/bulkcreate",
  },

  ALSTUDENTS: {
    GET: "/alstudents",
    GET_STUDENTS_COUNTRY_COUNT: "/alstudents/studentscountrycount",
    GET_STUDENTS_RECORD_COUNT: "/alstudents/studentsrecordcount",
    GET_STUDENTS_GENDER_COUNT: "/alstudents/studentsGender",
    ALSTUDENTS_STUDENTS_LEVEL:"/alstudents/studentslevel"
  },

  LEAVE: {
    CREATE: "/leaverequest",
    GET: "/leaverequest",
    LEAVE_CARD: "/leaverequest/card",
    LEAVE_SUMMARY_LIST: "/leavesummary/list",
    UPDATE: "/leavesummary",
  },

  DASHBOARD: {
    GET_UPCOMING_CLASSES: "/dashboard/ac/upcomingclass",
    GET_TEACHERS_ATTENDANCE: "dashboard/ac/teachersattendance",
    GET_WIDGETS: "/dashboard/widgets",
    GET_AC_UPCOMING_CLASSES: "/dashboard/ac/upcomingclass",
    GET_ADMIN_COUNT: "/dashboard/admin/count",
    DASHBOARD_ADMIN_TOTAL_CLASSES: "/dashboard/admin/totalclass",
    DASHBOARD_ADMIN_TOTAL_TRIAL_REQUESTS: "/dashboard/admin/totaltrialrequest",
    GET_TEACHER_COUNTS: "/dashboard/teacher/counts",
    GET_SUPERVISOR_COUNTS: "/dashboard/supervisor/counts",
    DASHBOARD_STUDENT_COUNTS:"/dashboard/student/counts",
    GET_TEACHER_FEMALEMALE: "/teacherfemalemale"
  },

  CLASSSHEDULE: {
    GET: "/classShedule",
    GET_CLASSSHEDULE_STUDENTS: "/classShedule/students",
    UPDATE_SLECTED_CLASS: "/classShedule",
    TEACHER_STUDENT_COUNT: "/teacher-student-count",
    STUDENT_ATTENDANCE_PERFORMANCE: "/studentattendanceperformance",
    TOTAL_TRAIL_CLASS: "/totaltrialclass",
    CLASSCHEDULE_TOTAL_CLASSES: "/classShedule/totalclasses",
    CLASS_STATUS_COUNT: "/classShedule/classstatuscount",
    CLASS_WISE_COUNT: "/classShedule/classwisecount",
    TEACHER_CLASSES: "/classShedule/teacher",
    TEACHER_CLASS_LIST: "/classShedule/teacher/list",
    ALL_TRIAL_CLASSES: "/alltrialclass",
    TEACHER_COUNT:"/classShedule/teacher/count",
    TEACHER_EARNINGS :"/teacher/earnings",
    UPDATE_TEACHER_RESCHEDULE:"/classShedule/teacherreschedule",
    GET_CLASS_STUDENT_ATT_COUNT:"/classstudentsattendancecounts",
    CLASS_SESSION_END:"/classSession/triggerEnd",
    GET_TEACHERMEETINGLIST:"/teacherMeetinglist",
    GET_TEACHER_TRAILCLASS :"/teachertrialclass",
    UPDATE_CLASS_ATTENDANCE:"/classShedule/attendanceupdate",
    UPDATE_GROUP_CLASSSCHEDULE:"/groupclassschedule/bulkupdate",
    UPDATE_CLASS_REQUEST_RESCHEDULE:"/classShedule/requestReshedule",
    GET_CLASS_TOTAL_HOURS:"/classShedule/totalhours",
    GET_CLASSSCHEDULE_ACTIVITY: "/classShedule/activity"
  },

  AVAILABLE_TIME_SLOT: {
    GET: "/teacher/availabletime",
  },

  PAYMENT: {
    CREATE_PAYMENT_INTENT: "/create-payment-intent",
    GET_STUDENT_PAYMENT_HISTORY: "/student/paymenthistory",
    CREATE_STUDENT_PAYMENT :"/student/create-payment-intent"
  },

  APPLICANTS: {
    GET_LIST: "/applicants",
    GET_APPLICANT_COUNT_BY_COUNTRY: "/applicants/countriescount",
    GET_APPLICATION_SUPERVISOR: "/application"
  },

  MEETING_MINUTES: {
    UPDATE_MINUTES: "/meetingminutes",
  },

  OTHEREMPLOYEE: {
    CREATE: "/otheremployee",
    GET_OTHER_EMPLOYEE: "/otheremp",
    GET_OTHER_EMPLOYEE_WAGES: "/empwages",
    UPDATE: "/otheremployee",
    SALARY_WAGES: "/salarywagesById",
    UPDATE_EMP_WAGES: "/empwages",
    GET_OTHER_EMPLOYEE_COUNT: "/otherempcount",
    GET_OTHER_EMPLOYEE_GENDER_COUNT: "/otheremp/gendercount",
    GET_OTHER_EMPLOYEE_COUNT_BY_COUNTRY: "/otheremp/countriescount",
    GET_WAGES: "salarywages",
    UPDATE_WAGES: "/salarywages",
  },

  EXPENSE: {
    CREATE: "/expense",
    GET_EXPENSE: "/expenseCardCounts",
    GET: "/expense",
  },

  COURSE: {
    GET_LIST: "/courses",
    CREATE: "/courses",
  },

  KNOWLEDGE_BASE: {
    CREATE: "/knowledgebase",
    LIST: "/knowledgebase/list",
  },

  ADMIN_MEETING: {
    CREATE: "/addadminMeeting",
    UPDATE: "/allAdminMeeting",
    GET_LIST: "/allAdminMeeting",
    GET: "/allAdminMeeting/meetingId",
    UPDATE_ADMIN: "/allAdminMeeting/update",
  },

  PACKAGAE: {
    POST: "/package",
  },

  RECRUITMENT: {
    UPDATE: "/admin",
    GET_TEACHER_OVERVIEW: "/teacheroverview",
    CREATE_SUPERVISOR_RECRUIT: "/recruit",
  },

  ANALYTICS: {
    STUDENT_VISITOR: "/studentvisitor",
    AMOUNT_BY_COUNTRY: "/amountbycountry",
    AMOUNT_BY_COURSE: "/amountbycourse",
    STUDENT_REVENUE: "/studentrevenue",
  },

  ASSIGNMENT: {
    GET_LIST: "/assignments",
    CREATE: "/assignments",
    GET_ADMIN_ASSIGNMENT: "/adminassignment",
    CREATE_ADMIN_ASSIGNMENT: "/adminassignment",
    GET_STUDENT_ASSIGNMENTS: "/assignments/student",
    GET_TEACHER_ASS_CARD_COUNT: "/assignments/teacher/cardcount",
    GET_ALL_ASS:"/allAssignment",
    UPDATE:"/assignments",
    GROUP_ASSIGNMENTS:"/groupAssignments",
    GET_ADMIN_ASS:"/adminassignment/assignment",
    GET_ASSIGNMNET_QUESTIONLIST:"/assignments/questionlist",
    ASS_CARD_COUNT :"/assignments/cardcount"
  },

  LEVELS: {
    GET_LIST: "/levels",
    CREATE: "/levels",
    UPDATE: "/update-levels",
  },

  SHIFTSCHEDULE: {
    GET: "/shiftschedule",
    PUT: "/shiftschedule",
  },

  FILEUPLOAD: {
    GET_UPLOAD: "/files/view",
  },

  RBAC: {
    UPDATE_ACCESS: "/update-access",
    GET_ACCESS: "/update-access",
  },

  CHECKMAIL: {
    CREATE_CHECK: "/allcheck-email",
    CREATE_CHECK_EMAIL: "/check-email",
  },

  MESSAGES: {
    GET: "/realtimemessage",
    CREATE: "/realtimemessage",
  },

  SALARYWAGES: {
    GET_SALARY_CARD: "/salarywagesCardCount",
  },

  TEACHERMEETING: {
    CREATE: "/teacherMeeting",
    UPDATE :"/updateTeacherMeeting",
    GET_MEETING :"/teacherMeeting",
    GET_STUDENTMEETING_LIST:"/StudentMeetinglist",
    GET_TEACHER_MEET: "/teacher"

  },

  FEEBACK :{
    TEACHER_FEEDBACK:"/teacherfeedback",
    SUPERVISOR_FEEDBACK: "/allfeedback",
    SUPERVISORS_FEEDBACK: "/supervisorfeedback",
    CREATE_FEEDBACK: "/feedback",
  },

  PROFILE : {
    STUDENT_PROFILE : "/studentProfile"
  }

};
