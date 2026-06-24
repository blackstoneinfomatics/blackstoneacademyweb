import React from 'react';
import Assignment from '../../components/Assignment';
import StudentList from '../../components/StudentsList';
import BaseLayout from '@/app/(tenant)/modules/users/teacher/components/BaseLayout';
import TeacherHeader from '../../components/TeacherHeader';

const page = () => {
  return (
    <BaseLayout>
        <TeacherHeader currentSection="Assignments" />

      {/* Page wrapper */}
      <div className=" min-h-screen py-px-4 ">
        {/* Dashboard Title */}

        {/* Assignment Cards Section */}
        <div className="mb-5">
          <Assignment />
        </div>

        {/* Student List Section */}
        <div>
          <StudentList />
        </div>
      </div>
    </BaseLayout>
  );
};

export default page;
