import { CircleCheck, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { Link } from "wouter";
import { siteConfig } from "@/lib/siteConfig";

const shippingHighlights = [
  {
    icon: Truck,
    eyebrow: "مدة التوصيل",
    title: "من يومين إلى 7 أيام عمل.",
    description:
      "داخل القاهرة والجيزة، يستغرق التوصيل عادةً من 2 إلى 5 أيام عمل. أما باقي المحافظات، فيستغرق عادةً من 5 إلى 7 أيام عمل.",
    className: "",
  },
  {
    icon: MessageCircle,
    eyebrow: "رسوم الشحن",
    title: "تُحدّد حسب منطقتك.",
    description:
      "رسوم التوصيل تختلف من منطقة لأخرى، وسيتم تأكيدها معك عبر واتساب قبل اعتماد الطلب.",
    className: "berry-card",
  },
  {
    icon: CircleCheck,
    eyebrow: "تنبيه مهم",
    title: "الأسعار لا تشمل الشحن.",
    description:
      "أسعار المنتجات الظاهرة في الموقع لا تتضمن رسوم الشحن. تظهر رسوم التوصيل كتأكيد منفصل عند التواصل بشأن الطلب.",
    className: "notice-card",
  },
];

export default function Shipping() {
  return (
    <main className="page-shell shipping-page">
      <section className="container shipping-hero">
        <div>
          <p className="eyebrow">
            <Truck size={16} /> تصل اختياراتك إليك
          </p>
          <h1>
            معلومات <span>الشحن والتوصيل.</span>
          </h1>
          <p>
            نرتّب كل طلب بعناية، ثم نؤكد معك تفاصيل التوصيل والرسوم عبر واتساب
            قبل الإرسال.
          </p>
          <a
            className="primary-button"
            href={siteConfig.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} /> اسألي عن شحنتك
          </a>
        </div>
        <div className="shipping-hero-mark">
          <PackageCheck size={61} />
          <span>{siteConfig.name}</span>
        </div>
      </section>

      <section className="container shipping-content">
        {shippingHighlights.map(
          ({ icon: Icon, eyebrow, title, description, className }) => (
            <article className={`shipping-card ${className}`} key={title}>
              <span className="shipping-icon">
                <Icon size={23} />
              </span>
              <p className="eyebrow">{eyebrow}</p>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          )
        )}
      </section>

      <section className="container shipping-bottom">
        <div>
          <h2>جاهزة لتختاري قطعك؟</h2>
          <p>
            أضيفي ما أعجبك إلى السلة، ثم أرسلي طلبك على واتساب لنؤكد معك
            التفاصيل.
          </p>
        </div>
        <Link href="/products" className="secondary-button">
          تصفحي المنتجات
        </Link>
      </section>
    </main>
  );
}
