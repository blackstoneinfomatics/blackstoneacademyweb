import BaseLayout2 from "@/app/(tenant)/modules/users/student/components/BaseLayout2";
import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineArrowOutward } from "react-icons/md";
import StudentHeader from "../../components/StudentHeader";

const Support = () => {
  return (
    <BaseLayout2>
      <StudentHeader currentSection="Support" />
      <div className="p-4 mx-auto">
        <div className="flex gap-x-5 w-auto">
          {/* CONTACT SECTION */}
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

          {/* FAQ SECTION */}
          <div className="bg-[#5E6578] shadow-lg rounded-xl p-6 w-[915px] relative pb-20">
            <h2 className="text-[20px] p-4 text-left font-semibold text-[#FAFAFA] mb-7">
              Do you have questions?
            </h2>
            <div className="px-6">
              <details className="group mb-6 py-2 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                How can I join my live class from the dashboard?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                You can join your live class directly from your Student Dashboard by clicking the “Join”
button next to your scheduled class.
Alternatively, go to the Classes menu and click Join from there.
Note: The Join button will only become active at the scheduled class time.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                How can I check my upcoming class schedule or past sessions?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                Go to “Classes” in your dashboard. You’ll find both upcoming and completed classes listed
                there.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                How can I upgrade or change my current package?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                Click “Upgrade Package” in your dashboard. You can choose from the available plans or
                contact the Admin Support Team for assistance.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                Is it possible to reschedule a class if I miss one?                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                If a scheduled class is missed, make-up or reschedule is not available.
                </div>
              </details>

              <details className="group py-2 mb-6 w-full border-b border-b-[#818795]">
                <summary className="flex items-center justify-between text-[16px] font-normal text-[#fff] cursor-pointer">
                How to reschedule a scheduled class?
                  <IoIosArrowDown className="text-white transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-[#BBBBBB] text-[14px] mt-2 break-words">
                You can request to reschedule a class based on your package. Go to your Scheduled Classes list,
click the “Request Reschedule” button next to the class, and choose your preferred date (subject
to teacher availability).
Note: Rescheduling is only allowed up to 4 hours before the class start time.
                </div>
              </details>
            </div>

            <div className="absolute bottom-6 right-8 z-10">
              <button className="bg-[#FAFAFA] text-[#1B242C] px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                Connect Us
                <MdOutlineArrowOutward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout2>
  );
};

export default Support;
