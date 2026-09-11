import React from 'react'
import { IndianRupee } from "lucide-react";


const TotalRevenueCard = () => {
  return (
<div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF4DF]">
          <IndianRupee className="text-[#F6A623]" size={22} />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#5038E8]">
            Total Revenue
          </p>

          <h2 className="text-lg font-bold text-[#252525]">
            7.65L
          </h2>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2 text-xs">
        <span className="font-semibold text-red-500">
          ↓ 14%
        </span>

        <span className="text-gray-500">
          vs last Month
        </span>
      </div>
    </div>
  )
}

export default TotalRevenueCard
