"use client";

import { useState } from "react";
import ClassesScheduleTab from "./ClassesScheduleTab";
import DocumentsTab from "./DocumentsTab";
import OverviewTab from "./OverviewTab";
import PersonalInformationTab from "./PersonalInformationTab";
import SalaryHistoryTab from "./SalaryHistoryTab";
import {
  TeacherDetailsTabId,
  TeacherDetailsTabProps,
} from "./teacherDetailsTypes";

interface TeacherDetailsTabsProps extends TeacherDetailsTabProps {
  onViewResume: () => void;
  onChangeTab: (tab: TeacherDetailsTabId) => void;
}

const tabs: { id: TeacherDetailsTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "personal", label: "Personal Information" },
  { id: "documents", label: "Documents" },
  { id: "classes", label: "Classes & Schedule" },
  { id: "salary", label: "Salary History" },
];

export default function TeacherDetailsTabs(props: TeacherDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<TeacherDetailsTabId>("overview");
  const tabProps: TeacherDetailsTabProps = {
    teacher: props.teacher,
    stats: props.stats,
    classes: props.classes,
    classesLoading: props.classesLoading,
  };

  const changeTab = (tab: TeacherDetailsTabId) => {
    setActiveTab(tab);
    props.onChangeTab(tab);
  };

  return (
    <div>
      <nav
        role="tablist"
        aria-label="Teacher details"
        className="mb-3 flex gap-2 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`teacher-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="teacher-details-panel"
            onClick={() => changeTab(tab.id)}
            className={`relative shrink-0 px-3 py-3 text-[13px] font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[#5268bb] after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-[#5268bb]"
                : "text-[#111b38] hover:text-[#5268bb] dark:text-[#d6d9e2]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div
        id="teacher-details-panel"
        role="tabpanel"
        aria-labelledby={`teacher-tab-${activeTab}`} className="mt-4 bg-[#f2f3fa] dark:bg-[#1e1e2d] p-4 rounded-lg"
      >
        {activeTab === "overview" && (
          <OverviewTab {...tabProps} onChangeTab={changeTab} />
        )}
        {activeTab === "personal" && <PersonalInformationTab {...tabProps} />}
        {activeTab === "documents" && (
          <DocumentsTab {...tabProps} onViewResume={props.onViewResume} />
        )}
        {activeTab === "classes" && <ClassesScheduleTab {...tabProps} />}
        {activeTab === "salary" && <SalaryHistoryTab {...tabProps} />}
      </div>
    </div>
  );
}
