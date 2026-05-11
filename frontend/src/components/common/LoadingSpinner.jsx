import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LoadingSpinner({ message }) {
  const { systemLang, tSystem } = useLanguage();
  const [translatedMessage, setTranslatedMessage] = useState(message || 'Đang tải dữ liệu...');

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const t = await tSystem(message || 'Đang tải dữ liệu...');
      if (isMounted) setTranslatedMessage(t);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem, message]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin-slow"></div>
      {translatedMessage && <p className="mt-4 text-gray-500 text-sm font-medium">{translatedMessage}</p>}
    </div>
  );
}
