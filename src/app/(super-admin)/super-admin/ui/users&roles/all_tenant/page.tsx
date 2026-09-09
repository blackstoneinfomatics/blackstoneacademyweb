import React from "react";
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../../components/SuperAdminHeader";
import Usercards from "../components/users/usercards";

const Page = () => {
  return (
    <BaseSuperLayout>
      <div className="flex flex-col gap-4">
        <SuperAdminHeader
          currentSection=" Portal & Roles"
          showBackPath="/super-admin/ui/users&roles"
        />
        <Usercards />
      </div>
    </BaseSuperLayout>
  );
};

export default Page;
