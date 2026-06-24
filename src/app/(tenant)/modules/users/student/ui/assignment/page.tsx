"use client";

import React from "react";
import Assignmentlist from "../../components/assignment/Assignmentlist";
import Assignlist from "../../components/assignment/Assignlist";
import StudentHeader from "../../components/StudentHeader";
import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";

const CurrentStatus = () => {
  return (
    <BaseLayout2>
      <StudentHeader currentSection="Assignments" />
      <div className=" min-h-screen py-px-4 ">
        <div className="mb-5">
          <Assignlist />
        </div>
        <Assignmentlist />
      </div>
    </BaseLayout2>
  );
};

export default CurrentStatus;
