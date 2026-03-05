import { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ECarnetProvider } from "@/contexts/ECarnetContext";
import { ReloadPrompt } from "@/components/core/ReloadPrompt";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/core/ErrorBoundary";

// Global components
const AIHealthAssistant = lazy(() => import("./components/assistant/AIHealthAssistant").then(m => ({ default: m.AIHealthAssistant })));
import Preloader from "@/components/core/Preloader";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import EmergencyDialog from "@/components/prescription/EmergencyDialog";

// Pages principales
const Index = lazy(() => import("./pages/Index"));
const IndexV2 = lazy(() => import("./pages/IndexV2"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Pages lazy-loadées (chargées uniquement quand visitées)
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
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ConsultationFeaturePage = lazy(() => import("./pages/ConsultationFeaturePage"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));
const DeliveryTracking = lazy(() => import("./pages/DeliveryTracking"));
const PharmacistDashboard = lazy(() => import("./pages/PharmacistDashboard"));
const ContactsDashboardPage = lazy(() => import("./pages/ContactsDashboardPage"));
const PatientMobilePage = lazy(() => import("./pages/PatientMobilePage"));
const TeleconsultationPage = lazy(() => import("./pages/TeleconsultationPage"));

const SubscriptionPlans = lazy(() => import("./pages/SubscriptionPlans"));

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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 2 minutes to prevent excessive background requests on slow networks
      staleTime: 1000 * 60 * 2,
      // Keep data in cache for 15 minutes to support offline scenarios better
      gcTime: 1000 * 60 * 15,
      // Only retry once on failure (saves battery and bandwidth)
      retry: 1,
      // Refetch on window focus is disabled to avoid useless network spikes
      refetchOnWindowFocus: false,
      // Helps when offline to not instantly error out if a network request is initiated
      networkMode: 'offlineFirst'
    }
  }
});

const App = () => {
  const { requestPermission } = usePushNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // Preloader display for 500ms (optimized for better UX)
    // Only show on first mount of the session
    const hasLoadedBefore = sessionStorage.getItem('pharmaGo_loaded');
    if (hasLoadedBefore) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('pharmaGo_loaded', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [requestPermission]);

  if (loading) {
    return <Preloader />;
  }

  return (
    <ErrorBoundary>
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
                    <Route path="/v2" element={<IndexV2 />} />
                    <Route path="/profile-selection" element={<ProfileSelection />} />
                    <Route path="/visitor" element={<VisitorPage />} />
                    <Route path="/visiteur" element={<VisitorPage />} />
                    <Route path="/auth" element={<Login />} />
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
                    <Route path="/ordonnances" element={<ProtectedRoute><PrescriptionsPage /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                    <Route path="/consultation" element={<ConsultationPage />} />
                    <Route path="/teleconsultation" element={<ProtectedRoute><TeleconsultationPage /></ProtectedRoute>} />
                    <Route path="/consultation/:featureId" element={<ConsultationFeaturePage />} />
                    <Route path="/doctor/:doctorId" element={<DoctorProfilePage />} />
                    <Route path="/ecarnet" element={<ProtectedRoute><ECarnetDashboard /></ProtectedRoute>} />
                    <Route path="/ecarnet/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
                    <Route path="/ecarnet/new-patient" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
                    <Route path="/ecarnet/birth" element={<ProtectedRoute><BirthRecord /></ProtectedRoute>} />
                    <Route path="/ecarnet/vaccinations" element={<ProtectedRoute><VaccinationTracker /></ProtectedRoute>} />
                    <Route path="/ecarnet/growth" element={<ProtectedRoute><GrowthCharts /></ProtectedRoute>} />
                    <Route path="/ecarnet/allergies" element={<ProtectedRoute><AllergyManager /></ProtectedRoute>} />
                    <Route path="/ecarnet/visits" element={<ProtectedRoute><MedicalVisits /></ProtectedRoute>} />
                    <Route path="/ecarnet/documents" element={<ProtectedRoute><DocumentManager /></ProtectedRoute>} />
                    <Route path="/ecarnet/alerts" element={<ProtectedRoute><AlertsPanel /></ProtectedRoute>} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/cgu" element={<TermsPage />} />
                    <Route path="/subscription" element={<SubscriptionPlans />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Suspense fallback={null}>
                  <AIHealthAssistant isFloating={true} />
                  <EmergencyDialog />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </ECarnetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
