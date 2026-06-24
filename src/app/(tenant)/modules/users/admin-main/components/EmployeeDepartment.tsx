"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const data = [
  { name: "Total Students", value: 100, color: "#002c5f" },
  { name: "Students On Hold", value: 30, color: "#B0C4DE" },
  { name: "Active Students", value: 80, color: "#6A5ACD" },
  { name: "Inactive Students", value: 50, color: "#00BFFF" },
  { name: "Students on Break", value: 60, color: "#007BFF" },
];

const EmployeeDepartment = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-[500px] h-[250px]">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Employee - Department Wise</h2>
      <div className="flex">
        {/* Legend */}
        <div className="space-y-4 mr-8">
          {data.map((item) => (
            <div key={item.name} className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full" style={{ background: item.color }}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-[250px] h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={50}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" axisLine={false} tick={false} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDepartment;
