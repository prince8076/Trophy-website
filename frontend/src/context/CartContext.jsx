import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('auratrophy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('auratrophy_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, customization = {}, quantity = 1) => {
    setCartItems(prev => {
      // Check if item with exact same product and engraving customization already exists
      const itemKey = `${product.id}-${customization.engraving_line1 || ''}-${customization.engraving_line2 || ''}-${customization.engraving_line3 || ''}-${customization.engraving_font || 'Classic Serif'}-${customization.plate_color || 'Gold'}`;
      
      const existingIndex = prev.findIndex(item => item.key === itemKey);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          key: itemKey,
          product,
          quantity,
          engraving_line1: customization.engraving_line1 || '',
          engraving_line2: customization.engraving_line2 || '',
          engraving_line3: customization.engraving_line3 || '',
          engraving_font: customization.engraving_font || 'Classic Serif',
          plate_color: customization.plate_color || 'Gold',
        },
      ];
    });
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.key === key ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = key => {
    setCartItems(prev => prev.filter(item => item.key !== key));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

