import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ExpensesProvider } from "./context/ExpensesContext";
import { useAuth } from "./hooks/use-auth";
import LoginPage from "./components/login-page";
import { FullPageLoader } from "./components/FullPageLoader";

function App() {
  const { session, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!session) return <LoginPage />;

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
          <div className="flex flex-1 flex-col p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </ExpensesProvider>
    </SidebarProvider>
  );
}

export default App;
