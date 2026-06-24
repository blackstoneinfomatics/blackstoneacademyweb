"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import axios, { AxiosError } from "axios"
import moment from "moment"
import { useSearchParams } from "next/navigation"
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1"
import AcademicHeader from "../../components/academicHeader"
import SuccessPopup from "@/app/(tenant)/modules/users/supervisor/components/successPopup";
import FailedPopup from "@/app/(tenant)/modules/users/supervisor/components/failedPopup";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints"

interface CalendarControlsProps {
  activeView: "monthly" | "weekly" | "daily";
  handleTabSwitch: (view: "monthly" | "weekly" | "daily") => void;
  currentDate: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  formatMonthYear: (date: Date) => string;
}

interface ClassSchedule {
  _v: { __v: any }
  student: Student
  teacher: Teacher
  course: Course
  _id: string
  classDay: string[]
  package: string
  totalHourse: number
  startDate: string
  endDate: string
  startTime: string[]
  endTime: string[]
  scheduleStatus: string
  classLink: string
  status: string
  createdBy: string
  sessionClassType: string
  sessionStarttime: string
  sessionsEndtime: string
  createdDate: string
  lastUpdatedDate: string
  __v: number
  studentAttendee?: any[]
  teacherAttendee?: any[]
}

interface Student {
  studentId: string
  studentFirstName: string
  studentLastName: string
  studentEmail: string
  gender: string
}

interface Teacher {
  teacherId: string
  teacherName: string
  teacherEmail: string
}

interface Course {
  courseId: string
  courseName: string
}

const TeachersSchedule = () => {

  const generateTimeSlots = () => {
    const slots: string[] = [];
    let start = moment("00:00", "HH:mm");

    for (let i = 0; i < 48; i++) {
      slots.push(start.format("HH:mm"));
      start.add(30, "minutes");
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleFromTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const fromMoment = moment(value, "HH:mm");
    const toMoment = fromMoment.clone().add(30, "minutes");

    setFormData((prev) => ({
      ...prev,
      fromTime: value,
      toTime: toMoment.format("HH:mm"),
    }));
  };
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "daily">("monthly")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetings, setMeetings] = useState<ClassSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)


  const Search = useSearchParams()
  const teacherId = Search.get("_id")
  const sendteacher = Search.get("teacherId");
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [success, setSucces] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [formData, setFormData] = useState({
    date: moment().format("YYYY-MM-DD"),
    fromTime: moment().format("HH:mm"),
    toTime: moment().add(30, "minutes").format("HH:mm"),
    comment: "",
    meetingId: "",
    applyToAll: false,
  });


  const tabs: Array<"monthly" | "weekly" | "daily"> = ["monthly", "weekly", "daily"];

  useEffect(() => {
    setRescheduleDate(formData.date)
  }, [formData.date])

  const meetingTypeColors = {
    "quran class": {
      text: "text-[#21BAFF]",
      border: "border-[#21BAFF]",
      bg: "bg-[#21BAFF]/10",
    },
    "arabic class": {
      text: "text-[#ce4b49]",
      border: "border-[#ce4b49]",
      bg: "bg-[#ce4b49]/10",
    },
    "islamic class": {
      text: "text-[#5362e4]",
      border: "border-[#5362e4]",
      bg: "bg-[#5362e4]/10",
    },
  }

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null
        if (!token) {
          console.error("❌ AcademicCoachAuthToken not found")
          return
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}?teacherId=${teacherId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        )

        let scheduleData: ClassSchedule[] = []
        if (response.data?.classSchedule) {
          scheduleData = response.data.classSchedule
        } else if (response.data?.students) {
          scheduleData = response.data.students
        }

        if (scheduleData.length > 0) {
          const sortedMeetings = scheduleData.toSorted(
            (a: ClassSchedule, b: ClassSchedule) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          )
          setMeetings(sortedMeetings)

          const today = new Date()
          setSelectedDate(today)

          const todayFormatted = moment(today).format("YYYY-MM-DD")
          setFormData({
            date: todayFormatted,
            fromTime: moment().format("HH:mm"),
            toTime: moment().add(30, "minutes").format("HH:mm"),
            comment: "",
            meetingId: "",
            applyToAll: false,
          })
          setRescheduleDate(todayFormatted)
        }
      } catch (error) {
        console.error("Error fetching meetings:", error)
      }
    }

    fetchMeetings()
  }, [teacherId])
  const handlePrev = () => {
    if (activeView === "monthly") {
      setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
    } else if (activeView === "weekly") {
      setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
    } else if (activeView === "daily") {
      setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
    }
  };

  const handleNext = () => {
    if (activeView === "monthly") {
      setCurrentDate(moment(currentDate).add(1, "month").toDate());
    } else if (activeView === "weekly") {
      setCurrentDate(moment(currentDate).add(1, "week").toDate());
    } else if (activeView === "daily") {
      setCurrentDate(moment(currentDate).add(1, "day").toDate());
    }
  };

  const getFormattedLabel = () => {
    if (activeView === "monthly") {
      return moment(currentDate).format("MMMM YYYY");
    } else if (activeView === "weekly") {
      const start = moment(currentDate).startOf("week");
      const end = moment(currentDate).endOf("week");
      return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    } else {
      return moment(currentDate).format("dddd, MMMM D, YYYY");
    }
  };

  const handleTabSwitch = (newView: "monthly" | "weekly" | "daily") => {
    if (activeView !== newView) {
      setActiveView(newView)

      const today = new Date()
      setSelectedDate(today)

      setCurrentDate(today)

      const todayMeetings = getMeetingsForDate(today)
      const todayFormatted = moment(today).format("YYYY-MM-DD")

      if (todayMeetings.length > 0) {
        const firstMeeting = todayMeetings[0]
        setFormData({
          date: todayFormatted,
          fromTime: firstMeeting.startTime?.[0] || moment().format("HH:mm"),
          toTime: firstMeeting.endTime?.[0] || moment().add(30, "minutes").format("HH:mm"),
          comment: "",
          meetingId: firstMeeting._id,
          applyToAll: false,
        })
      } else {
        setFormData({
          date: todayFormatted,
          fromTime: moment().format("HH:mm"),
          toTime: moment().add(30, "minutes").format("HH:mm"),
          comment: "",
          meetingId: "",
          applyToAll: false,
        })
      }

      setRescheduleDate(todayFormatted)
    }
  }

  const getMeetingTypeColor = (meetingName: string) => {
    const lowerName = meetingName.toLowerCase()
    if (lowerName.includes("quran")) return meetingTypeColors["quran class"]
    if (lowerName.includes("arabic")) return meetingTypeColors["arabic class"]
    if (lowerName.includes("islamic")) return meetingTypeColors["islamic class"]
    return meetingTypeColors["quran class"]
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    return firstDay.getDay()
  }



  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today && !isToday(date.getDate())
  }

  const getMeetingsForDate = (date: Date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    return meetings.filter((meeting) => {
      const startDate = new Date(meeting.startDate)
      const meetingDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

      return meetingDate.getTime() === targetDate.getTime()
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dayMeetings = getMeetingsForDate(date)
    const dateFormatted = moment(date).format("YYYY-MM-DD")

    if (dayMeetings.length > 0) {
      const firstMeeting = dayMeetings[0]
      setFormData({
        date: dateFormatted,
        fromTime: firstMeeting.startTime?.[0] || moment().format("HH:mm"),
        toTime: firstMeeting.endTime?.[0] || moment().add(30, "minutes").format("HH:mm"),
        comment: "",
        meetingId: firstMeeting._id,
        applyToAll: false,
      })
    } else {
      setFormData((prev) => ({
        date: dateFormatted,
        fromTime: prev.fromTime || moment().format("HH:mm"),
        toTime: prev.toTime || moment().add(30, "minutes").format("HH:mm"),
        comment: "",
        meetingId: "",
        applyToAll: false,
      }))
    }

    setRescheduleDate(dateFormatted)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("AcademicCoachAuthToken")
      if (!token) {
        throw new Error("No auth token found")
      }
      if (!formData.meetingId) {
        throw new Error("No meeting ID provided");
      }
      const meetingToReschedule = meetings.find((m) => m._id === formData.meetingId)
      if (!meetingToReschedule) {
        throw new Error("Meeting not found")
      }

      const classDayName = moment(rescheduleDate).format("dddd")

      const payload = {
        _id: meetingToReschedule._id,
        teacher: meetingToReschedule.teacher,
        student: meetingToReschedule.student,
        classDay: [{ value: classDayName, label: classDayName }],
        classLink: meetingToReschedule.classLink,
        course: meetingToReschedule.course,
        package: meetingToReschedule.package,
        sessionClassType: meetingToReschedule.sessionClassType || "REGULARCLASS",
        sessionStarttime: "",
        sessionsEndtime: "",
        startTime: [{ value: formData.fromTime, label: formData.fromTime }],
        endTime: [{ value: formData.toTime, label: formData.toTime }],
        totalHourse: 0,
        startDate: rescheduleDate,
        endDate: rescheduleDate,
        scheduleStatus: "Reschedule",
        studentAttendee: "absent",
        teacherAttendee: "absent",
        status: "Active",
        comment: formData.comment || "",
        createdBy: meetingToReschedule.createdBy || "teacher",
        createdDate: meetingToReschedule.createdDate || new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString(),
      }
      console.log("PUT Request Payload:", payload)
      console.log("PUT Request URL:", `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_TEACHER_RESCHEDULE}/${meetingToReschedule._id}`)
      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.UPDATE_TEACHER_RESCHEDULE}/${meetingToReschedule._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      console.log("PUT Response:", response)
      console.log("PUT Response Status:", response.status)
      console.log("PUT Response Data:", response.data)
      if ([200, 201].includes(response.status)) {
        setSucces(true);
        setFormData({
          date: moment().format("YYYY-MM-DD"),
          fromTime: moment().format("HH:mm"),
          toTime: moment().add(30, "minutes").format("HH:mm"),
          comment: "",
          meetingId: "",
          applyToAll: false,
        });
      }

      const refreshResponse = await axios.get(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.GET}?teacherId=${meetingToReschedule.teacher.teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setMeetings(refreshResponse.data?.classSchedule ?? refreshResponse.data?.students ?? [])
    }
    catch (err) {
      const error = err as AxiosError;

      const status = error.response?.status;
      if (Number(status === 400)) {
        console.log("please >");
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
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const CalendarControls = ({
    activeView,
    handleTabSwitch,
    currentDate,
    handlePrevMonth,
    handleNextMonth,
    formatMonthYear,
  }: CalendarControlsProps) => {
    const getNavigationHandlers = () => {
      switch (activeView) {
        case "weekly":
          return {
            prev: () => setCurrentDate(moment(currentDate).subtract(1, 'week').toDate()),
            next: () => setCurrentDate(moment(currentDate).add(1, 'week').toDate())
          };
        case "daily":
          return {
            prev: () => setCurrentDate(moment(currentDate).subtract(1, 'day').toDate()),
            next: () => setCurrentDate(moment(currentDate).add(1, 'day').toDate())
          };
        default:
          return {
            prev: handlePrevMonth,
            next: handleNextMonth
          };
      }
    };

    const { prev, next } = getNavigationHandlers();
    const generateTimeSlots = () => {
      const slots: string[] = [];
      let start = moment("00:00", "HH:mm");

      for (let i = 0; i < 48; i++) {
        slots.push(start.format("HH:mm"));
        start.add(30, "minutes");
      }
      return slots;
    };




    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4 text-sm font-medium">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`capitalize ${activeView === tab
                  ? "text-[#576cbc] border-b-2 border-[#576cbc]"
                  : "text-gray-400 hover:text-[#576cbc]"
                } pb-1 transition-colors duration-200`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
          >
            &lt;
          </button>
          <h2 className="text-[16px] font-semibold">{getFormattedLabel()}</h2>
          <button
            onClick={handleNext}
            className="py-[1px] px-2 rounded-lg bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const WeeklyView = () => {
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const startOfWeek = moment(currentDate).startOf("week").toDate()
    const endOfWeek = moment(currentDate).endOf("week").toDate()

    const weekMeetings = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startDate)
      return meetingDate >= startOfWeek && meetingDate <= endOfWeek
    })

    const meetingsByDay = weekMeetings.reduce(
      (acc, meeting) => {
        const day = moment(meeting.startDate).format("dddd")
        if (!acc[day]) {
          acc[day] = []
        }
        acc[day].push(meeting)
        return acc
      },
      {} as Record<string, ClassSchedule[]>,
    )

    const handleDayClick = (day: string) => {
      setSelectedDay(selectedDay === day ? null : day)
      const dayMeeting = weekMeetings.find((m) => moment(m.startDate).format("dddd") === day)

      if (dayMeeting) {
        const date = new Date(dayMeeting.startDate)
        handleDateClick(date)
      } else {
        const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day)
        const date = moment(currentDate).startOf("week").add(dayIndex, "days").toDate()
        handleDateClick(date)
      }
    }

    return (
      <div className="space-y-4">

        <div className="h-[540px] md:h-[540px] sm:h-[400px] overflow-y-scroll scrollbar-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm md:text-[16px] font-semibold">
              {moment(startOfWeek).format("MMM D")} - {moment(endOfWeek).format("MMM D, YYYY")}
            </h3>
          </div>

          <div className="space-y-2">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
              const dayMeetings = meetingsByDay[day] || []
              const isSelected = selectedDay === day
              const dayDate = moment(currentDate).day(day).toDate()
              const isPast = isPastDate(dayDate)

              return (
                <div key={day} className="flex flex-col">
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-full p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                        ? "dark:bg-[#414141] bg-[#f7f7f7] dark:text-white text-black"
                        : dayMeetings.length > 0
                          ? "dark:bg-[#414141] bg-[#f7f7f7] shadow-md hover:shadow-lg text-black"
                          : "bg-[#f7f7f7] dark:bg-[#414141] text-black"
                      } ${isPast ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div
                            className={`text-sm md:text-base font-semibold ${isSelected ? "dark:text-white text-black" : "text-gray-800 dark:text-white"
                              }`}
                          >
                            {day}
                          </div>
                          <div
                            className={`text-[9px] md:text-[10px] ${isSelected ? "bg:text-white/80" : "text-gray-500 dark:text-gray-400"
                              }`}
                          >
                            {moment(dayDate).format("MMMM D, YYYY")}
                          </div>
                        </div>
                      </div>
                      {dayMeetings.length > 0 && (
                        <div
                          className={`text-[9px] md:text-[10px] px-2 md:px-3 py-1 rounded-lg ${isSelected
                              ? "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                              : "dark:bg-[#555555] dark:text-white text-black bg-[#eae9e9]"
                            }`}
                        >
                          {dayMeetings.length} {dayMeetings.length === 1 ? "Meeting" : "Meetings"}
                        </div>
                      )}
                    </div>
                  </button>

                  {isSelected && dayMeetings.length > 0 && (
                    <div className="w-full mt-2 space-y-2 pl-4">
                      {dayMeetings.map((meeting, idx) => {
                        const colors = getMeetingTypeColor(meeting.course.courseName)
                        return (
                          <div
                            key={idx}
                            className={`p-2 md:p-3 rounded-lg ${colors.bg} dark:bg-[#414141] bg-[#f7f7f7] relative`}
                          >
                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-6 md:h-8 rounded-lg dark:bg-[#555555] bg-[#f7f7f7]"></div>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className={`text-xs md:text-sm font-semibold ${colors.text}`}>
                                  {meeting.course.courseName} Class
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-600 dark:text-gray-300">
                                  <Clock size={10} className="md:w-3 md:h-3" />
                                  {meeting.startTime?.[0] || "--:--"} - {meeting.endTime?.[0] || "--:--"}
                                </div>
                              </div>
                            </div>
                            <div className="text-[9px] md:text-[10px] text-gray-600 dark:text-gray-300 mt-1">
                              {meeting.student.studentFirstName}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const DailyView = () => {
    useEffect(() => {
      handleDateClick(currentDate)
    }, [currentDate])

    const dayMeetings = getMeetingsForDate(currentDate)
    const isPast = isPastDate(currentDate)

    return (
      <div className="space-y-4">

        <div className="h-[500px] md:h-[600px] overflow-y-scroll scrollbar-none">
          <div className="mb-4">
            <h3 className="text-sm md:text-[16px] font-semibold">{moment(currentDate).format("dddd, MMMM D, YYYY")}</h3>
          </div>

          {dayMeetings.length > 0 ? (
            dayMeetings.map((meeting, idx) => {
              const colors = getMeetingTypeColor(meeting.course.courseName)
              return (
                <div
                  key={meeting._id}
                  className={`p-3 md:p-4 text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl dark:text-[#fff] ${isPast ? "opacity-70" : ""
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`text-xs md:text-sm font-semibold ${colors.text}`}>{meeting.course.courseName}</div>
                    <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-600 dark:text-gray-300">
                      <Clock size={10} className="md:w-3 md:h-3" />
                      {meeting.startTime?.[0] || "--:--"} - {meeting.endTime?.[0] || "--:--"}
                    </div>
                  </div>

                  <div className="text-[9px] md:text-[10px] text-gray-400 mt-1">{meeting.student.studentFirstName}</div>
                </div>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No meetings scheduled for this day
            </div>
          )}
        </div>
      </div>
    )
  }

  const MonthlyView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyCells = Array.from({ length: firstDayOfMonth }, () => null)
    const totalDays = [...emptyCells, ...days]

    return (
      <div className="space-y-4">


        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs md:text-sm font-medium text-gray-500 mb-2 dark:bg-[#414141] bg-gray-100 rounded-xl p-2 md:p-3 dark:text-[#fff]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-2 gap-1 md:gap-2 text-xs md:text-sm h-[350px] md:h-[455px] overflow-scroll scrollbar-none">
          {totalDays.map((day, i: number) => {
            if (day === null) {
              return <div key={i} className="min-h-[50px] md:min-h-[80px] bg-transparent" />
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayMeetings = getMeetingsForDate(date)
            const hasMeetings = dayMeetings.length > 0
            const colors = hasMeetings ? getMeetingTypeColor(dayMeetings[0].course.courseName) : null
            const isSelected =
              selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear()
            const isPast = isPastDate(date)

            return (
              <button
                key={i}
                onClick={() => handleDateClick(date)}
                className={`min-h-[50px] md:min-h-[80px] rounded-xl flex flex-col items-center justify-start mt-1 p-1 cursor-pointer ${hasMeetings
                    ? `${colors?.border} ${colors?.text} ${colors?.bg} border text-[9px] md:text-[10px]`
                    : isToday(day)
                      ? "bg-[#27176518] text-white"
                      : "bg-gray-100 dark:bg-[#414141] dark:text-[#fff] text-gray-500"
                  } ${isSelected ? "ring-1 md:ring-2 ring-[#576cbc]" : ""} ${isPast ? "opacity-50" : ""}`}
                disabled={isPast}
              >
                <div
                  className={`font-semibold text-xs md:text-sm ${isToday(day) ? "dark:text-[#4b8cc9] text-[#4b8cc9]" : ""
                    }`}
                >
                  {day}
                </div>
                {hasMeetings && (
                  <div className="w-full overflow-hidden">
                    <div className="text-[8px] md:text-[9px] truncate px-1">
                      {dayMeetings[0]?.course?.courseName ?? "No Course"}
                    </div>
                    <div className="text-[7px] md:text-[8px] truncate px-1">
                      {dayMeetings[0]?.startTime?.[0] ?? "--:--"} - {dayMeetings[0]?.endTime?.[0] ?? "--:--"}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <BaseLayout1>
      <AcademicHeader currentSection="Reschedule Calendar" showBackButton={true} showBackPath={`teacherDetails?teacherId=${sendteacher}`}/>
      <div className="p-2">
        <div className="mx-auto gap-4 flex flex-col lg:flex-row overflow-hidden min-h-[630px]">
          <div className="w-full lg:w-2/3 p-4 md:p-6 bg-white dark:bg-[#343434] shadow-md rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-4 text-sm font-medium">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveView(tab)}
                    className={`capitalize ${activeView === tab
                        ? "text-[#576cbc] border-b-2 border-[#576cbc]"
                        : "text-gray-400 hover:text-[#576cbc]"
                      } pb-1 transition-colors duration-200`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={handlePrev}
                  className="py-[2px] px-3 rounded-md bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
                >
                  &lt;
                </button>
                <h2 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                  {getFormattedLabel()}
                </h2>
                <button
                  onClick={handleNext}
                  className="py-[2px] px-3 rounded-md bg-gray-100 dark:bg-[#414141] hover:bg-gray-200 dark:hover:bg-[#505050] transition-colors"
                >
                  &gt;
                </button>
              </div>
            </div>

            {activeView === "monthly" && <MonthlyView />}
            {activeView === "weekly" && <WeeklyView />}
            {activeView === "daily" && <DailyView />}
          </div>

          <div className="w-full lg:w-1/3 bg-white dark:bg-[#343434] shadow-md rounded-xl flex flex-col min-h-[500px] lg:h-[700px]">
            <div className="p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <h3 className="text-[16px] font-semibold text-gray-800 dark:text-white">
                  Add New Schedule
                </h3>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="gcuyc" className="block text-sm md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      const date = e.target.value
                      setRescheduleDate(date);
                    }}
                    min={moment().format("YYYY-MM-DD")}
                    className="w-full h-[38px] md:h-[42px] px-3 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:[color-scheme:dark]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="gcuyc" className="block text-sm md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Time
                    </label>
                    <select
                      name="fromTime"
                      value={formData.fromTime}
                      onChange={handleFromTimeChange}
                      className="w-full h-[38px] md:h-[42px] px-3 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs md:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((slot: any) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div>
                    <label htmlFor="gcuyc" className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To Time
                    </label>
                    <input
                      name="toTime"
                      value={formData.toTime}
                      readOnly
                      className="w-full h-[38px] md:h-[42px] px-3 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs md:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="gcuyc" className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comment
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => handleInputChange("comment", e.target.value)}
                    rows={4}
                    className="w-full h-[90px] md:h-[110px] px-3 py-2 border border-gray-300 dark:border-none rounded-md bg-white dark:bg-[#414141] text-xs md:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"

                  />
                </div>
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="p-4 md:p-6">
              <hr className="w-full border-t-[1px] border-[#dbdada] dark:border-[#dbdada] mb-4" />
              <div className="flex justify-end">
                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  className="px-3 py-1 text-lg bg-[#576CBC] text-white rounded hover:bg-[#4459A9]"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        {success && (
          <SuccessPopup onClose={() => setSucces(false)} title="Class Rescheduled" />
        )}
        {failed && (
          <FailedPopup onClose={() => setFailed(false)} title={failedMessage} />
        )}
      </div>
    </BaseLayout1>
  )
}

export default TeachersSchedule

