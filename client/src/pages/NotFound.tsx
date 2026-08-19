import { Link } from "wouter";
export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="container empty-state">
        <span>لا نجد هذه الصفحة</span>
        <p>ربما انتقلت القطعة إلى رف آخر.</p>
        <Link href="/" className="primary-button">
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
