export default function Activities() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="relative w-40 h-40 rounded-full bg-[conic-gradient(#22c55e_0deg_288deg,#f59e0b_288deg_331deg,#ef4444_331deg_360deg)] flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold">900</h3>
            <p className="text-xs text-gray-500">Activities</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between gap-8">
            <span>🟢 Active</span>
            <span>600 (80%)</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>🟡 Trial</span>
            <span>200 (12%)</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>🔴 Expired</span>
            <span>100 (8%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}