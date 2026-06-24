'use client';

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';


if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

interface PopupProps {
  isOpen: boolean;
  onRequestClose: () => void;
  user: User | null;
  isEditMode: boolean;  // Add this line

  onSave: (user: User) => void;
}


interface User {
studentId: string;
  fname: string;
  lname: string;
  email: string;
  number: string;
  country: string;
  course: string;
  preferredTeacher: string;
  date: string;
  time: string;
  evaluationStatus?: string;
  city: string;
  numberofstudents?: string;
  comment?: string;
  [key: string]: any;
}

interface GetAllUsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

interface ApiResponseUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  learningInterest: string;
  numberOfStudents: string;
  preferredTeacher: string;
  startDate: string;
  preferredFromTime: string;
  preferredToTime: string;
  evaluationStatus?: string;  
  city: string;    
}

const Popup: React.FC<PopupProps> = ({ isOpen, onRequestClose, user, onSave }) => {
  const [formData, setFormData] = useState<User>({
    studentId: '',
    fname: '',
    lname: '',
    email: '',
    number: '',
    country: '',
    course: '',
    preferredTeacher: '',
    date: '',
    time: '',
    evaluationStatus: 'PENDING',
    numberofstudents: '',
    comment: '',
    city:'',
  });

  const [users, setUsers] = useState<User[]>([]);
  console.log(users);
  

  const getAllUsers = async (): Promise<GetAllUsersResponse> => {
    try {
        const token =
    typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;

  if (!token) {
    console.error("❌ AdminAuthToken not found");
  }
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.STUDENT.GET_LIST}`,{
        headers:{
          'Authorization': `Bearer ${token}`,
        }
      });
      const rawData = await response.json();
      console.log('Raw API Response:', rawData);
      // console.log(response) 

      // Check if rawData.students exists and is an array
      if (!rawData.students || !Array.isArray(rawData.students)) {
        throw new Error('Invalid data structure received from API');
      }

      // Transform API data to match User interface
      const transformedData = rawData.students.map((item: ApiResponseUser) => ({
        studentId: item._id,
        fname: item.firstName,
        lname: item.lastName,
        email: item.email,
        number: item.phoneNumber.toString(),
        country: item.country,
        course: item.learningInterest,
        numberofstudents: item.numberOfStudents,
        preferredTeacher: item.preferredTeacher,
        date: new Date(item.startDate).toLocaleDateString(),
        time: `${item.preferredFromTime}`,
        evaluationStatus: item.evaluationStatus,
        city: item.city,
      }));

      return {
        success: true,
        data: transformedData,
        message: 'Users fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch users',
      };
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'student.studentFirstName') {
      setFormData((prev) => ({
        ...prev,
        student: {
          ...prev.student,
          studentFirstName: value,
        },
      }));
    } else if (name === 'student.studentLastName') {
      setFormData((prev) => ({
        ...prev,
        student: {
          ...prev.student,
          studentLastName: value,
        },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const router = useRouter();

  const handleStart = () => {
    console.log("Navigating with Student ID:", formData.studentId);
    router.push(`/evaluation?studentId=${formData.studentId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-8 w-[800px] max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#293552] to-[#1e273c] text-transparent bg-clip-text">
              {user ? 'Edit Student' : 'Start Evaluation'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="bg-gradient-to-r from-[#293552] to-[#1e273c] text-white px-5 py-2 rounded-lg
                         hover:shadow-lg transition-all duration-300 text-sm font-medium
                         flex items-center gap-2 transform hover:translate-y-[-1px]" 
              onClick={handleStart}
            >
              <span>Start Evaluation</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={onRequestClose} 
              className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-5">
            <div className="form-group">
              <label htmlFor='name' className="block text-xs font-medium text-gray-700 mb-1.5">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                           transition-all duration-300 ease-in-out
                           focus:border-[#293552] focus:ring-2 focus:ring-[#293552]/20 focus:outline-none
                           hover:border-[#293552]/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-0 transition-opacity duration-300 group-focus-within:opacity-100">
                  <div className="w-1 h-1 bg-[#293552] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Number of Students</label>
              <input
                type="text"
                name="numberofstudents"
                value={formData.numberofstudents}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Preferred Teacher</label>
              <input
                type="text"
                name="preferredTeacher"
                value={formData.preferredTeacher}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Time</label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
          </div>
          <div className="form-group">
            <label  htmlFor='name' className="block mb-1 text-xs font-medium text-gray-700">Comment</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default Popup;
