"use client";

import { useState } from "react";
import { BsCalendar4Event, BsClockHistory } from "react-icons/bs";
import { RiMenu2Fill } from "react-icons/ri";
import { GrCurrency } from "react-icons/gr";
import { MdOutlineCurrencyExchange, MdOutlineTimer } from "react-icons/md";
import { IoSunnyOutline } from "react-icons/io5";
import BaseLayout4 from "../../../components/BaseLayout4";

const Teacher = () => {
  const [activeTab, setActiveTab] = useState("Wages");
  const tabs = ["Wages", "Earnings", "Leave Records", "Working Hours"];

  return (
    <BaseLayout4>
      <div className="p-5 min-h-screen w-full">
        <div className="grid grid-cols-5 gap-4">
          {/* Profile Card (60%) with Contact Details */}
          <div className="col-span-3 bg-white p-6 rounded-lg shadow flex justify-between flex-row">
            <div className="border-r-2 justify-center p-5 text-center">
              <img
                src="/assets/images/Avatar.png"
                alt="Avatar"
                className="w-20 h-20 rounded-full border"
              />
              <h2 className="font-semibold mt-2 text-[12px]"> Alen Smith</h2>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="flex justify-between p-2 gap-6">
              <div>
                <div className="mt-4 text-xs w-full">
                  <h4 className="font-bold text-[13px] -mt-5">
                    Contact & Details
                  </h4>
                  <p className="py-2 font-semibold  text-gray-600">Email:</p>
                  <span>asulaiman403@gmail.com</span>
                  <p className="py-2 font-semibold  text-gray-600">Phone: </p>
                  <span>+880 1234 567891</span>
                  <p className="py-2 font-semibold  text-gray-600">
                    Date of Birth:
                  </p>
                  <span> 28, July 2000</span>
                  <p className="py-2 font-semibold  text-gray-600">Country:</p>
                  <span> Canada</span>
                  <p className="py-2 font-semibold  text-gray-600">
                    Gender:
                  </p>{" "}
                  <span>Male</span>
                </div>
              </div>
              <div>
                <div className="mt-4 text-gray-600 text-xs w-full">
                  <p className="py-2 font-semibold">Languages Known:</p>{" "}
                  <span> English, Hindi, Arabic</span>
                  <p className="py-2 font-semibold"> City:</p>{" "}
                  <span> Toronto</span>
                  <p className="py-2 font-semibold">Residential Address:</p>
                  <span>
                    {" "}
                    325, Residences on Bloor, Bloor St E, Toronto, Ontario.
                  </span>
                  <p className="py-2 font-semibold">Nationality:</p>{" "}
                  <span> Canadian</span>
                </div>
              </div>
            </div>
          </div>
          {/* Educational Details Card (20%) */}
          <div className="col-span-1 bg-white p-6 rounded-lg shadow">
            <div className="mt-4 text-xs w-full">
              <h4 className="font-bold text-[13px] -mt-5">
                Educational Information
              </h4>
              <p className="py-2 font-semibold text-gray-600">
                Highest Qualification:{" "}
              </p>{" "}
              <span>MBA</span>
              <p className="py-2 font-semibold text-gray-600">
                University/Institute:
              </p>{" "}
              <span> ABC School of Education</span>
              <p className="py-2 font-semibold text-gray-600">
                Previous Job Title:{" "}
              </p>{" "}
              <span>Junior Developer</span>
              <p className="py-2 font-semibold text-gray-600">Experience: </p>
              <span>2 years</span>
            </div>
          </div>
          {/* Bank Details Card (20%) */}
          <div className="col-span-1 bg-white p-6 rounded-lg shadow">
            <div className="mt-4 text-xs w-full">
              <h4 className="font-bold text-[13px] -mt-5">Bank Details</h4>
              <p className="py-2 font-semibold text-gray-600">Bank Name:</p>
              <span>Lorem Ipsum</span>
              <p className="py-2 font-semibold text-gray-600">
                Account Number:
              </p>{" "}
              <span> 1234567890</span>
              <p className="py-2 font-semibold text-gray-600">
                Bank Code:
              </p>{" "}
              <span>000-00000</span>
              <p className="py-2 font-semibold text-gray-600">
                Passport Number:
              </p>
              <span> ABCD00000</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow h-min">
          {/* Tabs */}
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 text-sm font-semibold rounded-lg focus:outline-none transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[#102645] text-white shadow"
                    : "text-black"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "Wages" && (
              <table className="w-full border border-gray-200 rounded-md">
                <thead className="text-left">
                  <tr className="text-sm text-gray-700 border-b border-gray-200">
                    <th className="p-4 font-medium">
                      <div className="flex items-center space-x-2">
                        <BsCalendar4Event className="text-base" />
                        <span>Class Type</span>
                      </div>
                    </th>
                    <th className="p-4 font-medium border-l border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-base">
                          <RiMenu2Fill className="text-base" />
                        </span>
                        <span>Rate</span>
                      </div>
                    </th>
                    <th className="p-4 font-medium border-l border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-base">
                          <GrCurrency />
                        </span>
                        <span>Currency</span>
                      </div>
                    </th>
                    <th className="p-4 font-medium border-l border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-base">
                          <MdOutlineTimer />
                        </span>
                        <span>Duration</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-900">
                  {[
                    ["Trial Class", "-", "-", "-"],
                    ["Regular Class", "-", "-", "-"],
                    ["Group Class", "-", "-", "-"],
                    ["Fixed Salary", "$2000", "Dirhams", "Monthly"],
                  ].map(([type, rate, currency, duration], index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-4">{type}</td>
                      <td className="p-4 border-l border-gray-200">{rate}</td>
                      <td className="p-4 border-l border-gray-200">
                        {type === "Fixed Salary" ? (
                          <select className="p-1 focus:outline-none">
                            <option>Dirhams</option>
                            <option>USD</option>
                            <option>INR</option>
                          </select>
                        ) : (
                          currency
                        )}
                      </td>
                      <td className="p-4 border-l border-gray-200">
                        {type === "Fixed Salary" ? (
                          <select className="p-1 focus:outline-none">
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Daily</option>
                          </select>
                        ) : (
                          duration
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Earnings Tab */}
            {activeTab === "Earnings" && (
              <div className="space-y-6">
                {/* Top Cards */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-[#11244D] text-white rounded-xl p-4 flex items-center justify-between w-56 shadow-md">
                    <div>
                      <p className="text-xs">Total Earnings</p>
                      <h2 className="text-lg font-bold mt-1">$2800</h2>
                    </div>
                    <div className="bg-[#1D3D70] p-2 rounded-lg text-sm">
                      <MdOutlineCurrencyExchange />
                    </div>
                  </div>
                  <div className="bg-[#4F4CD1] text-white rounded-xl p-4 flex items-center justify-between w-56 shadow-md">
                    <div>
                      <p className="text-xs">Total Deductions</p>
                      <h2 className="text-lg font-bold mt-1">$400</h2>
                    </div>
                    <div className="bg-[#6D6BF1] p-2 rounded-lg text-sm">
                      <BsClockHistory />
                    </div>
                  </div>
                </div>

                {/* Scrollable Table */}
                <div className="rounded-xl border border-[#D5D5D5] shadow overflow-hidden">
                  <div className="overflow-x-auto max-h-[180px] overflow-y-auto custom-scrollbar">
                    <table className="w-full min-w-[600px] text-sm text-left">
                      <thead className="text-gray-600 border-b border-gray-200 ">
                        <tr className="text-center">
                          <th className="p-4 font-semibold">Month</th>
                          <th className="p-4 font-semibold">
                            Total Working Hours
                          </th>
                          <th className="p-4 font-semibold">Total Earnings</th>
                          <th className="p-4 font-semibold">
                            Total Deductions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-800">
                        {[
                          ["January", "170 Hours", "$1050", "$0"],
                          ["February", "185 Hours", "$170", "$0"],
                          ["March", "178 Hours", "$140", "$0"],
                          ["April", "180 Hours", "$125", "$100"],
                          ["May", "100 Hours", "$190", "$0"],
                          ["June", "180 Hours", "$138", "$100"],
                          ["July", "120 Hours", "$210", "$0"],
                          ["August", "130 Hours", "$260", "$100"],
                          ["September", "100 Hours", "$186", "$100"],
                        ].map(([month, hours, earnings, deductions], index) => (
                          <tr
                            key={index}
                            className="border-t border-gray-100 hover:bg-gray-50"
                          >
                            <td className="p-2 text-[12px] text-center">
                              {month}
                            </td>
                            <td className="p-2 text-[12px] text-center">
                              {hours}
                            </td>
                            <td className="p-2 text-[12px] text-center">
                              {earnings}
                            </td>
                            <td className="p-2 text-[12px] text-center">
                              {deductions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
         

          {/* Leave Record Tab */}

          {activeTab === "Leave Records" && (
            <div className="space-y-6 ">
              {/* Summary Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#11244D] text-white rounded-xl p-4 flex items-center justify-between w-56 shadow-md">
                  <div>
                    <p className="text-xs">Total Applied Leave(Days)</p>
                    <h2 className="text-lg font-bold mt-1">03</h2>
                  </div>
                </div>
                <div className="bg-[#4F4CD1] text-white rounded-xl p-4 w-56 shadow-md">
                  <div>
                    <p className="text-xs">Total Approved</p>
                    <h2 className="text-lg font-bold mt-1">02</h2>
                  </div>
                </div>
                <div className="bg-[#707791] text-white rounded-xl p-4 w-56 shadow-md">
                  <div>
                    <p className="text-xs">Total Declined</p>
                    <h2 className="text-lg font-bold mt-1">01</h2>
                  </div>
                </div>
              </div>

              {/* Leave Table */}
              <div className="rounded-xl border border-[#D5D5D5] shadow overflow-hidden">
                <div className="overflow-x-auto max-h-[180px] overflow-y-auto custom-scrollbar">
                  <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="text-gray-600 border-b border-gray-200 ">
                      <tr className="text-center">
                        <th className="p-4 font-semibold">Employee ID</th>
                        <th className="p-4 font-semibold">Employee Name</th>
                        <th className="p-4 font-semibold">Designation</th>
                        <th className="p-4 font-semibold">Leave Type</th>
                        <th className="p-4 font-semibold">Date Range</th>
                        <th className="p-4 font-semibold">Reason For Leave</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {[
                        {
                          id: "#0983867",
                          name: "Robert james",
                          designation: "Supervisor",
                          type: "Sick Leave",
                          range: "11/02/2024 - 16/02/2024",
                          reason: "Sickness",
                          status: "Approved",
                        },
                        {
                          id: "#0983867",
                          name: "Stefan Salvatore",
                          designation: "Human Resource",
                          type: "Casual Leave",
                          range: "11/02/2024 - 16/02/2024",
                          reason: "Family Function",
                          status: "Approved",
                        },
                        {
                          id: "#0983867",
                          name: "Prasanna Popz",
                          designation: "Teacher",
                          type: "Privilege Leave",
                          range: "11/02/2024 - 16/02/2024",
                          reason: "Vacation",
                          status: "Declined",
                        },
                      ].map((item, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-2 text-[12px] text-center">
                            {item.id}
                          </td>
                          <td className="p-2 text-[12px] text-center">
                            {item.name}
                          </td>
                          <td className="p-2 text-[12px] text-center">
                            {item.designation}
                          </td>
                          <td className="p-2 text-[12px] text-center">
                            {item.type}
                          </td>
                          <td className="p-2 text-[12px] text-center">
                            {item.range}
                          </td>
                          <td className="p-2 text-[12px] text-center">
                            {item.reason}
                          </td>
                          <td className="p-2 text-[12px] text-center">
                            <div className="flex items-center gap-2">
                              {item.status === "Approved" ? (
                                <>
                                  <span className="text-green-600 p-2 text-[12px] text-center">
                                    ✅
                                  </span>
                                  <span className="p-2 text-[12px] text-center">
                                    Approved
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-red-600 p-2 text-[12px] text-center">
                                    ❌
                                  </span>
                                  <span className="p-2 text-[12px] text-center">
                                    Declined
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center text-lg text-gray-500 cursor-pointer">
                            ...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Working Hours Tab */}

          {activeTab === "Working Hours" && (
            <div className="shadow overflow-hidden">
              <div className="overflow-x-auto max-h-[280px] overflow-y-auto custom-scrollbar">
                <table className="w-full min-w-[600px] text-sm text-left border border-gray-200">
                  <thead className="text-gray-600 border-b border-gray-200">
                    <tr className="text-center">
                      <th className="p-4 font-semibold border-r border-gray-300">
                        <div className="flex items-center justify-center gap-2">
                          <BsCalendar4Event className="text-xl" />
                          <span>Day</span>
                        </div>
                      </th>
                      <th className="p-4 font-semibold border-r border-gray-300">
                        <div className="flex items-center justify-center gap-2">
                         <BsClockHistory className="text-xl" />
                          <span>Working Hours</span>
                        </div>
                      </th>
                      <th className="p-4 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <IoSunnyOutline className="text-xl" />
                          <span>GMT</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Friday", // duplicate as per image
                      "Sunday",
                    ].map((day, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-100 hover:bg-gray-50 text-center"
                      >
                        <td className="p-3 text-[12px] border-r border-gray-200">
                          {day}
                        </td>
                        <td className="p-3 text-[12px] border-r border-gray-200">
                          9 AM - 2 PM / 4 PM - 7 PM
                        </td>
                        <td className="p-3 text-[12px]">GMT +4</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

           </div>
        </div>
      </div>
    </BaseLayout4>
  );
};

export default Teacher;
