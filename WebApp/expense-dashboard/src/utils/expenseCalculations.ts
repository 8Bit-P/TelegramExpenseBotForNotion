import type {
  Expense,
  HighestCategory,
  MonthIncome,
  TotalExpense,
  WeeklyAverage,
} from "@/interfaces/expense.interface";

// Utility: Get previous month/year from a Date
function getPreviousMonthAndYear(date: Date = new Date()): {
  month: number;
  year: number;
} {
  const month = date.getMonth();
  const year = date.getFullYear();

  return month === 0
    ? { month: 11, year: year - 1 }
    : { month: month - 1, year };
}

// Utility: Filter expenses by type, month, year
function filterByMonth(
  expenses: Expense[],
  {
    month,
    year,
    isExpense,
  }: { month: number; year: number; isExpense: boolean }
): Expense[] {
  return expenses.filter(
    (e) =>
      e.expense === isExpense &&
      e.date.getMonth() === month &&
      e.date.getFullYear() === year
  );
}

// Utility: Safely calculate trending percentage
function calculateTrending(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Total Expense
export function calculateTotalExpense(expenses: Expense[]): TotalExpense {
  const now = new Date();
  const { month: prevMonth, year: prevYear } = getPreviousMonthAndYear(now);

  const currentMonthExpenses = filterByMonth(expenses, {
    month: now.getMonth(),
    year: now.getFullYear(),
    isExpense: true,
  });

  const prevMonthExpenses = filterByMonth(expenses, {
    month: prevMonth,
    year: prevYear,
    isExpense: true,
  });

  const currentTotal = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    amount: currentTotal,
    trendingPercentage: Math.round(calculateTrending(currentTotal, prevTotal)),
  };
}

// Weekly Average
export function calculateWeeklyAverage(expenses: Expense[]): WeeklyAverage {
  const now = new Date();
  const { month: prevMonth, year: prevYear } = getPreviousMonthAndYear(now);

  const currentMonthExpenses = filterByMonth(expenses, {
    month: now.getMonth(),
    year: now.getFullYear(),
    isExpense: true,
  });

  const prevMonthExpenses = filterByMonth(expenses, {
    month: prevMonth,
    year: prevYear,
    isExpense: true,
  });

  const currentAvg =
    currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0) / 4;
  const prevAvg = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0) / 4;

  return {
    amount: Math.round(currentAvg),
    trendingPercentage: Math.round(calculateTrending(currentAvg, prevAvg)),
  };
}

export function calculateHighestExpense(expenses: Expense[]): HighestCategory {
  const now = new Date();

  const currentMonthExpenses = filterByMonth(expenses, {
    month: now.getMonth(),
    year: now.getFullYear(),
    isExpense: true,
  });

  const currentTotal = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // Group expenses by category (fallback to "Uncategorized")
  const categoryTotals = new Map<string, number>();

  for (const e of currentMonthExpenses) {
    const category = e.tipo?.trim() || "Uncategorized";
    categoryTotals.set(
      category,
      (categoryTotals.get(category) ?? 0) + e.amount
    );
  }

  // Handle case: no expenses at all
  if (categoryTotals.size === 0) {
    return {
      amount: 0,
      categoryName: "None",
      trendingPercentage: 0,
    };
  }

  // Find the category with the highest total
  let maxCategory = "Uncategorized";
  let maxAmount = 0;

  for (const [category, amount] of categoryTotals.entries()) {
    if (amount > maxAmount) {
      maxCategory = category;
      maxAmount = amount;
    }
  }

  const trendingPercentage =
    currentTotal === 0 ? 0 : (maxAmount / currentTotal) * 100;

  return {
    amount: maxAmount,
    categoryName: maxCategory,
    trendingPercentage: Math.round(trendingPercentage),
  };
}

// Monthly Income
export function calculateMonthIncome(expenses: Expense[]): MonthIncome {
  const now = new Date();
  const { month: prevMonth, year: prevYear } = getPreviousMonthAndYear(now);

  const currentIncomes = filterByMonth(expenses, {
    month: now.getMonth(),
    year: now.getFullYear(),
    isExpense: false,
  });

  const prevIncomes = filterByMonth(expenses, {
    month: prevMonth,
    year: prevYear,
    isExpense: false,
  });

  const currentTotal = currentIncomes.reduce((sum, e) => sum + e.amount, 0);
  const prevTotal = prevIncomes.reduce((sum, e) => sum + e.amount, 0);

  return {
    amount: currentTotal,
    trendingPercentage: Math.round(calculateTrending(currentTotal, prevTotal)),
    numberOfSources: currentIncomes.length,
  };
}
