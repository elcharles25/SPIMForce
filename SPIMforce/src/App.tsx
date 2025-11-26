import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAutoCampaignSender } from '@/hooks/useAutoCampaignSender';
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Campaigns from "./pages/Campaigns";
import Webinars from "./pages/Webinars";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Opportunities from "./pages/Opportunities";
import OpportunityDetailPage from "./components/opportunities/OpportunityDetailPage";
import ContactDetailPage from "@/components/contacts/ContactDetailPage";
import MeetingDetailPage from "@/components/meetings/MeetingDetailPage";
import CampaignDetailPage from "@/components/campaigns/CampaignDetailPage";
import Accounts from '@/pages/Accounts';
import AccountDetailPage from '@/components/accounts/AccountDetailPage';
import "@/app.css";

const queryClient = new QueryClient();

// Componente interno que ejecuta el hook
const AppContent = () => {
  useAutoCampaignSender(); 

  return (  
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-12 border-b flex items-center px-4 bg-background">
            <SidebarTrigger />
          </header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountDetailPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/crm/:id" element={<ContactDetailPage />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="/webinars" element={<Webinars />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
            <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent /> {/* Componente interno con el hook */}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;