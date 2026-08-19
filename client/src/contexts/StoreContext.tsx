import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalog } from "@/contexts/CatalogContext";

type CartLine = { productId: number; quantity: number };
type StoreContextType = {
  favorites: number[];
  cart: CartLine[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleFavorite: (productId: number) => void;
  addToCart: (productId: number, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  cartCount: number;
  favoriteCount: number;
  cartTotal: number;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const storageKeys = {
  cart: "loulou-cart",
  favorites: "loulou-favorites",
} as const;

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { products } = useCatalog();
  const [favorites, setFavorites] = useState<number[]>(() =>
    readLocalStorage(storageKeys.favorites, [])
  );
  const [cart, setCart] = useState<CartLine[]>(() =>
    readLocalStorage(storageKeys.cart, [])
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  }, [cart]);

  const value = useMemo(
    () => ({
      favorites,
      cart,
      searchTerm,
      setSearchTerm,
      toggleFavorite: (productId: number) => {
        setFavorites(currentFavorites => {
          const isFavorite = currentFavorites.includes(productId);
          toast.success(
            isFavorite
              ? "تمت إزالة القطعة من المفضلة"
              : "أُضيفت القطعة إلى المفضلة"
          );

          return isFavorite
            ? currentFavorites.filter(id => id !== productId)
            : [...currentFavorites, productId];
        });
      },
      addToCart: (productId: number, quantity = 1) => {
        setCart(currentCart => {
          const existingLine = currentCart.find(
            line => line.productId === productId
          );
          if (!existingLine) {
            return [...currentCart, { productId, quantity }];
          }

          return currentCart.map(line =>
            line.productId === productId
              ? { ...line, quantity: line.quantity + quantity }
              : line
          );
        });
        toast.success("أُضيفت القطعة إلى السلة");
      },
      updateQuantity: (productId: number, quantity: number) => {
        setCart(currentCart => {
          if (quantity <= 0) {
            return currentCart.filter(line => line.productId !== productId);
          }

          return currentCart.map(line =>
            line.productId === productId ? { ...line, quantity } : line
          );
        });
      },
      removeFromCart: (productId: number) => {
        setCart(currentCart =>
          currentCart.filter(line => line.productId !== productId)
        );
        toast.success("تمت إزالة القطعة من السلة");
      },
      cartCount: cart.reduce((total, line) => total + line.quantity, 0),
      favoriteCount: favorites.length,
      cartTotal: cart.reduce((total, line) => {
        const product = products.find(
          currentProduct => currentProduct.id === line.productId
        );
        return total + (product?.finalPrice ?? 0) * line.quantity;
      }, 0),
    }),
    [cart, favorites, products, searchTerm]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
