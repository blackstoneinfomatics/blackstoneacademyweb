"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { getSocket } from "@/app/utils/socket";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";


interface ApiResponse {
  trialAssigned: number;
  evaluationCompleted: number;
  evaluationPending: number;
  totalPending: number;
}

const TotalList = () => {
  const [data, setData] = useState<ApiResponse>({
    trialAssigned: 0,
    evaluationCompleted: 0,
    evaluationPending: 0,
    totalPending: 0,
  });
  useEffect(()=>{
     const id  = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachPortalId") : null;
     if(!id) return
     const socket = getSocket(id);
     const handleCount = (data:ApiResponse)=>{
      setData(data);
     };
      socket.on('academicDashboardCard',handleCount);
      return ()=>{
        socket.off('academicDashboardCard',handleCount);
      }
  },[]);
  
  useEffect(() => {
    const fetchData = async () => {
         const token  = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachAuthToken") : null;
         const id  = typeof window !== "undefined" ? localStorage.getItem("AcademicCoachPortalId") : null;

      if (!id) {
        console.warn("⚠️ Missing academicCoachId in URL query params.");
        return;
      }

      try {
        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.GET_WIDGETS}?academicCoachId=${id}`,{
            headers:{
              "Authorization" : `Bearer ${token}`
            },
           
          }
        );
        const apiData: ApiResponse = response.data;
        console.log("API Response:", apiData);
        setData(apiData); // or response.data.data if nested
      } catch (error) {
        console.error("Failed to fetch widget data:", error);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: "Trial Assigned",
      count: data.trialAssigned,
      icon: (
        <div className="bg-[#e3f4ff] dark:bg-[#3e4e50] rounded-full">
          <Image
            src="/assets/images/acgr.svg"
            alt="Trial Assigned"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      ),
      bg: "bg-[#e3f4ff] dark:bg-[#3e4e50]",
    },
    {
      title: "Evaluation Completed",
      count: data.evaluationCompleted,
      icon: (
        <div className="bg-[#e1ffde] dark:bg-[#3f503e] rounded-full relative">
          <Image
            src="/assets/images/accom.svg"
            alt="Evaluation Completed"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      ),
      bg: "bg-[#e1ffde] dark:bg-[#3f503e]",
    },
    {
      title: "Evaluation Pending",
      count: data.evaluationPending,
      icon: (
        <div className="bg-[#ffdfde] dark:bg-[#503e3e] rounded-full">
          <Image
            src="/assets/images/acpend.svg"
            alt="Evaluation Pending"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      ),
      bg: "bg-[#ffdfde] dark:bg-[#503e3e]",
    },
    {
      title: "Total Pending",
      count: data.totalPending,
      icon: (
        <div className="bg-[#fff1de] dark:bg-[#504d3e] rounded-full relative">
          <Image
            src="/assets/images/acepend.svg"
            alt="Total Pending"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      ),
      bg: "bg-[#fff1de] dark:bg-[#504d3e]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-5 rounded-2xl shadow-sm bg-white dark:bg-[#343434] dark:text-[#fff]"
        >
          <div>
            <p className="text-[14px] font-medium text-black dark:text-white">
              {card.title.split(" ").map((word, index, array) => (
                <React.Fragment key={index}>
                  {word}
                  {index < array.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
            <p className="text-[28px] font-semibold text-black dark:text-white">{card.count}</p>
          </div>
          <div className={`${card.bg} p-3 rounded-full flex items-center justify-center`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TotalList;



