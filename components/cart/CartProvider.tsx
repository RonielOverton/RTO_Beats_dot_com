"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createCartLine, getCartSubtotal } from "@/lib/cart";
import type { CartLine, StoreItem } from "@/types/content";

interface CartContextValue {
  lines: CartLine[];
  totalItems: number;
  subtotal: number;
  addToCart: (item: StoreItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "rto-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CartLine[];
      setLines(parsed);
    } catch {
      setLines([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  function addToCart(item: StoreItem, quantity = 1) {
    setLines((current) => {
      const existing = current.find((line) => line.itemId === item.id);
      if (existing) {
        return current.map((line) =>
          line.itemId === item.id ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...current, createCartLine(item, quantity)];
    });
  }

  function removeFromCart(itemId: string) {
    setLines((current) => current.filter((line) => line.itemId !== itemId));
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setLines((current) =>
      current.map((line) => (line.itemId === itemId ? { ...line, quantity } : line))
    );
  }

  function clearCart() {
    setLines([]);
  }

  const value = useMemo(
    () => ({
      lines,
      totalItems: lines.reduce((total, line) => total + line.quantity, 0),
      subtotal: getCartSubtotal(lines),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
