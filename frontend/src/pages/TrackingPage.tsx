import { useState } from "react";
import OrderTracking from "@/components/OrderTracking";
import { useNavigate } from "react-router-dom";

const TrackingPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <OrderTracking onBackToHome={handleBackToHome} />;
};

export default TrackingPage;