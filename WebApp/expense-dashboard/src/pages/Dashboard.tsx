import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { ChartBarExpensesIncome } from "@/components/chart-bar-multiple";
import { DonutChartByCategory } from "@/components/DonutChartByCategory";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <SectionCards />
      <ChartBarExpensesIncome />
      <DonutChartByCategory />
      <DataTable />
    </div>
  );
}
