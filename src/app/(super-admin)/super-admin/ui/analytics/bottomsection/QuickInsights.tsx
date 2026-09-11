import React from 'react'
import {
  LogIn,
  Monitor,
  Eye,
  MessageSquare,
  Upload,
} from "lucide-react";

const QuickInsights = () => {

    const data = [
    {
      title: "Logins",
      value: "2,00,000",
      icon: LogIn,
    },
    {
      title: "Sessions",
      value: "2,00,000",
      icon: Monitor,
    },
    {
      title: "Page Views",
      value: "90%",
      icon: Eye,
    },
    {
      title: "Messages Sent",
      value: "50,000",
      icon: MessageSquare,
    },
    {
      title: "Files Uploaded",
      value: "50,000",
      icon: Upload,
    },
  ];

  return (
<div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-[#101B41]">
        Quick Insights
      </h2>

      <div className="space-y-5">
        {data.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-3">
                  <Icon size={18} />
                </div>

                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    May 2026
                  </p>
                </div>
              </div>

              <span className="font-semibold">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default QuickInsights
