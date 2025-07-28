import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import { useTheme } from "@/hooks/useTheme";
import MarketingPixels from "@/components/MarketingPixels";
import { loadSiteFavicon } from "@/utils/favicon";

function Router() {
  useTheme();

  return (
    <>
      <MarketingPixels />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/09806446909" component={AdminLogin} />
        <Route path="/09806446909/dashboard" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  useEffect(() => {
    loadSiteFavicon();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="relative main-container min-h-screen flex flex-col">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;