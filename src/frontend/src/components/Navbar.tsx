import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";

export default function Navbar() {
  const { lang, toggleLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const isAdmin = router.state.location.pathname === "/admin";

  const navLinks = [
    { href: "#services", labelEn: "Services", labelHi: "सेवाएं" },
    { href: "#booking", labelEn: "Book Now", labelHi: "बुक करें" },
    { href: "#contact", labelEn: "Contact", labelHi: "संपर्क" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm shadow-navy-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - DKAN only */}
        <a href="/" className="flex items-center gap-3">
          <img
            src="/assets/generated/dkan-logo.dim_400x400.png"
            alt="DKAN Enterprises"
            className="h-10 w-10 rounded-full object-cover border-2 border-electric"
          />
          <div>
            <p className="text-white font-bold text-sm font-poppins leading-tight">
              DKAN ENTERPRISES
            </p>
            <p className="text-electric text-xs font-devanagari leading-tight">
              होम अप्लायंस रिपेयर
            </p>
          </div>
        </a>

        {/* Desktop Nav */}
        {!isAdmin && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-electric transition-colors text-sm font-medium font-devanagari"
              >
                {lang === "hi" ? link.labelHi : link.labelEn}
              </a>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs bg-electric/20 text-electric border border-electric/30 px-3 py-1.5 rounded-full hover:bg-electric/30 transition-colors font-poppins"
          >
            {lang === "hi" ? "EN" : "हिं"}
          </button>

          {!isAdmin && (
            <a
              href="/admin"
              className="hidden md:block text-xs text-gray-400 hover:text-white transition-colors"
            >
              {lang === "hi" ? "एडमिन" : "Admin"}
            </a>
          )}

          {/* Mobile hamburger */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-1"
              aria-label="Toggle menu"
            >
              <div
                className={`w-5 h-0.5 bg-white transition-all mb-1 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
              />
              <div
                className={`w-5 h-0.5 bg-white transition-all mb-1 ${menuOpen ? "opacity-0" : ""}`}
              />
              <div
                className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && !isAdmin && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-electric py-2 text-sm font-devanagari"
            >
              {lang === "hi" ? link.labelHi : link.labelEn}
            </a>
          ))}
          <a
            href="/admin"
            className="block text-gray-400 hover:text-white py-2 text-xs"
          >
            {lang === "hi" ? "एडमिन पैनल" : "Admin Panel"}
          </a>
        </div>
      )}
    </nav>
  );
}
