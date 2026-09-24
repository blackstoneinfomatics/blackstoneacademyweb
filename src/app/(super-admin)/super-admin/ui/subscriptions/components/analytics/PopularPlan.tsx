import React, { useState, useEffect } from "react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

// Types based on your actual API response
interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    totalPlans: number;
    activePlans: number;
    inactivePlans: number;
    totalTenants: number;
    monthlyRevenue: number;
    planSummary: {
      active: {
        count: number;
        percentage: number;
      };
      trial: {
        count: number;
        percentage: number;
      };
      expired: {
        count: number;
        percentage: number;
      };
    };
    topPerformingPlan: {
      planId: string;
      planName: string;
      subscribedTenants: number;
      revenue: number;
      percentage: number;
    };
  };
}


const PopularPlan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planData, setPlanData] = useState({
    planName: '',
    revenue: 0,
    percentage: 0,
    subscribedTenants: 0
  });

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PLAN.PLAN_CARD_COUNT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: DashboardResponse = await response.json();
      
      if (result.success && result.data) {
        const topPlan = result.data.topPerformingPlan;
        
        setPlanData({
          planName: topPlan.planName || 'Standard',
          revenue: topPlan.revenue || 0,
          percentage: topPlan.percentage || 0,
          subscribedTenants: topPlan.subscribedTenants || 0
        });
      } else {
        setError(result.message || "Failed to fetch plan data");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchPlanData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-6 h-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Loading popular plan...</div>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-6 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-500 font-medium">Error loading plan</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress for circle - cap at 100% for display
  const progress = Math.min(planData.percentage, 100);
  const radius = 70;
  const stroke = 16;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format revenue in Indian Rupees
  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(planData.revenue);

  // Capitalize plan name for display
  const displayPlanName = planData.planName.charAt(0).toUpperCase() + planData.planName.slice(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-6 h-full flex flex-col">
      {/* Header */}
      <h2 className="text-[18px] font-semibold text-gray-900 dark:text-white mb-2">
        Popular Plan
      </h2>

      {/* Circle Progress */}
      <div className="flex justify-center items-center">
        <div className="relative w-[160px] h-[160px]">
          <svg height="160" width="160" className="rotate-[-140deg]">
            {/* Background */}
            <circle
              stroke="#E5E7EB"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="80"
              cy="80"
              className="dark:stroke-gray-600"
            />

            {/* Progress - Using REAL percentage from API */}
            <circle
              stroke="#3DBB59"
              fill="transparent"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              r={normalizedRadius}
              cx="80"
              cy="80"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h3 className="text-[18px] font-semibold text-black dark:text-white">
              {formattedRevenue}
            </h3>
            <p className="text-[15px] font-medium text-gray-900 dark:text-gray-300">
              {planData.percentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Badge - Shows the plan name from API */}
      <div className="flex justify-center">
        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 mb-3 mt-2 rounded-md text-[12px] font-medium">
          {displayPlanName}
        </span>
      </div>

      {/* Footer - Shows real data from API */}
      <div className="text-center space-y-1">
        <p className="text-center text-base font-medium text-gray-800 dark:text-gray-200">
          Most popular plan this month
        </p>

      </div>
    </div>
  );
};

export default PopularPlan;