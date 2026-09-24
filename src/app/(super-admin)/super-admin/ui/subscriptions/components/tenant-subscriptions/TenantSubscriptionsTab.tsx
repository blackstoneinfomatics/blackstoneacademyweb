import React from "react";
import Card from "./Card";
import Table from "./Table";

const TenantSubscriptionsTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Card />
      </div>
      <div>
        <Table />
      </div>
    </div>
  );
};

export default TenantSubscriptionsTab;
