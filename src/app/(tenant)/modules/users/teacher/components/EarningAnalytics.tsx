'use client';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';
import React, { useState, useEffect } from 'react';

type TimePeriod = 'monthly' | 'weekly' | 'daily';
type ClassType = 'Regular Class' | 'Trial Class' | 'Group Class';

interface PeriodData {
  label: string;
  amount: string;
  change: string;
  isPositive: boolean;
}

interface ApiResponse {
  currentPeriod: {
    totalEarnings: number | null;
    regularClass: number | null;
    groupClass: number | null;
    trialClass: number | null;
  };
  lastPeriod: {
    totalEarnings: number | null;
    regularClass: number | null;
    groupClass: number | null;
    trialClass: number | null;
  };
}

const EarningAnalytics = () => {
  const [activeTab, setActiveTab] = useState<ClassType>('Regular Class');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  
  const tabs: ClassType[] = ['Regular Class', 'Trial Class', 'Group Class'];

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const authToken = localStorage.getItem('TeacherAuthToken')
        const teacherId = localStorage.getItem('TeacherPortalId')

        console.log('[DEBUG] Fetching data for:', { teacherId, timePeriod });

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.CLASSSHEDULE.TEACHER_EARNINGS}?teacherId=${teacherId}&dateRange=${timePeriod}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('[DEBUG] Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        console.log('[DEBUG] API Response:', data);

        // Process null values - convert to 0
        const processedData: ApiResponse = {
          currentPeriod: {
            totalEarnings: data.currentPeriod?.totalEarnings ?? 0,
            regularClass: data.currentPeriod?.regularClass ?? 0,
            groupClass: data.currentPeriod?.groupClass ?? 0,
            trialClass: data.currentPeriod?.trialClass ?? 0
          },
          lastPeriod: {
            totalEarnings: data.lastPeriod?.totalEarnings ?? 0,
            regularClass: data.lastPeriod?.regularClass ?? 0,
            groupClass: data.lastPeriod?.groupClass ?? 0,
            trialClass: data.lastPeriod?.trialClass ?? 0
          }
        };

        setApiData(processedData);
      } catch (err) {
        console.error('[DEBUG] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [timePeriod]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? '0%' : '+∞%';
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getCurrentTabEarnings = (data: ApiResponse | null, tab: ClassType) => {
    const result = {
      current: 0,
      previous: 0
    };

    if (!data) return result;

    switch (tab) {
      case 'Regular Class':
        result.current = data.currentPeriod.regularClass ?? 0;
        result.previous = data.lastPeriod.regularClass ?? 0;
        break;
      case 'Trial Class':
        result.current = data.currentPeriod.trialClass ?? 0;
        result.previous = data.lastPeriod.trialClass ?? 0;
        break;
      case 'Group Class':
        result.current = data.currentPeriod.groupClass ?? 0;
        result.previous = data.lastPeriod.groupClass ?? 0;
        break;
    }

    console.log(`[DEBUG] ${tab} Earnings:`, result);
    return result;
  };

  const getTimePeriodData = (): PeriodData[] => {
    const currentTabData = getCurrentTabEarnings(apiData, activeTab);

    const periodLabels = {
      monthly: { current: 'This Month', previous: 'Last Month' },
      weekly: { current: 'This Week', previous: 'Last Week' },
      daily: { current: 'Today', previous: 'Yesterday' }
    };

    const result: PeriodData[] = [{
      label: periodLabels[timePeriod].current,
      amount: formatCurrency(currentTabData.current),
      change: calculateChange(currentTabData.current, currentTabData.previous),
      isPositive: currentTabData.current >= currentTabData.previous
    }];

    if (timePeriod !== 'daily') {
      result.push({
        label: periodLabels[timePeriod].previous,
        amount: formatCurrency(currentTabData.previous),
        change: calculateChange(currentTabData.previous, currentTabData.current),
        isPositive: currentTabData.previous >= currentTabData.current
      });
    }

    return result;
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white dark:bg-[#343434] rounded-2xl shadow-md p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading earnings data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white dark:bg-[#343434] rounded-2xl shadow-md p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[230px] bg-white dark:bg-[#343434] rounded-2xl shadow-md p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-[#010E30] dark:text-white">
          Earning Analytics
        </h2>
        <select 
          className="bg-[#EFEFEF] dark:bg-[#565656] text-[#3E5E8A] dark:text-white py-[2px] px-2 rounded-md text-[11px] font-medium"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>

      <h3 className="text-2xl font-semibold text-[#010E30] dark:text-white mb-4 -mt-2">
        {apiData ? formatCurrency(apiData.currentPeriod.totalEarnings ?? 0) : '$0.00'}
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === tab
                ? 'bg-[#576CBC] text-white'
                : 'bg-[#EFEFEF] dark:bg-[#444] text-[#7A7A7A] dark:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {getTimePeriodData().map((item, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-[#F9F9F9] dark:bg-[#3A3A3A] rounded-lg">
            <div className="text-xs font-medium text-[#010E30] dark:text-white">
              {item.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#010E30] dark:text-white">
                {item.amount}
              </span>
              <span className={`${
                item.isPositive 
                  ? 'text-green-600 bg-green-100 dark:bg-[#377E3633]/20' 
                  : 'text-red-600 bg-red-100 dark:bg-red-900/20'
              } text-[11px] font-semibold px-2 py-[2px] rounded-md`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningAnalytics;