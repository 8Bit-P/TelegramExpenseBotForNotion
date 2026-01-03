import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
      </Route>
    </Routes>
  );
}
