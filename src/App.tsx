
import { useEffect } from "react";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CreateAgent from "./pages/CreateAgent";
import AgentAnalytics from "./pages/AgentAnalytics";
import Checkout from "./pages/Checkout";
import PlanCheckout from "./pages/PlanCheckout";
import Plans from "./pages/Plans";
import Settings from "./pages/Settings";
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

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            {/* Add both toast providers */}
            <ShadcnToaster />
            <SonnerToaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-agent" element={<CreateAgent />} />
                <Route path="/edit-agent/:agentId" element={<CreateAgent />} />
                <Route path="/agents" element={<Navigate to="/dashboard?tab=agents" replace />} />
                <Route path="/my-agents" element={<Navigate to="/dashboard?tab=agents" replace />} />
                <Route path="/agent-analytics/:agentId" element={<AgentAnalytics />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/plan-checkout" element={<PlanCheckout />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/update-email" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <WhatsAppFloatingButton />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
