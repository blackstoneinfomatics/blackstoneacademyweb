const plans = [
  { name: "Basic", price: "$8,500", billing: "Monthly", date: "Sep, 12 2023" },
  { name: "Standard", price: "$9,500", billing: "Monthly", date: "Sep, 12 2023" },
  { name: "Premium", price: "$12,500", billing: "Monthly", date: "Sep, 12 2023" },
];

export default function PlansTable() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-5 border-b">
        <h2 className="text-xl font-semibold">Plan</h2>
      </div>

      <table className="w-full">
        <thead className="bg-blue-600 text-white text-sm">
          <tr>
            <th className="p-4 text-left">Plan Name</th>
            <th className="p-4 text-left">Price</th>
            <th className="p-4 text-left">Billing Cycle</th>
            <th className="p-4 text-left">Created Date</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {plans.map((plan, index) => (
            <tr key={index} className="border-b">
              <td className="p-4">{plan.name}</td>
              <td className="p-4">{plan.price}</td>
              <td className="p-4">{plan.billing}</td>
              <td className="p-4">{plan.date}</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}