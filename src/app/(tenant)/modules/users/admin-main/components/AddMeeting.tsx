"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isTeacher?: boolean;
}

interface MeetingTeacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  attendee: string;
}

interface MeetingData {
  _id?: string;
  meetingName: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  teachers: MeetingTeacher[];
  meetingminutes: string;
  status?: string;
  meetingStatus?: string;
  createdDate?: string;
  createdBy?: string;
  updatedDate?: string;
  duration?: string;
}

interface AddMeetingProps {
  onClose: () => void;
  onMeetingCreated: () => void;
  meetingToEdit?: MeetingData | null;
}

const AddMeeting = ({ onClose, onMeetingCreated, meetingToEdit }: AddMeetingProps) => {
  const [formData, setFormData] = useState<MeetingData>({
    meetingName: meetingToEdit?.meetingName || "",
    selectedDate: meetingToEdit?.selectedDate || new Date().toISOString().split('T')[0],
    startTime: meetingToEdit?.startTime || "",
    endTime: meetingToEdit?.endTime || "",
    description: meetingToEdit?.description || "",
    teachers: meetingToEdit?.teachers || [],
    meetingminutes: meetingToEdit?.meetingminutes || "",
    status: "Active",
    meetingStatus: "Scheduled",
    createdBy: "Admin",
    duration: "1h"
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("AdminAuthToken");
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.USER.GET}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const usersArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.users || response.data.data || [];

        const processedUsers = usersArray
          .filter((user: any) => {
            const roles = Array.isArray(user.role) ? user.role : [user.role];
            return !roles.some((r: string) => r?.toString().toLowerCase() === 'admin');
          })
          .map((user: any) => {
            const isTeacher = user.role?.toString().toLowerCase() === 'teacher';
            const id = isTeacher ? user.userId : user._id;

            if (!id) {
              console.error(`Missing ID for ${isTeacher ? 'teacher' : 'user'}:`, user);
              return null;
            }

            return {
              id,
              name: user.userName || user.name || "Unknown",
              email: user.email || "no-email@example.com",
              role: Array.isArray(user.role) ? user.role[0] : user.role,
              isTeacher
            };
          })
          .filter(Boolean) as User[];

        setAvailableUsers(processedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(value) || value === "") {
      setFormData({ ...formData, [name]: value });
    }
  };

  const formatTimeValue = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const toggleUser = (user: User) => {
    setFormData(prev => {
      const isSelected = prev.teachers.some(t => t.teacherId === user.id);
      
      if (isSelected) {
        return {
          ...prev,
          teachers: prev.teachers.filter(t => t.teacherId !== user.id)
        };
      } else {
        return {
          ...prev,
          teachers: [
            ...prev.teachers,
            {
              teacherId: user.id,
              teacherName: user.name,
              teacherEmail: user.email,
              attendee: "present"
            }
          ]
        };
      }
    });
  };

  const calculateDuration = (start: string, end: string): string => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.meetingName || !formData.selectedDate || !formData.startTime || !formData.endTime) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError("End time must be after start time");
      setLoading(false);
      return;
    }

    if (formData.teachers.length === 0) {
      setError("At least one attendee must be selected");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("AdminAuthToken");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const payload = {
        meetingName: formData.meetingName,
        selectedDate: formData.selectedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        teacher: formData.teachers,
        description: formData.description,
        meetingminutes: formData.description || "Meeting minutes",
        status: "Active",
        meetingStatus: "Scheduled",
        createdDate: new Date().toISOString(),
        createdBy: "Admin",
        updatedDate: new Date().toISOString(),
        duration: calculateDuration(formData.startTime, formData.endTime)
      };

      const url = meetingToEdit?._id 
        ? `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.UPDATE}/${meetingToEdit._id}`
        : `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.ADMIN_MEETING.CREATE}`;

      const method = meetingToEdit?._id ? "PUT" : "POST";

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if ([200, 201].includes(response.status)) {
        setSuccess(true);
        setTimeout(() => {
          onMeetingCreated();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("API Error:", err);
      
      let errorMessage = "An error occurred while saving the meeting.";
      
      if (err.response?.data?.issues) {
        errorMessage = err.response.data.issues
          .map((issue: any) => issue.message)
          .join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserSelected = (id: string) => {
    return formData.teachers.some(t => t.teacherId === id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">
            {meetingToEdit ? "Edit Meeting" : "Add Meeting"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm w-full text-center px-6 py-8 relative">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Scheduled successfully</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                  You have successfully sent the schedule
                </p>
                <div className="h-1 bg-green-500 rounded-full w-20 mx-auto my-4"></div>
                <button
                  onClick={() => {
                    setSuccess(false);
                    onMeetingCreated();
                    onClose();
                  }}
                  className="bg-[#5B6AC7] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-[#4b5ab3] transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Meeting Name *</label>
              <input
                type="text"
                name="meetingName"
                value={formData.meetingName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Meeting Date *</label>
              <input
                type="date"
                name="selectedDate"
                value={formData.selectedDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formatTimeValue(formData.startTime)}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                required
                step="300"
                pattern="[0-9]{2}:[0-9]{2}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formatTimeValue(formData.endTime)}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                required
                step="300"
                pattern="[0-9]{2}:[0-9]{2}"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Add Participants *</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                onClick={() => !loading && setShowUserList(true)}
                value={
                  formData.teachers.length > 0
                    ? `${formData.teachers.length} selected`
                    : "Add"
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm cursor-pointer dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Write a description here."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {showUserList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium dark:text-white">Select Attendees</h3>
                <button 
                  onClick={() => setShowUserList(false)}
                  disabled={loading}
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 text-sm dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                />

                <div className="overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {filteredUsers.length > 0 ? (
                    <div className="space-y-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <FaUserCircle className="text-gray-400 dark:text-gray-500" size={20} />
                            <div>
                              <p className="text-sm font-medium dark:text-white">
                                {user.name} {user.isTeacher && "(Teacher)"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email} {user.role && `(${user.role})`}
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isUserSelected(user.id)}
                            onChange={() => toggleUser(user)}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800"
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No attendees found
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserList(false)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    disabled={loading}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMeeting;