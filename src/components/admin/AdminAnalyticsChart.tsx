"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { AdminOrderRecord } from "@/lib/data/adminOrders";
import { formatPrice } from "@/lib/utils/formatters";

interface AdminAnalyticsChartProps {
  orders: AdminOrderRecord[];
}

export function AdminAnalyticsChart({ orders }: AdminAnalyticsChartProps) {
  const [chartMode, setChartMode] = useState<"revenue" | "volume">("revenue");
  const [timeRange, setTimeRange] = useState<"7days" | "30days">("7days");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        rangeDropdownRef.current &&
        !rangeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRangeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group orders by day
  const dataPoints = useMemo(() => {
    const daysCount = timeRange === "7days" ? 7 : 14;
    const points: {
      dateLabel: string;
      fullDate: string;
      revenue: number;
      ordersCount: number;
    }[] = [];

    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dateStr = targetDate.toISOString().slice(0, 10);
      const label = targetDate.toLocaleDateString("en-BD", {
        month: "short",
        day: "numeric",
      });

      // Find all orders created on this date
      const matchingOrders = orders.filter((o) => {
        const orderDateStr = new Date(o.createdAt).toISOString().slice(0, 10);
        return orderDateStr === dateStr;
      });

      const dayRevenue = matchingOrders.reduce(
        (sum, ord) => sum + ord.pricing.grandTotal,
        0
      );

      points.push({
        dateLabel: label,
        fullDate: targetDate.toLocaleDateString("en-BD", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        revenue: dayRevenue,
        ordersCount: matchingOrders.length,
      });
    }

    return points;
  }, [orders, timeRange]);

  const maxRevenue = useMemo(() => {
    const max = Math.max(...dataPoints.map((d) => d.revenue), 1000);
    return max * 1.15; // 15% breathing headroom
  }, [dataPoints]);

  const maxVolume = useMemo(() => {
    const max = Math.max(...dataPoints.map((d) => d.ordersCount), 5);
    return Math.ceil(max * 1.25);
  }, [dataPoints]);

  const totalPeriodRevenue = useMemo(() => {
    return dataPoints.reduce((sum, d) => sum + d.revenue, 0);
  }, [dataPoints]);

  const totalPeriodOrders = useMemo(() => {
    return dataPoints.reduce((sum, d) => sum + d.ordersCount, 0);
  }, [dataPoints]);

  // SVG Chart Geometry
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingY * 2;

  const pointsCoords = useMemo(() => {
    return dataPoints.map((pt, idx) => {
      const x =
        paddingX + (idx / Math.max(dataPoints.length - 1, 1)) * chartInnerWidth;
      const value = chartMode === "revenue" ? pt.revenue : pt.ordersCount;
      const maxValue = chartMode === "revenue" ? maxRevenue : maxVolume;
      const normalizedValue = Math.min(Math.max(value / maxValue, 0), 1);
      const y = paddingY + chartInnerHeight - normalizedValue * chartInnerHeight;
      return { x, y, pt, idx };
    });
  }, [dataPoints, chartMode, maxRevenue, maxVolume, chartInnerWidth, chartInnerHeight]);

  // Construct smooth bezier curve path
  const pathD = useMemo(() => {
    if (pointsCoords.length === 0) return "";
    let d = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
    for (let i = 0; i < pointsCoords.length - 1; i++) {
      const curr = pointsCoords[i];
      const next = pointsCoords[i + 1];
      const midX = (curr.x + next.x) / 2;
      d += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [pointsCoords]);

  // Construct area fill path
  const areaD = useMemo(() => {
    if (pointsCoords.length === 0) return "";
    const first = pointsCoords[0];
    const last = pointsCoords[pointsCoords.length - 1];
    const bottomY = paddingY + chartInnerHeight;
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [pathD, pointsCoords, chartInnerHeight]);

  return (
    <div className="bg-white rounded-3xl border border-brand-border/80 p-5 sm:p-7 shadow-2xs space-y-6" suppressHydrationWarning>
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" suppressHydrationWarning>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg sm:text-xl text-brand-charcoal">
              Sales & Order Analytics
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-brand-blush text-brand-primary text-[10px] font-bold uppercase tracking-wider">
              Live Trends
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time storefront checkout & transaction curves in Bangladeshi Taka (৳).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap" suppressHydrationWarning>
          {/* Mode Toggle: Revenue vs Volume */}
          <div className="inline-flex rounded-xl bg-[#FAF8F5] p-1 border border-brand-border/60">
            <button
              type="button"
              onClick={() => setChartMode("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === "revenue"
                  ? "bg-brand-primary text-white shadow-2xs"
                  : "text-zinc-600 hover:text-brand-charcoal"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Revenue (৳)</span>
            </button>

            <button
              type="button"
              onClick={() => setChartMode("volume")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                chartMode === "volume"
                  ? "bg-brand-primary text-white shadow-2xs"
                  : "text-zinc-600 hover:text-brand-charcoal"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Volume</span>
            </button>
          </div>

          {/* Custom Time Range Boutique Dropdown */}
          <div className="relative inline-block" ref={rangeDropdownRef} suppressHydrationWarning>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
              className="inline-flex items-center justify-between gap-2.5 bg-[#FAF8F5] border border-brand-border/80 text-brand-charcoal text-xs font-semibold rounded-xl px-3 py-1.5 hover:border-[#D4A373] transition-colors cursor-pointer shadow-2xs min-w-[125px]"
              aria-haspopup="listbox"
              aria-expanded={isRangeDropdownOpen}
            >
              <span>{timeRange === "7days" ? "Last 7 Days" : "Last 14 Days"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                  isRangeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isRangeDropdownOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-1.5 w-36 bg-white border border-[#EAE3DE] shadow-lg rounded-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                {[
                  { label: "Last 7 Days", value: "7days" as const },
                  { label: "Last 14 Days", value: "30days" as const },
                ].map((opt) => {
                  const isSelected = timeRange === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setTimeRange(opt.value);
                        setIsRangeDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#FAF7F5] text-[#4A1525] font-semibold"
                          : "text-[#240610] hover:bg-[#FAF7F5] font-normal"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A373]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-brand-border/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            {timeRange === "7days" ? "7-Day Revenue" : "14-Day Revenue"}
          </span>
          <span className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal block mt-0.5">
            {formatPrice(totalPeriodRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-brand-border/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            {timeRange === "7days" ? "7-Day Orders" : "14-Day Orders"}
          </span>
          <span className="font-serif text-lg sm:text-xl font-bold text-brand-primary block mt-0.5">
            {totalPeriodOrders} orders
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FCFAF8] border border-brand-border/60 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Average Order Value
          </span>
          <span className="font-serif text-lg sm:text-xl font-bold text-emerald-700 block mt-0.5">
            {formatPrice(
              totalPeriodOrders > 0
                ? Math.round(totalPeriodRevenue / totalPeriodOrders)
                : 0
            )}
          </span>
        </div>
      </div>

      {/* Interactive Responsive SVG Area Chart */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-60 overflow-visible"
        >
          <defs>
            {/* Soft Luxury Rose-Gold Linear Gradient */}
            <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B76E79" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#E8C5C8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFF5F7" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B76E79" />
              <stop offset="50%" stopColor="#D9828E" />
              <stop offset="100%" stopColor="#9C525D" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + chartInnerHeight * ratio;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="#EFEBE6"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Area */}
          <path d={areaD} fill="url(#analyticsGradient)" />

          {/* Curve Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Nodes */}
          {pointsCoords.map(({ x, y, pt, idx }) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-transform"
              >
                {/* Invisible hover target buffer */}
                <circle cx={x} cy={y} r="14" fill="transparent" />

                {/* Visible Ring Node */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "6" : "3.5"}
                  fill="#FFFFFF"
                  stroke="#B76E79"
                  strokeWidth={isHovered ? "3" : "2"}
                  className="transition-all duration-200"
                />

                {/* X Axis Date labels */}
                <text
                  x={x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-zinc-400 font-sans"
                >
                  {pt.dateLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip when hovering over a node */}
        {hoveredIndex !== null && pointsCoords[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-brand-charcoal text-white text-xs shadow-xl space-y-1 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${(pointsCoords[hoveredIndex].x / svgWidth) * 100}%`,
              top: "10%",
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-[10px] text-zinc-300 font-medium">
              {pointsCoords[hoveredIndex].pt.fullDate}
            </p>
            <div className="flex items-center gap-3 pt-0.5">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                  Revenue
                </span>
                <span className="font-serif font-bold text-sm text-brand-champagne-light">
                  {formatPrice(pointsCoords[hoveredIndex].pt.revenue)}
                </span>
              </div>
              <div className="pl-2 border-l border-zinc-700">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
                  Orders
                </span>
                <span className="font-bold text-sm text-white">
                  {pointsCoords[hoveredIndex].pt.ordersCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
