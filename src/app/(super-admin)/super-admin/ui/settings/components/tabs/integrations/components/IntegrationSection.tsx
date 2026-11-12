import React from "react";
import IntegrationCard from "./IntegrationCard";
import {
  Integration,
  IntegrationCategory,
} from "./integrationTypes";

interface Props {
  section: IntegrationCategory;
  onConfigure: (integration: Integration) => void;
  onConnect: (integration: Integration) => void;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

const IntegrationSection = ({
  section,
  onConfigure,
  onConnect,
}: Props) => {
  return (
    <section>
      {/* Section Heading */}
      <div className="mb-2">
        <h3 className="text-[13px] font-semibold text-[#10204A] dark:text-white">
          {section.title}
        </h3>

        <p className="mt-0.5 text-[9px] text-[#888888] dark:text-gray-400">
          {section.description}
        </p>
      </div>

      {/* Integration Cards */}
<div
  className={`grid ${columnClasses[section.columns || 2]} gap-2.5`}
>
  {section.integrations.map((integration) => (
    <IntegrationCard
      key={integration.id}
      integration={integration}
      onConfigure={onConfigure}
      onConnect={onConnect}
    />
  ))}
</div>
    </section>
  );
};

export default IntegrationSection;