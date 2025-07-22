"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// --------------------------
// 1. Example Registry Shape
// --------------------------

type Registry = {
  id: string
  description: string
  amount: number
  date: string // ISO format
  account: number
  expense: boolean
  type: string
}

// --------------------------
// 2. Mock Data
// --------------------------

const mockRegistries: Registry[] = [
  {
    id: "1",
    description: "Freelance",
    amount: 2000,
    date: "2024-05-01",
    account: 1,
    expense: false,
    type: "income",
  },
  {
    id: "2",
    description: "Groceries",
    amount: 400,
    date: "2024-05-02",
    account: 1,
    expense: true,
    type: "food",
  },
  {
    id: "3",
    description: "Consulting",
    amount: 1200,
    date: "2024-06-11",
    account: 1,
    expense: false,
    type: "income",
  },
  {
    id: "4",
    description: "Utilities",
    amount: 230,
    date: "2024-06-12",
    account: 1,
    expense: true,
    type: "bills",
  },
  {
    id: "5",
    description: "Bonus",
    amount: 800,
    date: "2024-07-01",
    account: 1,
    expense: false,
    type: "bonus",
  },
  {
    id: "6",
    description: "Rent",
    amount: 1000,
    date: "2024-07-05",
    account: 1,
    expense: true,
    type: "housing",
  },
]

// --------------------------
// 3. ChartConfig Style
// --------------------------

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--primary)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--muted)",
  },
} satisfies ChartConfig

// --------------------------
// 4. Data Grouper
// --------------------------

function groupRegistries(
  registries: Registry[],
  range: "30d" | "180d" | "365d"
) {
  const today = new Date("2024-07-22")
  const daysBack = range === "30d" ? 30 : range === "180d" ? 180 : 365
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - daysBack)

  const filtered = registries.filter((r) => new Date(r.date) >= startDate)

  const grouped: Record<string, { income: number; expenses: number }> = {}

  for (const entry of filtered) {
    const date = new Date(entry.date)
    const label =
      daysBack <= 30
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })

    if (!grouped[label]) {
      grouped[label] = { income: 0, expenses: 0 }
    }

    if (entry.expense) {
      grouped[label].expenses += entry.amount
    } else {
      grouped[label].income += entry.amount
    }
  }

  return Object.entries(grouped).map(([label, values]) => ({
    label,
    ...values,
  }))
}

// --------------------------
// 5. Component
// --------------------------

export function ChartBarExpensesIncome() {
  const [timeRange, setTimeRange] = React.useState<"30d" | "180d" | "365d">("180d")

  const chartData = groupRegistries(mockRegistries, timeRange)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses / Income</CardTitle>
        <CardDescription>
          {timeRange === "30d"
            ? "Last 30 days"
            : timeRange === "180d"
            ? "Last 6 months"
            : "Last 12 months"}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => {
              if (val) setTimeRange(val as "30d" | "180d" | "365d")
            }}
            variant="outline"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="30d">1M</ToggleGroupItem>
            <ToggleGroupItem value="180d">6M</ToggleGroupItem>
            <ToggleGroupItem value="365d">12M</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as "30d" | "180d" | "365d")}>
            <SelectTrigger className="sm:hidden w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="180d">Last 6 months</SelectItem>
              <SelectItem value="365d">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
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
                />
              }
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={4}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

    
    </Card>
  )
}
