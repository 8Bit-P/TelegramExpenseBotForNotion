import * as React from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useExpenses } from "@/context/ExpensesContext";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Expense } from "@/interfaces/expense.interface";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function TableCellViewer({ item }: { item: Expense }) {
  const isMobile = useIsMobile();
  const { categories, updateExpense } = useExpenses();

  const [formData, setFormData] = React.useState({ ...item });
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false); // Controlled drawer

  const handleChange = (key: keyof Expense, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData: Expense = {
        ...formData,
        date: new Date(formData.date),
        creation_date: new Date(formData.creation_date),
      };
      await updateExpense(item.id, updatedData);
      setOpen(false); // Close drawer after successful save
    } catch (e) {
      console.error("Failed to update expense:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          onClick={() => setOpen(true)}
        >
          {item.description}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.description}</DrawerTitle>
          <DrawerDescription>Edit Expense</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            {/* Description */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    handleChange("amount", parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={new Date(formData.date).toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleChange("date", new Date(e.target.value))
                  }
                />
              </div>
            </div>

            {/* Created At */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="creation_date">Created At</Label>
                <Input
                  id="creation_date"
                  type="date"
                  value={
                    new Date(formData.creation_date).toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    handleChange("creation_date", new Date(e.target.value))
                  }
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="tipo">Category</Label>
              <Select
                value={formData.tipo}
                onValueChange={(val) => handleChange("tipo", val)}
              >
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.tipo}>
                      {cat.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expense Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Checkbox
                id="expense"
                checked={formData.expense}
                onCheckedChange={(checked) =>
                  handleChange("expense", !!checked)
                }
              />
              <label htmlFor="expense" style={{ fontSize: "14px" }}>
                Is this an expense?
              </label>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button
            onClick={handleSave}
            className="w-full !text-gray-900 hover:!bg-gray-200 focus:outline-none focus:ring-0 focus:border-transparent"
            variant="outline"
            style={{
              backgroundColor: "#d9d9d9ff",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>

          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}