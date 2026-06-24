import BaseLayout from "@/app/(tenant)/modules/users/teacher/components/BaseLayout";
import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineArrowOutward } from "react-icons/md";
import TeacherHeader from "../../components/TeacherHeader";

const Support = () => {
  return (
    <BaseLayout>
      <TeacherHeader currentSection="Support" />
      <div className="p-4 mx-auto">
        <div className="flex gap-x-5 w-auto">
          <div className="bg-[#7689BD] shadow-lg rounded-xl p-4 h-[616px] w-[340px]">
            <h2 className="text-[20px] font-semibold text-[#fff] mb-4 p-4">
              Contact
            </h2>
            <div className="text-gray-800 space-y-4 justify-evenly px-6">
              <p>
                <strong className="text-white text-[16px] font-medium flex items-center gap-2">
                  <img
                    src="/assets/images/location.png"
                    alt="location"
                    className="w-4 h-4"
                  />
                  Visit Us :
                </strong>
                <div className="ml-6">
                  <span className="text-[13px] font-normal text-white">
                    Come say Hello at Our Office HQ
                  </span>
                  <br />
                  <span className="text-white text-[13px] font-normal">
                    {" "}
                    128, City Road, London, EC1V 2NX, United Kingdom
                  </span>
                </div>

              </p>
              <p>
                <strong className="text-white text-[16px] font-medium flex items-center gap-2">
                  <img
                    src="/assets/images/call.png"
                    alt="call"
                    className="w-4 h-4"
                  />
                  Call Us :
                </strong>
                <div className="ml-6">
                  <span className="text-[13px] font-normal text-white">
                    Monday – Sunday/ 24×7
                  </span>
                  <br />
                  <span className="text-white text-[13px] font-normal">
                    UK +44 20 4577 1227
                    <br />
                    USA +1 85 5442 3380
                  </span>
                </div>
              </p>
              <p>
                <strong className="text-white text-[16px] font-medium flex items-center gap-2">
                  <img
                    src="/assets/images/email.png"
                    alt="email"
                    className="w-4 h-4"
                  />
                  Email to Us :
                </strong>
                <div className="ml-6">
                  <span className="text-[13px] font-normal text-white">
                    Our Friendly team is here to Help
                  </span>
                  <br />
                  <span className="text-white text-[13px] font-normal">
                    contact@alfurqan.academy
                  </span>
                </div>
              </p>
            </div>
          </div>

          <div className="bg-[#5E6578] shadow-lg rounded-xl p-6 w-[915px] h-[616px]">
            <h2 className="text-[20px] p-4 text-left font-semibold text-[#FAFAFA] mb-7">
              Do you have questions?
            </h2>
            <div className="px-6">
              <details className="group mb-6 py-2 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  How can I view my upcoming class schedule and student list?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Go to the “Schedule” option in the menu to view all your assigned classes and upcoming
                  sessions.
                  To view your Student List and Class List, open the “Analytics” section from the menu.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  How do I mark student attendance or performance after class?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Attendance is recorded automatically based on the session’s start and end time.
                  After each class, you’ll be prompted to add a short feedback or performance note for the
                  student.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  Can I reschedule or cancel a class due to an emergency?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Yes. Click “Request Reschedule” next to the class you wish to change.
                  Your request will be reviewed by the Academic Coach and approved based on student and class
                  availability.
                  Note: Reschedule requests must be made at least 4 hours before the class start time.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  Where can I view my payment status or monthly earnings?                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Go to “Analytics → Earnings” in your dashboard. It displays your teaching hours, monthly
                  summary, and payment history.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  Who should I contact for technical or platform-related issues?                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Reach out to the Support Team via the “Support” section in your dashboard or through the
                  official contact number for immediate help.
                </div>
              </details>
            </div>

            <div className="flex gap-3 mt-32 text-[#fff] text-center justify-end p-2">
              <button className="bg-[#FAFAFA] text-[#1B242C] p-2 rounded-lg flex items-center gap-2">
                Connect Us
                <MdOutlineArrowOutward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Support;
