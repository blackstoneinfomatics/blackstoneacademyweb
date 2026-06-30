"use client";

import { ChevronDown, UsersRound } from "lucide-react";

const modules = [
  {
    name: "Most Used Modules",
    percentage: 80,
  },
  {
    name: "Attendance",
    percentage: 80,
  },
  {
    name: "Live Classes",
    percentage: 80,
  },
  {
    name: "Communication",
    percentage: 80,
  },
  {
    name: "Finance",
    percentage: 80,
  },
];

export default function GrowthCard() {
  return (
    <div className="bg-white rounded-[18px] border border-[#ECECEC] p-5 ">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-semibold text-[#1E293B]">
          Growth
        </h2>

        <button className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-1 rounded-md text-[11px] text-[#7B8495]">
          Yearly
          <ChevronDown size={13} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">

        {modules.map((item) => (

          <div
            key={item.name}
            className="flex items-center justify-between"
          >

            {/* Left */}

         <div className="flex items-center gap-3 min-w-[180px]">

  <div className="w-9 h-9 rounded-full bg-[#F1EFFF] flex items-center justify-center flex-shrink-0">
    <UsersRound
      size={17}
      strokeWidth={2}
      className="text-[#5B5CF6]"
    />
  </div>

  <p className="text-[14px] font-medium text-[#1E293B]">
    {item.name}
  </p>

</div>

            {/* Progress */}

            <div className="flex items-center gap-3 flex-1 ml-5">

              <div className="flex-1 h-[5px] bg-[#E5E7EB] rounded-full overflow-hidden">

                <div
                  className="h-full rounded-full bg-[#5B4CF5]"
                  style={{
                    width: `${item.percentage}%`,
                  }}
                />

              </div>

              <span className="text-[12px] font-semibold text-[#374151] w-9 text-right">
                {item.percentage}%
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}