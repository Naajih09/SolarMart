import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

const CART_KEY = "solarmart-cart";
const REF_KEY = "solarmart-referral";

function safeRead(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    setCart(safeRead(CART_KEY, []));
    setReferralCode(safeRead(REF_KEY, ""));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(REF_KEY, JSON.stringify(referralCode));
  }, [referralCode]);

  function addToCart(product, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          quantity,
        },
      ];
    });
  }

  function updateQuantity(id, quantity) {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal > 0 ? 25000 : 0;
    const total = subtotal + delivery;

    return {
      subtotal,
      delivery,
      total,
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart]);

  const value = {
    cart,
    totals,
    referralCode,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setReferralCode,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}
