import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Dashboard from "@/pages/dashboard";
import Drivers from "@/pages/drivers";
import DriverBalance from "@/pages/driver-balance";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import ManualOrder from "@/pages/manual-order";
import HeatMap from "@/pages/heat-map";
import DriverMap from "@/pages/driver-map";
import LiveTracking from "@/pages/live-tracking";
import PushNotifications from "@/pages/push-notifications";
import AutoAssignment from "@/pages/auto-assignment";
import AnalyticsReports from "@/pages/analytics-reports";
import BulkOperations from "@/pages/bulk-operations";
import RevenueCalculator from "@/pages/revenue-calculator";
import SmartRouteOptimization from "@/pages/smart-route-optimization";
import RealtimeRouteOptimization from "@/pages/real-time-route-optimization";
import WeatherRouteOptimization from "@/pages/weather-route-optimization";
import RecommendationSystem from "@/pages/recommendation-system";
import DriverCommunityChat from "@/pages/driver-community-chat";
import MultiCityManagement from "@/pages/multi-city-management";
import FranchiseSystem from "@/pages/franchise-system";
import DriverCreditScoring from "@/pages/driver-credit-scoring";
import SmartDemandPrediction from "@/pages/smart-demand-prediction";
import DynamicRouteLearning from "@/pages/dynamic-route-learning";
import Vehicles from "@/pages/vehicles";
import Pricing from "@/pages/pricing";
import Reports from "@/pages/reports";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
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

            <Route path="/heat-map" component={HeatMap} />
            <Route path="/driver-map" component={DriverMap} />
            <Route path="/live-tracking" component={LiveTracking} />
            <Route path="/push-notifications" component={PushNotifications} />
            <Route path="/auto-assignment" component={AutoAssignment} />

            <Route path="/analytics-reports" component={AnalyticsReports} />
            <Route path="/bulk-operations" component={BulkOperations} />
            <Route path="/revenue-calculator" component={RevenueCalculator} />
            <Route path="/smart-route-optimization" component={SmartRouteOptimization} />
            <Route path="/real-time-route-optimization" component={RealtimeRouteOptimization} />
            <Route path="/weather-route-optimization" component={WeatherRouteOptimization} />
            <Route path="/recommendation-system" component={RecommendationSystem} />
            <Route path="/driver-community-chat" component={DriverCommunityChat} />
            <Route path="/multi-city-management" component={MultiCityManagement} />
            <Route path="/franchise-system" component={FranchiseSystem} />
            <Route path="/driver-credit-scoring" component={DriverCreditScoring} />
            <Route path="/smart-demand-prediction" component={SmartDemandPrediction} />
            <Route path="/dynamic-route-learning" component={DynamicRouteLearning} />
            <Route path="/vehicles" component={Vehicles} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/reports" component={Reports} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/settings" component={Settings} />
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
