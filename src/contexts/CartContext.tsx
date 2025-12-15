import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine } from '@/lib/supabase';

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
  getItemCount: () => number;
  groupByPharmacy: () => { [pharmacyId: string]: CartItem[] };
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pharmagoCart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('pharmagoCart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
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
    getItemCount,
    groupByPharmacy,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};