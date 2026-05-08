import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import {
  CartPage,
  CheckoutPage,
  CheckoutSuccessPage,
  Footer,
  HomePage,
  MobileStickyBar,
  MiniCartDrawer,
  Navbar,
  ProductDetailPage,
  ProductsPage,
  ScrollToTop,
  StoreProvider,
  WhatsAppFloat,
} from "@solarmart/shared";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 550);
    return () => window.clearTimeout(splashTimer);
  }, []);

  return (
    <StoreProvider>
      <div className="min-h-screen bg-brand-cream pb-32 text-brand-slate md:pb-0">
        {showSplash ? (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white text-brand-deep">
            <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-brand-slate/10 bg-white p-8 shadow-soft">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-green shadow-soft">
                <img
                  src="/solarmart-logo.svg"
                  alt="SolarMart logo"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-brand-deep">SolarMart</h1>
            </div>
          </div>
        ) : null}
        <ScrollToTop />
        <Navbar onOpenCart={() => setCartOpen(true)} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          </Routes>
        </main>
        <Footer />
            <MiniCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            <MobileStickyBar />
            <WhatsAppFloat />
          </div>
        </StoreProvider>
  );
}

export default App;
