import { useState } from "react";
import PaymentSystem from "@/components/payment/PaymentSystem";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/medicaments');
  };

  return <PaymentSystem onBackToHome={handleBackToHome} />;
};

export default PaymentPage;
