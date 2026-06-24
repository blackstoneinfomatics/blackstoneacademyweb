"use client";

import React, { useState } from 'react';
import BaseLayout4 from '../../../../components/BaseLayout4';


const MonthDataPage = () => {
  const data = [
    {
      studentName: "Robert James",
      studentId: "#09838267",
      course: "Arabic",
      type: "Trial Class",
      duration: "30 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 08:30 AM",
      amount: "$04",
      status: "Completed",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838268",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
    {
      studentName: "Stefan Salvatore",
      studentId: "#09838267",
      course: "Quran",
      type: "Regular Class",
      duration: "60 Minutes",
      dateTime: "January 2, 2023 - 08:00 - 09:00 AM",
      amount: "$10",
      status: "Cancelled",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Set the number of items per page

  // Calculate the index of the last item and the first item
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const Pagination = () => {
    return (
      <div className="flex justify-between items-center p-3">
        <p className="text-[9px] text-gray-600">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.length)} from {data.length} data
        </p>
        <div className="flex space-x-2 text-[8px]">
          {/* Previous Button */}
          <button
            className={`px-2 py-1 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-200 hover:bg-gray-300"}`}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {/* Pagination Numbers */}
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`px-2 py-1 rounded ${currentPage === index + 1 ? "bg-[#1B2B65] text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          {/* Next Button */}
          <button
            className={`px-2 py-1 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-gray-200 hover:bg-gray-300"}`}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#DCFCE7] text-green-800 border border-green-900 rounded-lg";
      case "Cancelled":
        return "bg-red-100 text-red-500 border-red-500 border rounded-lg";
      case "Rescheduled":
        return "bg-yellow-100 text-yellow-600 border-yellow-600 border rounded-lg";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <BaseLayout4>
      <div className="p-3 pr-9 mx-auto">
        <h2 className="text-[18px] p-2 font-semibold">
          Teacher
        </h2>
        <div className=" bg-white rounded-lg border-2 border-[#1C3557]">
          <div className="flex justify-end px-4 py-2">
            <select className=" px-3 py-1 text-xs bg-[#1C3557] rounded-lg text-white">
              <option>Duration : January</option>
              <option>Duration : February</option>
              <option>Duration : March</option>
              <option>Duration : April</option>
              <option>Duration : May</option>
              <option>Duration : June</option>
              <option>Duration : July</option>
              <option>Duration : August</option>
              <option>Duration : September</option>
              <option>Duration : October</option>
              <option>Duration : November</option>
              <option>Duration : December</option>
            </select>
          </div>
          <table className="min-w-full rounded-lg shadow bg-[#fff]"
            style={{ width: "100%", tableLayout: "fixed" }}>
            <thead className="border-b-[1px] border-[#1C3557] text-[12px] font-semibold">
              <tr>
                <th className="p-3 py-5  font-semibold text-left">Student Name</th>
                <th className="p-3 py-5  font-semibold text-left">Student ID</th>
                <th className="p-3 py-5  font-semibold text-left">Courses</th>
                <th className="p-3 py-5  font-semibold text-left">Course Type</th>
                <th className="p-3 py-5  font-semibold text-left">Course Duration</th>
                <th className="p-3 py-5  font-semibold text-left">Class Date & Time</th>
                <th className="p-3 py-5  font-semibold text-left">Amount</th>
                <th className="p-3 py-5  font-semibold text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.map((item, index) => (
                <tr key={index} className={`text-[10px] font-medium mt-0 ${index % 2 === 0 ? "bg-[#faf9f9]" : "bg-[#ebebeb]"
                  }`}>
                  <td className="px-6 py-2 whitespace-nowrap text-left">{item.studentName}</td>
                  <td className="px-6 py-2 text-left">{item.studentId}</td>
                  <td className="px-6 py-2 text-left">{item.course}</td>
                  <td className="px-6 py-2 text-left">{item.type}</td>
                  <td className="px-6 py-2 text-left">{item.duration}</td>
                  <td className="px-6 py-2 text-left">{item.dateTime}</td>
                  <td className="px-6 py-2 text-left">{item.amount}</td>
                  <td className="px-6 py-2 text-left">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </BaseLayout4>
  );
};

export default MonthDataPage;
