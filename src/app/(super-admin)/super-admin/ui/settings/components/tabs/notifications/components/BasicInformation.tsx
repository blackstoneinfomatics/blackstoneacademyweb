import React from "react";
import NotificationCard from "./NotificationCard";
import NotificationEvents from "./NotificationEvents";

import {
  NotificationEvent,
  NotificationCategory,
} from "./notificationTypes";

interface Props {
  category: NotificationCategory;
  events: NotificationEvent[];
  onCategoryChange: (category: NotificationCategory) => void;
  onEventChange: (
    id: string,
    field: "email" | "inApp",
    value: boolean
  ) => void;
}

const BasicInformation = ({
  category,
  events,
  onCategoryChange,
  onEventChange,
}: Props) => {
  return (
    <NotificationCard title="Basic Information">
      <NotificationEvents
        category={category}
        events={events}
        onCategoryChange={onCategoryChange}
        onEventChange={onEventChange}
      />
    </NotificationCard>
  );
};

export default BasicInformation;