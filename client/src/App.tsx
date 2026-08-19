import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { CatalogProvider } from "./contexts/CatalogContext";
import { StoreProvider } from "./contexts/StoreContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Shipping from "./pages/Shipping";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Catalog} />
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/cart" component={Cart} />
      <Route path="/contact" component={Contact} />
      <Route path="/shipping" component={Shipping} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <CatalogProvider>
            <StoreProvider>
              <div className="app-shell" dir="rtl">
                <Header />
                <AppRoutes />
                <Footer />
              </div>
              <Toaster position="top-center" richColors />
            </StoreProvider>
          </CatalogProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
