import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useGetSettings } from "../hooks/useQueries";
import SevaMitraBadge from "./SevaMitraBadge";

const DKAN_LOGO = "/assets/uploads/logo-image-2-1.jpg";

export default function Footer() {
  const { lang } = useLanguage();
  const { data: settings } = useGetSettings();
  const [logoError, setLogoError] = useState(false);

  const currentYear = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== "undefined"
      ? window.location.hostname
      : "dkan-enterprises",
  );

  return (
    <footer className="bg-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {logoError ? (
                <div className="h-14 w-14 rounded-full bg-electric flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DK</span>
                </div>
              ) : (
                <img
                  src={DKAN_LOGO}
                  alt="DKAN Enterprises"
                  className="h-14 w-14 rounded-full object-cover border-2 border-electric"
                  onError={() => setLogoError(true)}
                />
              )}
              <div>
                <p className="text-white font-bold font-poppins">
                  DKAN ENTERPRISES
                </p>
                <p className="text-electric text-xs font-devanagari">
                  होम अप्लायंस रिपेयर
                </p>
              </div>
            </div>

            {/* SevaMitra Badge */}
            <div className="mb-4">
              <SevaMitraBadge variant="footer" />
            </div>

            {/* UP Government */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full text-xs mb-4">
              <span>🏛️</span>
              <span className="font-devanagari">
                {lang === "hi"
                  ? "उत्तर प्रदेश सरकार अधिकृत"
                  : "UP Government Authorized"}
              </span>
            </div>

            <p className="text-sm text-gray-400 font-devanagari">
              {lang === "hi"
                ? "DKAN ENTERPRISES — उत्तर प्रदेश में विश्वसनीय होम अप्लायंस रिपेयर सेवा।"
                : "DKAN ENTERPRISES — Trusted home appliance repair service in Uttar Pradesh."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 font-poppins">
              {lang === "hi" ? "त्वरित लिंक" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "#services", labelHi: "सेवाएं", labelEn: "Services" },
                { href: "#booking", labelHi: "बुकिंग", labelEn: "Booking" },
                { href: "#contact", labelHi: "संपर्क", labelEn: "Contact" },
                { href: "/admin", labelHi: "एडमिन", labelEn: "Admin" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-electric transition-colors font-devanagari"
                  >
                    {lang === "hi" ? link.labelHi : link.labelEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 font-poppins">
              {lang === "hi" ? "संपर्क" : "Contact"}
            </h3>
            <ul className="space-y-2 text-sm font-devanagari">
              <li>📞 {settings?.contactPhone || "+91 80096 75645"}</li>
              <li>💬 {settings?.whatsappNumber || "+91 80096 75645"}</li>
              <li>📍 {settings?.businessAddress || "Kanpur, Uttar Pradesh"}</li>
              <li>🕐 {settings?.businessHours || "Mon-Sat: 9am-7pm"}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-devanagari">
            © {currentYear} DKAN ENTERPRISES.{" "}
            {lang === "hi" ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}
          </p>
          <p className="text-xs text-gray-500">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
