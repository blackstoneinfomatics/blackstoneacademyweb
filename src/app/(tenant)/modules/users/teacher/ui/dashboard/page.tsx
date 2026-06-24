'use client';

import React from 'react';
import 'react-calendar/dist/Calendar.css';
import BaseLayout from '@/app/(tenant)/modules/users/teacher/components/BaseLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Calender from '../../components/Calender';
import Total from '@/app/(tenant)/modules/users/teacher/components/total';
import NextScheduleClass from '@/app/(tenant)/modules/users/teacher/components/NextScheduleclass';
import ClassAnalyticsChart from '@/app/(tenant)/modules/users/teacher/components/ClassAnalyticsChart';
import EarningAnalytics from '../../components/EarningAnalytics';
import TeachingActivity from '../../components/TeachingActivity';
import UpcomingTask from '../../components/UpcomingTask';
import StudentsCard from '../../components/Students';
import TeacherHeader from '../../components/TeacherHeader';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Academic() {
  return (
    <BaseLayout>
      <TeacherHeader currentSection="Dashboard" />

      <div className="flex flex-col lg:flex-row gap-4 bg-[#E4E7F4] dark:bg-[#252525]   min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Total />
          </div>

          {/* Next Class Schedule */}
          <div className="grid grid-cols-1 gap-4">
            <NextScheduleClass />
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
            <div className="col-span-12 md:col-span-8">
              <EarningAnalytics />
            </div>
            <div className="col-span-12 md:col-span-4">
              <StudentsCard />
            </div>
          </div>



          {/* Teaching Activity and Class Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
            {/* Teaching Activity (8 cols) */}
            <div className="col-span-12 lg:col-span-8 flex">
              <div className="w-full h-full">
                <TeachingActivity />
              </div>
            </div>

            {/* Class Analytics (4 cols) - with constrained container */}
            <div className="col-span-12 lg:col-span-4 flex">
              <div className="w-full h-full min-h-[250px]">
                <ClassAnalyticsChart />
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[310px] flex flex-col gap-4">
          {/* Calendar */}
          <div className="rounded-xl shadow-lg  bg-white dark:bg-[#343434] p-2">
            <Calender />
          </div>
          {/* Upcoming Tasks */}
          <div className="rounded-xl shadow-lg bg-white dark:bg-[#343434] overflow-y-auto scrollbar-none flex-1">
            <UpcomingTask />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
