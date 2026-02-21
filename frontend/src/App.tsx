import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ECarnetProvider } from "@/contexts/ECarnetContext";
import { ReloadPrompt } from "@/components/ReloadPrompt";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UnifiedSupport } from "./components/UnifiedSupport";
import { FloatingChat } from "./components/chat/FloatingChat";

import { lazy, Suspense, useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { initializeMockData } from "@/data/ecarnetMockData";

// Pages chargées immédiatement (en théorie), mais passées en lazy pour le bundle
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Pages lazy-loadées (chargées uniquement quand visitées)
const IndexV2 = lazy(() => import("./pages/IndexV2"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileSelection = lazy(() => import("./pages/ProfileSelection"));
const VisitorPage = lazy(() => import("./pages/VisitorPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Auth pages
const PatientAuth = lazy(() => import("./pages/auth/PatientAuth"));
const PharmacyAuth = lazy(() => import("./pages/auth/PharmacyAuth"));
const DriverAuth = lazy(() => import("./pages/auth/DriverAuth"));
const DoctorAuth = lazy(() => import("./pages/auth/DoctorAuth"));
const InsurerAuth = lazy(() => import("./pages/auth/InsurerAuth"));

// Feature pages
const PharmaciesPage = lazy(() => import("./pages/PharmaciesPage"));
const PharmaciesGardePage = lazy(() => import("./pages/PharmaciesGardePage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const ParapharmacyPage = lazy(() => import("./pages/ParapharmacyPage"));
const MedicinesPage = lazy(() => import("./pages/MedicinesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ConsultationPage = lazy(() => import("./pages/ConsultationPage"));
const PrescriptionsPage = lazy(() => import("./pages/PrescriptionsPage"));
const ConsultationFeaturePage = lazy(() => import("./pages/ConsultationFeaturePage"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));
const DeliveryTracking = lazy(() => import("./pages/DeliveryTracking"));
const PharmacistDashboard = lazy(() => import("./pages/PharmacistDashboard"));
const ContactsDashboardPage = lazy(() => import("./pages/ContactsDashboardPage"));
const PatientMobilePage = lazy(() => import("./pages/PatientMobilePage"));
const TeleconsultationPage = lazy(() => import("./pages/TeleconsultationPage"));

// E-Carnet pages
const ECarnetDashboard = lazy(() => import("./pages/ECarnetDashboard"));
const VaccinationTracker = lazy(() => import("./components/ecarnet/VaccinationTracker"));
const AllergyManager = lazy(() => import("./components/ecarnet/AllergyManager"));
const MedicalVisits = lazy(() => import("./components/ecarnet/MedicalVisits"));
const DocumentManager = lazy(() => import("./components/ecarnet/DocumentManager"));
const GrowthCharts = lazy(() => import("./components/ecarnet/GrowthCharts"));
const PatientProfile = lazy(() => import("./components/ecarnet/PatientProfile"));
const BirthRecord = lazy(() => import("./components/ecarnet/BirthRecord"));
const AlertsPanel = lazy(() => import("./components/ecarnet/AlertsPanel"));

// Misc
const TestForm = lazy(() => import("@/components/TestForm").then(m => ({ default: m.TestForm })));

const queryClient = new QueryClient();

const App = () => {
  const { requestPermission } = usePushNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize E-Carnet mock data
    initializeMockData();

    // Request notification permissions
    const setupNotifications = async () => {
      // Delay slightly to not overwhelm during preloader
      setTimeout(async () => {
        const result = await requestPermission();
        if (result === 'granted') {
          console.log('Notifications authorized');
        }
      }, 3000);
    };
    setupNotifications();

    // Preloader display for 1 second
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [requestPermission]);

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
              <Suspense fallback={<Preloader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/home-v2" element={<IndexV2 />} />
                  <Route path="/test-form" element={<TestForm />} />
                  <Route path="/profile-selection" element={<ProfileSelection />} />
                  <Route path="/visitor" element={<VisitorPage />} />
                  <Route path="/visiteur" element={<VisitorPage />} />
                  <Route path="/auth/patient" element={<PatientAuth />} />
                  <Route path="/auth/pharmacy" element={<PharmacyAuth />} />
                  <Route path="/auth/driver" element={<DriverAuth />} />
                  <Route path="/auth/doctor" element={<DoctorAuth />} />
                  <Route path="/auth/insurer" element={<InsurerAuth />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/pharmacies" element={<PharmaciesPage />} />
                  <Route path="/pharmacies-garde" element={<PharmaciesGardePage />} />
                  <Route path="/suivi" element={<TrackingPage />} />
                  <Route path="/livraison/suivi" element={<DeliveryTracking />} />
                  <Route path="/pharmacien/dashboard" element={<ProtectedRoute allowedRoles={['pharmacy', 'admin']}><PharmacistDashboard /></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/paiement" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                  <Route path="/parapharmacie" element={<ParapharmacyPage />} />
                  <Route path="/medicaments" element={<MedicinesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/contacts-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><ContactsDashboardPage /></ProtectedRoute>} />
                  <Route path="/patient-mobile" element={<PatientMobilePage />} />
                  <Route path="/ordonnances" element={<PrescriptionsPage />} />
                  <Route path="/consultation" element={<ConsultationPage />} />
                  <Route path="/teleconsultation" element={<ProtectedRoute><TeleconsultationPage /></ProtectedRoute>} />
                  <Route path="/consultation/:featureId" element={<ConsultationFeaturePage />} />
                  <Route path="/doctor/:doctorId" element={<DoctorProfilePage />} />
                  <Route path="/ecarnet" element={<ProtectedRoute><ECarnetDashboard /></ProtectedRoute>} />
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
              </Suspense>
              <UnifiedSupport />
              <FloatingChat />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </ECarnetProvider>
    </QueryClientProvider>
  );
};

export default App;
