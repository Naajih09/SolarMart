import { Route, Routes } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import {
  Footer,
  MobileStickyBar,
  Navbar,
  ScrollToTop,
  WhatsAppFloat,
} from "./components/Layout";
import {
  AffiliatePage,
  AuthPage,
  CalculatorPage,
  CartPage,
  CheckoutPage,
  DashboardPage,
  HomePage,
  ProductDetailPage,
  ProductsPage,
  ReferralLandingPage,
} from "./components/MarketplacePages";

function App() {
  return (
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
  );
}

export default App;
