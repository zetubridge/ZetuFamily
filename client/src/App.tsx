import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AppDetail from "@/pages/AppDetail";
import PublishApp from "@/pages/PublishApp";
import DeveloperLogin from "@/pages/DeveloperLogin";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app/:id" component={AppDetail} />
      <Route path="/publish" component={PublishApp} />
      <Route path="/developer/login" component={DeveloperLogin} />
      <Route path="/developer/dashboard" component={DeveloperDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
