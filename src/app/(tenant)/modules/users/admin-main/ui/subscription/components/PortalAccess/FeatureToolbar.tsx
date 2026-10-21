import React from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

export type ViewTab = "Module List" | "Feature List";

type Props = {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  search: string;
  setSearch: (value: string) => void;
  selectedModule: string;
  setSelectedModule: (value: string) => void;
  modules: string[];
  count: number;
  start: number;
  end: number;
};

export default function FeatureToolbar({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  selectedModule,
  setSelectedModule,
  modules,
  count,
  start,
  end,
}: Props) {
  const [filterOpen, setFilterOpen] = React.useState(false);

  return (
    <>
      <div className="flex gap-6 px-5 pt-3 dark:border-[#414141]">
        {(["Module List", "Feature List"] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`relative pb-1.5 text-xs font-medium ${
              activeTab === tab
                ? "text-[#536bc5] dark:text-white"
                : "text-[#16264a] dark:text-[#a9b9ff]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#596fc8]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 rounded-t-xl ml-3 mr-3 mt-4 bg-[#fafafa] dark:border-[#414141] dark:bg-[#292929] sm:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-[#414141] sm:border-b-0 sm:border-r">
          <Search size={14} className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword"
            className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>

        <div className="relative border-b border-gray-100 dark:border-[#414141] sm:border-b-0 sm:border-r">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[11px] text-gray-500 dark:text-gray-300"
          >
            <SlidersHorizontal size={14} />
            <span className="flex-1 text-left">Filter</span>
            <ChevronDown
              size={12}
              className={filterOpen ? "rotate-180" : ""}
            />
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-full z-20 w-full min-w-[180px] rounded-b-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-[#505050] dark:bg-[#383838]">
              <label className="mb-2 block text-[11px] dark:text-white">
                Parent Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setFilterOpen(false);
                }}
                className="w-full rounded-md border border-gray-200 bg-white p-2 text-[11px] dark:border-[#505050] dark:bg-[#292929] dark:text-white"
              >
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedModule("All");
                  setSearch("");
                  setFilterOpen(false);
                }}
                className="mt-2 w-full rounded-md bg-[#edf1ff] p-2 text-[11px] text-[#4059a8] dark:bg-[#39476b] dark:text-white"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center px-3 py-2.5 text-[10px] text-gray-500 dark:text-gray-400">
          Showing {start}–{end} of {count}
        </div>
      </div>
    </>
  );
}