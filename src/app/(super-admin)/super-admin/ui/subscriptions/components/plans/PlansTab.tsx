import StatsCards from "./StatsCards";
import TopPerformingPlan from "./TopPerformingPlan";
import PlansTable from "./PlansTable";
import Activities from "./Activities";

export default function PlansTab() {
  return (
    <div className="space-y-6">
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Activities />
        <TopPerformingPlan />
      </div>

      <PlansTable />
    </div>
  );
}