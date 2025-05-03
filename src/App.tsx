import { useEffect } from "react";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AdminGuard } from "./components/admin/AdminGuard";
import { supabase } from "@/lib/supabase";
import { initializeAdminUser } from "@/utils/adminAuthUtils";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CreateAgent from "./pages/CreateAgent";
import Agents from "./pages/Agents";
import AgentAnalytics from "./pages/AgentAnalytics";
import Checkout from "./pages/Checkout";
import PlanCheckout from "./pages/PlanCheckout";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAdministrators from "./pages/admin/AdminAdministrators";
import AdminGroups from "./pages/admin/AdminGroups";
import AdminSettings from "./pages/admin/AdminSettings";
import { initializeUserEmail } from "./services/user/userService";
import { initializeUserPlan } from "./services/plan/userPlanService";
import WhatsAppFloatingButton from "./components/ui/WhatsAppFloatingButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  // Initialize user email and plan on app load
  // This is for the transition period until we fully migrate to Supabase
  useEffect(() => {
    const userEmail = initializeUserEmail();
    initializeUserPlan(userEmail);
  }, []);

  // Initialize admin user
  useEffect(() => {
    initializeAdminUser();
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <AdminAuthProvider>
                {/* Add both toast providers */}
                <ShadcnToaster />
                <SonnerToaster />
                
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* User routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-agent" element={<CreateAgent />} />
                  <Route path="/edit-agent/:agentId" element={<CreateAgent />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/my-agents" element={<Navigate to="/agents" replace />} />
                  <Route path="/agent-analytics/:agentId" element={<AgentAnalytics />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/plan-checkout" element={<PlanCheckout />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/update-email" element={<Dashboard />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                  <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                  <Route path="/admin/plans" element={<AdminGuard><AdminPlans /></AdminGuard>} />
                  <Route path="/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />
                  <Route path="/admin/administrators" element={<AdminGuard><AdminAdministrators /></AdminGuard>} />
                  <Route path="/admin/groups" element={<AdminGuard><AdminGroups /></AdminGuard>} />
                  <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AdminAuthProvider>
              <WhatsAppFloatingButton />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
