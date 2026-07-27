import React from 'react'
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../../components/SuperAdminHeader";
import Usercards from '../components/users/usercards';

const page = () => {
  return (
    <BaseSuperLayout>
      <div className="flex flex-col gap-4">
        <SuperAdminHeader currentSection="Users & Roles" />
        <Usercards />
      </div>
    </BaseSuperLayout>
  )
}

export default page