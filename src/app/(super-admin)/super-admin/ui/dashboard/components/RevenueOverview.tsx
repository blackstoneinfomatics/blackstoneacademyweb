"use client"; 

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";


export type RevenueRange = "daily" | "weekly" | "monthly";

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface RevenueOverviewProps {

  data?: Partial<Record<RevenueRange, RevenuePoint[]>>;

  fetchRevenue?: (
    range: RevenueRange,
    signal: AbortSignal
  ) => Promise<RevenuePoint[]>;
  defaultRange?: RevenueRange;
  onRangeChange?: (range: RevenueRange) => void;
  scale?: "log" | "linear";
  locale?: string;
  currencySymbol?: string;
  formatAxisValue?: (value: number) => string;
  formatValue?: (value: number) => string;
  className?: string;
}


const DEMO_DATA: Record<RevenueRange, RevenuePoint[]> = {
  monthly: [
    { label: "January", value: 31500 },
    { label: "February", value: 72000 },
    { label: "March", value: 168000 },
    { label: "April", value: 305000 },
    { label: "May", value: 214800 },
    { label: "June", value: 213097.45 },
    { label: "July", value: 220342.76 },
    { label: "August", value: 352000 },
    { label: "September", value: 431000 },
    { label: "October", value: 438500 },
    { label: "November", value: 690000 },
    { label: "December", value: 1015000 },
  ],
  weekly: [
    { label: "Week 21", value: 38000 },
    { label: "Week 22", value: 61000 },
    { label: "Week 23", value: 54000 },
    { label: "Week 24", value: 95000 },
    { label: "Week 25", value: 88000 },
    { label: "Week 26", value: 131000 },
    { label: "Week 27", value: 176000 },
    { label: "Week 28", value: 205000 },
    { label: "Week 29", value: 310000 },
    { label: "Week 30", value: 520000 },
  ],
  daily: [
    { label: "16 July", value: 9200 },
    { label: "17 July", value: 13400 },
    { label: "18 July", value: 11800 },
    { label: "19 July", value: 19600 },
    { label: "20 July", value: 24500 },
    { label: "21 July", value: 22800 },
    { label: "22 July", value: 21900 },
    { label: "23 July", value: 33000 },
    { label: "24 July", value: 31200 },
    { label: "25 July", value: 44000 },
    { label: "26 July", value: 41500 },
    { label: "27 July", value: 58000 },
    { label: "28 July", value: 69000 },
    { label: "29 July", value: 95800 },
  ],
};

const RANGES: { key: RevenueRange; label: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "weekly", label: "Weekly" },
  { key: "daily", label: "Daily" },
];

/* -------------------------------------------------------------------------- */
/*  Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

const VIEW_W = 700;
const VIEW_H = 380;
const PAD_X = 0;
/** Plot band inside the 190px box — 48/380 ≈ the original `top-6` inset. */
const PLOT_TOP = 48;
const PLOT_BOTTOM = 372;

const TICK_SERIES_PRIMARY = [1, 2, 5];
const TICK_SERIES_FALLBACK = [1, 1.5, 2, 3, 4, 5, 6, 8];

function logTicks(lo: number, hi: number, count = 4): number[] {
  const build = (series: number[]) => {
    const out: number[] = [];
    const from = Math.floor(Math.log10(lo)) - 1;
    const to = Math.ceil(Math.log10(hi)) + 1;
    for (let e = from; e <= to; e++) {
      for (const s of series) {
        const v = s * Math.pow(10, e);
        if (v >= lo && v <= hi) out.push(v);
      }
    }
    return out.sort((a, b) => a - b);
  };

  let ticks = build(TICK_SERIES_PRIMARY);
  if (ticks.length < count) ticks = build(TICK_SERIES_FALLBACK);
  if (ticks.length === 0) return [lo, hi];
  return ticks.slice(Math.max(0, ticks.length - count));
}

function linearTicks(lo: number, hi: number, count = 4): number[] {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / (count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
    out.push(Number(v.toPrecision(12)));
  }
  return out.slice(0, count);
}

function buildScale(values: number[], scale: "log" | "linear") {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!isFinite(min) || !isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    min = min === 0 ? 0 : min * 0.9;
    max = max === 0 ? 1 : max * 1.1;
  }

  const useLog = scale === "log" && min > 0;
  const lo = useLog ? min * 0.9 : Math.max(0, min - (max - min) * 0.15);
  const hi = useLog ? max * 1.08 : max + (max - min) * 0.12;
  const d0 = useLog ? Math.log10(lo) : lo;
  const d1 = useLog ? Math.log10(hi) : hi;

  const toY = (value: number) => {
    const v = useLog ? Math.log10(Math.max(value, 1e-9)) : value;
    const t = d1 === d0 ? 0.5 : (v - d0) / (d1 - d0);
    return PLOT_BOTTOM - t * (PLOT_BOTTOM - PLOT_TOP);
  };

  return { toY, ticks: useLog ? logTicks(lo, hi) : linearTicks(lo, hi) };
}

/** Fritsch–Carlson monotone cubic — keeps plateaus flat and never overshoots. */
function monotonePath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x || 1e-6;
    slope[i] = (pts[i + 1].y - pts[i].y) / dx[i];
  }

  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) {
      m[i] = 0;
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d +=
      ` C${pts[i].x + h},${pts[i].y + h * m[i]}` +
      ` ${pts[i + 1].x - h},${pts[i + 1].y - h * m[i + 1]}` +
      ` ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function RevenueOverview({
  data,
  fetchRevenue,
  defaultRange = "monthly",
  onRangeChange,
  scale = "log",
  locale = "en-US",
  currencySymbol = "$",
  formatAxisValue,
  formatValue,
  className = "",
}: RevenueOverviewProps) {
  const uid = useId().replace(/:/g, "");

  const [range, setRange] = useState<RevenueRange>(defaultRange);
  const [points, setPoints] = useState<RevenuePoint[]>(
    () => data?.[defaultRange] ?? DEMO_DATA[defaultRange]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const fetchRef = useRef(fetchRevenue);
  useEffect(() => {
    fetchRef.current = fetchRevenue;
  });

  /* ---------------------------- data binding ----------------------------- */

  const provided = data?.[range];

  useEffect(() => {
    setHoverIndex(null);

    if (provided) {
      setPoints(provided);
      setError(null);
      setLoading(false);
      return;
    }

    const load = fetchRef.current;
    if (!load) {
      setPoints(DEMO_DATA[range]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);

    load(range, controller.signal)
      .then((result) => {
        if (!active) return;
        setPoints(Array.isArray(result) ? result : []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active || (err as Error)?.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Couldn't load revenue data"
        );
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [range, provided, retryKey]);

  /* ------------------------------ formatting ----------------------------- */

  const fmtAxis = useCallback(
    (v: number) =>
      formatAxisValue
        ? formatAxisValue(v)
        : currencySymbol +
          new Intl.NumberFormat(locale, {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(v),
    [formatAxisValue, currencySymbol, locale]
  );

  const fmtValue = useCallback(
    (v: number) =>
      formatValue
        ? formatValue(v)
        : new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(v),
    [formatValue, locale]
  );

  /* ------------------------------- geometry ------------------------------ */

  const geom = useMemo(() => {
    if (points.length === 0) {
      return {
        coords: [] as { x: number; y: number }[],
        path: "",
        areaPath: "",
        ticks: [] as number[],
        toY: () => 0,
      };
    }
    const { toY, ticks } = buildScale(
      points.map((p) => p.value),
      scale
    );
    const n = points.length;
    const width = VIEW_W - PAD_X * 2;
    const coords = points.map((p, i) => ({
      x: n === 1 ? VIEW_W / 2 : PAD_X + (i / (n - 1)) * width,
      y: toY(p.value),
    }));
    const path = monotonePath(coords);
    const first = coords[0];
    const last = coords[coords.length - 1];
    // Close the curve down to the baseline so the stripes can be clipped to it.
    const areaPath = path
      ? `${path} L${last.x},${VIEW_H} L${first.x},${VIEW_H} Z`
      : "";

    return { coords, path, areaPath, ticks, toY };
  }, [points, scale]);

  const defaultIndex = points.length
    ? Math.round((points.length - 1) * 0.55)
    : 0;
  const activeIndex = clamp(
    hoverIndex ?? defaultIndex,
    0,
    Math.max(0, points.length - 1)
  );
  const activePoint = points[activeIndex];
  const activeCoord = geom.coords[activeIndex];

  const delta = useMemo(() => {
    if (!activePoint || activeIndex === 0) return null;
    const prev = points[activeIndex - 1]?.value;
    if (!prev) return null;
    return ((activePoint.value - prev) / Math.abs(prev)) * 100;
  }, [activePoint, activeIndex, points]);

  /* ------------------------------ interaction ---------------------------- */

  const indexFromClientX = useCallback(
    (clientX: number, rect: DOMRect) => {
      if (points.length < 2) return 0;
      const ratio = (clientX - rect.left) / rect.width;
      const t = (ratio * VIEW_W - PAD_X) / (VIEW_W - PAD_X * 2);
      return clamp(Math.round(t * (points.length - 1)), 0, points.length - 1);
    },
    [points.length]
  );

  const handlePointer = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoverIndex(
      indexFromClientX(e.clientX, e.currentTarget.getBoundingClientRect())
    );
  };

  const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    setHoverIndex(
      indexFromClientX(touch.clientX, e.currentTarget.getBoundingClientRect())
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowLeft" ? -1 : 1;
    setHoverIndex((prev) =>
      clamp((prev ?? defaultIndex) + step, 0, points.length - 1)
    );
  };

  /* -------------------------------- dropdown ----------------------------- */

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const selectRange = (next: RevenueRange) => {
    setMenuOpen(false);
    if (next === range) return;
    setRange(next);
    onRangeChange?.(next);
  };

  const activeLabel =
    RANGES.find((r) => r.key === range)?.label ?? "Monthly";

  /* --------------------------- tooltip placement ------------------------- */

  const xPct = activeCoord ? (activeCoord.x / VIEW_W) * 100 : 50;
  const yPct = activeCoord ? (activeCoord.y / VIEW_H) * 100 : 50;
  const tooltipBelow = yPct < 20;
  const translateX =
    xPct < 18 ? "-12%" : xPct > 82 ? "-88%" : "-50%";

  return (
    <div
      className={`w-full max-w-full rounded-[18px] bg-white p-5 text-slate-900 shadow-sm ring-1 ring-slate-900/5 transition-colors dark:bg-[#343434] dark:text-white dark:ring-white/10 ${className}`}
    >
      {/* ------------------------------ header ------------------------------ */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-semibold tracking-tight">
          Revenue Overview
        </h2>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-[#8178F9] dark:bg-[#2c2c2c] dark:text-slate-200 dark:hover:bg-[#3a3a3a]"
          >
            {activeLabel}
            <svg
              viewBox="0 0 10 6"
              aria-hidden="true"
              className={`h-[6px] w-[10px] transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M1 1l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {menuOpen && (
            <ul
              role="listbox"
              aria-label="Select time range"
              className="absolute right-0 top-full z-40 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#2c2c2c]"
            >
              {RANGES.map((option) => {
                const selected = option.key === range;
                return (
                  <li key={option.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectRange(option.key)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        selected
                          ? "bg-[#8178F9]/10 text-[#6b60f0] dark:bg-[#8178F9]/20 dark:text-[#b3adfb]"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                      }`}
                    >
                      {option.label}
                      {selected && (
                        <svg viewBox="0 0 12 10" className="h-[10px] w-3">
                          <path
                            d="M1 5l3.2 3.2L11 1.4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ------------------------------- chart ------------------------------ */}
      <div className="relative h-[190px] select-none">
        {/* grid lines */}
        <div className="absolute inset-0">
          {geom.ticks.map((tick) => (
            <div
              key={`grid-${tick}`}
              className="absolute left-0 right-0 border-t border-dashed border-slate-200 dark:border-white/10"
              style={{ top: `${(geom.toY(tick) / VIEW_H) * 100}%` }}
            />
          ))}
        </div>

        {/* y axis labels */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10">
          {geom.ticks.map((tick) => (
            <span
              key={`tick-${tick}`}
              className="absolute -translate-y-1/2 text-[11px] font-medium text-slate-500 dark:text-slate-400"
              style={{ top: `${(geom.toY(tick) / VIEW_H) * 100}%` }}
            >
              {fmtAxis(tick)}
            </span>
          ))}
        </div>

        {/* curve + striped block */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible text-[#978FED]"
        >
          <defs>
            <pattern
              id={`stripes-${uid}`}
              width="9"
              height={VIEW_H}
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2={VIEW_H}
                stroke="currentColor"
                strokeWidth="2"
              />
            </pattern>
            <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="50%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.3" />
            </linearGradient>
            <mask id={`mask-${uid}`}>
              <rect
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
                fill={`url(#fade-${uid})`}
              />
            </mask>
            <clipPath id={`area-${uid}`}>
              <path d={geom.areaPath || "M0,0"} />
            </clipPath>
          </defs>

          {geom.areaPath && (
            <g clipPath={`url(#area-${uid})`}>
              <rect
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
                fill={`url(#stripes-${uid})`}
                mask={`url(#mask-${uid})`}
                opacity="0.75"
              />
            </g>
          )}

          {geom.path && (
            <path
              d={geom.path}
              fill="none"
              stroke="#8178F9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* active marker */}
        {activeCoord && !loading && (
          <>
            <div
              className="pointer-events-none absolute bottom-0 z-10 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#8178F9] via-[#8178F9] to-[#8178F9]/20"
              style={{ left: `${xPct}%`, top: `${yPct}%` }}
            />
            <div
              className="pointer-events-none absolute z-20 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-[#8178F9] bg-white dark:bg-[#343434]"
              style={{ left: `${xPct}%`, top: `${yPct}%` }}
            />
          </>
        )}

        {/* tooltip */}
        {activePoint && !loading && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute z-30 whitespace-nowrap rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-slate-900/5 dark:bg-[#2c2c2c] dark:ring-white/10"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: `translate(${translateX}, ${
                tooltipBelow ? "14px" : "calc(-100% - 14px)"
              })`,
            }}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activePoint.label}
            </p>
            <div className="mt-0.5 flex items-center gap-4">
              <span className="text-lg font-semibold tabular-nums">
                {fmtValue(activePoint.value)}
              </span>
              {delta !== null && (
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-semibold tabular-nums ${
                    delta >= 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
                  }`}
                >
                  {delta >= 0 ? "+" : "−"}
                  {Math.abs(delta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* hover surface */}
        <div
          tabIndex={0}
          role="slider"
          aria-label={`Revenue, ${activeLabel.toLowerCase()}`}
          aria-valuemin={0}
          aria-valuemax={Math.max(0, points.length - 1)}
          aria-valuenow={activeIndex}
          aria-valuetext={
            activePoint
              ? `${activePoint.label}: ${fmtValue(activePoint.value)}`
              : undefined
          }
          onMouseMove={handlePointer}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={() => setHoverIndex(null)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 z-20 cursor-crosshair rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#8178F9]/60"
        />

        {/* loading / error / empty */}
        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px] dark:bg-[#343434]/70">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#8178F9] border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/85 text-center dark:bg-[#343434]/85">
            <p className="text-sm font-medium">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="rounded-lg bg-[#8178F9] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-lg text-sm text-slate-500 dark:text-slate-400">
            No revenue recorded for this period yet.
          </div>
        )}
      </div>
    </div>
  );
}