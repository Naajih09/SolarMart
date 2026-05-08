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

function normalizeCartItem(item) {
  return {
    id: String(item?.id || "").trim(),
    slug: String(item?.slug || "").trim(),
    name: String(item?.name || "").trim(),
    price: Number(item?.price || 0),
    image: String(item?.image || "").trim(),
    quantity: Math.max(1, Math.floor(Number(item?.quantity || 1))),
  };
}

function normalizeCart(items = []) {
  return items
    .map(normalizeCartItem)
    .filter((item) => item.id && item.name && Number.isFinite(item.price) && item.price >= 0);
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    setReferralCode(safeRead(REF_KEY, ""));
  }, []);

  useEffect(() => {
    const localCart = normalizeCart(safeRead(CART_KEY, []));
    setCart(localCart);
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

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
    try {
      window.localStorage.removeItem(CART_KEY);
    } catch {
      // ignore localStorage removal errors
    }
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
