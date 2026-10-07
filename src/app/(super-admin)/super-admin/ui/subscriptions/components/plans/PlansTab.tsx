import StatsCards from "./StatsCards";
import TopPerformingPlan from "./TopPerformingPlan";
import PlansTable from "./PlansTable";
import Activities from "./Activities";

export default function PlansTab() {
  return (
    <div className="space-y-4">
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4">
        <Activities />
        <TopPerformingPlan />
      </div>

      <PlansTable />
    </div>
  );
}
