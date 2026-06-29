import React from "react";

const RecentActivities = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold mb-4">Recent Activities</h2>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="border-b pb-2">
            New tenant added "Nandha School"
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;