import React from "react";

const Activities = () => {
  const stats = [
    { label: "Active", color: "#22C55E", value: "600 (80%)", count: 600 },
    { label: "Trial", color: "#FACC15", value: "200 (12%)", count: 200 },
    { label: "Expired", color: "#EF4444", value: "100 (8%)", count: 100 },
  ];

  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl p-5 border border-[#ECECEC] h-full min-h-full">
      <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-6 h-full">
        
        {/* Donut Chart */}
        <div
          className="relative w-[160px] h-[160px] sm:w-[171px] sm:h-[171px] rounded-full flex-shrink-0 mt-1"
          style={{
            background: `conic-gradient(
              #22C55E 0deg 288deg,
              #FACC15 288deg 331deg,
              #EF4444 331deg 360deg
            )`,
          }}
        >
          <div className="absolute inset-[28px] bg-white rounded-full flex flex-col items-center justify-center">
            <h2 className="text-[30px] font-bold text-[#111827] leading-none">
              {total}
            </h2>
            <p className="text-[13px] mt-0.5">Activities</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 w-full space-y-7 items-center mt-7 px-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center justify-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[14px] text-[#111827]">
                  {item.label}
                </span>
              </div>

              <span className="text-[14px] font-medium text-[#111827]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;