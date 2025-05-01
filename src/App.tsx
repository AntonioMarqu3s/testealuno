
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import { initializeUserEmail } from "./services/user/userService";
import { initializeUserPlan } from "./services/plan/userPlanService";

const queryClient = new QueryClient();

const App = () => {
  // Initialize user email and plan on app load
  // This is for the transition period until we fully migrate to Supabase
  useEffect(() => {
    const userEmail = initializeUserEmail();
    initializeUserPlan(userEmail);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-agent" element={<CreateAgent />} />
              <Route path="/edit-agent/:agentId" element={<CreateAgent />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/my-agents" element={<Agents />} />
              <Route path="/agent-analytics/:agentId" element={<AgentAnalytics />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/plan-checkout" element={<PlanCheckout />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/update-email" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
