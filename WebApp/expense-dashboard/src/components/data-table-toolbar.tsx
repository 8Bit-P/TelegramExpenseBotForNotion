import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { IconX, IconSearch, IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categories: { id: number; tipo: string }[];
}

export function DataTableToolbar<TData>({
  table,
  categories,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;

  // State for Date Range
  const [date, setDate] = React.useState<DateRange | undefined>();

  // Sync Date Range with Table Filters
  React.useEffect(() => {
    table
      .getColumn("date")
      ?.setFilterValue(date ? [date.from, date.to] : undefined);
  }, [date, table]);

    const tipoFilterValue = table.getColumn("tipo")?.getFilterValue() as string[] | undefined;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* 1. Search Bar */}
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search description..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-9 w-full pl-9 lg:w-[300px]"
          />
        </div>

        {/* 2. Multi-select Category Filter */}
        {table.getColumn("tipo") && (
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-dashed"
                >
                  Category
                  {tipoFilterValue && tipoFilterValue.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      {/* Mobile: Show count */}
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal lg:hidden"
                      >
                        {tipoFilterValue.length}
                      </Badge>

                      {/* Desktop: Show names or count */}
                      <div className="hidden space-x-1 lg:flex">
                        {tipoFilterValue.length > 2 ? (
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            {tipoFilterValue.length} selected
                          </Badge>
                        ) : (
                          categories
                            .filter((c) => tipoFilterValue.includes(c.tipo))
                            .map((c) => (
                              <Badge
                                variant="secondary"
                                key={c.tipo}
                                className="rounded-sm px-1 font-normal"
                              >
                                {c.tipo}
                              </Badge>
                            ))
                        )}
                      </div>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-2 flex flex-col gap-1">
                  {categories.map((category) => {
                    const isSelected = (
                      table.getColumn("tipo")?.getFilterValue() as string[]
                    )?.includes(category.tipo);
                    return (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 p-1 hover:bg-muted cursor-pointer rounded"
                        onClick={() => {
                          const currentValues =
                            (table
                              .getColumn("tipo")
                              ?.getFilterValue() as string[]) || [];
                          const nextValues = isSelected
                            ? currentValues.filter((v) => v !== category.tipo)
                            : [...currentValues, category.tipo];
                          table
                            .getColumn("tipo")
                            ?.setFilterValue(
                              nextValues.length ? nextValues : undefined
                            );
                        }}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 border rounded-sm flex items-center justify-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}
                        >
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </div>
                        <span className="text-sm">{category.tipo}</span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* 3. Date Range Picker */}
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                size="sm"
                className={cn(
                  "h-9 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <IconCalendar className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter(undefined);
              setDate(undefined);
            }}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <IconX className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
