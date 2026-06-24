"use client";
import React from "react";
import Link from "next/link";
import AdminHeader from "../../components/AdminHeader";
import BaseLayout4 from "../../components/BaseLayout4";

const cardData = [
  {
    title: "Courses",
    totalLabel: "Total Levels",
    total: "100",
    course: "Islamic History",
    city: "India",
    duration: "150 Hours",
    date: "11/05/25",
    createdBy: "Admin",
    href: "/modules/users/admin-main/ui/courses/coursedetails",
  },
  {
    title: "Assignments",
    totalLabel: "Total Levels",
    total: "100",
    course: "Islamic History",
    city: "UAE",
    duration: "60 Hours",
    date: "12/05/25",
    createdBy: "Admin",
    href: "/modules/users/admin-main/ui/assignments",
  },
  {
    title: "Assessments",
    totalLabel: "Total Levels",
    total: "100",
    duration: "70 Hours",
    date: "12/05/25",
    createdBy: "Admin",
    href: "/modules/users/admin-main/ui/assessments",
  },
  {
    title: "Knowledge Base",
    totalLabel: "Total Levels",
    total: "100",
    duration: "80 Hours",
    date: "13/05/25",
    createdBy: "Admin",
    href: "/modules/users/admin-main/ui/knowledge",
  },
  {
    title: "Packages",
    totalLabel: "Total Packages",
    total: "100",
    date: "13/05/25",
    createdBy: "Admin",
    href: "/modules/users/admin-main/ui/package",
  },
];

const Page = () => {
  return (
    <BaseLayout4>
      <AdminHeader currentSection="Course" />
      <div className="min-h-100vh w-full px-4 sm:px-6 lg:px-10 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {cardData.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="w-full bg-white dark:bg-[#343434] rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 sm:p-6 text-center hover:border-[#576CBC] hover:border-[2.5px]"
            >
              {/* Title */}
              <h2 className="text-lg font-semibold text-[#fff] bg-[#576CBC] rounded-sm dark:text-white mb-4 break-words">
                {item.title}
              </h2>


              {/* Info List */}
              <div className="w-full text-xs sm:text-[11px] text-gray-700 dark:text-gray-300 space-y-3 text-left">

                {item.duration && (
                  <div className="grid grid-cols-[auto_1fr] gap-2 w-full">
                    <span className="font-medium break-words">Duration</span>
                    <span className="text-right break-words font-normal">
                      {item.duration}
                    </span>
                  </div>
                )}

                {item.total && (
                  <div className="grid grid-cols-[auto_1fr] gap-2 w-full">
                    <span className="font-medium break-words">
                      {item.totalLabel || "Total"}
                    </span>
                    <span className="text-right break-words font-normal">
                      {item.total}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-[auto_1fr] gap-2 w-full">
                  <span className="font-medium break-words">Creation Date</span>
                  <span className="text-right break-words font-normal">
                    {item.date}
                  </span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 w-full">
                  <span className="font-medium break-words">Created By</span>
                  <span className="text-right break-words font-normal">
                    {item.createdBy}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </BaseLayout4>
  );
};

export default Page;