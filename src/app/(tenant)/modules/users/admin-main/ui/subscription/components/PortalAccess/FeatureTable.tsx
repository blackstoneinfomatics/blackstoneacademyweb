import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleX,
} from "lucide-react";
import { Feature, PortalRole } from "./PortalData";
import { ViewTab } from "./FeatureToolbar";

type Props = {
  features: Feature[];
  activeRole: PortalRole;
  activeTab: ViewTab;
  onToggle: (id: number) => void;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export default function FeatureTable({
  features,
  activeRole,
  activeTab,
  onToggle,
  page,
  totalPages,
  setPage,
}: Props) {
  return (
    <div className="px-3 pb-3">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-[#4c6993] text-white">
              <th className="w-[19%] px-2 py-3 text-[10px] font-medium">
                {activeTab === "Feature List" ? "Feature Name" : "Module Name"}
              </th>
              <th className="w-[17%] px-2 py-3 text-[10px] font-medium">
                Parent Module
              </th>
              <th className="w-[14%] px-2 py-3 text-[10px] font-medium">
                Child Module
              </th>
              <th className="w-[25%] px-2 py-3 text-[10px] font-medium">
                Description
              </th>
              <th className="w-[12%] px-2 py-3 text-[10px] font-medium">
                Add on
              </th>
              <th className="w-[13%] px-2 py-3 text-center text-[10px] font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {features.map((feature, index) => (
              <tr
                key={feature.id}
                className={`transition-colors hover:bg-[#edf2ff] dark:hover:bg-[#414757] ${
                  index % 2
                    ? "bg-[#F8F8F8] dark:bg-[#383838]"
                    : "bg-white dark:bg-[#303030]"
                }`}
              >
                <td className="px-2 py-3 text-[10px] font-medium dark:text-gray-100">
                  {activeTab === "Module List"
                    ? feature.parentModule
                    : feature.name}
                </td>

                <td className="px-2 py-3 text-[10px] dark:text-gray-200">
                  {feature.parentModule}
                </td>

                <td className="px-2 py-3 text-[10px] dark:text-gray-200">
                  {feature.childModule}
                </td>

                <td className="px-2 py-3 text-[10px] dark:text-gray-300">
                  {activeRole === "Student"
                    ? feature.description
                    : `Access and permissions for ${activeRole.toLowerCase()}.`}
                </td>

                <td className="whitespace-nowrap px-2 py-3 text-[9px] text-[#4265a4] dark:text-[#9bb7ff]">
                  {feature.addedOn}
                </td>

                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggle(feature.id)}
                    aria-pressed={feature.enabled}
                    className={`inline-flex min-w-[65px] items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[9px] ${
                      feature.enabled
                        ? "bg-[#e9fff0] text-[#278046] hover:bg-[#d3f8df] dark:bg-[#244332] dark:text-[#8ee5a8]"
                        : "bg-[#fff0f0] text-[#c34b4b] hover:bg-[#ffe0e0] dark:bg-[#4b2c2c] dark:text-[#ffaaaa]"
                    }`}
                  >
                    {feature.enabled ? (
                      <>
                        <CheckCircle2 size={11} />
                        Enable
                      </>
                    ) : (
                      <>
                        <CircleX size={11} />
                        Disable
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}

            {features.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-xs text-gray-500 dark:text-gray-400"
                >
                  No features found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 py-3 dark:border-[#414141]">
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
            className="rounded-md border border-gray-200 p-1.5 text-gray-600 disabled:opacity-40 dark:border-[#505050] dark:text-gray-300"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                className={`h-7 min-w-7 rounded-md px-2 text-[10px] ${
                  page === number
                    ? "bg-[#536bc5] text-white"
                    : "border border-gray-200 text-gray-600 dark:border-[#505050] dark:text-gray-300"
                }`}
              >
                {number}
              </button>
            )
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
            className="rounded-md border border-gray-200 p-1.5 text-gray-600 disabled:opacity-40 dark:border-[#505050] dark:text-gray-300"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}