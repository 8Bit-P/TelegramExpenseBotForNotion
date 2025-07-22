import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ExpensesContext = createContext(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState([]);
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
      else setExpenses(data ?? []);
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
  return useContext(ExpensesContext);
}
