"use client";
import React, { useEffect, useState } from 'react';

// Local icons
const ICONS: Record<string, string> = {
  logins: '/assets/images/superadmin-analytics-quickinsights-best-revenue-month.svg',
  sessions: '/assets/images/superadmin-analytics-quickinsights-top-payning-tenant.svg',
  page_views: '/assets/images/superadmin-analytics-quickinsights-collection-rate.svg',
  messages: '/assets/images/superadmin-analytics-quickinsights-overdue-amount.svg',
};

type InsightItem = {
  key: string;
  title: string;
  value: string;
  period: string;
  image?: string;
};

const FALLBACK_DATA: InsightItem[] = [
  { key: 'logins', title: 'Logins', value: '2,00,000', period: 'May 2026' },
  { key: 'sessions', title: 'Sessions', value: '2,00,000', period: 'May 2026' },
  { key: 'page_views', title: 'Page Views', value: '90%', period: 'May 2026' },
  { key: 'messages', title: 'Messages Sent', value: '50,000', period: 'May 2026' },
];

const QuickInsights = () => {
  const [data, setData] = useState<InsightItem[]>(FALLBACK_DATA);

  useEffect(() => {
    fetch('/api/quick-insights')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.data)) setData(json.data);
      })
      .catch(() => { });
  }, []);

  return (
    <div className="w-full h-[350px] rounded-2xl bg-white p-4 shadow-sm sm:p-5 dark:bg-[#343434] dark:shadow-none dark:border dark:border-[#454545]">
      <h2 className="mb-4 text-sm font-semibold text-[#101B41] sm:mb-5 sm:text-base dark:text-white">
        Quick Insights
      </h2>

      <div className="space-y-5 sm:space-y-7">
        {data.map((item, index) => {
          const imgSrc = item.image || ICONS[item.key];

          return (
            <div
              key={item.key ?? index}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#454545]">
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="h-9 w-9 object-contain"
                    />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-xs font-medium text-[#101B41] sm:text-sm dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {item.period}
                  </p>
                </div>
              </div>

              <span className="flex-shrink-0 text-sm font-medium text-[#101B41] sm:text-sm dark:text-white">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickInsights;