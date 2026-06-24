'use client';

import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';


if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

interface EvaluationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (data: EvaluationData) => void;
}

interface EvaluationData {
  studentFirstName: string;
  studentLastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  learningInterest: string;
  numberOfStudents: string;
  preferredTeacher: string;
  date: string;
  time: string;
  comment?: string;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onRequestClose, onSave }) => {
  const [formData, setFormData] = useState<EvaluationData>({
    studentFirstName: '',
    studentLastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    learningInterest: '',
    numberOfStudents: '',
    preferredTeacher: '',
    date: '',
    time: '',
    comment: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onRequestClose(); // Close the modal after saving
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-8 w-[800px] max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Start Evaluation</h2>
          <button onClick={onRequestClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="form-group">
              <label 
                htmlFor="studentFirstName"
                className="block mb-1 text-xs font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="studentFirstName"
                id="studentFirstName"
                value={formData.studentFirstName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
              htmlFor="studentLastName"
              className="block mb-1 text-xs font-medium text-gray-700">Last Name</label>
              <input
                id="studentLastName"
                type="text"
                name="studentLastName"
                value={formData.studentLastName}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
               htmlFor="email"
              className="block mb-1 text-xs font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
               htmlFor='phoneNumber'
              className="block mb-1 text-xs font-medium text-gray-700">Phone Number</label>
              <input
                id="phoneNumber"
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
               htmlFor='country'
               className="block mb-1 text-xs font-medium text-gray-700">Country</label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
                 htmlFor='learningInterest'
                className="block mb-1 text-xs font-medium text-gray-700">Learning Interest</label>
              <input
                 id="learningInterest"
                type="text"
                name="learningInterest"
                value={formData.learningInterest}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
               htmlFor='numberOfStudents'
              className="block mb-1 text-xs font-medium text-gray-700">Number of Students</label>
              <input
                id='numberOfStudents'
                type="text"
                name="numberOfStudents"
                value={formData.numberOfStudents}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
                 htmlFor='preferredTeacher'
                className="block mb-1 text-xs font-medium text-gray-700">Preferred Teacher</label>
              <input
                 id='preferredTeacher'
                type="text"
                name="preferredTeacher"
                value={formData.preferredTeacher}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
               htmlFor='date'
              className="block mb-1 text-xs font-medium text-gray-700">Date</label>
              <input
               id='date'
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
            <div className="form-group">
              <label 
              htmlFor='time'
              className="block mb-1 text-xs font-medium text-gray-700">Time</label>
              <input
                id='time'
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
              />
            </div>
          </div>
          <div className="form-group">
            <label 
              htmlFor='comment'
              className="block mb-1 text-xs font-medium text-gray-700">Comment</label>
            <textarea
               id='comment'
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-[#293552] outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#293552] to-[#1e273c] text-white p-2 rounded-lg
                       hover:shadow-lg transition-all duration-300 text-sm font-medium"
          >
            Save
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default EvaluationModal; 