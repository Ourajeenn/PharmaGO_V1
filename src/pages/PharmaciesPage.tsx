import { useState } from "react";
import PharmacyFinder from "@/components/PharmacyFinder";
import SEO from "@/components/SEO";
import { pagesSEO } from "@/config/seo";
import { useNavigate } from "react-router-dom";

const PharmaciesPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO {...pagesSEO.pharmacies} />
      <PharmacyFinder onBackToHome={() => navigate('/')} />
    </>
  );
};

export default PharmaciesPage;