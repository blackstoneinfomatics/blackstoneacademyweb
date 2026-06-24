"use client";

import { Star, Search } from "lucide-react";
import { useState } from "react";
import { MdTune } from "react-icons/md";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";

const allUsers = Array.from({ length: 47 }, (_, i) => ({
  name: `User ${i + 1}`,
  level: `Level : ${(i % 5) + 1}`,
  language: "Arabic Language",
  rating: 4,
}));

const ITEMS_PER_PAGE = 5;

const dummyStudents = [
  { fullName: "Abdullah Sulaiman", courseName: "Arabic" },
  { fullName: "Iman Gabell", courseName: "Islamic Studies" },
  { fullName: "Gia Rose", courseName: "Quran" },
  { fullName: "Samantha Neil", courseName: "Arabic" },
];

export default function DashboardPage() {
  const teacher = {
    candidateFirstName: "Will Jonto",
    candidateEmail: "willjonto@gmail.com",
    candidatePhoneNumber: "(1) 2345 6789 3245",
    candidateCountry: "UAE",
    positionApplied: "Senior Arabic Tutor",
    overallRating: 4,
    profileImage:
      "/assets/images/portrait-happy-smiling-young-businessman-blue-suit-isolated-white-wall.svg",
  };
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);

  const currentItems = allUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const studentInfoList = dummyStudents;
  return (
    <BaseLayout4>
      <AdminHeader currentSection="Assessment" showBackButton={true} showBackPath="courses" />
      <div className="min-h-100vh flex flex-col  p-1 w-full overflow-x-hidden">
        {/* Top Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 flex-wrap mb-2">
          {/* 50% Profile Info = 5/10 cols */}
          <div className="col-span-1 xl:col-span-5 bg-[#5E6578] text-white rounded-2xl shadow-lg p-6 flex flex-wrap xl:flex-nowrap items-start gap-6 relative w-full">
            {/* Badge */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center text-center px-2 w-full xl:w-1/3">
              <img
                src={teacher.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full  object-cover mb-3"
              />
              <h2 className="text-xl font-semibold text-white break-words">
                {teacher.candidateFirstName}
              </h2>
              <p className="text-sm text-[#C9C9C9] break-words">
                {teacher.candidateEmail}
              </p>
            </div>

            {/* Divider */}
            <div className=" xl:block w-[2px] h-full bg-gray-300 opacity-30" />

            {/* Info */}
            <div className="w-full xl:w-2/3 mt-4 xl:mt-0">
              <h3 className="text-base font-semibold mb-4">Personal Info</h3>
              <ul className="text-sm space-y-2 text-white">
                <li className="flex justify-between">
                  <span>Contact</span>
                  <span className="text-[#DADADA]/80">
                    {teacher.candidatePhoneNumber}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Country</span>
                  <span className="text-[#DADADA]/80">
                    {teacher.candidateCountry}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Role</span>
                  <span className="text-[#DADADA]/80">
                    {teacher.positionApplied}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Level</span>
                  <span className="text-[#DADADA]/80">
                    {teacher.overallRating}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Performance</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < teacher.overallRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* 20% Stat Box 1 = 2/10 cols */}
          <div className="col-span-1 xl:col-span-2 flex flex-col gap-4">
            <div className="bg-[#7689BD] text-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-lg mb-2">Total Assessments</h3>
              <p className="text-2xl font-bold">62</p>
            </div>
            <div className="bg-[#7689BD] text-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-lg mb-2">Total Pending</h3>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>

          {/* 30% Student List = 3/10 cols */}
          <div className="col-span-1 xl:col-span-3 bg-white dark:bg-[#2f2f2f] rounded-2xl p-4 flex flex-col gap-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-[#111827] dark:text-white">
                Total Completed
              </h2>
              <span className="bg-[#576CBC] text-white text-[12px] font-semibold rounded-md px-2 py-1">
                {studentInfoList.length}
              </span>
            </div>

            <ul className="space-y-3 overflow-y-auto max-h-[200px] md:max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
              {studentInfoList.map((student, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
                    <span className="text-[12px] font-medium text-[#111827] dark:text-white">
                      {student.fullName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#576CBC] font-medium whitespace-nowrap">
                    {student.courseName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-3  w-full bg-[#F5F5F5] dark:bg-[#3B3B3B] rounded-xl ">
          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center dark:bg-[#343434] bg-[#FAFAFB] rounded-xl px-4 gap-4 md:gap-0">
            <div className="flex-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 justify-start py-3 sm:py-2 px-4">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search by Course Name"
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100"
              />
            </div>

            <button className="flex-1 flex items-center gap-2 text-sm sm:py-2 text-gray-400 dark:text-gray-300 cursor-pointer justify-start border-y-0 border-l-2 border-r-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4">
              <MdTune className="w-5 h-5" />
              <span>Filter</span>
            </button>

            <div className="flex-1 flex items-center text-sm text-gray-500 sm:py-2 dark:text-gray-300 py-3 px-4 justify-start">
              <span>Showing {currentItems.length} entries</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-3">
            {currentItems.map((user, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#343434] rounded-2xl shadow-lg p-3 text-center flex flex-col items-center justify-between hover:shadow-xl transition-shadow w-full"
              >
                <img
                  src="/assets/images/profilePicture11.svg"
                  alt="User"
                  className="w-full aspect-video object-contain mb-3"
                />
                <div className="text-sm text-gray-800 dark:text-white font-semibold mb-1">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                  {user.level}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                  {user.language}
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(user.rating)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <button className="w-full bg-[#576CBC] text-white  hover:bg-[#4459A9] text-[12px] rounded-lg py-[7px] mb-2  transition-colors">
                  View Profile
                </button>
                <button className="w-full border border-[#576CBC] text-[#576CBC] hover:border-[#4459A9] text-[12px] rounded-lg py-[7px] hover:bg-[#E6E9F5] dark:hover:bg-[#333]  transition-colors">
                  Portal Access
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Pagination */}
        <div className="flex flex-wrap justify-end items-center gap-2 mt-3 w-full">
          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-md border flex items-center justify-center bg-[#F5F5F2] text-sm disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
          >
            &lt;
          </button>

          {/* Page Numbers with Ellipsis */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
            )
            .map((page, idx, arr) => {
              const prevPage = arr[idx - 1];

              return (
                <div key={`pagination-${page}`} className="flex items-center">
                  {Boolean(
                    prevPage && page - prevPage > 1 && (
                      <span
                        key={`ellipsis-${page}`}
                        className="px-2 text-sm text-gray-500 dark:text-gray-400"
                      >
                        …
                      </span>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm transition ${
                      page === currentPage
                        ? "bg-[#FAFAFB] text-[#203F78] border-[#203F78] dark:bg-[#939393]"
                        : "bg-white dark:bg-[#565656] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#939393]"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-md border flex items-center justify-center text-sm bg-[#F5F5F2] disabled:opacity-50 hover:bg-gray-300 dark:bg-[#565656] dark:hover:bg-[#939393]"
          >
            &gt;
          </button>
        </div>
      </div>
    </BaseLayout4>
  );
}
