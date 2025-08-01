import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useExpenseStats } from "@/hooks/use-stats";

export function SectionCards() {
  const { totalExpenses, weeklyAverage, highestExpense, monthIncome } =
    useExpenseStats();

  // Badge for expenses/weekly average/highest category - inverted logic
  const ExpenseTrendingBadge = ({
    trendingPercentage,
  }: {
    trendingPercentage: number;
  }) => {
    const isUp = trendingPercentage >= 0;
    // Invert colors: Up is red, Down is green
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-sm">
        {isUp ? (
          <IconTrendingUp className="w-4 h-4 text-red-500" />
        ) : (
          <IconTrendingDown className="w-4 h-4 text-green-500" />
        )}
        {isUp ? "+" : ""}
        {trendingPercentage}%
      </Badge>
    );
  };

  // Badge for income - normal logic
  const IncomeTrendingBadge = ({
    trendingPercentage,
  }: {
    trendingPercentage: number;
  }) => {
    const isUp = trendingPercentage >= 0;
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-sm">
        {isUp ? (
          <IconTrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <IconTrendingDown className="w-4 h-4 text-red-500" />
        )}
        {isUp ? "+" : ""}
        {trendingPercentage}%
      </Badge>
    );
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Expenses */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalExpenses.amount.toFixed(2)} €
          </CardTitle>
          <CardAction>
            <ExpenseTrendingBadge
              trendingPercentage={totalExpenses.trendingPercentage}
            />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalExpenses.trendingPercentage >= 0
              ? "Trending up"
              : "Trending down"}{" "}
            this month{" "}
            {totalExpenses.trendingPercentage >= 0 ? (
              <IconTrendingUp className="size-4 text-red-500" />
            ) : (
              <IconTrendingDown className="size-4 text-green-500" />
            )}
          </div>
          <div className="text-muted-foreground">
            {totalExpenses.trendingPercentage}% from last month
          </div>
        </CardFooter>
      </Card>

      {/* Weekly Average */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Weekly average</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {weeklyAverage.amount.toFixed(2)} €
          </CardTitle>
          <CardAction>
            <ExpenseTrendingBadge
              trendingPercentage={weeklyAverage.trendingPercentage}
            />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {weeklyAverage.trendingPercentage >= 0 ? "Up" : "Down"}{" "}
            {Math.abs(weeklyAverage.trendingPercentage)}% this period{" "}
            {weeklyAverage.trendingPercentage >= 0 ? (
              <IconTrendingUp className="size-4 text-red-500" />
            ) : (
              <IconTrendingDown className="size-4 text-green-500" />
            )}
          </div>
          <div className="text-muted-foreground">
            {weeklyAverage.trendingPercentage}% from last week
          </div>
        </CardFooter>
      </Card>

      {/* Highest Category */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Highest Category</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {highestExpense.categoryName}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-sm"
            >
              {highestExpense.trendingPercentage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {highestExpense.trendingPercentage}% of total expense{" "}
          </div>
          <div className="text-muted-foreground">
            {highestExpense.amount.toFixed(2)} €
          </div>
        </CardFooter>
      </Card>

      {/* Income this month */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Income this month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {monthIncome.amount.toFixed(2)} €
          </CardTitle>
          <CardAction>
            <IncomeTrendingBadge
              trendingPercentage={monthIncome.trendingPercentage}
            />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {monthIncome.numberOfSources} separate source
            {monthIncome.numberOfSources !== 1 ? "s" : ""} of income
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
