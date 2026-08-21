import { ArrowLeft, Grid2X2 } from "lucide-react";
import { Link } from "wouter";
import { useCatalog } from "@/contexts/CatalogContext";
import { mainImage } from "@/lib/products";

export default function Categories() {
  const { categories, loading, products } = useCatalog();

  return (
    <main className="page-shell categories-page">
      <section className="container page-intro categories-intro">
        <p className="eyebrow">
          <Grid2X2 size={16} /> اختاري بحسب احتياجك
        </p>
        <h1>
          أقسام <span>معرض اللؤلؤه.</span>
        </h1>
        <p>تصفحي الأقسام المتاحة، ثم اختاري القسم الذي يهمك لعرض كل قطعة داخله.</p>
      </section>

      {loading ? (
        <p className="container catalog-state">جارٍ تحميل الأقسام…</p>
      ) : (
        <section className="container categories-grid" aria-label="أقسام معرض اللؤلؤه">
          {categories.map((category, index) => {
            const categoryProducts = products.filter(
              product => product.categoryId === category.id
            );
            const coverProduct = categoryProducts[0];

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className={`category-directory-card category-directory-card-${(index % 4) + 1}`}
              >
                {coverProduct && (
                  <img src={mainImage(coverProduct)} alt="" aria-hidden="true" />
                )}
                <span className="category-directory-shade" />
                <span className="category-directory-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="category-directory-copy">
                  <small>{category.nameEnglish}</small>
                  <strong>{category.nameArabic}</strong>
                  <p>{category.description || "تشكيلة مختارة للبيت والمطبخ."}</p>
                  <span className="category-directory-link">
                    {categoryProducts.length ? `${categoryProducts.length} قطعة` : "استكشفي القسم"}
                    <ArrowLeft size={16} />
                  </span>
                </span>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
