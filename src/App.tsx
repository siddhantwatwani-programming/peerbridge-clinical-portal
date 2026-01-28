import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NursePulse from "./pages/NursePulse";
import Interpretation from "./pages/Interpretation";
import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import InventoryDevices from "./pages/InventoryDevices";
import DeviceShipments from "./pages/DeviceShipments";
import { SidebarLayout } from "./components/SidebarLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          
          {/* Protected routes with SidebarLayout */}
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nurse-pulse" element={<NursePulse />} />
            <Route path="/interpretation" element={<Interpretation />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/add" element={<AddPatient />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/add" element={<AddUser />} />
            <Route path="/inventory" element={<InventoryDevices />} />
            <Route path="/inventory/devices" element={<InventoryDevices />} />
            <Route path="/inventory/shipments" element={<DeviceShipments />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/research" element={<Dashboard />} />
            <Route path="/events" element={<Dashboard />} />
            <Route path="/transmissions" element={<NursePulse />} />
            <Route path="/studies" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/admin" element={<Dashboard />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
