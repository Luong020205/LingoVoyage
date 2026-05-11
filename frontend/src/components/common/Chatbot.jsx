import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Chatbot() {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Khởi tạo sessionId để phân biệt các phiên chat
    let currentSession = sessionStorage.getItem('chatSessionId');
    if (!currentSession) {
      currentSession = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('chatSessionId', currentSession);
    }
    setSessionId(currentSession);
  }, []);

  const API = 'http://localhost:5000';

  // Cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (messages.length === 0) {
        loadHistory();
      }
    }
  }, [isOpen, messages]);

  const loadHistory = async () => {
    if (!token || !sessionId) return;
    try {
      const res = await fetch(`${API}/api/chatbot/history?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data.map(m => ({ sender: m.role === 'user' ? 'user' : 'bot', text: m.content })));
      } else {
        setMessages([{ sender: 'bot', text: `Chào ${user?.name || 'bạn'}! Tôi là LingoBot, trợ lý du lịch của bạn. Bạn muốn hỏi gì về các địa danh Việt Nam hôm nay?` }]);
      }
    } catch (error) {
      console.error("Lỗi nạp lịch sử:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg, sessionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi từ server");
      setMessages(prev => [...prev, { sender: 'bot', text: data.text || "Xin lỗi, tôi không thể trả lời lúc này.", landmark: data.landmark }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, tôi đang gặp chút trục trặc kết nối!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-info text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40 ${isOpen ? 'hidden' : ''}`}
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-info text-white px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-xl">🤖</span> LingoBot
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 w-8 h-8 rounded-full transition-colors">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-info text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-info text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 rounded-tl-sm text-gray-800'
                }`}>
                  {msg.text}
                  {msg.landmark && (
                    <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-2">
                      {msg.landmark.image && (
                        <img src={msg.landmark.image} alt={msg.landmark.name} className="w-full h-32 object-cover rounded-xl shadow-sm border border-gray-100" />
                      )}
                      <p className="font-bold text-gray-800 text-sm">{msg.landmark.name}</p>
                      <a 
                        href={`/province/${msg.landmark.provinceSlug}/${msg.landmark.slug}`}
                        className="mt-1 block w-full text-center bg-primary text-white py-2 px-3 rounded-lg font-medium text-xs hover:bg-primary-dark transition-colors shadow-sm"
                      >
                        Khám phá ngay 🚀
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="self-start flex gap-2 items-center text-gray-400 text-xs animate-pulse ml-10">
                LingoBot đang suy nghĩ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Hỏi LingoBot về địa danh..." 
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-info focus:bg-white transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={loading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${loading ? 'bg-gray-100 text-gray-400' : 'bg-info text-white hover:bg-blue-600 shadow-sm active:scale-90'}`}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
