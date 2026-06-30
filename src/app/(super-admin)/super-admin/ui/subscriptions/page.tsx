import React from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Tabs from "./components/Tabs";

const page = () => {
  return (
    <BaseSuperLayout>
      <SuperAdminHeader currentSection="Subscriptions" />
      <div className="pt-4">
        <Tabs />
      </div>
    </BaseSuperLayout>
  );
};

export default page;
