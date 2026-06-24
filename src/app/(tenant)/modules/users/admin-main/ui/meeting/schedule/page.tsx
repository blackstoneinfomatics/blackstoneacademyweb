"use client";

import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import moment from "moment";
import BaseLayout4 from "../../../components/BaseLayout4";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  meetingStatus: string;
  supervisorName: string;
  meetingId: string;
  teacherName: string;
}

// Custom Toolbar Component
const CustomToolbar = ({ label, onViewChange, view }: any) => {
  return (
    <div className="flex justify-between items-center p-2">
      <h2 className="text-sm font-semibold">{label}</h2>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 text-xs rounded shadow ${
            view === "month" ? "bg-[#223857] text-white" : "bg-gray-200"
          }`}
          onClick={() => onViewChange("month")}
        >
          Month
        </button>
        <button
          className={`px-3 py-1 text-xs rounded shadow ${
            view === "week" ? "bg-[#223857] text-white" : "bg-gray-200"
          }`}
          onClick={() => onViewChange("week")}
        >
          Week
        </button>
        <button
          className={`px-3 py-1 text-xs rounded shadow ${
            view === "day" ? "bg-[#223857] text-white" : "bg-gray-200"
          }`}
          onClick={() => onViewChange("day")}
        >
          Day
        </button>
      </div>
    </div>
  );
};
const Schedules: React.FC = () => {
  const [showSuccess] = useState(false);
  const [successMessage] = useState("");
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [showAttendeesDropdown, setShowAttendeesDropdown] = useState(false);

  const quranTeachers = ["Teacher A", "Teacher B", "Teacher C"];
  const arabicTeachers = ["Teacher X", "Teacher Y", "Teacher Z"];

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  // Merge both Quran and Arabic teachers into one list
  const allTeachers = [
    ...quranTeachers.map((t) => ({ name: t, subject: "quran" })),
    ...arabicTeachers.map((t) => ({ name: t, subject: "arabic" })),
  ];

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredMeetings, setFilteredMeetings] = useState<Event[]>([]);
  const [currentView, setCurrentView] = useState<View>("month");
  const [isAutoClose, setIsAutoClose] = useState(false);
  const [allTeacher, setAllTeacher] = useState([
    "Lucas Johnson",
    "Emily Peterson",
    "Hannah White",
    "Oliver Martinez",
    "Isabella Garcia",
    "Ethan Lee",
    "Sophia Wilson",
    "Samantha",
    "Will Jonto",
    "El Byers",
  ]);

  useEffect(() => {
    if (isAutoClose) {
      const timer = setTimeout(() => {
        setIsMeetingModalOpen(false);
        setIsAutoClose(false);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer); // cleanup
    }
  }, [isAutoClose]);

  const toggleTeacher = (name: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTeachers.length === allTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(allTeacher);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      try {
        // Replace this with your static/mock data
        const meetings = [
          {
            id: "1",
            meetingName: "Math Class",
            selectedDate: "2025-04-20",
            startTime: "09:00",
            endTime: "09:30",
            description: "Algebra basics",
            status: "Confirmed",
            meetingId: "23456",
            supervisor: { supervisorName: "Mr. Ali" },
            teacher: [{ teacherName: "Ms. Fatima" }],
          },
          {
            id: "2",
            meetingName: "Science Session",
            selectedDate: "2025-04-19",
            startTime: "10:00",
            endTime: "11:00",
            description: "Physics - Motion",
            status: "Pending",
            meetingId: "23456",
            supervisor: { supervisorName: "Ms. Aisha" },
            teacher: [{ teacherName: "Mr. Hamza" }],
          },
          // Add more mock meetings if needed
        ];

        const formattedEvents: Event[] = meetings
          .map((item): Event | null => {
            if (!item.selectedDate || !item.startTime || !item.endTime)
              return null;

            const selectedDate = moment(item.selectedDate);
            const startTimeParts = item.startTime.split(":");
            const endTimeParts = item.endTime.split(":");

            const startDate = selectedDate
              .clone()
              .set({
                hour: parseInt(startTimeParts[0], 10),
                minute: parseInt(startTimeParts[1], 10),
                second: 0,
              })
              .toDate();

            const endDate = selectedDate
              .clone()
              .set({
                hour: parseInt(endTimeParts[0], 10),
                minute: parseInt(endTimeParts[1], 10),
                second: 0,
              })
              .toDate();

            return {
              id: item.id,
              title: item.meetingName || "Untitled Meeting",
              start: startDate,
              end: endDate,
              description: item.description ?? "No description",
              meetingStatus: item.status || "Unknown",
              supervisorName: item.supervisor?.supervisorName || "Unknown",
              meetingId: item.meetingId,
              teacherName: item.teacher?.[0]?.teacherName || "Unknown",
            };
          })
          .filter((event): event is Event => event !== null);

        let startRange = moment();
        let endRange = moment();

        if (currentView === "month") {
          startRange = moment().startOf("month");
          endRange = moment().endOf("month");
        } else if (currentView === "week") {
          startRange = moment().startOf("week");
          endRange = moment().endOf("week");
        } else if (currentView === "day") {
          startRange = moment().startOf("day");
          endRange = moment().endOf("day");
        }

        const filteredEvents = formattedEvents.filter((event) => {
          const eventStart = moment(event.start);
          return eventStart.isBetween(startRange, endRange, undefined, "[]");
        });

        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error processing mock data:", error);
      }
    };

    fetchData();
  }, [currentView]);

  const handleViewChanges = (view: View) => {
    setCurrentView(view);
  };
  const handleDateClick = (slotInfo: { start: Date }) => {
    const clickedDate = moment(slotInfo.start).startOf("day"); // Normalize the date
    setSelectedDate(clickedDate.toDate());

    // Filter meetings by exact date
    const filtered = events.filter((event) =>
      moment(event.start).isSame(clickedDate, "day")
    );

    setFilteredMeetings(filtered);
  };

  return (
    <BaseLayout4>
      <div className="py-2 px-4 w-full h-full ">
        <div className="flex justify-between items-center mb-5">
            <h1 className="text-[20px] font-semibold">Calender</h1>
          </div>
        {/* Success Message Toast */}
        {showSuccess && (
          <div className="fixed top-4 align-middle right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            {successMessage}
          </div>
        )}

        {/* Calendar Section */}
        <div className="flex-1 ">
           <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3">
              <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
                <div className="flex justify-end items-center mb-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsMeetingModalOpen(true)}
                      className="px-3 py-[6px] text-[10px] bg-[#223857] text-white rounded shadow hover:bg-[#1C3557]"
                    >
                      + Add Schedule
                    </button>

               
                  </div>
                </div>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600, width: "100%" }}
                  views={["month", "week", "day"]}
                  view={currentView} // Ensure the calendar respects the state
                  selectable
                  onView={handleViewChanges} // Update the view state when user changes it
                  onSelectSlot={handleDateClick}
                  onSelectEvent={(event) =>
                    console.log("Event clicked:", event)
                  }
                  components={{
                    toolbar: (props) => (
                      <CustomToolbar
                        {...props}
                        onViewChange={handleViewChanges}
                      />
                    ),
                  }}
                  popup
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.title.includes("Meeting")
                        ? "#fcd4d4"
                        : "#e8fcd8",
                      color: "#000",
                      fontSize: "8px",
                      padding: "2px 4px",
                    },
                  })}
                />
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-white p-6 w-65 rounded-lg shadow overflow-y-scroll h-full scrollbar-none">
                <h2 className="text-[13px] font-semibold mb-6 text-center p-4">
                  {selectedDate
                    ? `Meetings Schedules for ${moment(selectedDate).format(
                        "MMMM Do, YYYY"
                      )}`
                    : "Select a Date to View Meetings"}
                </h2>
                <div
                  className="space-y-6"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#d1d5db #f3f4f6",
                  }}
                >
                  {filteredMeetings.length > 0 ? (
                    filteredMeetings.map((meeting) => (
                      <div key={meeting.id} className="border-b pb-2">
                        <span className="text-[9px] text-gray-500 text-end">
                          {moment(meeting.start).format("MMM Do, YYYY")}
                        </span>
                        <div className="justify-between">
                          <span className="text-sm font-semibold">
                            {meeting.teacherName}
                          </span>
                          <div className="text-[10px] text-gray-500">
                            <span className="material-icons text-gray-400 mr-1">
                              schedule
                            </span>
                            {moment(meeting.start).format("hh:mm A")} -{" "}
                            {moment(meeting.end).format("hh:mm A")}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-[12px] text-center">
                      No meetings scheduled for this day.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  
 
 
 { /*Add meeting Model*/ }
      
      {isMeetingModalOpen && (
            <div className="fixed inset-0 z-10 bg-black bg-opacity-40 flex justify-center items-center ">
              <div className="bg-white rounded-xl shadow-lg px-6 py-8 w-[460px]">
                {/* Header */}
                <h2 className="text-[14px] font-bold text-[#1C3557] mb-6">
                  Add Meeting
                </h2>

                {/* Meeting ID */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    className="w-full bg-[#f4f4f4] border border-gray-300 rounded-xl p-2 text-xs"
                  />
                </div>

                {/* Meeting Title */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    placeholder="Weekly Meeting"
                    className="w-full bg-[#f4f4f4] border border-gray-300 rounded-xl p-2 text-xs"
                  />
                </div>

                {/* Scheduled Date */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Scheduled Date
                  </label>
                  <div className="flex items-center border border-gray-300 bg-[#f4f4f4] rounded-xl p-2 text-xs">
                    <input
                      type="text"
                      placeholder="11/02/2024"
                      className="w-full bg-transparent text-xs focus:outline-none"
                      readOnly
                    />
                    <span className="text-gray-500">
                      <i className="fas fa-calendar-alt" />
                    </span>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Scheduled Time
                  </label>
                  <div className="flex items-center border border-gray-300 bg-[#f4f4f4] rounded-xl p-2">
                    <input
                      type="text"
                      placeholder="07.30 PM"
                      className="w-full bg-transparent text-xs focus:outline-none"
                      readOnly
                    />
                    <span className="text-gray-500">
                      <i className="fas fa-clock" />
                    </span>
                  </div>
                </div>

                {/* Attendees Dropdown */}
                <div className="mb-2 relative">
                  <label className="text-xs font-medium text-gray-700">
                    Attendees
                  </label>
                  <div
                    className="flex items-center border border-gray-300 bg-[#f4f4f4] rounded-xl p-2 justify-between cursor-pointer"
                    onClick={() =>
                      setShowAttendeesDropdown(!showAttendeesDropdown)
                    }
                  >
                    <span className="text-sm text-gray-600">
                      {selectedTeachers.length > 0
                        ? `${selectedTeachers.length} Selected`
                        : "Select Teachers"}
                    </span>
                    <i
                      className={`fas fa-chevron-${
                        showAttendeesDropdown ? "up" : "down"
                      } text-gray-500`}
                    />
                  </div>

                  {showAttendeesDropdown && (
                    <div className="absolute bg-white border border-gray-300 rounded-xl shadow-md w-full mt-2 max-h-44 overflow-y-auto z-50 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-[#1C3557]">
                          Add Teachers
                        </span>
                      </div>

                      {/* Select All */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Select All
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedTeachers.length === allTeachers.length}
                          onChange={toggleSelectAll}
                          className="h-3 w-3"
                        />
                      </div>

                      {/* Teacher List */}
                      <div className="space-y-3 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                        {allTeacher.map((teacher, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-[#D1D5DB] rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-white text-xs" />
                              </span>
                              <span className="text-xs text-gray-800">
                                {teacher}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedTeachers.includes(teacher)}
                              onChange={() => toggleTeacher(teacher)}
                              className="h-3 w-3"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Dropdown Actions */}
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => setShowAttendeesDropdown(false)}
                          className="w-[25%] border border-[#1C3557] text-[#1C3557] py-1 rounded-lg hover:bg-gray-100 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setShowAttendeesDropdown(false)}
                          className="w-[25%] bg-[#1C3557] text-white py-1 rounded-lg hover:bg-[#15294a] text-xs"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder=""
                    className="w-full bg-[#f4f4f4] border border-gray-300 rounded-xl p-3 mt-1 text-sm h-24 resize-none"
                  ></textarea>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setIsMeetingModalOpen(false)}
                    className="w-[38%] border border-[#1C3557] text-[#1C3557] py-2 rounded-xl hover:bg-gray-100 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsMeetingModalOpen(false)}
                    className="w-[38%] bg-[#1C3557] text-white py-2 rounded-xl hover:bg-[#15294a] flex items-center justify-center text-xs"
                  >
                    <i className="fas fa-save mr-2" /> Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

    </BaseLayout4>
  );
};

export default Schedules;
