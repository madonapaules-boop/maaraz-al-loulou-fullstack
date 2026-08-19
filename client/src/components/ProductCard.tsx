import { Heart, Plus, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/contexts/StoreContext";
import { formatPrice, mainImage, Product } from "@/lib/products";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const favorite = favorites.includes(product.id);
  return (
    <article
      className="product-card"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <Link href={`/products/${product.id}`} className="product-visual">
        <img src={mainImage(product)} alt={product.name} loading="lazy" />
        {product.isNewArrival && (
          <span className="new-tag">
            <Sparkles size={13} /> جديد
          </span>
        )}
        {product.isOnOffer && <span className="offer-tag">عرض</span>}
      </Link>
      <button
        className={`heart-button ${favorite ? "is-favorite" : ""}`}
        onClick={() => toggleFavorite(product.id)}
        aria-label="إضافة للمفضلة"
      >
        <Heart size={18} fill={favorite ? "currentColor" : "none"} />
      </button>
      <div className="product-info">
        <span className="product-category">{product.categoryNameArabic}</span>
        <Link href={`/products/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-bottom">
          <span className="product-price">
            <strong>{formatPrice(product.finalPrice)}</strong>
            {product.isOnOffer && <del>{formatPrice(product.price)}</del>}
          </span>
          <button
            className="quick-add"
            disabled={!product.isAvailable}
            onClick={() => addToCart(product.id)}
            aria-label={`أضيفي ${product.name} إلى السلة`}
          >
            <Plus size={18} />
          </button>
        </div>
        <span className="color-note">
          <i
            style={{
              background:
                product.color === "ذهبي"
                  ? "#c59b62"
                  : product.color === "وردي" || product.color.includes("وردي")
                    ? "#c98d93"
                    : product.color === "عسلي"
                      ? "#b57c51"
                      : product.color === "طبيعي"
                        ? "#bda98a"
                        : product.color === "لؤلؤي"
                          ? "#ded8cd"
                          : "#ded4c8",
            }}
          />{" "}
          {product.color}
        </span>
      </div>
    </article>
  );
}
