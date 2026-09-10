"use client";

import React, { useState } from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Table from "./component/featureTable/page";
import TenantTable from "./component/tenantTable/page";


const Page = () => {
  const [activeTab, setActiveTab] = useState<"feature" | "tenants">("feature");

  return (
    <BaseSuperLayout>
      <div className="flex flex-col gap-4">
        <SuperAdminHeader currentSection="Feature & Control" />

      <div className="rounded-xl bg-[#F4F6FC] dark:bg-[#1F1F1F]">

        <div className="flex items-center justify-between mt-2 px-3 py-2">
          <h2 className="text-[17px] font-medium text-[#24324B] dark:text-white">
            Institute Feature Control
          </h2>

          {activeTab === "feature" && (
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
              Add Feature
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 px-5 mt-1">
          <button
            onClick={() => setActiveTab("feature")}
            className={`relative text-[13px] font-medium pb-2 transition-colors ${
              activeTab === "feature"
                ? "text-[#5872C5]"
                : "text-[#24324B] dark:text-gray-300"
            }`}
          >
            Feature
            {activeTab === "feature" && (
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
        {activeTab === "feature" && <Table />}

        {activeTab === "tenants" && <TenantTable /> }

</div>

      </div>
    </BaseSuperLayout>
  );
};

export default Page;