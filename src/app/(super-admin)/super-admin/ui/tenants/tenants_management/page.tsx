"use client";

import BaseLayout3 from "@/app/(tenant)/modules/users/supervisor/components/BaseLayout3";
import SupervisorHeader from "@/app/(tenant)/modules/users/supervisor/components/supervisorHeader";
import { Users } from "lucide-react";
import React, { useState } from "react";
import TenantAnalytics from "../../../components/TenantAnalytics";
import TenantUserTable from "../../../components/TenantUsers";

const tenantDetails = {
  tenantId: "TEN22001",
  name: "Blackstone Academy",
  domain: "blackstoneacademy.com",
  createdDate: "02 July, 2020",

  stats: {
    users: 240,
    students: 34000,
    teachers: 120,
    classes: 240,
  },

  companyInfo: {
    name: "Blackstone Academy",
    academyName: "Blackstone Academy",
    email: "blackstone@gmail.com",
    phone: "1234567890",
    address: "70-71, Inbaite @ BuildScape, Mill Road, Coimbatore, Tamil Nadu",
  },

  subscription: {
    plan: "Premium",
    status: "Active",
    currentPeriod: "15 Feb 2025 - 15 Aug 2025",
    nextBilling: "15 Aug 2025",
    autoRenewal: "Enabled",
  },

  modules: [
    { name: "Admin", status: "Enabled" },
    { name: "Teacher", status: "Enabled" },
    { name: "Students", status: "Enabled" },
    { name: "Supervisor", status: "Disabled" },
  ],

  features: [
    { name: "Live Class", status: "Enabled" },
    { name: "Assignments", status: "Enabled" },
    { name: "Jitsi", status: "Enabled" },
    { name: "Payment Gateway", status: "Enabled" },
  ],
};

const tabs = [
  "Overview",
  "Users",
  "Subscriptions",
  "Features",
  "Active Logs",
  "Tickets",
  "Analytics",
];

const Page = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <BaseLayout3>
      <SupervisorHeader currentSection="Tenant Management" />
      <div className="p-6 ">
        {/* Tabs */}
        <div className="flex flex-wrap gap-6 border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium ${
                activeTab === tab
                  ? "text-[#576CBC] border-b-2 border-[#576CBC]"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="space-y-5 bg-white rounded-2xl">
            <div className="bg-white rounded-xl px-6 py-5">
              <div className="flex items-start gap-8">
                {/* Logo */}
                <div className="w-[95px] h-[95px] rounded-full overflow-hidden">
                  <img
                    src="/assets/images/BE-LOGO.jpg"
                    alt="logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right Side */}
                <div className="flex flex-col">
                  <h1 className="text-[34px] font-semibold leading-none text-[#111827]">
                    {tenantDetails.name}
                  </h1>

                  <p className="text-[16px] text-[#6B7280] mt-4">
                    {tenantDetails.domain}
                  </p>

                  <p className="text-[14px] text-[#9CA3AF] mt-2">
                    Created on : {tenantDetails.createdDate}
                    <span className="text-[#576CBC] ml-2 font-medium">
                      ID: {tenantDetails.tenantId}
                    </span>
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-14 mt-6">
                    {/* Users */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] flex items-center justify-center">
                        <Users size={18} className="text-[#576CBC]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] pt-1">Users</p>
                        <p className="text-[16px] font-semibold">
                          {tenantDetails.stats.users}
                        </p>
                      </div>
                    </div>

                    {/* Students */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] flex items-center justify-center">
                        <Users size={18} className="text-[#576CBC]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] pt-1">Students</p>
                        <p className="text-[16px] font-semibold">
                          {tenantDetails.stats.students}
                        </p>
                      </div>
                    </div>

                    {/* Teachers */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] flex items-center justify-center">
                        <Users size={18} className="text-[#576CBC]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] pt-1">Teachers</p>
                        <p className="text-[16px] font-semibold">
                          {tenantDetails.stats.teachers}
                        </p>
                      </div>
                    </div>

                    {/* Classes */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C7CEFC24] flex items-center justify-center">
                        <Users size={18} className="text-[#576CBC]" />
                      </div>

                      <div>
                        <p className="text-[12px] text-[#7A7A7A] pt-1">Classes</p>
                        <p className="text-[16px] font-semibold">
                          {tenantDetails.stats.classes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5 p-5 pt-5">
              {/* Company Information */}
              <div className="bg-[#C7CEFC24] rounded-xl p-5">
                <h3 className="text-[15px] font-semibold text-[#0B1533] mb-5">
                  Company Information
                </h3>


                <div className="space-y-4 text-[13px]">
                  {Object.entries(tenantDetails.companyInfo).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-[120px_1fr] gap-4"
                      >
                        <span className="text-[#7A7A7A] capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>

                        <span className="text-[#1F2A44] font-medium break-words">
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Subscription */}
              <div className="bg-[#C7CEFC24] rounded-xl p-5">
                <h3 className="text-[15px] font-semibold text-[#0B1533] mb-5">
                  Subscription
                </h3>

                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A]">Plan</span>

                    <span>
                      <span className="inline-flex items-center justify-center min-w-[75px] h-6 rounded-md text-[11px] font-medium bg-[#EAE5FF] text-[#7C5CFA]">
                        {tenantDetails.subscription.plan}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A]">Status</span>

                    <span>
                      <span className="inline-flex items-center justify-center min-w-[75px] h-6 rounded-md text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                        {tenantDetails.subscription.status}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A]">Current Period</span>

                    <span className="font-medium text-[#1F2A44]">
                      {tenantDetails.subscription.currentPeriod}
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A]">Next Billing</span>

                    <span className="font-medium text-[#1F2A44]">
                      {tenantDetails.subscription.nextBilling}
                    </span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-[#7A7A7A]">Auto Renewal</span>

                    <span className="font-medium text-[#1F2A44]">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Module Access */}
              <div className="bg-[#C7CEFC24] rounded-xl p-5">
                <h3 className="text-[15px] font-semibold text-[#0B1533] mb-5">
                  Modules Access
                </h3>

                <div className="space-y-3">
                  {tenantDetails.modules.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_90px] items-center"
                    >
                      <span className="text-[13px] text-[#7A7A7A]">
                        {item.name}
                      </span>

                      <span
                        className={`inline-flex items-center justify-center h-6 rounded-md text-[11px] font-medium ${
                          item.status === "Enabled"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#FEE2E2] text-[#EF4444]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Access */}
              <div className="bg-[#C7CEFC24] rounded-xl p-5">
                <h3 className="text-[15px] font-semibold text-[#0B1533] mb-5">
                  Features Access
                </h3>

                <div className="space-y-3">
                  {tenantDetails.features.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_90px] items-center"
                    >
                      <span className="text-[13px] text-[#7A7A7A]">
                        {item.name}
                      </span>

                      <span className="inline-flex items-center justify-center h-6 rounded-md text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
          <div className=" rounded-xl border">
            <TenantAnalytics />
            <TenantUserTable />
          </div>
        )}

        {activeTab === "Subscriptions" && (
          <div className="bg-white p-6 rounded-xl border">
            Subscription Content
          </div>
        )}

        {activeTab === "Features" && (
          <div className="bg-white p-6 rounded-xl border">Features Content</div>
        )}

        {activeTab === "Active Logs" && (
          <div className="bg-white p-6 rounded-xl border">
            Active Logs Content
          </div>
        )}

        {activeTab === "Tickets" && (
          <div className="bg-white p-6 rounded-xl border">Tickets Content</div>
        )}

        {activeTab === "Analytics" && (
          <div className="bg-white p-6 rounded-xl border">
            Analytics Content
          </div>
        )}
      </div>
    </BaseLayout3>
  );
};

export default Page;
