import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/contexts/StoreContext";
import { formatPrice, mainImage } from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const { products, loading } = useCatalog();
  const product = products.find(item => item.id === Number(params?.id));
  const { favorites, toggleFavorite, addToCart } = useStore();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [product?.id]);
  if (loading)
    return (
      <main className="page-shell">
        <div className="container not-found-product">
          <h1>جارٍ تحميل القطعة…</h1>
        </div>
      </main>
    );
  if (!product)
    return (
      <main className="page-shell">
        <div className="container not-found-product">
          <h1>هذه القطعة لم تعد هنا</h1>
          <Link href="/products">العودة إلى المنتجات</Link>
        </div>
      </main>
    );
  const gallery = product.images.length
    ? product.images.map(image => image.imageUrl)
    : [mainImage(product)];
  const related = products
    .filter(
      item => item.categoryId === product.categoryId && item.id !== product.id
    )
    .slice(0, 4);
  const favorite = favorites.includes(product.id);
  return (
    <main className="page-shell product-page">
      <div className="container">
        <Link href="/products" className="back-link">
          <ArrowRight size={17} /> العودة للمنتجات
        </Link>
        <div className="product-detail-layout">
          <div className="product-gallery">
            <div className="main-product-image">
              <img
                src={gallery[activeImage] || gallery[0]}
                alt={product.name}
              />
            </div>
            <div className="thumb-row">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={activeImage === index ? "active" : ""}
                >
                  <img
                    src={image}
                    alt={`${product.name} - صورة ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="product-detail-copy">
            <p className="eyebrow">{product.categoryNameArabic}</p>
            <h1>{product.name}</h1>
            <p className="detail-price">
              {formatPrice(product.finalPrice)}{" "}
              {product.isOnOffer && <del>{formatPrice(product.price)}</del>}
            </p>
            <p className="detail-description">{product.description}</p>
            <div className="detail-divider" />
            <div className="detail-property">
              <span>اللون</span>
              <b>
                <i className="product-color-dot" /> {product.color}
              </b>
            </div>
            <div className="detail-property">
              <span>الفئة</span>
              <b>{product.categoryNameArabic}</b>
            </div>
            <div className="detail-property">
              <span>التوفر</span>
              <b>
                {product.isAvailable
                  ? `متاح (${product.stockQuantity} قطعة)`
                  : "نفدت الكمية حالياً"}
              </b>
            </div>
            <div className="quantity-row">
              <span>الكمية</span>
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="تقليل الكمية"
                >
                  <Minus size={16} />
                </button>
                <b>{quantity}</b>
                <button
                  disabled={
                    !product.isAvailable || quantity >= product.stockQuantity
                  }
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="زيادة الكمية"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="detail-actions">
              <button
                className="primary-button add-detail"
                disabled={!product.isAvailable}
                onClick={() => addToCart(product.id, quantity)}
              >
                <ShoppingBag size={19} />{" "}
                {product.isAvailable ? "أضيفي إلى السلة" : "غير متاح حالياً"}
              </button>
              <button
                className={`favorite-detail ${favorite ? "is-favorite" : ""}`}
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart size={20} fill={favorite ? "currentColor" : "none"} />{" "}
                <span>{favorite ? "في المفضلة" : "أضيفي للمفضلة"}</span>
              </button>
            </div>
            <p className="delivery-line">
              <Truck size={18} /> نرتّب طلبك معك مباشرة عبر واتساب.
            </p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="related-section container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">قد يعجبك أيضاً</p>
              <h2>من نفس الحكاية.</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((item, index) => (
              <ProductCard product={item} index={index} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
