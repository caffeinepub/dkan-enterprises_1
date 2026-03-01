import { useLanguage } from "../hooks/useLanguage";

interface SevaMitraBadgeProps {
  variant?: "hero" | "footer" | "inline";
}

// Official UP SevaMitra app on Google Play Store
const SEVAMITRA_APP_URL =
  "https://play.google.com/store/apps/details?id=com.digitalcorn.sewamitra";

export default function SevaMitraBadge({
  variant = "inline",
}: SevaMitraBadgeProps) {
  const { lang } = useLanguage();

  if (variant === "hero") {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        <p className="text-white/80 text-xs font-devanagari">
          {lang === "hi"
            ? "DKAN ENTERPRISES की सर्विस बुक करने के लिये"
            : "Book DKAN ENTERPRISES services via"}
        </p>
        <a
          href={SEVAMITRA_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-xl shadow-md transition-colors"
        >
          <img
            src="/assets/generated/sevamitra-logo.dim_512x512.png"
            alt="SevaMitra Logo"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wide leading-tight">
              SevaMitra App
            </p>
            <p className="text-xs font-devanagari font-bold leading-tight">
              {lang === "hi"
                ? "उत्तर प्रदेश का सेवामित्र ऐप डाउनलोड करे"
                : "Download UP SevaMitra App"}
            </p>
          </div>
        </a>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <a
        href={SEVAMITRA_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-2 rounded-lg transition-colors"
      >
        <img
          src="/assets/generated/sevamitra-logo.dim_512x512.png"
          alt="SevaMitra Logo"
          className="h-7 w-7 rounded-md object-cover"
        />
        <div>
          <p className="text-xs font-bold leading-tight">SevaMitra App</p>
          <p className="text-xs font-devanagari font-semibold leading-tight">
            {lang === "hi"
              ? "सेवामित्र ऐप डाउनलोड करे"
              : "Download UP SevaMitra App"}
          </p>
        </div>
      </a>
    );
  }

  // inline variant
  return (
    <a
      href={SEVAMITRA_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1.5 rounded-lg transition-colors"
    >
      <img
        src="/assets/generated/sevamitra-logo.dim_512x512.png"
        alt="SevaMitra Logo"
        className="h-5 w-5 rounded object-cover"
      />
      <span className="text-xs font-devanagari font-bold">
        {lang === "hi" ? "सेवामित्र ऐप डाउनलोड करे" : "Download UP SevaMitra App"}
      </span>
    </a>
  );
}
