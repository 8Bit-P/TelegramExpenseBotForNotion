// components/ExpenseDrawer.tsx
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { type Expense, type Category } from "@/interfaces/expense.interface"
import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useExpenses } from "@/context/ExpensesContext"

export function ExpenseDrawer({
  open,
  onOpenChange,
  initialData,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  initialData?: Partial<Expense>
}) {
  const isMobile = useIsMobile()
  const { addExpense, updateExpense, categories } = useExpenses()

  const isEditing = !!initialData?.id
  const [formData, setFormData] = React.useState<Partial<Expense>>({
    description: "",
    amount: 0,
    date: new Date(),
    creation_date: new Date(),
    account: 0,
    tipo: "",
    expense: true,
    ...initialData,
  })

  const [loading, setLoading] = React.useState(false)

  const handleChange = (key: keyof Expense, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (isEditing && initialData?.id) {
        await updateExpense(initialData.id, formData as Expense)
      } else {
        await addExpense(formData as Expense)
      }
      onOpenChange(false)
    } catch (e) {
      console.error("Save failed:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DrawerTitle>
          <DrawerDescription>
            {isEditing ? "Modify this expense entry." : "Create a new expense."}
          </DrawerDescription>
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
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={new Date(formData.date!).toISOString().split("T")[0]}
                  onChange={(e) => handleChange("date", new Date(e.target.value))}
                />
              </div>
            </div>

            {/* Account & Creation Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="account">Account</Label>
                <Input
                  id="account"
                  type="number"
                  value={formData.account}
                  onChange={(e) => handleChange("account", parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="creation_date">Created At</Label>
                <Input
                  id="creation_date"
                  type="date"
                  value={new Date(formData.creation_date!).toISOString().split("T")[0]}
                  onChange={(e) => handleChange("creation_date", new Date(e.target.value))}
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="tipo">Category</Label>
              <Select value={formData.tipo} onValueChange={(val) => handleChange("tipo", val)}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.tipo}>
                      {cat.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expense Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="expense"
                checked={formData.expense as boolean}
                onCheckedChange={(checked) => handleChange("expense", !!checked)}
              />
              <label htmlFor="expense" className="text-sm">
                Is this an expense?
              </label>
            </div>
          </form>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            className="w-full !text-gray-900 hover:!bg-gray-200"
            variant="outline"
            style={{ backgroundColor: "#d9d9d9ff", border: "none" }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
