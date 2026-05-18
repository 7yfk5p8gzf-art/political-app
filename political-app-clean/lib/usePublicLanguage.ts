"use client";

import { useEffect, useState } from "react";
import { detectBrowserLanguage } from "@/lib/getPublicLabels";

export function usePublicLanguage() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(detectBrowserLanguage());

    function handleLanguageChange() {
      setLang(detectBrowserLanguage());
    }

    window.addEventListener("language-change", handleLanguageChange);

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  return lang;
}