import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Dashboard from "@/pages/dashboard-simple";
import Drivers from "@/pages/drivers";
import DriverBalance from "@/pages/driver-balance";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import ManualOrder from "@/pages/manual-order";

import LiveTracking from "@/pages/live-tracking";
import PushNotifications from "@/pages/push-notifications";
import AutoAssignment from "@/pages/auto-assignment";

import OrdersBulkManagement from "@/pages/orders-bulk-management";
import SystemManagement from "@/pages/system-management";

import IntegratedCityFranchise from "@/pages/integrated-city-franchise";
import SmartAIOperations from "@/pages/smart-ai-operations";
import Tracking from "@/pages/tracking";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/*">
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/drivers" component={Drivers} />
            <Route path="/driver-balance" component={DriverBalance} />
            <Route path="/customers" component={Customers} />
            <Route path="/orders" component={Orders} />
            <Route path="/manual-order" component={ManualOrder} />

            <Route path="/live-tracking" component={LiveTracking} />
            <Route path="/push-notifications" component={PushNotifications} />
            <Route path="/auto-assignment" component={AutoAssignment} />

            <Route path="/orders-bulk-management" component={OrdersBulkManagement} />
            <Route path="/system-management" component={SystemManagement} />
            <Route path="/integrated-city-franchise" component={IntegratedCityFranchise} />
            <Route path="/smart-ai-operations" component={SmartAIOperations} />
            <Route path="/tracking" component={Tracking} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="bakusam-express-theme">
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
