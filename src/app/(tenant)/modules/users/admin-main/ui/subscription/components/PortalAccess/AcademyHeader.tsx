import React from "react";
import { Building2, Users } from "lucide-react";

export default function AcademyHeader() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2.2fr_0.85fr]">
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#414141] dark:bg-[#303030]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <Building2 size={27} className="text-[#344b93]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Blackstone Academy
            </h2>
            <span className="text-[10px] text-green-600">
              Active
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            blackstoneacademy.com
          </p>
          <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
            Created on: 02 July 2000{" "}
            <span className="text-[#536bc5]">ID: TEN 22001</span>
          </p>
        </div>

        <span className="self-start rounded bg-[#e9efff] px-2 py-1 text-[9px] text-[#4264bc] dark:bg-[#39476b] dark:text-[#c3d0ff]">
          Standard
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#414141] dark:bg-[#303030]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-[#3678ff] dark:bg-[#293b60] dark:text-[#8bb3ff]">
          <Users size={19} />
        </div>
        <div>
          <p className="text-xs text-[#3778ff] dark:text-[#8bb3ff]">
            Portal Usage
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            8 / 10
          </p>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            2 user slots available
          </p>
        </div>
      </div>
    </div>
  );
}