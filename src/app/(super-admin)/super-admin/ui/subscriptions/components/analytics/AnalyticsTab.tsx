import React from "react";
import Card from "./Card";
import Table from "./Table";
import SubscriptionGrowth from "./SubscriptionGrowth";
import Plans from "./Plans";
import PopularPlan from "./PopularPlan";
import QuickInsight from "./QuickInsight";

const TenantSubscriptionsTab = () => {
  return (
    <div>
      <div className="pt-2 min-h-screen">
        <div className="grid grid-cols-1 gap-4 h-full">
          <Card />

          <div className="grid grid-cols-1 lg:grid-cols-[8fr_7fr_5fr] gap-4 h-full">
            <SubscriptionGrowth />
            <Plans />
            <PopularPlan />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4">
            <Table />
            <QuickInsight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSubscriptionsTab;
