"use client";

import { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Download } from "lucide-react";
import { downloadPdf } from "../downloadCsv";
import axios from "axios";

// Define the API Response
interface ActivityApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    activities: Array<{
      _id?: string;
      date: string;
      role: string;
      activity: string;
      details: string;
    }>;
  };
}

// Define the Activity type
interface Activity {
  id: string;
  date: string;
  role: string;
  activity: string;
  details: string;
}

export default function ReportTable() {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const allActivitiesSelected =
    activities.length > 0 && selectedActivityIds.length === activities.length;

  // Fetch Real-Time Data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ActivityApiResponse>(
          "http://localhost:5001/finance/today-activities"
        );

        if (response.data.success) {
          const apiActivities = response.data.data.activities || [];

          // Map API data to match your UI structure
          const mappedActivities: Activity[] = apiActivities.map((item) => ({
            id: item._id || Math.random().toString(36).substr(2, 9),
            date: item.date ? new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) : "N/A",
            role: item.role || "N/A",
            activity: item.activity || "N/A",
            details: item.details || "N/A",
          }));

          setActivities(mappedActivities);
        }
      } catch (error) {
        console.error("Failed to fetch finance activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleDownloadSelected = async () => {
    const selectedItems = activities.filter((item) =>
      selectedActivityIds.includes(item.id),
    );

    if (selectedItems.length === 0) return;

    await downloadPdf(
      "selected-analytics-report.pdf",
      ["Date & Time", "Role", "Activity", "Details"],
      selectedItems.map((item) => [
        item.date,
        item.role,
        item.activity,
        item.details,
      ]),
    );
  };

  const toggleAllActivities = () => {
    setSelectedActivityIds(
      allActivitiesSelected ? [] : activities.map((activity) => activity.id),
    );
  };
  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white dark:bg-[#343434] rounded-2xl shadow-sm py-4">
      <div className="mb-4 flex items-center justify-between px-3">
        <h2
          className="mb-4 font-medium text-[#010E30E5]/90 dark:text-[#fff]"
          style={{
            fontSize: "clamp(14px, 1.2vw, 16px)",
            lineHeight: "1.4",
          }}
        >
          All Reports
        </h2>
        <button
          onClick={handleDownloadSelected}
          disabled={selectedActivityIds.length === 0}
          className="flex items-center gap-2 rounded-md bg-[#496A96] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} />
          Download Report
        </button>
      </div>

      <div className="overflow-hidden border border-[#E8E8E8] dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-[#486A99]">
            <tr>
              <th className="px-5 py-3 text-left text-white text-[12px] font-semibold">
                <input
                  type="checkbox"
                  checked={allActivitiesSelected}
                  onChange={toggleAllActivities}
                  aria-label="Select all reports"
                />
              </th>
              {["Date & Time", "ROLE", "Activity", "Details", "Action"].map(
                (item) => (
                  <th
                    key={item}
                    className="px-5 py-3 text-left text-white text-[12px] font-semibold"
                  >
                    {item}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                  Loading activities...
                </td>
              </tr>
            ) : activities.length > 0 ? (
              activities.map((row, index) => {
                const rowBgClass =
                  index % 2 === 0
                    ? "bg-[#fff] dark:bg-[#2C2C2C]"
                    : "bg-[#F8F8F8] dark:bg-[#303030]";
                return (
                  <tr className={`text-[10px] ${rowBgClass}`} key={row.id}>
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedActivityIds.includes(row.id)}
                        onChange={() =>
                          setSelectedActivityIds((current) =>
                            current.includes(row.id)
                              ? current.filter((id) => id !== row.id)
                              : [...current, row.id],
                          )
                        }
                        aria-label={`Select report ${row.id}`}
                      />
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#576CBC]">
                      {row.date}
                    </td>

                    <td className="px-5 py-4 text-[12px] text-[#1E293B] dark:text-white">
                      {row.role}
                    </td>

                    <td className="px-5 py-4 text-[12px] text-[#1E293B] dark:text-white">
                      {row.activity}
                    </td>

                    <td className="px-5 py-4 text-[12px] text-[#1E293B] dark:text-white">
                      {row.details}
                    </td>

                    <td className="px-5 py-4 relative">
                      <button
                        onClick={() => toggleDropdown(row.id)}
                        className="text-[#6B7280] hover:text-[#576CBC]"
                      >
                        <BsThreeDotsVertical size={15} />
                      </button>
                      {openDropdownId === row.id && (
                        <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#343434] border rounded-md shadow-lg z-50">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444]"
                            onClick={() => {
                              setSelectedActivity(row);
                              setShowViewModal(true);
                              setOpenDropdownId(null);
                            }}
                          >
                            View Details
                          </button>

                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-[#444]"
                            onClick={() => {
                              setOpenDropdownId(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                  No activities found for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showViewModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2C2C2C] rounded-2xl w-[900px] p-6">
            {/* Header */}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[22px] font-semibold text-[#1E293B] dark:text-white">
                Activity
              </h2>

              <button
                onClick={() => setShowViewModal(false)}
                className="text-3xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Role */}

              <div>
                <label className="block text-sm font-medium mb-2">ROLE</label>

                <input
                  readOnly
                  value={selectedActivity.role}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>

              {/* Date */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date & time
                </label>

                <input
                  readOnly
                  value={selectedActivity.date}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>

              {/* Activity */}

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Activity
                </label>

                <input
                  readOnly
                  value={selectedActivity.activity}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>

              {/* Details */}

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Details
                </label>

                <textarea
                  readOnly
                  rows={4}
                  value={selectedActivity.details}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none bg-[#F9FAFB] dark:bg-[#2C2C2C]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}