import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ECarnetProvider } from "@/contexts/ECarnetContext";
import { ReloadPrompt } from "@/components/ReloadPrompt";
import { Chatbot } from "@/components/chatbot/Chatbot";
import Index from "./pages/Index";
import IndexV2 from "./pages/IndexV2";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProfileSelection from "./pages/ProfileSelection";
import VisitorPage from "./pages/VisitorPage";
import TermsPage from "./pages/TermsPage";
import PatientAuth from "./pages/auth/PatientAuth";
import PharmacyAuth from "./pages/auth/PharmacyAuth";
import DriverAuth from "./pages/auth/DriverAuth";
import DoctorAuth from "./pages/auth/DoctorAuth";
import InsurerAuth from "./pages/auth/InsurerAuth";
import PharmaciesPage from "./pages/PharmaciesPage";
import TrackingPage from "./pages/TrackingPage";
import PaymentPage from "./pages/PaymentPage";
import ParapharmacyPage from "./pages/ParapharmacyPage";
import MedicinesPage from "./pages/MedicinesPage";
import ContactPage from "./pages/ContactPage";
import ConsultationPage from "./pages/ConsultationPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import ConsultationFeaturePage from "./pages/ConsultationFeaturePage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import ECarnetDashboard from "./pages/ECarnetDashboard";
import VaccinationTracker from "./components/ecarnet/VaccinationTracker";
import AllergyManager from "./components/ecarnet/AllergyManager";
import MedicalVisits from "./components/ecarnet/MedicalVisits";
import DocumentManager from "./components/ecarnet/DocumentManager";
import GrowthCharts from "./components/ecarnet/GrowthCharts";
import PatientProfile from "./components/ecarnet/PatientProfile";
import BirthRecord from "./components/ecarnet/BirthRecord";
import AlertsPanel from "./components/ecarnet/AlertsPanel";
import DeliveryTracking from "./pages/DeliveryTracking";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import ContactsDashboardPage from "./pages/ContactsDashboardPage";
import PatientMobilePage from "./pages/PatientMobilePage";
import PharmaciesGardePage from "./pages/PharmaciesGardePage";

import Login from "./pages/Login";

import { TestForm } from "@/components/TestForm";

import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import { initializeMockData } from "@/data/ecarnetMockData";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize E-Carnet mock data
    initializeMockData();
    setLoading(false);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ECarnetProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <ReloadPrompt />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home-v2" element={<IndexV2 />} />
                <Route path="/test-form" element={<TestForm />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile-selection" element={<ProfileSelection />} />
                <Route path="/visitor" element={<VisitorPage />} />
                <Route path="/visiteur" element={<VisitorPage />} />
                <Route path="/auth/patient" element={<PatientAuth />} />
                <Route path="/auth/pharmacy" element={<PharmacyAuth />} />
                <Route path="/auth/driver" element={<DriverAuth />} />
                <Route path="/auth/doctor" element={<DoctorAuth />} />
                <Route path="/auth/insurer" element={<InsurerAuth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/login" element={<Login />} /> 
                <Route path="/connexion" element={<Login />} /> Redundant, Auth handles this */}
                <Route path="/pharmacies" element={<PharmaciesPage />} />
                <Route path="/pharmacies-garde" element={<PharmaciesGardePage />} />
                <Route path="/suivi" element={<TrackingPage />} />
                <Route path="/livraison/suivi" element={<DeliveryTracking />} />
                <Route path="/pharmacien/dashboard" element={<PharmacistDashboard />} />
                <Route path="/paiement" element={<PaymentPage />} />
                <Route path="/parapharmacie" element={<ParapharmacyPage />} />
                <Route path="/medicaments" element={<MedicinesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contacts-dashboard" element={<ContactsDashboardPage />} />
                <Route path="/patient-mobile" element={<PatientMobilePage />} />
                <Route path="/ordonnances" element={<PrescriptionsPage />} />
                <Route path="/consultation" element={<ConsultationPage />} />
                <Route path="/consultation/:featureId" element={<ConsultationFeaturePage />} />
                <Route path="/doctor/:doctorId" element={<DoctorProfilePage />} />
                <Route path="/ecarnet" element={<ECarnetDashboard />} />
                <Route path="/ecarnet/profile" element={<PatientProfile />} />
                <Route path="/ecarnet/new-patient" element={<PatientProfile />} />
                <Route path="/ecarnet/birth" element={<BirthRecord />} />
                <Route path="/ecarnet/vaccinations" element={<VaccinationTracker />} />
                <Route path="/ecarnet/growth" element={<GrowthCharts />} />
                <Route path="/ecarnet/allergies" element={<AllergyManager />} />
                <Route path="/ecarnet/visits" element={<MedicalVisits />} />
                <Route path="/ecarnet/documents" element={<DocumentManager />} />
                <Route path="/ecarnet/alerts" element={<AlertsPanel />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cgu" element={<TermsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </ECarnetProvider>
    </QueryClientProvider>
  );
};

export default App;
