import React from "react";
import { Users, DollarSign, UserPlus, Clock3 } from "lucide-react";

const RecentActivities = () => {
  return (
    <div className="bg-white dark:bg-[#343434] rounded-xl p-5 shadow-sm h-full">
      <div className="flex justify-between">
        <h2 className="font-semibold mb-4 text-[18px]">Recent Activities</h2>
        <p className="text-[10px] text-[#576CBC]">View All</p>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className=" pb-2 text-xs flex gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E4E7F4] dark:bg-[#9ea8b6]">
              <Users className="w-4 h-4 text-[#4D5BF6]" />
            </div>
            <div className="gap-1">
              <p>New tenant added "Nandha School"</p>
              <p className="text-[9px]">2 mins ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
