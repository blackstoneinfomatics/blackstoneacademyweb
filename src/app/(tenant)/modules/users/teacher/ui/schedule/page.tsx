import BaseLayout from '@/app/(tenant)/modules/users/teacher/components/BaseLayout'
import React from 'react'
import NextClass from '../../components/NextClass'
import ScheduledClasses from '../../components/ScheduledClasses'
import TeacherHeader from '../../components/TeacherHeader'

const Schedules = () => {
  return (
    <BaseLayout>
       <TeacherHeader currentSection="Scheduled Classes" />
        <div className=' mx-auto W-full'>
            <NextClass />
            <ScheduledClasses />
        </div>
    </BaseLayout>
  )
}

export default Schedules