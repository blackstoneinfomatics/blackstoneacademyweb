import React, { useState, useEffect } from "react";
import { Star, Gem, Crown } from "lucide-react";
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
      planName: string;
      subscribedTenants: number;
      revenue: number;
    };
  };
}

// Map icon names to components
const iconMap = {
  Star: Star,
  Gem: Gem,
  Crown: Crown,
};

// Color mapping based on plan type
const colorMap = {
  Basic: {
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    bar: "bg-cyan-500 dark:bg-cyan-400",
  },
  Standard: {
    color: "text-green-500 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    bar: "bg-green-500 dark:bg-green-400",
  },
  Premium: {
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    bar: "bg-indigo-500 dark:bg-indigo-400",
  },
};


const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");

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
        const totalTenants = result.data.totalTenants || 0;
        const activeCount = result.data.planSummary?.active?.count || 0;
        const trialCount = result.data.planSummary?.trial?.count || 0;
        const expiredCount = result.data.planSummary?.expired?.count || 0;
        
        const basicCount = activeCount;
        const standardCount = trialCount;
        const premiumCount = expiredCount;
        
        const formattedPlans = [
          {
            name: "Basic",
            icon: "Star",
            currentUsers: basicCount,
            totalUsers: totalTenants,
            percentage: totalTenants > 0 ? Math.round((basicCount / totalTenants) * 100) : 0,
            progress: totalTenants > 0 ? `${Math.round((basicCount / totalTenants) * 100)}%` : "0%",
            color: "text-cyan-500 dark:text-cyan-400",
            bg: "bg-cyan-100 dark:bg-cyan-900/30",
            bar: "bg-cyan-500 dark:bg-cyan-400",
          },
          {
            name: "Standard",
            icon: "Gem",
            currentUsers: standardCount,
            totalUsers: totalTenants,
            percentage: totalTenants > 0 ? Math.round((standardCount / totalTenants) * 100) : 0,
            progress: totalTenants > 0 ? `${Math.round((standardCount / totalTenants) * 100)}%` : "0%",
            color: "text-green-500 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30",
            bar: "bg-green-500 dark:bg-green-400",
          },
          {
            name: "Premium",
            icon: "Crown",
            currentUsers: premiumCount,
            totalUsers: totalTenants,
            percentage: totalTenants > 0 ? Math.round((premiumCount / totalTenants) * 100) : 0,
            progress: totalTenants > 0 ? `${Math.round((premiumCount / totalTenants) * 100)}%` : "0%",
            color: "text-indigo-500 dark:text-indigo-400",
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
            bar: "bg-indigo-500 dark:bg-indigo-400",
          },
        ];
        
        setPlans(formattedPlans);
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-5 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">Loading plans...</div>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-5 h-full">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-500 font-medium">Error loading plans</p>
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

  // Empty state
  if (!plans.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-5 h-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">No plans available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/30 p-5 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-semibold text-gray-900 dark:text-white">
          Plans
        </h2>

        <select 
          className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-md outline-none text-xs border-0 dark:border-gray-600"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="Yearly">Yearly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
        </select>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const Icon = iconMap[plan.icon as keyof typeof iconMap] || Star;

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              {/* Left */}
              <div className="flex items-center gap-4 min-w-[140px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${plan.bg}`}
                >
                  <Icon className={`w-4 h-4 ${plan.color}`} />
                </div>

                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                  {plan.name}
                </h3>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3 flex-1 max-w-[220px]">
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-[6px]">
                  <div
                    className={`${plan.bar} h-[6px] rounded-full transition-all duration-500`}
                    style={{ width: plan.progress }}
                  />
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {plan.currentUsers?.toLocaleString() || 0}
                  </span>
                  <span className="text-[10px] text-gray-800 dark:text-gray-400">
                    {plan.progress}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;