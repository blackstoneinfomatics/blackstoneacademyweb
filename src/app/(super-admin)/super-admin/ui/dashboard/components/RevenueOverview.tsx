import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface DataPoint {
  name: string;
  Institute: number;
}

// Peak value set to 190 max so it stays strictly within the 0-200 domain bounds
const data: DataPoint[] = [
  { name: '1 July', Institute: 2 },
  { name: '5 July', Institute: 25 },
  { name: '10 July', Institute: 55 },
  { name: '15 July', Institute: 90 },
  { name: '20 July', Institute: 125 },
  { name: '25 July', Institute: 155 },
  { name: '29 July', Institute: 175 },
  { name: '31 July', Institute: 190 },
];

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const rawValue = payload[0].value as number;
    const formattedValue = (rawValue * 1000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1">
        <span className="text-xs text-slate-400 font-medium">
          {payload[0].payload.name}
        </span>
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          ${formattedValue}
          <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            +3.4%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueOverview: React.FC = () => {
  return (
    <div className="relative w-full bg-white rounded-2xl p-6 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[16px] font-semibold text-slate-900">
          Revenue Overview
        </h3>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm inline-block" />
            Institute
          </div>

          <select className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border-none outline-none cursor-pointer hover:bg-slate-200 transition-colors">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>

      {/* Chart Container - Strictly Clipped Box */}
      <div className="w-full h-56 relative overflow-hidden flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Gradient for base smooth fill */}
              <linearGradient id="colorInstitute" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>

              {/* Vertical Stripes Pattern */}
              <pattern id="verticalStripes" width="10" height="10" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.3" />
              </pattern>
            </defs>

            <XAxis dataKey="name" hide />
            <YAxis
              domain={[0, 200]}
              ticks={[0, 50, 100, 150, 200]}
              tickFormatter={(v: number) => `$${v}`}
              axisLine={false}
              tickLine={false}
              width={45}
              className="text-xs fill-slate-400"
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="Institute"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorInstitute)"
              activeDot={{
                r: 5,
                fill: '#ffffff',
                stroke: '#4f46e5',
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverview;