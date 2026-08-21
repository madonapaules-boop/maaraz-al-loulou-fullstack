import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "wouter";
import { useStore } from "@/contexts/StoreContext";
import { formatPrice, mainImage } from "@/lib/products";
import { useCatalog } from "@/contexts/CatalogContext";
import { siteConfig } from "@/lib/siteConfig";

export default function Cart() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useStore();
  const { products } = useCatalog();
  const lines = cart.flatMap(line => {
    const product = products.find(item => item.id === line.productId);
    return product ? [{ product, quantity: line.quantity }] : [];
  });
  const sendWhatsApp = () => {
    const items = lines
      .map(
        ({ product, quantity }) =>
          `• ${product.name} × ${quantity} = ${formatPrice(product.finalPrice * quantity)}`
      )
      .join("\n");
    const message = `مرحباً ${siteConfig.name}، أود طلب القطع التالية:\n\n${items}\n\nالإجمالي: ${formatPrice(cartTotal)}\n\nالاسم والعنوان:`;
    window.open(
      `${siteConfig.whatsappUrl}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="page-shell">
      <div className="container page-intro compact-intro">
        <p className="eyebrow">
          <ShoppingBag size={15} /> سلة مشترياتك
        </p>
        <h1>
          تفاصيلك <span>المختارة.</span>
        </h1>
        <p>راجعي قطعك، ثم أرسلي طلبك مباشرة عبر واتساب لنرتب كل التفاصيل معك.</p>
      </div>
      <div className="container">
        {lines.length ? (
          <div className="cart-layout">
            <section className="cart-list">
              {lines.map(({ product, quantity }) => (
                <article className="cart-line" key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    className="cart-product-image"
                    aria-label={`عرض ${product.name}`}
                  >
                    <img src={mainImage(product)} alt={product.name} />
                  </Link>
                  <div className="cart-line-copy">
                    <span>{product.categoryNameArabic}</span>
                    <h3>
                      <Link href={`/products/${product.id}`} className="cart-product-name">
                        {product.name}
                      </Link>
                    </h3>
                    <b>{formatPrice(product.finalPrice)}</b>
                    <div className="cart-line-actions">
                      <div className="quantity-control small">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <b>{quantity}</b>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="remove-line"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Trash2 size={16} /> إزالة
                      </button>
                    </div>
                  </div>
                  <strong className="cart-subtotal">
                    {formatPrice(product.finalPrice * quantity)}
                  </strong>
                </article>
              ))}
            </section>
            <aside className="cart-summary">
              <p className="eyebrow">ملخص الطلب</p>
              <h2>على مهل، راجعي اختياراتك.</h2>
              <div className="summary-row">
                <span>عدد القطع</span>
                <b>{cart.reduce((sum, line) => sum + line.quantity, 0)}</b>
              </div>
              <div className="summary-row">
                <span>الشحن</span>
                <b>يُحدّد عند التواصل</b>
              </div>
              <div className="summary-total">
                <span>الإجمالي</span>
                <b>{formatPrice(cartTotal)}</b>
              </div>
              <div className="cart-shipping-note">
                <Truck size={17} />
                <p>
                  <b>معلومة الشحن</b>رسوم الشحن غير مشمولة في الأسعار المعروضة،
                  وتُؤكَّد حسب المنطقة عبر واتساب.
                </p>
              </div>
              <button className="whatsapp-button" onClick={sendWhatsApp}>
                <MessageCircle size={21} /> أرسلي الطلب عبر واتساب
              </button>
              <p className="summary-note">
                بالضغط على الزر سيفتح واتساب برسالة طلب جاهزة. يمكنك تعديلها قبل الإرسال.
              </p>
            </aside>
          </div>
        ) : (
          <div className="empty-state cart-empty">
            <ShoppingBag size={42} />
            <span>سلتك تنتظر لمستك</span>
            <p>لم تضيفي أي قطعة بعد. تصفحي تشكيلتنا وابني طلبك على مهل.</p>
            <Link href="/products" className="primary-button">
              تصفحي المنتجات
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
