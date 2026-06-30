export default function TopPerformingPlan() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h3 className="font-semibold text-lg mb-5">Top Performing Plan</h3>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="w-28 h-28 rounded-2xl bg-indigo-100" />

          <div>
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">
              Most Popular
            </span>

            <h2 className="text-3xl font-bold text-indigo-600 mt-2">
              Enterprise
            </h2>

            <p className="mt-2 text-gray-500">42 Tenants</p>
            <p className="font-bold text-2xl mt-2">$8,500 / year</p>
          </div>
        </div>

        <div className="w-40 h-24 border-b border-l rounded-bl-xl" />
      </div>
    </div>
  );
}