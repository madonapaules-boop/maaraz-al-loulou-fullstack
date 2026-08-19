import { type FormEvent, useState } from "react";
import { MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function Contact() {
  const [customerName, setCustomerName] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");

  function submitContactRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = [
      `مرحباً ${siteConfig.name}،`,
      `الاسم: ${customerName.trim()}`,
      `الرسالة: ${customerMessage.trim()}`,
    ].join("\n");

    window.open(
      `${siteConfig.whatsappUrl}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="page-shell contact-page">
      <section className="container contact-hero">
        <div>
          <p className="eyebrow">نسمعك دائماً</p>
          <h1>
            دعينا نرتّب
            <br />
            <span>تفاصيلك معاً.</span>
          </h1>
          <p>
            سواء لديك سؤال عن قطعة، أو ترغبين في تجهيز هدية وضيافة، تواصلي معنا
            بالطريقة الأقرب لك.
          </p>
        </div>
        <div className="contact-orb">
          <img
            src="/images/al-loulou-table.jpg"
            alt="تفاصيل من معرض اللؤلؤه"
          />
        </div>
      </section>

      <div className="container contact-layout">
        <section className="contact-ways" aria-label="بيانات التواصل">
          <a
            href={siteConfig.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="contact-way"
          >
            <span>
              <MessageCircle size={22} />
            </span>
            <div>
              <small>الأسرع والأقرب</small>
              <h3>واتساب</h3>
              <p>{siteConfig.phoneDisplay}</p>
            </div>
          </a>
          <a
            href={`tel:${siteConfig.phoneInternational}`}
            className="contact-way"
          >
            <span>
              <Phone size={22} />
            </span>
            <div>
              <small>من السبت إلى الخميس</small>
              <h3>اتصلي بنا</h3>
              <p>{siteConfig.phoneDisplay}</p>
            </div>
          </a>
          <div className="contact-way">
            <span>
              <MapPin size={22} />
            </span>
            <div>
              <small>العنوان</small>
              <h3>زورينا في المعرض</h3>
              <p>{siteConfig.address}</p>
            </div>
          </div>
          <div className="map-placeholder">
            <MapPin size={28} />
            <span>شارع الملوحة، طما، سوهاج</span>
            <small>مصر</small>
          </div>
        </section>

        <form className="contact-form" onSubmit={submitContactRequest}>
          <p className="eyebrow">رسالة سريعة</p>
          <h2>نحب أن نسمع منك.</h2>
          <label>
            الاسم
            <input
              value={customerName}
              onChange={event => setCustomerName(event.target.value)}
              placeholder="اكتبي اسمك"
              required
            />
          </label>
          <label>
            رسالتك
            <textarea
              value={customerMessage}
              onChange={event => setCustomerMessage(event.target.value)}
              placeholder="كيف يمكننا مساعدتك؟"
              rows={5}
              required
            />
          </label>
          <button className="primary-button" type="submit">
            إرسال عبر واتساب <Send size={18} />
          </button>
          <p className="form-note">
            سيُفتح واتساب برسالة جاهزة، ويمكنك مراجعتها قبل الإرسال.
          </p>
        </form>
      </div>
    </main>
  );
}
