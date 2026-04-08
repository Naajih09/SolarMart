export {
  Footer,
  MobileStickyBar,
  Navbar,
  ScrollToTop,
  WhatsAppFloat,
} from "./components/Layout";
export {
  BottomNavigation,
  CategoryIcon,
  CheckoutStepper,
  FilterSidebar,
  HeroCarousel,
  HorizontalScroller,
  ProductCard,
  MiniCartDrawer,
  SectionHeader,
  TrustBadge,
  storeCategories,
} from "./components/commerce-ui";
export {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  CalculatorPage,
  CheckoutPage,
  CheckoutSuccessPage,
  AuthPage,
  ReferralLandingPage,
  DashboardPage,
  AffiliatePage,
} from "./components/MarketplacePages";
export { EmptyState } from "./components/pages/SharedPageParts";
export { AuthProvider, useAuth } from "./context/AuthContext";
export { StoreProvider, useStore } from "./context/StoreContext";
export { apiFetch, getToken, setToken } from "./lib/api";
export { company, formatNaira, getRecommendation, whatsappMessage } from "./site";
