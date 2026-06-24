"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";
import { AppValidationMessages } from "@/app/_components/contents/validation_message";
import "react-toastify/dist/ReactToastify.css";

type InvoiceMonthData = {
    date: string;
    total: number;
    paid: number;
  };
const ApplicationChart = () => {
    const [monthlyInvoices, setMonthlyInvoices] = useState<InvoiceMonthData[]>(
        []
      );
    
        useEffect(() => {
        const token =
        typeof window !== "undefined" ? localStorage.getItem("AdminAuthToken") : null;
    
      if (!token) {
        console.error("❌ AdminAuthToken not found");
        return;
      }
        if (token) {
          fetchMonthlyInvoices(token); // call your function with token
          } else {
            toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          }
      }, []);
      
      const fetchMonthlyInvoices = async (token: string) => {
          try {
            const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.INVOICE.TOTAL_GET_LIST}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              });
            const json = await res.json();
            if (json.success) {
              setMonthlyInvoices(json.data);
            }
          } catch (error) {
            console.error("Failed to fetch monthly invoice data", error);
          }
        };
    
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full relative ">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#181A20] dark:text-white text-base font-semibold">Total Invoice</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#a6c1ff]" />
              <span className="text-xs text-[#181A20] dark:text-white">Total Invoices</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#d5e0ff]" />
              <span className="text-xs text-[#181A20] dark:text-white">Paid Invoices</span>
            </div>
            {/* Year Box - styled as per image, with dropdown */}
            <select
              className="bg-[#E5E5E5] border border-gray-300 text-gray-600 text-xs px-8 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none shadow-sm ml-2 dark:bg-[#2C2C2C] dark:border-[#444] dark:text-white"
              style={{ minWidth: 90, cursor: 'pointer' }}
              value={currentYear}
              onChange={() => {}}
              disabled
              title="Currently only the latest year is available."
            >
              <option>{currentYear}</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="text-black dark:text-white/80">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={monthlyInvoices}
              margin={{ top: 0, right: 10, left: 0, bottom: 5 }}
              barCategoryGap="25%" // Decrease this to make bars thicker
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => {
                  // Split "Jan-2025" into ["Jan", "2025"] and use only the month
                  const [month] = payload.value.split("-");
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="middle"
                        className="fill-[#181A20] dark:fill-white"
                        fontSize={10}
                      >
                        {month}
                      </text>
                    </g>
                  );
                }}
                padding={{ left: 4, right: 20 }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: "currentColor", className: "dark:fill-white" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ fontSize: "10px", borderRadius: "8px" }}
              />
              <Bar
                dataKey="total"
                stackId="a"
                fill="#a6c1ff"
                radius={[0,0,12,12]}
              />
              <Bar
                dataKey="paid"
                stackId="a"
                fill="#d5e0ff"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
  );
};

export default ApplicationChart;
