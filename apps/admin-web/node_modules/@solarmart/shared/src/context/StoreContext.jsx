import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "./AuthContext";

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
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    setReferralCode(safeRead(REF_KEY, ""));
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function hydrateCart() {
      const localCart = normalizeCart(safeRead(CART_KEY, []));

      if (!isAuthenticated || !user?.id) {
        if (!cancelled) {
          setCart(localCart);
          setCartReady(true);
        }
        return;
      }

      try {
        const data = await apiFetch("/api/store?action=cart");
        const serverCart = normalizeCart(data.items || []);

        if (serverCart.length) {
          if (!cancelled) {
            setCart(serverCart);
            setCartReady(true);
          }
          return;
        }

        if (localCart.length) {
          const saved = await apiFetch("/api/store?action=cart", {
            method: "POST",
            body: JSON.stringify({ items: localCart }),
          });

          if (!cancelled) {
            setCart(normalizeCart(saved.cart || localCart));
            setCartReady(true);
          }
          return;
        }

        if (!cancelled) {
          setCart([]);
          setCartReady(true);
        }
      } catch {
        if (!cancelled) {
          setCart(localCart);
          setCartReady(true);
        }
      }
    }

    hydrateCart();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    if (!cartReady || !isAuthenticated || !user?.id) {
      return;
    }

    const timeout = window.setTimeout(() => {
      apiFetch("/api/store?action=cart", {
        method: "POST",
        body: JSON.stringify({ items: cart }),
      }).catch(() => {
        // Keep the local cart usable even if persistence temporarily fails.
      });
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [cart, cartReady, isAuthenticated, user?.id]);

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
