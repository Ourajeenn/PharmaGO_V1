import SEO from "@/components/SEO";
import { pagesSEO } from "@/config/seo";
import { useNavigate } from "react-router-dom";
import { PharmacyMapSection } from "@/components/maps/PharmacyMapSection";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PharmaciesPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO {...pagesSEO.pharmacies} />
      <div className="min-h-screen mesh-gradient">
        <Header />
        <div className="container mx-auto px-4 py-6">
          {/* Back button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tight">
              Pharmacies <span className="text-primary">Abidjan</span>
            </h1>
            <p className="text-muted-foreground">
              Trouvez les pharmacies les plus proches avec stock de médicaments en temps réel
            </p>
          </div>

          {/* Pharmacy Map Section with all 87 pharmacies */}
          <PharmacyMapSection />
        </div>
      </div>
    </>
  );
};

export default PharmaciesPage;