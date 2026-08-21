import { Heart, Moon, Search, ShoppingBag, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useStore } from "@/contexts/StoreContext";

const links = [
  ["الرئيسية", "/"],
  ["المنتجات", "/products"],
  ["الأقسام", "/categories"],
  ["تواصل معنا", "/contact"],
] as const;

export default function Header() {
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { cartCount, favoriteCount, searchTerm, setSearchTerm } = useStore();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate("/products");
  };

  const navigationLinks = (className?: string) =>
    links.map(([label, href]) => (
      <Link
        key={label}
        href={href}
        className={`${className ?? ""} ${location === href ? "is-active" : ""}`.trim()}
      >
        {label}
      </Link>
    ));

  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link href="/" className="brand" aria-label="العودة للرئيسية">
          <img
            src="/images/al-loulou-logo.png"
            alt="رمز معرض اللؤلؤه"
            className="brand-mark"
          />
          <span>
            <strong>معرض اللؤلؤه</strong>
            <em>للبيت والمطبخ</em>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navigationLinks()}
        </nav>

        <div className="header-actions">
          <form className="header-search" onSubmit={submitSearch} role="search">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="ابحثي عن قطعة..."
              aria-label="ابحثي عن منتج"
            />
          </form>
          <button
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label="تبديل المظهر"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <Link href="/favorites" className="icon-button" aria-label="المفضلة">
            <Heart size={20} />
            {favoriteCount > 0 && <b className="count-badge">{favoriteCount}</b>}
          </Link>
          <Link
            href="/cart"
            className="icon-button cart-button"
            aria-label="سلة المشتريات"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <b className="count-badge">{cartCount}</b>}
          </Link>
        </div>
      </div>

      <div className="mobile-header-area container">
        <form className="mobile-visible-search" onSubmit={submitSearch} role="search">
          <Search size={18} />
          <input
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="ابحثي عن قطعة في المعرض..."
            aria-label="ابحثي عن منتج"
          />
        </form>
        <nav className="mobile-primary-nav" aria-label="التنقل الرئيسي على الهاتف">
          {navigationLinks()}
        </nav>
      </div>
    </header>
  );
}
