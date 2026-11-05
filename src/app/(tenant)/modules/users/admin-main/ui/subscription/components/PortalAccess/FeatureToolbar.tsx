import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export type ViewTab = "Module List" | "Feature List";
export type FilterField =
  | "name"
  | "parentModule"
  | "childModule"
  | "description"
  | "addedOn"
  | "status";

export type FilterOption = {
  field: FilterField;
  label: string;
  values: string[];
};

type Props = {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  search: string;
  setSearch: (value: string) => void;
  filterOptions: FilterOption[];
  selectedFilters: Record<FilterField, string>;
  setSelectedFilter: (field: FilterField, value: string) => void;
  resetFilters: () => void;
  count: number;
  start: number;
  end: number;
};

export default function FeatureToolbar({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  filterOptions,
  selectedFilters,
  setSelectedFilter,
  resetFilters,
  count,
  start,
  end,
}: Props) {
  const [filterOpen, setFilterOpen] = React.useState(false);

  React.useEffect(() => {
    if (!filterOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  return (
    <>
      <div className="flex gap-6 px-5 pt-3 dark:border-[#414141]">
        {(["Module List", "Feature List"] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`relative pb-1.5 text-[15px] font-medium ${
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

      <div className="ml-3 mr-3 mt-4 grid grid-cols-1 rounded-t-xl bg-[#fafafa] dark:border-[#414141] dark:bg-[#292929] sm:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-[#414141] sm:border-b-0 sm:border-r">
          <Search size={14} className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword"
            className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>

        <div className=" border-b border-gray-100 dark:border-[#414141] sm:border-b-0 sm:border-r">
          <button
            type="button"
            aria-expanded={filterOpen}
            aria-haspopup="dialog"
            onClick={() => setFilterOpen(true)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] text-gray-500 dark:text-gray-300"
          >
            <SlidersHorizontal size={14} />
            <span className="flex-1 text-left text-[14px]">Filter</span>
          </button>
        </div>
        <div className="flex items-center px-3 py-2.5 text-[14px] text-gray-500 dark:text-gray-400">
          Showing {start}–{end} of {count}
        </div>
      </div>

      {filterOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFilterOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-access-filter-title"
            className="relative max-h-[80vh] w-full max-w-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-[#505050] dark:bg-[#292929]"
          >
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              aria-label="Close filters"
              className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#383838] dark:hover:text-white"
            >
              <X size={20} />
            </button>
            <h2
              id="portal-access-filter-title"
              className="mb-6 text-[19px] font-semibold text-gray-900 dark:text-white"
            >
              Filter {activeTab}
            </h2>
            <div className="space-y-2">
              {filterOptions.map((option) => (
                <label
                  key={option.field}
                  className="block text-[15px] font-semibold text-gray-700 dark:text-gray-200"
                >
                  {option.label}
                  <select
                    value={selectedFilters[option.field]}
                    onChange={(event) =>
                      setSelectedFilter(option.field, event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 outline-none focus:border-[#576cbc] dark:border-[#505050] dark:bg-[#343434] dark:text-white"
                  >
                    <option value="All">All values</option>
                    {option.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setFilterOpen(false);
                }}
                className="rounded-md border border-[#576cbc] px-3 py-1.5 text-[13px] font-semibold text-[#576cbc] transition hover:bg-[#576cbc]/5 dark:hover:bg-[#383838]"
              >
                Reset filters
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="rounded-md bg-[#576cbc] px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#465ba0]"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}