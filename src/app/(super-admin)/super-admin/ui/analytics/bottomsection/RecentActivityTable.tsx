import React from 'react'



const RecentActivityTable = () => {

    const activities = [
    {
      date: "Sep 12, 2026 10:00 AM",
      activity: "New Subscription",
      tenant: "Blackstone Academy",
      amount: "25,000",
      status: "Paid",
    },
    {
      date: "Sep 12, 2026 10:00 AM",
      activity: "Plan Upgrade",
      tenant: "Future Academy",
      amount: "5,000",
      status: "Pending",
    },
    {
      date: "Sep 12, 2026 10:00 AM",
      activity: "Trial Converted",
      tenant: "Blackstone Academy",
      amount: "20,000",
      status: "Paid",
    },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold text-[#101B41]">
          Recent Activities
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#3F5E95] text-white">
            <tr>
              <th className="p-4 text-left">Date & Time</th>
              <th className="p-4 text-left">Activity</th>
              <th className="p-4 text-left">Tenant</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{item.date}</td>
                <td className="p-4">{item.activity}</td>
                <td className="p-4">{item.tenant}</td>
                <td className="p-4">₹{item.amount}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      item.status === "Paid"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentActivityTable
