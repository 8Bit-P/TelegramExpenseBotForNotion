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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
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
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import TableCellViewer from "./table-cell-viewer";
import { DraggableRow, DragHandle } from "./data-table-row";
import { DataTableToolbar } from "./data-table-toolbar";

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
    filterFn: (row, columnId, value) => {
      const rowValue = row.getValue(columnId) as string | Date;
      if (!rowValue) return false;

      const date = new Date(rowValue);
      const [start, end] =
        (value as [Date | undefined, Date | undefined]) || [];

      if (!start) return true;

      const adjustedStart = new Date(start);
      adjustedStart.setHours(0, 0, 0, 0);

      if (!end) {
        return date >= adjustedStart;
      }

      const adjustedEnd = new Date(end);
      adjustedEnd.setHours(23, 59, 59, 999);

      return date >= adjustedStart && date <= adjustedEnd;
    },
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
    accessorKey: "tipo",
    header: "Category",
    filterFn: "arrIncludesSome",
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

interface DataTableProps {
  view?: "expenses" | "dashboard";
}

export function DataTable({ view = "dashboard" }: DataTableProps) {
  const isExpenseView = view === "expenses";

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

  const [globalFilter, setGlobalFilter] = React.useState("");

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

  React.useEffect(() => {
    if (isExpenseView) {
      table.setPageSize(100);
      setColumnVisibility((prev) => ({
        ...prev,
        drag: false, // matches the 'id' in your columns definition
      }));
    } else {
      setColumnVisibility((prev) => ({
        ...prev,
        drag: true,
      }));
    }
  }, [isExpenseView]);

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
      globalFilter,
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
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    filterFns: {
      dateRange: (row, columnId, value) => {
        const date = new Date(row.getValue(columnId));
        const [start, end] = value;
        if (!start || !end) return true;
        return date >= start && date <= end;
      },
    },
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

  return (
    <>
      <div
        className={`flex flex-col px-4 lg:px-6 ${
          isExpenseView ? "h-full w-full gap-2 p-0" : "gap-6"
        }`}
      >
        {isExpenseView ? (
          <DataTableToolbar table={table} categories={categories} />
        ) : (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(true)}
            >
              <IconPlus />
              <span className="hidden lg:inline">Add Expense</span>
            </Button>
          </div>
        )}

        <div
          className={`overflow-auto border ${
            isExpenseView
              ? "flex-1 rounded-none border-t border-b border-x-0"
              : "rounded-lg"
          }`}
        >
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
              .rows // <--- You need to access the rows array here
              .filter((row) => row.original.expense === true)
              .reduce((sum, row) => sum + row.original.amount, 0)
              .toFixed(2)}{" "}
            € total expenses in current view.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            {!isExpenseView && (
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
            )}

            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div
              className={`flex items-center gap-2 justify-between ${
                isExpenseView ? "py-4" : ""
              }`}
            >
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
