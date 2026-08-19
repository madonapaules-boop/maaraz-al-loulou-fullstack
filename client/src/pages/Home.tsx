import {
  ArrowLeft,
  ArrowUpLeft,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCatalog } from "@/contexts/CatalogContext";
import { mainImage } from "@/lib/products";
import { siteConfig } from "@/lib/siteConfig";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [, navigate] = useLocation();
  const {
    products,
    categories,
    bestSellers,
    newArrivals,
    offers,
    loading,
    error,
  } = useCatalog();
  const railCategories = categories
    .slice(0, 4)
    .map(category => ({
      ...category,
      count: products.filter(product => product.categoryId === category.id)
        .length,
      image: mainImage(
        products.find(product => product.categoryId === category.id) ||
          ({ images: [] } as never)
      ),
    }));
  return (
    <>
      <section className="hero-section">
        <div className="hero-image">
          <img
            src="/images/al-loulou-hero.jpg"
            alt="أدوات مائدة أنيقة من معرض اللؤلؤه"
          />
          <div className="hero-shade" />
        </div>
        <div className="container hero-content">
          <p className="eyebrow">
            <Sparkles size={16} /> لمسات بيتك تبدأ من هنا
          </p>
          <h1>
            اختاري تفاصيل
            <br />
            <span>تليق ببيتِك.</span>
          </h1>
          <p className="hero-copy">
            تشكيلة منتقاة للمطبخ والمائدة والديكور، صُممت لترافق لحظاتك اليومية
            بجمال هادئ.
          </p>
          <div className="hero-buttons">
            <Link href="/products" className="primary-button">
              تصفحي المجموعة <ArrowLeft size={18} />
            </Link>
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="text-button"
            >
              <MessageCircle size={18} /> اطلبي عبر واتساب
            </a>
          </div>
        </div>
        <div className="hero-note">
          <span>مجموعات مختارة</span>
          <b>لبيت يشبهك</b>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div>
            <Truck size={22} />
            <span>
              <b>توصيل داخل مصر</b>تُنسّق تفاصيله عبر واتساب
            </span>
          </div>
          <div>
            <ShieldCheck size={22} />
            <span>
              <b>اختيارات منتقاة</b>قطعة وراء قطعة باهتمام
            </span>
          </div>
          <div>
            <Sparkles size={22} />
            <span>
              <b>هدايا وضيافة</b>للحظات الصغيرة والمميزة
            </span>
          </div>
        </div>
      </section>

      <section className="editorial-section container">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">الأقرب إلى قلبك</p>
            <h2>
              كل زاوية لها
              <br />
              قطعتها الخاصة.
            </h2>
          </div>
          <p>
            تصنيفات تجعل الوصول إلى القطعة المناسبة أسهل، وتمنح بيتك ترتيباً
            جميلاً من أول رف حتى آخر مائدة.
          </p>
        </div>
        <div className="category-rail">
          {railCategories.map((category, index) => (
            <button
              key={category.id}
              className={`category-card category-card-${index + 1}`}
              onClick={() => navigate(`/products?category=${category.id}`)}
            >
              <img src={category.image} alt={category.nameArabic} />
              <span className="category-overlay" />
              <div>
                <small>{category.count} قطعة</small>
                <h3>{category.nameArabic}</h3>
                <p>{category.description || "قطع منتقاة لكل تفصيلة"}</p>
                <i>
                  <ArrowUpLeft size={18} />
                </i>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">مختارات اللؤلؤه</p>
              <h2>الأكثر طلباً هذا الأسبوع.</h2>
            </div>
            <Link href="/products" className="view-all">
              اكتشفي كل القطع <ArrowLeft size={17} />
            </Link>
          </div>
          {loading ? (
            <p className="catalog-state">جارٍ تحميل المختارات…</p>
          ) : error ? (
            <p className="catalog-state">{error}</p>
          ) : (
            <div className="product-grid featured-grid">
              {bestSellers.slice(0, 4).map((product, index) => (
                <ProductCard product={product} index={index} key={product.id} />
              ))}
            </div>
          )}
        </div>
      </section>
      {!loading && (newArrivals.length > 0 || offers.length > 0) && (
        <section className="editorial-section container live-collections">
          <div className="live-collection">
            <div className="section-heading">
              <div>
                <p className="eyebrow">وصل حديثاً</p>
                <h2>
                  تفاصيل جديدة
                  <br />
                  لبيتك.
                </h2>
              </div>
            </div>
            <div className="product-grid">
              {newArrivals.slice(0, 4).map((product, index) => (
                <ProductCard product={product} index={index} key={product.id} />
              ))}
            </div>
          </div>
          {offers.length > 0 && (
            <div className="live-collection offers-collection">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">اختيارات بسعر خاص</p>
                  <h2>
                    عروض <span>اللؤلؤه.</span>
                  </h2>
                </div>
                <Link href="/products" className="view-all">
                  كل العروض <ArrowLeft size={17} />
                </Link>
              </div>
              <div className="product-grid">
                {offers.slice(0, 4).map((product, index) => (
                  <ProductCard
                    product={product}
                    index={index}
                    key={product.id}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="story-section container">
        <div className="story-image">
          <img
            src="/images/al-loulou-table.jpg"
            alt="تفاصيل ديكور منزلية هادئة"
          />
        </div>
        <div className="story-copy">
          <p className="eyebrow">بيتك يروي عنك</p>
          <h2>الجمال لا يحتاج مناسبة.</h2>
          <p>
            سواء كانت قهوتك الصباحية أو مائدة تجمع من تحبين، القطعة المناسبة
            تجعل العادة الصغيرة لحظة تستحق التذكر.
          </p>
          <Link href="/products" className="secondary-button">
            ابني تشكيلتك <ArrowLeft size={18} />
          </Link>
        </div>
        <div className="pearl-orb" />
      </section>
    </>
  );
}
