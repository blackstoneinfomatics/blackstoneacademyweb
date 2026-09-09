"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Table from "./components/roles/table";
import TenantTable from "./user_tenants/page";

const Page = () => {
  const [activeTab, setActiveTab] = useState<"portal" | "tenants">("portal");

  return (
    <BaseSuperLayout>
      <div className="flex flex-col gap-4">
        <SuperAdminHeader currentSection="Users & Roles" />

      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">

        <div className="flex items-center justify-between mt-2 px-3 py-2">
          <h2 className="text-[17px] font-medium text-[#24324B] dark:text-white">
            Institute Portal & Roles
          </h2>

          {activeTab === "portal" && (
            <button
              className="
                bg-[#5872C5]
                hover:bg-[#4D66B3]
                text-white
                text-[12px]
                font-medium
                px-4
                py-3
                rounded-lg
                transition
              "
            >
              Add Portal
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 px-5 mt-1">
          <button
            onClick={() => setActiveTab("portal")}
            className={`relative text-[13px] font-medium pb-2 transition-colors ${
              activeTab === "portal"
                ? "text-[#5872C5]"
                : "text-[#24324B] dark:text-gray-300"
            }`}
          >
            Portal
            {activeTab === "portal" && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("tenants")}
            className={`relative text-[13px] font-medium pb-2 transition-colors ${
              activeTab === "tenants"
                ? "text-[#5872C5]"
                : "text-[#24324B] dark:text-gray-300"
            }`}
          >
            Tenants
            {activeTab === "tenants" && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#5872C5] rounded-full" />
            )}
          </button>
        </div>


        {/* Tab Content */}
        {activeTab === "portal" && <Table />}

        {activeTab === "tenants" && <TenantTable />}

</div>

      </div>
    </BaseSuperLayout>
  );
};

export default Page;