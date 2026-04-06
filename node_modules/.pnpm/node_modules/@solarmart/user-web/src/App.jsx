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
  Navbar,
  ProductDetailPage,
  ProductsPage,
  ReferralLandingPage,
  ScrollToTop,
  StoreProvider,
  WhatsAppFloat,
} from "@solarmart/shared";

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <div className="min-h-screen bg-brand-cream pb-24 text-brand-slate md:pb-0">
          <ScrollToTop />
          <Navbar />
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
          <MobileStickyBar />
          <WhatsAppFloat />
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
