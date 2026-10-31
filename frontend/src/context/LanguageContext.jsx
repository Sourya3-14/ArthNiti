import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = "arthniti_language";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (["english", "hindi", "bengali"].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return "english"; // Default language
  });

  const toggleLanguage = (lang) => {
    if (["english", "hindi", "bengali"].includes(lang)) {
      setLanguage(lang);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      } catch (e) {
        console.warn("Could not save language to localStorage", e);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
