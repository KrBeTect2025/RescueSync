import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import { EmergencyAlertOverlay } from "./components/EmergencyAlertOverlay";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trainings from "./pages/Trainings";
import Analytics from "./pages/Analytics";
import Partners from "./pages/Partners";
import DataEntry from "./pages/DataEntry";
import EmergencyResponse from "./pages/EmergencyResponse";
import MapView from "./pages/MapView";
import Users from "./pages/Users";
import AlertManagement from "./pages/AlertManagement";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AlertProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <EmergencyAlertOverlay />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/overview" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/trainings" element={<Trainings />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/data-entry" element={<DataEntry />} />
                  <Route path="/emergency" element={<EmergencyResponse />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/alerts" element={<AlertManagement />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Chatbot />
              </BrowserRouter>
            </TooltipProvider>
          </AlertProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
