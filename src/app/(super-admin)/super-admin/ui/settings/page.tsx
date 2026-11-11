"use client";

import React, { useState } from 'react';
import SuperAdminHeader from '../../components/SuperAdminHeader';
import OrganizationHeader, {OrganizationTab} from '../../components/OrganizationHeader';
import SettingsTabs from './components/SettingsTabs';

const Page = () => {
    const [tab, setTab] = useState<OrganizationTab>("All");
  return (
    <>
    <SuperAdminHeader currentSection="Settings" />
        <OrganizationHeader

          showTabs
          activeTab={tab}
          onTabChange={setTab} currentSection={""} />
    <main className="min-h-screen rounded-xl bg-[#F7F8FE] shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] p-5 dark:bg-[#252525]">
      <SettingsTabs />
    </main>
    </>
  )
}

export default Page