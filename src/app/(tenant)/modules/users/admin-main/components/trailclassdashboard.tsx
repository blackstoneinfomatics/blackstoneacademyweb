'use client'
import { useState, useEffect } from "react"
import { Check, Clock, X } from "lucide-react"
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints"
import { toast } from "react-toastify"
import { AppValidationMessages } from "@/app/_components/contents/validation_message"
import "react-toastify/dist/ReactToastify.css"

interface TrialRequestData {
  totalTrialRequest: number
  pendingRequest: number
  pendingRequestPercentage: number
  joinedStudents: number
  joinedStudentsPercentage: number
  notJoinedStudents: number
  notJoinedrequestPercentage: number
}

export default function TrialRequests() {
  const [data, setData] = useState<TrialRequestData | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('AdminAuthToken');
      if (token) {
        fetchData(token);
      } else {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
      }
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.DASHBOARD.DASHBOARD_ADMIN_TOTAL_TRIAL_REQUESTS}`,{
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json()
      console.log("trial request api result:", result) // helpful for debugging
      setData(result)
    } catch (error) {
      console.error("Failed to fetch trial request data:", error)
    }
  }

  const requests = data
    ? [
        {
          status: "Trials Request",
          icon: Clock,
          percentage: data.pendingRequestPercentage ?? 0,
          total: data.pendingRequest ?? 0,
          color: "bg-[#9EABD3]",
        },
        {
          status: "Joined",
          icon: Check,
          percentage: data.joinedStudentsPercentage ?? 0,
          total: data.joinedStudents ?? 0,
          color: "bg-[#9EABD3]",
        },
        {
          status: "Not joined",
          icon: X,
          percentage: data.notJoinedrequestPercentage ?? 0,
          total: data.notJoinedStudents ?? 0,
          color: "bg-[#9EABD3]",
        },
      ]
    : []

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 h-[227px] dark:bg-[#343434]">
      <div className="mb-3">
        <h2 className="text-[15px] ml-1.5 font-semibold text-gray-800 dark:text-[#fff]"> Trial Class Status</h2>
      </div>

      <div className="space-y-6 mx-2 ">
        {requests.map((request) => (
          <div key={request.status} className="flex items-center space-x-4 h-42">
            <div className="flex-grow">
              <div className="flex justify-between mb-1 items-baseline">
                <span className="text-xs font-medium flex items-center gap-2">
                  {/* optional icon */}
                  <request.icon className="h-4 w-4 text-gray-600 dark:text-[#fff]" />
                  {request.status}
                </span>

                {/* Show count and percentage. If API includes totalTrialRequest, show "count / total" */}
                <span className="text-xs text-gray-500 dark:text-[#7889BB] px-2">
                  {typeof request.total === "number" ? request.total : 0}
                  {data?.totalTrialRequest ? `` : ""}
                  
                </span>
              </div>

              <div className="h-2 w-full bg-[#E4EAF0] rounded-full overflow-hidden">
                <div
                  className={`h-full ${request.color} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.max(0, Math.min(100, request.percentage))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
