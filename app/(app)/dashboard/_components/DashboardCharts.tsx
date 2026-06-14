"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

const FALLBACK_THEME = {
  text: "#5f6b7a",
  textStrong: "#050505",
  grid: "#d5dee9",
  tooltipBg: "#ffffff",
  tooltipBorder: "#c7d2df",
  primary: "#1666db",
};

const CHART_COLORS = ["#1666db", "#0f6ff2", "#0ea5a8", "#f97316", "#eab308"];

type ExpenseData = { name: string; value: number }[];
type MonthlySpendData = { name: string; spend: number }[];

interface DashboardChartsProps {
  expenseData: ExpenseData;
  monthlySpend: MonthlySpendData;
}

function getThemeColors() {
  if (typeof window === "undefined") return FALLBACK_THEME;

  const styles = getComputedStyle(document.documentElement);
  return {
    text: styles.getPropertyValue("--on-surface-variant").trim() || FALLBACK_THEME.text,
    textStrong: styles.getPropertyValue("--on-surface").trim() || FALLBACK_THEME.textStrong,
    grid: styles.getPropertyValue("--outline-variant").trim() || FALLBACK_THEME.grid,
    tooltipBg: styles.getPropertyValue("--surface").trim() || FALLBACK_THEME.tooltipBg,
    tooltipBorder: styles.getPropertyValue("--border").trim() || FALLBACK_THEME.tooltipBorder,
    primary: styles.getPropertyValue("--primary").trim() || FALLBACK_THEME.primary,
  };
}

function formatCurrencyTooltip(value: ValueType | undefined) {
  return `฿${Number(value ?? 0).toLocaleString()}`;
}

export function DashboardCharts({
  expenseData,
  monthlySpend,
}: DashboardChartsProps) {
  const [themeColors, setThemeColors] = useState(FALLBACK_THEME);

  useEffect(() => {
    const syncColors = () => setThemeColors(getThemeColors());

    syncColors();

    const observer = new MutationObserver(syncColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  const pieLabelStyle = { fill: themeColors.textStrong, fontSize: 12, fontWeight: 600 };
  const legendStyle = { color: themeColors.textStrong };
  const tooltipStyle = {
    backgroundColor: themeColors.tooltipBg,
    borderColor: themeColors.tooltipBorder,
    borderRadius: "12px",
    color: themeColors.textStrong,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="glass-panel rounded-2xl border border-white/5 p-6">
        <h3 className="mb-6 font-display text-lg font-semibold">ค่าใช้จ่ายตามหมวดหมู่</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
                style={pieLabelStyle}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={formatCurrencyTooltip}
                contentStyle={tooltipStyle}
              />
              <Legend wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 p-6">
        <h3 className="mb-6 font-display text-lg font-semibold">แนวโน้มการใช้จ่าย (6 เดือนล่าสุด)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySpend}
              margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={themeColors.grid}
                vertical={false}
                opacity={0.85}
              />
              <XAxis
                dataKey="name"
                stroke={themeColors.text}
                tick={{ fill: themeColors.text, fontSize: 12 }}
                axisLine={{ stroke: themeColors.grid }}
                tickLine={{ stroke: themeColors.grid }}
              />
              <YAxis
                stroke={themeColors.text}
                tick={{ fill: themeColors.text, fontSize: 12 }}
                axisLine={{ stroke: themeColors.grid }}
                tickLine={{ stroke: themeColors.grid }}
                tickFormatter={(value: number) => `฿${Number(value) / 1000}k`}
                width={56}
              />
              <Tooltip
                formatter={formatCurrencyTooltip}
                contentStyle={tooltipStyle}
                cursor={{ fill: "rgba(22, 102, 219, 0.08)" }}
              />
              <Bar
                dataKey="spend"
                fill={themeColors.primary}
                radius={[6, 6, 0, 0]}
                name="งบประมาณที่ใช้"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
