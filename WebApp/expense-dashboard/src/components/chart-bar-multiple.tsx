"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useExpenses } from "@/context/ExpensesContext";
import type { Expense } from "@/interfaces/expense.interface";

type TimeRange = "month" | "quarter" | "year";

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

function getChartData(expenses: Expense[], range: TimeRange) {
  const now = new Date();
  const year = now.getFullYear();

  // Filter based on time range
  const filtered = expenses.filter((exp) => {
    const d = new Date(exp.date);
    const sameYear = d.getFullYear() === year;

    if (!sameYear) return false;

    const month = d.getMonth();
    const quarter = Math.floor(month / 3);
    const currentQuarter = Math.floor(now.getMonth() / 3);

    if (range === "month") {
      return month === now.getMonth();
    }

    if (range === "quarter") {
      return quarter === currentQuarter;
    }

    return true; // range === "year"
  });

  // Sort oldest to newest
  const sorted = [...filtered].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Group by label
  const grouped: Record<string, { income: number; expenses: number }> = {};

  for (const entry of sorted) {
    const date = new Date(entry.date);
    const label =
      range === "month"
        ? date.toLocaleDateString("es-ES", {
            day: "numeric",
          })
        : date.toLocaleDateString("es-ES", {
            month: "short",
            year: range === "year" ? "2-digit" : undefined,
          });

    if (!grouped[label]) {
      grouped[label] = { income: 0, expenses: 0 };
    }

    if (entry.expense) {
      grouped[label].expenses += entry.amount;
    } else {
      grouped[label].income += entry.amount;
    }
  }

  return Object.entries(grouped).map(([label, values]) => ({
    label,
    ...values,
  }));
}

export function ChartBarExpensesIncome() {
  const { expenses, loadingExpenses } = useExpenses();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("quarter");

  const chartData = getChartData(expenses, timeRange);
  const onlyExpenses = timeRange === "month";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses / Income</CardTitle>
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
            onValueChange={(val) => {
              if (val) setTimeRange(val as TimeRange);
            }}
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
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dashed"
                    labelFormatter={(val) => val}
                    formatter={(value: unknown, name: unknown) => [
                      `${value} € `,
                      name as string,
                    ]}
                  />
                }
              />

              {!onlyExpenses && (
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
              )}
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
