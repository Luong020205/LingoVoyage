import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import ImageCarousel from '../components/landmark/ImageCarousel';
import WordPopup from '../components/landmark/WordPopup';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchLandmarkBySlug, fetchProvinceBySlug } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hàm render đoạn mô tả với các từ vựng được gạch chân và hỗ trợ dịch thuật.
 */
function HighlightedDescription({ description, vocabularies, onWordClick }) {
  const { learningLang, tLearning } = useLanguage();
  const [translatedParts, setTranslatedParts] = useState([]);
  const [parts, setParts] = useState([]);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    if (!description) return;
    
    let activeHighlights = [];
    if (vocabularies?.length) {
      activeHighlights = vocabularies
        .filter(v => v.highlightText && v.highlightText.trim())
        .map(v => ({ text: v.highlightText.trim(), vocab: v }));
      
      activeHighlights.sort((a, b) => b.text.length - a.text.length);
    }

    setHighlights(activeHighlights);

    if (activeHighlights.length === 0) {
      setParts([description]);
    } else {
      const pattern = activeHighlights.map(h => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`(${pattern})`, 'gi');
      setParts(description.split(regex));
    }
  }, [description, vocabularies]);

  useEffect(() => {
    let isMounted = true;
    const translateAll = async () => {
      if (learningLang === 'vi') {
        if (isMounted) setTranslatedParts(parts);
        return;
      }
      
      const result = await Promise.all(parts.map(async (part) => {
        if (!part || !part.trim()) return part;
        return await tLearning(part);
      }));
      
      if (isMounted) setTranslatedParts(result);
    };

    if (parts.length > 0) {
      translateAll();
    }
    
    return () => { isMounted = false; };
  }, [parts, learningLang, tLearning]);

  if (!description) return null;

  return (
    <p>
      {translatedParts.map((tPart, idx) => {
        const originalPart = parts[idx];
        const matched = highlights.find(h => h.text.toLowerCase() === originalPart.toLowerCase());
        if (matched) {
          return (
            <span
              key={idx}
              onClick={() => onWordClick(matched.vocab)}
              className="text-primary font-semibold underline decoration-primary/40 decoration-2 underline-offset-2 cursor-pointer hover:bg-primary/10 hover:decoration-primary px-0.5 rounded transition-all"
            >
              {tPart}
            </span>
          );
        }
        return <span key={idx}>{tPart}</span>;
      })}
    </p>
  );
}

export default function LandmarkPage() {
  const { provinceSlug, landmarkSlug } = useParams();
  const { systemLang, learningLang, languages, tSystem, tLearning, switchLearningLanguage } = useLanguage();
  
  const [landmark, setLandmark] = useState(null);
  const [province, setProvince] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [translatedDescText, setTranslatedDescText] = useState('');

  const [labels, setLabels] = useState({
    home: 'Trang chủ',
    loading: 'Đang tải thông tin địa danh...',
    notFound: 'Không tìm thấy địa danh',
    listen: 'Nghe đọc',
    save: 'Lưu sổ tay',
    language: 'Ngôn ngữ',
    intro: 'Giới thiệu',
    moreInfo: 'Thông tin thêm',
    address: 'Địa chỉ',
    openHours: 'Giờ mở cửa',
    ticketPrice: 'Giá vé',
    notUpdated: 'Chưa cập nhật'
  });

  useEffect(() => {
    let isMounted = true;
    const translateLabels = async () => {
      const newLabels = {
        home: await tSystem('Trang chủ'),
        loading: await tSystem('Đang tải thông tin địa danh...'),
        notFound: await tSystem('Không tìm thấy địa danh'),
        listen: await tSystem('Nghe đọc'),
        save: await tSystem('Lưu sổ tay'),
        language: await tSystem('Ngôn ngữ'),
        intro: await tSystem('Giới thiệu'),
        moreInfo: await tSystem('Thông tin thêm'),
        address: await tSystem('Địa chỉ'),
        openHours: await tSystem('Giờ mở cửa'),
        ticketPrice: await tSystem('Giá vé'),
        notUpdated: await tSystem('Chưa cập nhật')
      };
      if (isMounted) setLabels(newLabels);
    };
    translateLabels();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [landmarkData, provinceData] = await Promise.all([
          fetchLandmarkBySlug(provinceSlug, landmarkSlug),
          fetchProvinceBySlug(provinceSlug).catch(() => null)
        ]);
        setLandmark(landmarkData);
        setProvince(provinceData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [provinceSlug, landmarkSlug]);

  useEffect(() => {
    if (landmark?.description) {
      const getTranslation = async () => {
        const text = await tLearning(landmark.description);
        setTranslatedDescText(text);
      };
      getTranslation();
    }
  }, [landmark?.description, learningLang, tLearning]);

  const handleSpeak = () => {
    if (!translatedDescText) return;
    const utterance = new SpeechSynthesisUtterance(translatedDescText);
    if (learningLang === 'en') utterance.lang = 'en-US';
    else if (learningLang === 'zh') utterance.lang = 'zh-CN';
    else if (learningLang === 'ko') utterance.lang = 'ko-KR';
    else utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return <LoadingSpinner message={labels.loading} />;
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;
  if (!landmark) return <div className="text-center py-20">{labels.notFound}</div>;

  const data = landmark;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumb items={[
        { label: labels.home, link: '/' },
        { label: province?.name || provinceSlug, link: `/province/${provinceSlug}` },
        { label: data.name }
      ]} />

      <ImageCarousel images={data.images} />

      <div className="space-y-8 mt-6">
        
        {/* Main Content */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
           
           <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-heading font-bold text-gray-800">{data.name}</h1>
              <div className="flex gap-2">
                 <button onClick={handleSpeak} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl hover:bg-primary/10 hover:text-primary transition-colors" title={labels.listen}>🔊</button>
                 <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl hover:bg-info/10 hover:text-info transition-colors" title={labels.save}>🔖</button>
              </div>
           </div>

           {/* Language selector */}
           <div className="flex items-center gap-2 mb-6 p-2 bg-gray-50 rounded-xl overflow-x-auto">
              <span className="text-sm font-medium text-gray-500 pl-2">🌐 {labels.language}:</span>
              <div className="flex gap-2">
                 {languages.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => switchLearningLanguage(lang.code)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${learningLang === lang.code ? 'bg-white border-gray-200 shadow-sm font-medium text-primary' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                    >
                       {lang.flag} {lang.name}
                    </button>
                 ))}
              </div>
           </div>

           {/* Description with highlighted vocabulary */}
           <div className="prose max-w-none text-gray-600 leading-relaxed text-justify relative">
              <h3 className="flex items-center gap-2 text-lg font-heading font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
                <span>📝</span> {labels.intro}
              </h3>
              <HighlightedDescription 
                description={data.description} 
                vocabularies={data.vocabularies}
                onWordClick={setSelectedWord}
              />
           </div>

        </div>

        {/* Info (Moved to bottom) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-heading font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <span>📍</span> {labels.moreInfo}
          </h3>
          <ul className="space-y-4 text-sm">
             <li className="flex gap-3">
                <span className="text-gray-400 text-lg">📍</span>
                <div><strong className="block text-gray-800 mb-1">{labels.address}</strong><span className="text-gray-600">{data.address || labels.notUpdated}</span></div>
             </li>
             <li className="flex gap-3">
                <span className="text-gray-400 text-lg">🕒</span>
                <div><strong className="block text-gray-800 mb-1">{labels.openHours}</strong><span className="text-gray-600">{data.openHours || labels.notUpdated}</span></div>
             </li>
             <li className="flex gap-3">
                <span className="text-gray-400 text-lg">🎫</span>
                <div><strong className="block text-gray-800 mb-1">{labels.ticketPrice}</strong><span className="text-gray-600">{data.ticketPrice || labels.notUpdated}</span></div>
             </li>
          </ul>
        </div>

      </div>

      <WordPopup word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
