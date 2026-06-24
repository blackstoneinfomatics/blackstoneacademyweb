"use client";
import BaseLayout1 from "@/app/(tenant)/modules/users/Academic-coach/components/BaseLayout1";
import React, { useState } from "react";
import TrailSection from "../../components/TrailSection/page";
import Evaluation from "../../components/Evaluation/page";
import AcademicHeader from "../../components/academicHeader";

const Page = () => {
  const [activeTab, setActiveTab] = useState("evaluation");

  return (
    <BaseLayout1>
      <div>
        <AcademicHeader currentSection="Trial Management" />
        <div className="flex space-x-6 px-4 py-2 rounded-md relative">
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`relative pb-2 ${
              activeTab === "evaluation" ? "text-[#576CBC] font-semibold" : "text-gray-600 dark:text-[#ffffff]"
            }`}
          >
             Evaluation Session
            {activeTab === "evaluation" && (
              <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[80px] h-[2px] bg-[#576CBC] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("trial")}
            className={`relative pb-2 ${
              activeTab === "trial" ? "text-[#576CBC] font-semibold" : "text-gray-600 dark:text-[#ffffff]"
            }`}
          >
       Trial Session
            {activeTab === "trial" && (
              <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[80px] h-[2px] bg-[#576CBC] rounded-full"></span>
            )}
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "evaluation" && <Evaluation />}
          {activeTab === "trial" && <TrailSection />}
        </div>
      </div>
    </BaseLayout1>
  );
};

export default Page;
