import { useState } from "react";
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
  StoreProvider,
  WhatsAppFloat,
} from "@solarmart/shared";

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
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
          <MobileStickyBar />
          <WhatsAppFloat />
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
