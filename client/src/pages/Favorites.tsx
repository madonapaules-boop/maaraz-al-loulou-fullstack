import { Heart } from "lucide-react";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/contexts/StoreContext";
import { useCatalog } from "@/contexts/CatalogContext";

export default function Favorites() {
  const { favorites } = useStore();
  const { products } = useCatalog();
  const selected = products.filter(product => favorites.includes(product.id));
  return (
    <main className="page-shell">
      <div className="container page-intro compact-intro">
        <p className="eyebrow">
          <Heart size={15} /> اختياراتك المحفوظة
        </p>
        <h1>
          المفضلة <span>لديك.</span>
        </h1>
        <p>ضعي القطع القريبة من قلبك هنا، وعودي إليها وقتما تحبين.</p>
      </div>
      <div className="container">
        {selected.length ? (
          <div className="product-grid catalog-grid">
            {selected.map((product, index) => (
              <ProductCard product={product} index={index} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state favorite-empty">
            <Heart size={40} />
            <span>لم تحفظي أي قطع بعد</span>
            <p>
              ابدئي باستكشاف تشكيلتنا، واضغطي على القلب عند القطعة التي أعجبتك.
            </p>
            <Link href="/products" className="primary-button">
              استكشفي المنتجات
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
