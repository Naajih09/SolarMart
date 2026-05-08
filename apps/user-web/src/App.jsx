import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import {
  CartPage,
  CheckoutPage,
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

  return (
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
