import { useExpenses } from "@/context/ExpensesContext";
import type {
  HighestCategory,
  MonthIncome,
  TotalExpense,
  WeeklyAverage,
} from "@/interfaces/expense.interface";
import {
  calculateHighestExpense,
  calculateMonthIncome,
  calculateTotalExpense,
  calculateWeeklyAverage,
} from "@/utils/expenseCalculations";
import { useEffect, useState } from "react";

export function useExpenseStats() {
  const { expenses } = useExpenses();

  const [totalExpenses, setTotalExpense] = useState<TotalExpense>({
    amount: 0,
    trendingPercentage: 0,
  });

  const [weeklyAverage, setWeeklyAverage] = useState<WeeklyAverage>({
    amount: 0,
    trendingPercentage: 0,
  });

  const [highestExpense, setHighestExpense] = useState<HighestCategory>({
    amount: 0,
    categoryName: "Category",
    trendingPercentage: 0,
  });

  const [monthIncome, setMonthIncome] = useState<MonthIncome>({
    amount: 0,
    trendingPercentage: 0,
    numberOfSources: 0,
  });

  useEffect(() => {
    setTotalExpense(calculateTotalExpense(expenses));
    setWeeklyAverage(calculateWeeklyAverage(expenses));
    setHighestExpense(calculateHighestExpense(expenses));
    setMonthIncome(calculateMonthIncome(expenses));
  }, [expenses]);

  return {
    totalExpenses,
    weeklyAverage,
    highestExpense,
    monthIncome,
  };
}
