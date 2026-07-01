import StatsCards from "./StatsCards";
import TopPerformingPlan from "./TopPerformingPlan";
import PlansTable from "./PlansTable";
import Activities from "./Activities";

export default function PlansTab() {
  return (
    <div className="space-y-4">
      <StatsCards />

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <div className=""><Activities/></div>
        <div className=""><TopPerformingPlan /></div>
      </div>

      <PlansTable />
    </div>
  );
}