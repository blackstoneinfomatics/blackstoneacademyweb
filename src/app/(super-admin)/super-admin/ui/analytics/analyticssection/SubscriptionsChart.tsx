"use client";
import React, { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Activity {
  date: string;
  type: string;
  activity: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  status: string;
  createdDate: string;
  planName?: string;
  refundStatus?: string;
  refundMethod?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    activities: Activity[];
  };
}

interface Segment {
  label: string;
  value: number;
  count: number;
  color: string;
}

// ─────────────────────────────────────────────
// Endpoint
// ─────────────────────────────────────────────
const API_URL =
  "http://localhost:5001/analytics/tenant-subscription-activities";

// ─────────────────────────────────────────────
// Palette
// ─────────────────────────────────────────────
const PALETTE = [
  "#4F46E5", // indigo
  "#F5A623", // orange
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
];

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────
const FALLBACK_SEGMENTS: Segment[] = [
  { label: "Premium", value: 40, count: 200, color: "#4F46E5" },
  { label: "Standard", value: 24, count: 200, color: "#F5A623" },
  { label: "Basic", value: 30, count: 200, color: "#22C55E" },
  { label: "Trial", value: 6, count: 200, color: "#3B82F6" },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const SubscriptionChart = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        if (!cancelled && json.success) {
          setActivities(json.data.activities ?? []);
          setTotal(json.data.total ?? 0);
        }
      } catch {
        if (!cancelled) setActivities([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Build segments ──
  const segments = useMemo<Segment[]>(() => {
    if (activities.length === 0) return FALLBACK_SEGMENTS;

    const planMap = new Map<string, Set<string>>();
    activities.forEach((a) => {
      const plan = a.plan || a.planName || "Unknown";
      if (!planMap.has(plan)) planMap.set(plan, new Set());
      planMap.get(plan)!.add(a.tenantId);
    });

    const counts = Array.from(planMap.entries()).map(([label, set]) => ({
      label,
      count: set.size,
    }));

    const sum = counts.reduce((s, c) => s + c.count, 0);
    if (sum === 0) return FALLBACK_SEGMENTS;

    return counts.map((c, i) => ({
      label: c.label,
      count: c.count,
      value: Math.round((c.count / sum) * 100),
      color: PALETTE[i % PALETTE.length],
    }));
  }, [activities]);

  // ── Conic gradient ──
  const gradientStops = useMemo(() => {
    let cumulative = 0;
    return segments
      .map((seg) => {
        const start = cumulative;
        cumulative += seg.value;
        return `${seg.color} ${start}% ${cumulative}%`;
      })
      .join(", ");
  }, [segments]);

  // ── Label positions ──
  const labels = useMemo(() => {
    const LABEL_RADIUS_PCT = 36.5;
    return segments.map((seg, i) => {
      const startValue = segments
        .slice(0, i)
        .reduce((sum, s) => sum + s.value, 0);
      const midValue = startValue + seg.value / 2;

      const angleDeg = midValue * 3.6 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;

      return {
        ...seg,
        xPct: 50 + LABEL_RADIUS_PCT * Math.cos(angleRad),
        yPct: 50 + LABEL_RADIUS_PCT * Math.sin(angleRad),
      };
    });
  }, [segments]);

  return (
    <div className="bg-white dark:bg-[#343434] rounded-[18px] p-4 sm:p-5 md:p-6 w-full dark:border dark:border-[#454545]">
      <h2 className="text-sm sm:text-base font-semibold text-[#111827] dark:text-white mb-4 sm:mb-6">
        Subscriptions
      </h2>

      <div className="flex flex-col-reverse items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* ── Legend — fixed height, scrolls silently if >4 ── */}
        <div
          className="
            w-full lg:w-auto
            lg:h-[215px]
            overflow-y-auto
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
            pr-1
          "
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 lg:flex lg:flex-col lg:space-y-4 lg:gap-0">
            {segments.map((seg) => (
              <div key={seg.label}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-[#111827] dark:text-white truncate">
                    {seg.label}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 ml-4 sm:ml-5">
                  {seg.count} ({seg.value}%)
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Donut ── */}
        <div className="relative w-full max-w-[215px] aspect-square flex-shrink-0 mx-auto lg:mx-0">
          <div
            className="w-full h-full rounded-full"
            style={{ background: `conic-gradient(${gradientStops})` }}
          />

          {/* Inner hole — matches card bg in both modes */}
          <div
            className="absolute rounded-full bg-white dark:bg-[#343434] flex flex-col items-center justify-center"
            style={{ inset: "23%" }}
          >
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#2F3A56] dark:text-white leading-none">
              100%
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              Total
            </span>
          </div>

          {labels.map((l) => (
            <span
              key={l.label}
              className="absolute text-white text-[10px] sm:text-[11px] font-bold pointer-events-none select-none"
              style={{
                left: `${l.xPct}%`,
                top: `${l.yPct}%`,
                transform: "translate(-50%, -50%)",
                lineHeight: 1,
              }}
            >
              {l.value}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionChart;