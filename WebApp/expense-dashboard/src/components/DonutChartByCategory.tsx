"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenses } from "@/context/ExpensesContext";
import type { Expense } from "@/interfaces/expense.interface";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

type TimeRange = "month" | "quarter" | "year";

function getCategoryData(expenses: Expense[], range: TimeRange) {
  const now = new Date();
  const year = now.getFullYear();

  const filtered = expenses.filter((exp) => {
    const d = new Date(exp.date);
    const sameYear = d.getFullYear() === year;
    if (!sameYear || !exp.expense) return false;

    const month = d.getMonth();
    const quarter = Math.floor(month / 3);
    const currentQuarter = Math.floor(now.getMonth() / 3);

    if (range === "month") {
      return month === now.getMonth();
    }

    if (range === "quarter") {
      return quarter === currentQuarter;
    }

    return true;
  });

  const grouped: Record<string, number> = {};

  for (const exp of filtered) {
    grouped[exp.tipo] = (grouped[exp.tipo] || 0) + exp.amount;
  }

  const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

  return Object.entries(grouped).map(([category, value], idx) => ({
    name: category,
    value,
    percent: total ? ((value / total) * 100).toFixed(1) : "0.0",
    color: COLORS[idx % COLORS.length],
  }));
}

export function DonutChartByCategory() {
  const { expenses, loadingExpenses } = useExpenses();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("year");

  const categoryData = getCategoryData(expenses, timeRange);

  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          {timeRange === "month"
            ? "This Month"
            : timeRange === "quarter"
            ? "This Quarter"
            : "This Year"}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val as TimeRange)}
            variant="outline"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
            <ToggleGroupItem value="quarter">Quarter</ToggleGroupItem>
            <ToggleGroupItem value="year">Year</ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val as TimeRange)}
          >
            <SelectTrigger className="sm:hidden w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        {loadingExpenses ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : categoryData.length === 0 ? (
          <p className="text-muted-foreground text-sm">No expenses found.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-full h-100 sm:w-1/2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    outerRadius={isMobile ? 100 : 180}
                    paddingAngle={0}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value.toFixed(2)} €`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {categoryData
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((entry, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium">{entry.name}</span>
                    <span className="text-muted-foreground ml-auto">
                      {entry.percent}% – {entry.value.toFixed(2)} €
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
