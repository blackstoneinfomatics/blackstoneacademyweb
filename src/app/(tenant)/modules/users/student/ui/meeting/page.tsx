"use client";

import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import NextMeetingSchedule from "../../components/meetings/NextMeetingScheduke";
import ScheduledMeetings from "../../components/meetings/ScheduledMeetings";
import StudentHeader from "../../components/StudentHeader";


const Meeting = () => {
  return (
    <BaseLayout2>
      <StudentHeader currentSection="Scheduled Meeting" />
      <NextMeetingSchedule />
      <ScheduledMeetings/>
    </BaseLayout2>
  );
};

export default Meeting;

