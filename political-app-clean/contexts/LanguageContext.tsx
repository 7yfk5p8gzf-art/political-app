"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Lang = "hu" | "en" | "de" | "fr";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;

    if (saved) {
      setLangState(saved);
    }
  }, []);

  function setLang(lang: Lang) {
    localStorage.setItem("lang", lang);
    setLangState(lang);
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}