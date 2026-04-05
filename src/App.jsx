import { Route, Routes } from "react-router-dom";
import {
  Footer,
  MobileStickyBar,
  Navbar,
  ScrollToTop,
  WhatsAppFloat,
} from "./components/Layout";
import {
  AboutPage,
  CalculatorPage,
  ContactPage,
  HomePage,
  HowItWorksPage,
  PackagesPage,
  QuotePage,
} from "./components/PageSections";

function App() {
  return (
    <div className="min-h-screen bg-brand-cream pb-24 text-brand-slate md:pb-0">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
        </Routes>
      </main>
      <Footer />
      <MobileStickyBar />
      <WhatsAppFloat />
    </div>
  );
}

export default App;
