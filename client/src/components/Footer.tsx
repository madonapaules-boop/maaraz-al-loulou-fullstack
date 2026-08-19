import {
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Link } from "wouter";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={siteConfig.logoUrl} alt="" />
          <div>
            <h3>{siteConfig.name}</h3>
            <p>تفاصيل صغيرة تصنع مائدة لا تُنسى.</p>
          </div>
        </div>
        <div>
          <h4>تصفحي</h4>
          <Link href="/products">كل المنتجات</Link>
          <Link href="/favorites">المفضلة</Link>
          <Link href="/cart">سلة المشتريات</Link>
          <Link href="/shipping">معلومات الشحن</Link>
        </div>
        <div>
          <h4>تواصل سريع</h4>
          <a href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> واتساب
          </a>
          <a href={`tel:${siteConfig.phoneInternational}`}>
            <Phone size={16} /> {siteConfig.phoneDisplay}
          </a>
          <a href={siteConfig.facebookUrl} target="_blank" rel="noreferrer">
            <Facebook size={16} /> فيسبوك
          </a>
          <span>
            <Instagram size={16} /> @maaraz.alloulou
          </span>
        </div>
        <div>
          <h4>زورينا</h4>
          <p className="footer-address">
            <MapPin size={17} /> {siteConfig.address}
          </p>
          <Link href="/contact" className="footer-contact">
            معلومات التواصل
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}
        </span>
        <span>صُنع بمحبة لبيتك</span>
      </div>
    </footer>
  );
}
