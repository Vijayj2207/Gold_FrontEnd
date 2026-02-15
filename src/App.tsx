import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

import Layout from "@/components/Layout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/UsersPage";
import UserDetails from "@/pages/UserDetails";
import DepositsPage from "@/pages/DepositsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import GoldPricePage from "@/pages/GoldPricePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/* ================= PROTECTED ROUTE ================= */

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

/* ================= ROUTES ================= */

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* PROTECTED */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />

      <Route
        path="/users"
        element={<ProtectedRoute><UsersPage /></ProtectedRoute>}
      />

      <Route
        path="/users/:id"
        element={<ProtectedRoute><UserDetails /></ProtectedRoute>}
      />

      <Route
        path="/deposits"
        element={<ProtectedRoute><DepositsPage /></ProtectedRoute>}
      />

      <Route
        path="/payments"
        element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>}
      />

      <Route
        path="/gold-price"
        element={<ProtectedRoute><GoldPricePage /></ProtectedRoute>}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/* ================= APP ROOT ================= */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>

          <Toaster />
          <Sonner />
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
