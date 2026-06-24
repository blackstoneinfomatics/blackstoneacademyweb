"use client";


import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import ApplicationChart from "../../components/Growth";
import Subject from "../../components/SubjectCard";
import CourseOverview from "../../components/CourseOverview";
import UpcomingTable from "../../components/UpcomingTable";
import StudentProfile from "../../components/StudentProfile";
import StudentHeader from "../../components/StudentHeader";
import MyClass from "../classes/MyClass";

const Dashboard = () => {
  return (
    <BaseLayout2>
      <StudentHeader currentSection="Dashboard" />

      <div className="flex flex-row gap-4 p-0 min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Next Class Schedule */}
          <div className="grid grid-cols-1 gap-4">
            <MyClass />
          </div>

          {/* Course Overview */}
          <CourseOverview />

          {/* Charts Row */}
          <div className="flex gap-4">
            <div className="w-[67%] rounded-xl h-[250px] flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <ApplicationChart />
              </div>
            </div>
            {/* <div className="w-[33%] bg-white rounded-xl dark:bg-[#343434] h-[270px] flex flex-col"> */}
            <Subject />
            {/* </div> */}
          </div>

          {/* Applications Table */}
          <UpcomingTable />
        </div>

        {/* Sidebar */}

        <StudentProfile />
      </div>
    </BaseLayout2>
  );
};

export default Dashboard;
