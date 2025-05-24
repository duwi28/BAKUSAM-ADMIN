import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard";
import Drivers from "@/pages/drivers";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import ManualOrder from "@/pages/manual-order";
import DriverApp from "@/pages/driver-app";
import DriverRecommendations from "@/pages/driver-recommendations";
import DriverStories from "@/pages/driver-stories";
import DriverSafety from "@/pages/driver-safety";
import HeatMap from "@/pages/heat-map";
import DriverMap from "@/pages/driver-map";
import LiveTracking from "@/pages/live-tracking";
import PushNotifications from "@/pages/push-notifications";
import AutoAssignment from "@/pages/auto-assignment";
import DriverNavigation from "@/pages/driver-navigation";
import PhotoUpload from "@/pages/photo-upload";
import Vehicles from "@/pages/vehicles";
import Pricing from "@/pages/pricing";
import Reports from "@/pages/reports";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Tracking from "@/pages/tracking";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/drivers" component={Drivers} />
      <Route path="/customers" component={Customers} />
      <Route path="/orders" component={Orders} />
      <Route path="/manual-order" component={ManualOrder} />
      <Route path="/driver-app" component={DriverApp} />
      <Route path="/driver-recommendations" component={DriverRecommendations} />
      <Route path="/driver-stories" component={DriverStories} />
      <Route path="/driver-safety" component={DriverSafety} />
      <Route path="/heat-map" component={HeatMap} />
      <Route path="/driver-map" component={DriverMap} />
      <Route path="/live-tracking" component={LiveTracking} />
      <Route path="/push-notifications" component={PushNotifications} />
      <Route path="/auto-assignment" component={AutoAssignment} />
      <Route path="/driver-navigation" component={DriverNavigation} />
      <Route path="/photo-upload" component={PhotoUpload} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/reports" component={Reports} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route path="/tracking" component={Tracking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
