import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import {
  AffiliatePage,
  AuthPage,
  AuthProvider,
  CalculatorPage,
  CartPage,
  CheckoutPage,
  CheckoutSuccessPage,
  DashboardPage,
  Footer,
  HomePage,
  MobileStickyBar,
  MiniCartDrawer,
  Navbar,
  ProductDetailPage,
  ProductsPage,
  ReferralLandingPage,
  ScrollToTop,
  SplashCard,
  StoreProvider,
  ThemeProvider,
  WhatsAppFloat,
} from "@solarmart/shared";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const dismissed = window.localStorage.getItem("solarmart-splash-dismissed") === "1";
    if (dismissed) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSplashOpen(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  function closeSplash() {
    setSplashOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("solarmart-splash-dismissed", "1");
    }
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <div className="min-h-screen bg-brand-cream pb-32 text-brand-slate md:pb-0">
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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/affiliate" element={<AffiliatePage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/ref/:affiliateCode" element={<ReferralLandingPage />} />
              </Routes>
            </main>
            <Footer />
            <MiniCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            <SplashCard open={splashOpen} onClose={closeSplash} />
            <MobileStickyBar />
            <WhatsAppFloat />
          </div>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
