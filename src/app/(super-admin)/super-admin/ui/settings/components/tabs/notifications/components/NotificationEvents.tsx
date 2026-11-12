import React from "react";
import { Building2 } from "lucide-react";
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

const categories: NotificationCategory[] = [
  "Institute",
  "School",
  "College",
];

const NotificationEvents = ({
  category,
  events,
  onCategoryChange,
  onEventChange,
}: Props) => {
  return (
    <div>
      {/* Category Tabs */}
      <div className="mb-2 flex items-center gap-5 border-b border-[#E9ECF3] px-2 dark:border-[#555]">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
            className={`relative pb-2 text-[11px] font-medium transition ${
              category === item
                ? "text-[#5B70C8] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-[#5B70C8] after:content-['']"
                : "text-[#10204A] hover:text-[#5B70C8] dark:text-gray-400"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Event Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E7EAF1] dark:border-[#555]">
        <table className="w-full min-w-[430px] border-collapse">
          <thead>
            <tr className="bg-[#F5F6F9] text-left dark:bg-[#292929]">
              <th className="px-3 py-2 text-[10px] font-semibold text-[#263755] dark:text-gray-200">
                Event
              </th>
              <th className="w-[90px] px-2 py-2 text-center text-[10px] font-semibold text-[#263755] dark:text-gray-200">
                Email
              </th>
              <th className="w-[90px] px-2 py-2 text-center text-[10px] font-semibold text-[#263755] dark:text-gray-200">
                In App
              </th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-t border-[#F0F1F5] dark:border-[#444]"
              >
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#EAE2FF] text-[#7044FF]">
                      <Building2 size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#10204A] dark:text-gray-200">
                        {event.title}
                      </p>

                      <p className="mt-0.5 text-[9px] text-gray-500">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={event.email}
                    onChange={(e) =>
                      onEventChange(event.id, "email", e.target.checked)
                    }
                    className="h-[14px] w-[14px] cursor-pointer accent-[#5B70C8]"
                  />
                </td>

                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={event.inApp}
                    onChange={(e) =>
                      onEventChange(event.id, "inApp", e.target.checked)
                    }
                    className="h-[14px] w-[14px] cursor-pointer accent-[#5B70C8]"
                  />
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-[11px] text-gray-500"
                >
                  No notification events available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationEvents;