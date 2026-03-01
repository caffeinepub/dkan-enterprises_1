import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Language } from "../translations";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("dkan-lang");
    return stored === "hi" || stored === "en" ? stored : "hi";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("dkan-lang", newLang);
  };

  const toggleLang = () => {
    setLang(lang === "hi" ? "en" : "hi");
  };

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  return createElement(LanguageContext.Provider, {
    value: { lang, toggleLang, setLang },
    children,
  });
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
