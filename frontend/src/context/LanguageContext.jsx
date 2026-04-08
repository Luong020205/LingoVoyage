import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState('vi');

  const switchLanguage = (langCode) => {
    setCurrentLang(langCode);
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  };

  return (
    <LanguageContext.Provider value={{ currentLang, switchLanguage, getCurrentLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}
