import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChartBarExpensesIncome } from "./components/chart-bar-multiple";
import LoginPage from "./components/login-page";
import { useAuth } from "./hooks/use-auth";
import { ExpensesProvider } from "./context/ExpensesContext";
import { FullPageLoader } from "./components/FullPageLoader";

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <FullPageLoader/>
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <ExpensesProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartBarExpensesIncome />
                </div>
                <DataTable/>
              </div>
            </div>
          </div>
        </SidebarInset>
      </ExpensesProvider>
    </SidebarProvider>
  );
}

export default App;
