import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getApiData } from "@/lib/apiClient";
import type { Category, Product } from "@/lib/products";

type CatalogContextType = {
  products: Product[];
  categories: Category[];
  bestSellers: Product[];
  newArrivals: Product[];
  offers: Product[];
  loading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCatalog = async () => {
    setLoading(true);

    try {
      const [allProducts, allCategories, best, newest, activeOffers] =
        await Promise.all([
          getApiData<Product[]>("/products?sort=newest"),
          getApiData<Category[]>("/categories"),
          getApiData<Product[]>("/products/best-sellers"),
          getApiData<Product[]>("/products/new-arrivals"),
          getApiData<Product[]>("/products/offers"),
        ]);

      setProducts(allProducts);
      setCategories(allCategories);
      setBestSellers(best);
      setNewArrivals(newest);
      setOffers(activeOffers);
      setError(null);
    } catch {
      setProducts([]);
      setCategories([]);
      setBestSellers([]);
      setNewArrivals([]);
      setOffers([]);
      setError("نجهّز تشكيلة اللؤلؤه الآن. يرجى المحاولة بعد قليل.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCatalog();
  }, []);

  const value = useMemo(
    () => ({
      products,
      categories,
      bestSellers,
      newArrivals,
      offers,
      loading,
      error,
      refreshCatalog,
    }),
    [products, categories, bestSellers, newArrivals, offers, loading, error]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context)
    throw new Error("useCatalog must be used within CatalogProvider");
  return context;
}
