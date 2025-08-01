import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconPlus,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Expense } from "@/interfaces/expense.interface";
import { useExpenses } from "@/context/ExpensesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ExpenseDrawer } from "./ExpenseDrawer";

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<Expense>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.amount.toFixed(2)} €
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.date).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "creation_date",
    header: "Created At",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.creation_date).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }) => <div>{row.original.account}</div>,
  },
  {
    accessorKey: "tipo",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.tipo}
      </Badge>
    ),
  },
  {
    accessorKey: "expense",
    header: "Is Expense?",
    cell: ({ row }) => (
      <Badge variant={row.original.expense ? "destructive" : "secondary"}>
        {row.original.expense ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { deleteExpense } = useExpenses();
      const id = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await deleteExpense(id);
                } catch (err) {
                  console.error("Failed to delete:", err);
                }
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function DraggableRow({ row }: { row: Row<Expense> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable() {
  const [data, setData] = React.useState<Expense[]>([]);
  const [filteredCategory, setFilteredCategory] = React.useState<string | null>(
    null
  );
  const { expenses, categories } = useExpenses();

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    setData(
      filteredCategory
        ? expenses.filter((expense) => expense.tipo === filteredCategory)
        : expenses
    );
  }, [expenses, filteredCategory]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    manualPagination: false,
    autoResetPageIndex: false,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  /* TODO: add sort by  */
  return (
    <>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) =>
                setFilteredCategory(value === "all" ? null : value)
              }
              defaultValue="all"
            >
              <SelectTrigger className="w-48" id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.tipo}>
                    {cat.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* TODO: add expense logic */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            <IconPlus />
            <span className="hidden lg:inline">Add Expense</span>
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table
              .getRowModel()
              .rows.reduce((sum, e) => sum + e.original.amount, 0)
              .toFixed(2)}{" "}
            € total in current view.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="min-w-[4rem]"
                  id="rows-per-page"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ExpenseDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

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

            {/* Created At & Account */}
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
              <div className="flex flex-col gap-3">
                <Label htmlFor="account">Account</Label>
                <Input
                  id="account"
                  type="number"
                  value={formData.account}
                  onChange={(e) =>
                    handleChange("account", parseInt(e.target.value))
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
