export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: Date;
  creation_date: Date;
  account: number;
  expense: boolean;
  tipo: string;
}

export interface Category {
  id: number;
  tipo: string;
  description: string;
}

export interface TotalExpense {
  amount: number;
  trendingPercentage: number;
}

export interface WeeklyAverage {
  amount: number;
  trendingPercentage: number;
}
export interface HighestCategory {
  amount: number;
  categoryName: string;
  trendingPercentage: number;
}
export interface MonthIncome {
  amount: number;
  trendingPercentage: number;
  numberOfSources: number;
}
