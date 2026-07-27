import React from 'react'
import BaseSuperLayout from "@/app/(super-admin)/super-admin/components/BaseSuperLayout";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import Cards from './components/roles/cards';
import Table from './components/roles/table';

const page = () => {
  return (
    <BaseSuperLayout>
    
      <div className="flex flex-col gap-4">
        <SuperAdminHeader currentSection="Users & Roles" />
        <Cards />
        <Table />
      </div>
    </BaseSuperLayout>

  )
}

export default page