"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import axios from "axios"
import { getSocket } from "@/app/utils/socket"
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints"
import { AppValidationMessages } from "@/app/_components/contents/validation_message"
import { toast } from "react-toastify"

interface TeacherDashboardStats {
  totalclasses: number
  totalstudents: number
  totalhours: number
  totalearnings: number
}

const Total = () => {
  const [stats, setStats] = useState<TeacherDashboardStats>({
    totalclasses: 0,
    totalstudents: 0,
    totalhours: 0,
    totalearnings: 0,
  })

  const safeNumber = (value: unknown): number => {
    if (typeof value === "string") {
      const cleaned = value.replace(/[$,]/g, "")
      const num = Number.parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  const formatNumber = (num: number, isCurrency = false): string => {
    if (isCurrency) {
      return num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
    return num.toLocaleString()
  }

  const fetchData = async () => {
    const teacherId = localStorage.getItem("TeacherPortalId")
    const token = localStorage.getItem("TeacherAuthToken")

    if (!teacherId) {
  toast.error(
    AppValidationMessages.AUTH.TEACHER_REQUIRED
  );
  return;
}

if (!token) {
  toast.error(
    AppValidationMessages.AUTH.TOKEN_REQUIRED
  );
  return;
}

    try {
      const response = await axios.get(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD. GET_TEACHER_COUNTS}`, {
        params: { teacherId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data

      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid response format")
      }

      setStats({
        totalclasses: safeNumber(data.totalclasses),
        totalstudents: safeNumber(data.totalstudents),
        totalhours: safeNumber(data.totalhours),
        totalearnings: safeNumber(data.totalearnings),
      })

    } catch (err: any) {
      console.error("API Error:", err)
      let errorMessage;
      if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection."
      } else {
        errorMessage = err.message || "Unknown error occurred"
      }
      console.log(errorMessage);
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const teacherId = typeof window !== "undefined" ? localStorage.getItem("TeacherPortalId") : null
    if (!teacherId) return

    const socket = getSocket(teacherId)
    const handleLiveStats = (data: TeacherDashboardStats) => {
      setStats({
        totalclasses: safeNumber(data.totalclasses),
        totalstudents: safeNumber(data.totalstudents),
        totalhours: safeNumber(data.totalhours),
        totalearnings: safeNumber(data.totalearnings),
      })
    }

    socket.on("teacherDashboardCardCount", handleLiveStats)
    return () => {
      socket.off("teacherDashboardCardCount", handleLiveStats)
    }
  }, [])

  const cards = [
    {
      title: "Total Classes",
      count: formatNumber(stats.totalclasses),
      icon: "/assets/images/tc1.svg",
      bg: "bg-[#e3efff] dark:bg-[#3e4e50]",
    },
    {
      title: "Total Students",
      count: formatNumber(stats.totalstudents),
      icon: "/assets/images/tc2.svg",
      bg: "bg-[#ede5ff] dark:bg-[#3f3e50]",
    },
    {
      title: "Total Hours",
      count: formatNumber(stats.totalhours),
      icon: "/assets/images/tc3.svg",
      bg: "bg-[#ffe9e9] dark:bg-[#503e3e]",
    },
    {
      title: "Total Earnings",
      count: formatNumber(stats.totalearnings, true),
      icon: "/assets/images/tc4.svg",
      bg: "bg-[#fff5d4] dark:bg-[#504d3e]",
    },
  ]

  return (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ">
  {cards.map((card) => (
    <div
      key={card.title}
      className="flex items-center justify-between bg-white dark:bg-[#343434] rounded-2xl shadow-sm px-5 py-6 w-full min-h-[120px]"
    >
      {/* Text Section */}
      <div className="flex flex-col text-left">
        <p className="text-black -mt-1 dark:text-white font-medium text-[clamp(14px,1.1vw,14px)] leading-snug">
          {card.title}
        </p>
        <p className="text-black  dark:text-white font-semibold text-[clamp(20px,2vw,28px)] leading-tight mt-6">
          {card.count}
        </p>
      </div>

      {/* Icon Section */}
      <div
        className={`${card.bg} rounded-full flex items-center justify-center flex-shrink-0`}
        style={{
          width: "clamp(44px, 4vw, 56px)",
          height: "clamp(44px, 4vw, 56px)",
        }}
      >
        <Image
          src={card.icon}
          alt={card.title}
          width={36}
          height={36}
          className="object-contain"
        />
      </div>
    </div>
  ))}
</div>

  )
}

export default Total
