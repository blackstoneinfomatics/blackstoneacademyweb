"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Users,
  GraduationCap,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";
import { toast } from "react-toastify";


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
  status: string;
};

const billingCycles: BillingCycle[] = ["Monthly", "Half-Yearly", "Yearly"];

const formatPrice = (price: number) =>
  `₹ ${price.toLocaleString("en-IN")}`;

const AvailablePlans = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPortals, setExpandedPortals] = useState<Record<string, boolean>>({});
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("AdminAuthToken");

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT.replace(/\/$/, "")}/plans`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch plans.");
        }

        const mappedPlans: Plan[] = result.data.items.map((item: any) => {
          const prices: Record<BillingCycle, number> = { Monthly: 0, "Half-Yearly": 0, Yearly: 0 };
          const originalPrices: Record<BillingCycle, number> = { Monthly: 0, "Half-Yearly": 0, Yearly: 0 };

          item.billingPeriods?.forEach((bp: any) => {
            let cycleName = bp.billingPeriod;
            if (cycleName === "Month" || cycleName === "Monthly") cycleName = "Monthly";
            if (cycleName === "Halfly" || cycleName === "Half-Yearly") cycleName = "Half-Yearly";
            if (cycleName === "Yearly") cycleName = "Yearly";

            if (prices.hasOwnProperty(cycleName)) {
              prices[cycleName as BillingCycle] = bp.price;
              originalPrices[cycleName as BillingCycle] = bp.price + (bp.taxAmount || 0);
            }
          });

          const portalMap: Record<string, string[]> = {};
          item.modules?.forEach((mod: any) => {
            const portalName = mod.portalName || "General";
            if (!portalMap[portalName]) portalMap[portalName] = [];
            portalMap[portalName].push(mod.moduleName);
            mod.features?.forEach((feat: any) => portalMap[portalName].push(feat.featureName));
            mod.children?.forEach((child: any) => portalMap[portalName].push(child.childModuleName));
          });

          const portals: Portal[] = Object.keys(portalMap).map((key) => ({
            name: key,
            features: Array.from(new Set(portalMap[key])),
          }));

          const isPopular = item.planStatus === "Most_Popular" || item.planName.toLowerCase() === "premium";
          let badge = "STANDARD";
          if (item.planStatus === "Most_Popular") badge = "MOST POPULAR";
          else if (isPopular) badge = "BEST VALUE";

          return {
            id: item._id,
            name: item.planName,
            badge: badge,
            description: item.planDescription || "No description provided.",
            prices,
            originalPrices,
            students: item.studentLimit || 0,
            users: item.userLimit || 0,
            popular: isPopular,
            portals: portals.length > 0 ? portals : [{ name: "Admin", features: ["Basic Access"] }],
            status: item.status,
          };
        });

        // 🚨 FILTER OUT DRAFT PLANS
        const activePlans = mappedPlans.filter(p => p.status === "Active");
        setPlans(activePlans);

        // Auto-select the first plan by default so there is always a blue card
        if (activePlans.length > 0) {
          setSelectedPlan(activePlans[0].id);
        }

      } catch (err: any) {
        console.error("API Error:", err);
        setError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Failed to load plans.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // 🚨 TAB FILTERING: Only show plans that have a valid price (> 0) for the selected tab
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => plan.prices[billingCycle] > 0);
  }, [plans, billingCycle]);

  const togglePortal = (key: string) => {
    setExpandedPortals((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const downloadFeatures = (plan: Plan) => {
    const currentPrice = plan.prices[billingCycle] || 0;
    const rows = [
      ["Plan", plan.name],
      ["Billing Cycle", billingCycle],
      ["Price", currentPrice],
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

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-white p-3 shadow-lg dark:bg-[#343434]">
        <Loader2 className="h-8 w-8 animate-spin text-[#576CBC]" />
        <span className="ml-3 text-lg font-medium text-gray-600 dark:text-gray-300">Loading Plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl bg-white p-3 shadow-lg dark:bg-[#343434]">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="rounded bg-[#576CBC] px-4 py-2 text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-white p-3 shadow-[0_6px_20px_rgba(153,153,153,0.15)] dark:bg-[#343434] sm:p-5 lg:p-6">

      {/* Fixed Billing Cycle Tabs */}
      <div className="mb-5 flex justify-center">
        <div className="inline-flex items-center rounded-full bg-[#576CBC] p-[3px] shadow-sm">
          {billingCycles.map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => {
                setBillingCycle(cycle);
                // If the currently selected plan doesn't support this new tab, clear selection
                const currentSelectedPlan = plans.find(p => p.id === selectedPlan);
                if (currentSelectedPlan && currentSelectedPlan.prices[cycle] <= 0) {
                  setSelectedPlan(null);
                }
              }}
              className={`rounded-full px-3 py-2 text-[10px] font-medium transition-all duration-300 sm:px-5 sm:text-xs ${billingCycle === cycle
                ? "bg-white text-[#5369c0] shadow-sm"
                : "text-white hover:bg-white/10"
                }`}
            >
              {cycle}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State if no plans for the tab */}
      {filteredPlans.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center text-gray-500">
          <p>No plans available for {billingCycle} billing cycle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-3">
          {filteredPlans.map((plan) => {
            // 🚨 BLUE CARD LOGIC: ONLY turns blue if the user selected this specific plan
            const isSelected = selectedPlan === plan.id;

            const currentPrice = plan.prices[billingCycle];
            const originalPrice = plan.originalPrices[billingCycle];

            return (
              <div
                key={plan.id}
                className={`flex h-full min-w-0 flex-col rounded-[15px] p-2.5 transition-all duration-300 sm:p-3 ${isSelected
                  ? "bg-gradient-to-br from-[#596fc6] via-[#4259ae] to-[#253a83] shadow-md xl:-mt-0"
                  : "bg-[#e8edff] dark:bg-[#41465a]"
                  }`}
              >
                {/* Plan header */}
                <div
                  className={`relative rounded-xl px-2.5 pb-2.5 pt-9 text-white sm:px-3 sm:pb-3 ${isSelected
                    ? "bg-white/10"
                    : "bg-gradient-to-br from-[#576CBC] to-[#243783] opacity-80"
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
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="text-[11px] text-white/90">/</span>
                    <span className="text-xs text-white/85 line-through">
                      {formatPrice(originalPrice || 0)}
                    </span>
                  </div>

                  <p className="mt-3 min-h-[17px] text-[10px] leading-relaxed text-white/95 sm:text-[11px]">
                    {plan.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-all duration-200 sm:text-sm ${isSelected
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
                  className={`mt-2 rounded-lg p-2.5 ${isSelected
                    ? "bg-white/10 text-white"
                    : "bg-[#f0f3ff] text-[#0d1b42] dark:bg-[#343949] dark:text-white"
                    }`}
                >
                  <h4 className="mb-2 text-[11px] font-medium">
                    Usage Limit
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <GraduationCap size={17} className="shrink-0 text-[#536bc5]" />
                      <span className="truncate text-[10px] sm:text-[11px]">
                        Students - {plan.students}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <Users size={16} className="shrink-0 text-[#536bc5]" />
                      <span className="truncate text-[10px] sm:text-[11px]">
                        Users - {plan.users}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Portals accordion */}
                <div
                  className={`mt-3 rounded-lg p-2.5 ${isSelected
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
                      const isExpanded = Boolean(expandedPortals[key]);

                      return (
                        <div
                          key={portal.name}
                          className={`overflow-hidden rounded-lg transition-colors ${isSelected
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
                              className={`shrink-0 transition-transform duration-300 ${isSelected ? "text-white" : "text-[#0d1b42] dark:text-white"
                                } ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                              }`}
                          >
                            <div className="overflow-hidden">
                              <ul className="space-y-2 px-3 pb-3 pt-1">
                                {portal.features.map((feature) => (
                                  <li
                                    key={feature}
                                    className="flex items-start gap-2 text-[10px] leading-relaxed opacity-90"
                                  >
                                    <Check size={12} className="mt-0.5 shrink-0 text-[#55bf82]" />
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
                  className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium transition-all duration-200 sm:text-xs ${isSelected
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
      )}
    </div>
  );
};

export default AvailablePlans;