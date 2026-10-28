"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Users,
  GraduationCap,
  Download,
  Check,
} from "lucide-react";

type BillingCycle = "Monthly" | "Half-Yearly" | "Yearly";

type Portal = {
  name: string;
  features: string[];
};

type Plan = {
  id: string;
  name: string;
  badge: string;
  description: string;
  prices: Record<BillingCycle, number>;
  originalPrices: Record<BillingCycle, number>;
  students: number;
  users: number;
  popular?: boolean;
  portals: Portal[];
};

const billingCycles: BillingCycle[] = [
  "Monthly",
  "Half-Yearly",
  "Yearly",
];

const defaultPortals: Portal[] = [
  {
    name: "Admin",
    features: [
      "Dashboard",
      "Student Management",
      "Teacher Management",
      "Attendance Management",
      "Fees and Payments",
    ],
  },
  {
    name: "Teachers",
    features: [
      "Class Management",
      "Attendance",
      "Assignments",
      "Student Reports",
    ],
  },
  {
    name: "Students",
    features: [
      "Student Dashboard",
      "Timetable",
      "Assignments",
      "Academic Reports",
    ],
  },
  {
    name: "Academy",
    features: [
      "Academic Overview",
      "Course Management",
      "Institution Reports",
    ],
  },
  {
    name: "Supervisor",
    features: [
      "Staff Monitoring",
      "Academic Monitoring",
      "Performance Reports",
    ],
  },
];

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    badge: "MOST POPULAR",
    description: "Perfect for small Academies getting started.",
    prices: {
      Monthly: 1500,
      "Half-Yearly": 7500,
      Yearly: 15000,
    },
    originalPrices: {
      Monthly: 2500,
      "Half-Yearly": 12500,
      Yearly: 25000,
    },
    students: 500,
    users: 500,
    portals: defaultPortals.slice(0, 3),
  },
  {
    id: "premium",
    name: "Premium",
    badge: "BEST VALUE",
    description:
      "Perfect for growing Academies with advanced needs.",
    prices: {
      Monthly: 1500,
      "Half-Yearly": 7500,
      Yearly: 15000,
    },
    originalPrices: {
      Monthly: 2500,
      "Half-Yearly": 12500,
      Yearly: 25000,
    },
    students: 500,
    users: 500,
    popular: true,
    portals: defaultPortals.slice(0, 4),
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "MOST POPULAR",
    description:
      "Perfect for large Academies with flexible needs.",
    prices: {
      Monthly: 1500,
      "Half-Yearly": 7500,
      Yearly: 15000,
    },
    originalPrices: {
      Monthly: 2500,
      "Half-Yearly": 12500,
      Yearly: 25000,
    },
    students: 500,
    users: 500,
    portals: defaultPortals,
  },
];

const formatPrice = (price: number) =>
  `₹ ${price.toLocaleString("en-IN")}`;

const AvailablePlans = () => {
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("Monthly");

  const [expandedPortals, setExpandedPortals] =
    useState<Record<string, boolean>>({});

  const [selectedPlan, setSelectedPlan] =
    useState<string | null>(null);

  const togglePortal = (key: string) => {
    setExpandedPortals((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const downloadFeatures = (plan: Plan) => {
    const rows = [
      ["Plan", plan.name],
      ["Billing Cycle", billingCycle],
      ["Price", plan.prices[billingCycle]],
      ["Students Limit", plan.students],
      ["Users Limit", plan.users],
      [],
      ["Portal", "Available Features"],
      ...plan.portals.map((portal) => [
        portal.name,
        portal.features.join(", "),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${plan.name.toLowerCase()}-features.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-xl bg-white p-3 shadow-[0_6px_20px_rgba(153,153,153,0.15)] dark:bg-[#343434] sm:p-5 lg:p-6">
      {/* Billing cycle selector */}
      <div className="mb-5 flex justify-center">
        <div className="inline-flex items-center rounded-full bg-[#576CBC] p-[3px] shadow-sm">
          {billingCycles.map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={`rounded-full px-3 py-2 text-[10px] font-medium transition-all duration-300 sm:px-5 sm:text-xs ${
                billingCycle === cycle
                  ? "bg-white text-[#5369c0] shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing plans */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-3">
        {plans.map((plan) => {
          const isPopular = Boolean(plan.popular);
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`min-w-0 rounded-[15px] p-2.5 transition-all duration-300 sm:p-3 ${
                isPopular
                  ? "bg-gradient-to-br from-[#596fc6] via-[#4259ae] to-[#253a83] shadow-md xl:-mt-0"
                  : "bg-[#e8edff] dark:bg-[#41465a]"
              }`}
            >
              {/* Plan header */}
              <div
                className={`relative rounded-xl px-2.5 pb-2.5 pt-9 text-white sm:px-3 sm:pb-3 ${
                  isPopular
                    ? "bg-white/10"
                    : "bg-gradient-to-br from-[#576CBC] to-[#243783]"
                }`}
              >
                <span className="absolute right-2 top-2 rounded-sm bg-[#e9fff0] px-2 py-1 text-[8px] font-bold text-[#26733d] sm:text-[9px]">
                  {plan.badge}
                </span>

                <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
                  {plan.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[27px] font-medium leading-tight sm:text-[30px]">
                    {formatPrice(plan.prices[billingCycle])}
                  </span>

                  <span className="text-[11px] text-white/90">
                    /
                  </span>

                  <span className="text-xs text-white/85 line-through">
                    {formatPrice(plan.originalPrices[billingCycle])}
                  </span>
                </div>

                <p className="mt-3 min-h-[17px] text-[10px] leading-relaxed text-white/95 sm:text-[11px]">
                  {plan.description}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-all duration-200 sm:text-sm ${
                    isSelected
                      ? "bg-[#e8fff0] text-[#24713a]"
                      : "bg-white text-[#5068c2] hover:bg-[#f0f3ff] active:scale-[0.99]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check size={15} />
                      Plan Selected
                    </>
                  ) : (
                    "Choose Plan"
                  )}
                </button>
              </div>

              {/* Usage limits */}
              <div
                className={`mt-2 rounded-lg p-2.5 ${
                  isPopular
                    ? "bg-white/10 text-white"
                    : "bg-[#f0f3ff] text-[#0d1b42] dark:bg-[#343949] dark:text-white"
                }`}
              >
                <h4 className="mb-2 text-[11px] font-medium">
                  Usage Limit
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <GraduationCap
                      size={17}
                      className="shrink-0 text-[#536bc5]"
                    />
                    <span className="truncate text-[10px] sm:text-[11px]">
                      Students - {plan.students} 
                    </span>
                    {/* <span className="ml-auto text-[10px] sm:text-[11px]">
                      {plan.students} 
                    </span> */}
                  </div>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <Users
                      size={16}
                      className="shrink-0 text-[#536bc5]"
                    />
                    <span className="truncate text-[10px] sm:text-[11px]">
                      Users - {plan.users}
                    </span>
                    {/* <span className="ml-auto text-[10px] sm:text-[11px]">
                     
                    </span> */}
                  </div>
                </div>
              </div>

              {/* Portals accordion */}
              <div
                className={`mt-3 rounded-lg p-2.5 ${
                  isPopular
                    ? "bg-white/10 text-white"
                    : "bg-[#f0f3ff] text-[#0d1b42] dark:bg-[#343949] dark:text-white"
                }`}
              >
                <h4 className="mb-2 text-[11px] font-medium">
                  Portals
                </h4>

                <div className="space-y-1">
                  {plan.portals.map((portal) => {
                    const key = `${plan.id}-${portal.name}`;
                    const isExpanded = Boolean(
                      expandedPortals[key]
                    );

                    return (
                      <div
                        key={portal.name}
                        className={`overflow-hidden rounded-lg transition-colors ${
                          isPopular
                            ? "bg-white/10 hover:bg-white/15"
                            : "bg-white dark:bg-[#414757]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePortal(key)}
                          aria-expanded={isExpanded}
                          className="flex w-full items-center justify-between gap-2 px-2.5 py-2.5 text-left text-[11px] transition-colors"
                        >
                          <span>{portal.name}</span>

                          <ChevronDown
                            size={15}
                            className={`shrink-0 transition-transform duration-300 ${
                              isPopular
                                ? "text-white"
                                : "text-[#0d1b42] dark:text-white"
                            } ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <ul className="space-y-2 px-3 pb-3 pt-1">
                              {portal.features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-2 text-[10px] leading-relaxed opacity-90"
                                >
                                  <Check
                                    size={12}
                                    className="mt-0.5 shrink-0 text-[#55bf82]"
                                  />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Download features */}
              <button
                type="button"
                onClick={() => downloadFeatures(plan)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium transition-all duration-200 sm:text-xs ${
                  isPopular
                    ? "bg-[#5369bd] text-white shadow-[0_4px_12px_rgba(16,29,79,0.2)] hover:bg-[#6479d1]"
                    : "bg-white text-[#5068c2] shadow-[0_4px_12px_rgba(30,48,100,0.12)] hover:bg-[#f7f8ff] dark:bg-[#414757] dark:text-white dark:hover:bg-[#4b5265]"
                }`}
              >
                <Download size={14} />
                Download List of Features
              </button>
            </div>
          );
        })}
      </div>

      {/* Selection feedback */}
      {selectedPlan && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce3ff] bg-[#f5f7ff] p-3 dark:border-[#4d5877] dark:bg-[#2e3341]">
          <p className="text-xs text-[#233765] dark:text-white">
            <span className="font-semibold">
              {plans.find((plan) => plan.id === selectedPlan)?.name}
            </span>{" "}
            plan selected for {billingCycle.toLowerCase()} billing.
          </p>

          <button
            type="button"
            onClick={() => setSelectedPlan(null)}
            className="text-xs font-medium text-[#536bc5] hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailablePlans;
