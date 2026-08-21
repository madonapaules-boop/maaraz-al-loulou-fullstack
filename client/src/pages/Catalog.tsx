import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/contexts/StoreContext";
import { useCatalog } from "@/contexts/CatalogContext";

export default function Catalog() {
  const [location] = useLocation();
  const { searchTerm, setSearchTerm } = useStore();
  const { products, categories, loading, error } = useCatalog();
  const [category, setCategory] = useState("الكل");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const target = new URLSearchParams(location.split("?")[1] || "").get("category");
    setCategory(target ?? "الكل");
  }, [location]);

  const activeCategory = categories.find(item => item.id === Number(category));
  const categoryProducts = useMemo(
    () =>
      products.filter(
        product => category === "الكل" || product.categoryId === Number(category)
      ),
    [category, products]
  );
  const priceCeiling = useMemo(
    () => Math.max(0, ...categoryProducts.map(product => product.finalPrice)),
    [categoryProducts]
  );

  useEffect(() => setMaxPrice(priceCeiling), [priceCeiling]);

  const visible = useMemo(
    () =>
      products
        .filter(product => {
          const searchMatch = `${product.name} ${product.categoryNameArabic} ${product.color}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const categoryMatch =
            category === "الكل" || product.categoryId === Number(category);

          return searchMatch && categoryMatch && product.finalPrice <= maxPrice;
        })
        .sort((a, b) =>
          sort === "low"
            ? a.finalPrice - b.finalPrice
            : sort === "high"
              ? b.finalPrice - a.finalPrice
              : sort === "new"
                ? Date.parse(b.createdAt) - Date.parse(a.createdAt)
                : Number(b.isBestSeller) - Number(a.isBestSeller)
        ),
    [category, maxPrice, products, searchTerm, sort]
  );

  const reset = () => {
    setCategory("الكل");
    setSearchTerm("");
    setSort("featured");
  };

  const filterPanel = (
    <aside className="filter-panel">
      <div className="filter-panel-head">
        <h3>
          <Filter size={18} /> تصفية القطع
        </h3>
        <button onClick={reset}>إعادة ضبط</button>
        <button className="mobile-close" onClick={() => setFiltersOpen(false)}>
          <X size={20} />
        </button>
      </div>
      <div className="filter-group">
        <h4>القسم</h4>
        <div className="filter-list">
          <button
            onClick={() => setCategory("الكل")}
            className={category === "الكل" ? "selected" : ""}
          >
            كل الأقسام
          </button>
          {categories.map(item => (
            <button
              key={item.id}
              onClick={() => setCategory(String(item.id))}
              className={category === String(item.id) ? "selected" : ""}
            >
              {item.nameArabic}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="price-label">
          <h4>السعر</h4>
          <b>حتى {maxPrice.toLocaleString("ar-EG")} ج.م</b>
        </div>
        <input
          className="range-input"
          type="range"
          min="0"
          max={priceCeiling}
          step="50"
          value={Math.min(maxPrice, priceCeiling)}
          onChange={event => setMaxPrice(Number(event.target.value))}
          disabled={priceCeiling === 0}
        />
        <p className="price-filter-note">
          يتحدد الحد الأقصى تلقائياً حسب أغلى منتج في {activeCategory?.nameArabic ?? "كل الأقسام"}.
        </p>
      </div>
    </aside>
  );

  return (
    <main className="page-shell">
      <div className="container page-intro">
        <p className="eyebrow">{activeCategory?.nameEnglish ?? "تشكيلة متجددة"}</p>
        <h1>
          {activeCategory?.nameArabic ?? "قطع تليق بكل"} <span>{activeCategory ? "" : "تفصيلة."}</span>
        </h1>
        <p>
          {activeCategory
            ? `تصفحي كل منتجات قسم ${activeCategory.nameArabic}، واختاري القطعة التي تناسب بيتك.`
            : "تصفحي أدوات المطبخ، الضيافة، التخزين والديكور الذي يحوّل البيت إلى مساحة أقرب لك."}
        </p>
      </div>
      <div className="container catalog-layout">
        <div className="desktop-filters">{filterPanel}</div>
        <div className="catalog-content">
          <div className="catalog-toolbar">
            <button className="filter-trigger" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={18} /> تصفية
            </button>
            <span>
              يعرض <b>{visible.length}</b> قطعة
              {activeCategory ? ` من ${activeCategory.nameArabic}` : ""}
            </span>
            <label className="sort-select">
              ترتيب حسب{" "}
              <select value={sort} onChange={event => setSort(event.target.value)}>
                <option value="featured">الأكثر تميزاً</option>
                <option value="low">السعر: الأقل أولاً</option>
                <option value="high">السعر: الأعلى أولاً</option>
                <option value="new">الأحدث</option>
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
          {loading ? (
            <p className="catalog-state">جارٍ تحميل المنتجات…</p>
          ) : error ? (
            <div className="empty-state">
              <span>{error}</span>
              <p>تأكدي من إعداد رابط الـ API ثم أعيدي المحاولة.</p>
              <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
            </div>
          ) : visible.length ? (
            <div className="product-grid catalog-grid">
              {visible.map((product, index) => (
                <ProductCard product={product} index={index} key={product.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>لا توجد قطع مطابقة</span>
              <p>جرّبي تعديل البحث أو اختاري تصنيفاً آخر.</p>
              <button onClick={reset}>عرض كل القطع</button>
            </div>
          )}
        </div>
      </div>
      {filtersOpen && (
        <div className="filter-drawer-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="filter-drawer" onClick={event => event.stopPropagation()}>
            {filterPanel}
          </div>
        </div>
      )}
    </main>
  );
}
