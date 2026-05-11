import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

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

// Cache translations to avoid re-translating the same text
const translationCache = {};

/**
 * Translate text using the free Google Translate endpoint.
 * Falls back to the original text if translation fails.
 */
async function translateText(text, targetLang) {
  if (!text || targetLang === 'vi') return text; // Vietnamese is the source language

  const cacheKey = `${targetLang}::${text}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0].map(seg => seg[0]).join('');
    translationCache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.warn('Translation failed, using original:', err);
    return text;
  }
}

export function LanguageProvider({ children }) {
  const { user } = useAuth(); // Lấy user từ AuthContext
  const [systemLang, setSystemLang] = useState('vi');
  const [learningLang, setLearningLang] = useState('en');

  // Khi thông tin User thay đổi (đăng nhập, hoặc lưu cài đặt), cập nhật lại ngôn ngữ mặc định
  useEffect(() => {
    if (user) {
      if (user.uiLanguage) setSystemLang(user.uiLanguage);
      if (user.learningLanguage) setLearningLang(user.learningLanguage);
    }
  }, [user]);

  const switchSystemLanguage = (langCode) => {
    setSystemLang(langCode);
  };

  const switchLearningLanguage = (langCode) => setLearningLang(langCode);

  const getSystemLanguage = () => LANGUAGES.find(l => l.code === systemLang) || LANGUAGES[0];
  const getLearningLanguage = () => LANGUAGES.find(l => l.code === learningLang) || LANGUAGES[0];

  const tSystem = useCallback(async (text) => {
    if (systemLang === 'vi' || !text) return text;
    return await translateText(text, systemLang);
  }, [systemLang]);

  const tLearning = useCallback(async (text) => {
    if (learningLang === 'vi' || !text) return text;
    return await translateText(text, learningLang);
  }, [learningLang]);

  return (
    <LanguageContext.Provider value={{
      systemLang,
      learningLang,
      switchSystemLanguage,
      switchLearningLanguage,
      getSystemLanguage,
      getLearningLanguage,
      languages: LANGUAGES,
      tSystem,
      tLearning
    }}>
      {children}
    </LanguageContext.Provider>
  );
}
