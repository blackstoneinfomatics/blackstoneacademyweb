import BaseLayout from '@/app/(tenant)/modules/users/teacher/components/BaseLayout'
import React from 'react'
import DashboardClasses from '../../components/schedule'
import SalaryCard from '../../components/classTable'
import AdminHeader from '../../components/AdminHeader'
import BaseLayout4 from '../../components/BaseLayout4'


const Classes = () => {
  return (
    <BaseLayout4>
    <AdminHeader currentSection={'Classes'}>
      
    </AdminHeader>
        <div className=' mx-auto W-full'>
            <DashboardClasses />
            <SalaryCard />
        </div>
    </BaseLayout4>
  )
}

export default Classes