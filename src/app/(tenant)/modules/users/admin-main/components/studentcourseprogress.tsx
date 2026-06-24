import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white text-xs text-gray-800 px-2 py-1 rounded shadow border border-gray-200">
        <span className="font-semibold">{data.name}</span>: {data.value}
      </div>
    );
  }
  return null;
};

const data = [
  { name: "Total Assessments", value: 100, color: "#002c5f" },
  { name: "Upcoming Assessments", value: 30, color: "#B0C4DE" },
  { name: "Average Score", value: 80, color: "#6A5ACD" },
];

const StudentsRecord = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 w-[370px] h-[135px] flex flex-col justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Student Course Progress
        </h2>

        <div className="flex items-center justify-between">
          {/* Legend */}
          <div className="space-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                ></div>
                <span className="text-[12px] text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="w-[150px] h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={20}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tick={false} />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />

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
    </div>
  );
};

export default StudentsRecord;
