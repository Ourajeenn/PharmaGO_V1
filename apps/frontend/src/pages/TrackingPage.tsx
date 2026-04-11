import { useSearchParams, useNavigate } from "react-router-dom";
import { OrderTracking } from "@/components/tracking/OrderTracking";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order') || 'demo';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <OrderTracking orderId={orderId} />
      </div>
    </div>
  );
};

export default TrackingPage;