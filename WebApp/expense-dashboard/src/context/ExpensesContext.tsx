import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Category, Expense } from "@/interfaces/expense.interface";

interface ExpensesContextType {
  expenses: Expense[];
  loadingExpenses: boolean;
  categories: Category[];
  loadingCategories: boolean;

  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: number, updated: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

      setLoadingExpenses(false);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");

      if (error) console.error(error);
      else {
        setCategories(data);
      }

      setLoadingCategories(false);
    };

    fetchExpenses();
    fetchCategories();
  }, []);

  const addExpense = async (expense: Omit<Expense, "id">) => {
    const { data, error } = await supabase
      .from("expenses")
      .insert([expense])
      .select()
      .single();

    if (error) throw error;

    setExpenses((prev) => [
      {
        ...data,
        date: new Date(data.date),
        creation_date: new Date(data.creation_date),
      },
      ...prev,
    ]);
  };

  const updateExpense = async (id: number, updated: Partial<Expense>) => {
    const { error } = await supabase
      .from("expenses")
      .update(updated)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp))
    );
  };

  const deleteExpense = async (id: number) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        loadingExpenses,
        categories,
        loadingCategories,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context)
    throw new Error("useExpenses must be used within ExpensesProvider");
  return context;
}
