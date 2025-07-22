import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Expense } from "@/interfaces/expense.interface";

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
}

const ExpensesContext = createContext<ExpensesContextType | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", oneYearAgo.toISOString())
        .order("date", { ascending: false });

      if (error) console.error(error);
      else {
        const formatted = (data ?? []).map((item) => ({
          ...item,
          date: new Date(item.date),
          creation_date: new Date(item.creation_date),
        }));
        setExpenses(formatted);
      }

      setLoading(false);
    };

    fetchExpenses();
  }, []);

  return (
    <ExpensesContext.Provider value={{ expenses, loading }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) throw new Error("useExpenses must be used within ExpensesProvider");
  return context;
}