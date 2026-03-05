import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine } from '@/lib/supabase';
import { mvpStocks } from '@/data/mvpMockData';
import { toast } from "sonner";
import { InsurancePartner } from '@/services/InsuranceService';
import { familyService } from '@/services/familyService';
import { checkDrugInteractions } from '@/services/drugInteractionService';

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  pharmacy_id: string;
  pharmacy_name: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getDiscountedTotal: () => number;
  getItemCount: () => number;
  groupByPharmacy: () => { [pharmacyId: string]: CartItem[] };
  selectedInsurance: InsurancePartner | null;
  setInsurance: (insurance: InsurancePartner | null) => void;
  coverageRate: number;
  setCoverageRate: (rate: number) => void;
  pointsToUse: number;
  setPointsToUse: (points: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState<InsurancePartner | null>(null);
  const [coverageRate, setCoverageRate] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmagoCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        localStorage.removeItem('pharmagoCart');
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('pharmagoCart', JSON.stringify(items));
  }, [items]);

  const addToCart = async (newItem: CartItem) => {
    // 1. Drug Interaction Check (Feature 4 - Familial Profile)
    try {
      const familyProfiles = await familyService.getFamilyProfiles('user-1');
      // Let's assume the order is for the main user (first profile) for MVP, or we can check against all
      if (familyProfiles.length > 0) {
        const warning = checkDrugInteractions(familyProfiles[0], [newItem.medicine.name]);
        if (warning) {
          if (warning.level === 'danger' && warning.preventCheckout) {
            toast.error(`Alerte Médicale: ${warning.message}`, { duration: 8000 });
            return; // Block adding to cart
          } else {
            toast.warning(`Attention: ${warning.message}`, { duration: 6000 });
          }
        }
      }
    } catch (e) {
      console.error("Failed interaction check", e);
    }

    // 2. Stock Check Logic (Epic 2 - MED-02 / ORDER-01)
    const stockEntry = mvpStocks.find(s => s.pharmacyId === newItem.pharmacy_id && s.medicineId === newItem.medicine.id);
    const maxStock = stockEntry ? stockEntry.quantity : 99; // Default to 99 if not found in mock

    const currentQtyInCart = items.find(
      item => item.medicine.id === newItem.medicine.id && item.pharmacy_id === newItem.pharmacy_id
    )?.quantity || 0;

    if (currentQtyInCart + newItem.quantity > maxStock) {
      toast.error(`Stock insuffisant. Seulement ${maxStock} disponible(s).`);
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.medicine.id === newItem.medicine.id && item.pharmacy_id === newItem.pharmacy_id
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.medicine.id === newItem.medicine.id && item.pharmacy_id === newItem.pharmacy_id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      toast.success("Produit ajouté au panier");
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setItems(prevItems => prevItems.filter(item => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.medicine.id === medicineId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountedTotal = () => {
    let total = getTotalPrice();

    // Applying insurance discount first
    if (selectedInsurance && coverageRate > 0) {
      const insuranceDiscount = (total * coverageRate) / 100;
      total -= insuranceDiscount;
    }

    // Applying loyalty points discount (1 point = 1 FCFA)
    if (pointsToUse > 0) {
      total = Math.max(0, total - pointsToUse);
    }

    return total;
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const groupByPharmacy = () => {
    return items.reduce((groups, item) => {
      if (!groups[item.pharmacy_id]) {
        groups[item.pharmacy_id] = [];
      }
      groups[item.pharmacy_id].push(item);
      return groups;
    }, {} as { [pharmacyId: string]: CartItem[] });
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getDiscountedTotal,
    getItemCount,
    groupByPharmacy,
    selectedInsurance,
    setInsurance: setSelectedInsurance,
    coverageRate,
    setCoverageRate,
    pointsToUse,
    setPointsToUse,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};