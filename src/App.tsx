import { useEffect } from "react";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
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
import { initializeUserEmail } from "./services/user/userService";
import { initializeUserPlan } from "./services/plan/userPlanService";
import WhatsAppFloatingButton from "./components/ui/WhatsAppFloatingButton";
import { adminRoutes } from "./routes/adminRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function RequireUserOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  // Enquanto carrega, não renderiza nada
  if (isLoading) return null;
  // Se for admin, redireciona para o painel admin
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  // Se não for admin, renderiza normalmente
  return <>{children}</>;
}

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
                  
                  {/* User routes protegidas: só renderiza se NÃO for admin */}
                  <Route path="/dashboard" element={<RequireUserOnly><Dashboard /></RequireUserOnly>} />
                  <Route path="/create-agent" element={<RequireUserOnly><CreateAgent /></RequireUserOnly>} />
                  <Route path="/edit-agent/:agentId" element={<RequireUserOnly><CreateAgent /></RequireUserOnly>} />
                  <Route path="/agents" element={<RequireUserOnly><Agents /></RequireUserOnly>} />
                  <Route path="/my-agents" element={<RequireUserOnly><Navigate to="/agents" replace /></RequireUserOnly>} />
                  <Route path="/agent-analytics/:agentId" element={<RequireUserOnly><AgentAnalytics /></RequireUserOnly>} />
                  <Route path="/checkout" element={<RequireUserOnly><Checkout /></RequireUserOnly>} />
                  <Route path="/plan-checkout" element={<RequireUserOnly><PlanCheckout /></RequireUserOnly>} />
                  <Route path="/plans" element={<RequireUserOnly><Plans /></RequireUserOnly>} />
                  <Route path="/settings" element={<RequireUserOnly><Settings /></RequireUserOnly>} />
                  <Route path="/update-email" element={<RequireUserOnly><Dashboard /></RequireUserOnly>} />
                  
                  {/* Admin routes */}
                  {adminRoutes}
                  
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
