
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  useEffect(() => {
    const userEmail = initializeUserEmail();
    initializeUserPlan(userEmail);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-agent" element={<CreateAgent />} />
            <Route path="/edit-agent/:agentId" element={<CreateAgent />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agent-analytics/:agentId" element={<AgentAnalytics />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/plan-checkout" element={<PlanCheckout />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/update-email" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
