import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineArrowOutward } from "react-icons/md";
import SupervisorHeader from "../../components/supervisorHeader";

const Support = () => {
  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Support" />
      <div className="p-4">
        <div className="flex gap-x-5 w-auto">
          <div className="bg-[#7689BD] shadow-lg rounded-xl p-4 h-[616px] w-[580px]">
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

          <div className="bg-[#5E6578] shadow-lg rounded-xl p-6 w-full h-[616px]">
            <h2 className="text-[20px] p-4 text-left font-semibold text-[#FAFAFA] mb-7">
              Do you have questions?
            </h2>
            <div className="px-6">
              <details className="group mb-6 py-2 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  How can I monitor live classes or review class recordings?{" "}
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Go to the “Teachers” menu and click “Scheduled Classes” at the
                  top right to view ongoing or recorded sessions.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  Can I provide feedback or evaluations for teachers?{" "}
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Yes. Use the “Teacher → Feedback” option at the top right to
                  submit ratings and performance notes.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  What actions can I take if a teacher or student reports an
                  issue?{" "}
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  You can review, investigate, and either resolve or escalate
                  the issue to the Admin Team. effectively.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  How do I communicate with teachers or academic coaches?{" "}
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Use the “Messages” feature from your menu for direct and
                  smooth communication.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                  How can I view new teacher applications?{" "}
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                  Go to the “Recruitment” menu to view applications with
                  profiles, qualifications, and demo videos. You can shortlist
                  or reject applicants directly from there.
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
    </BaseLayout3>
  );
};

export default Support;
