import { useState, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Chào bạn! Tôi là LingoBot, trợ lý du lịch của bạn. Bạn muốn hỏi gì về các địa danh Việt Nam hôm nay?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, tôi đang trong quá trình phát triển và chưa thể trả lời câu hỏi này!' }]);
    }, 1000);
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
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-info text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-xl">🤖</span> LingoBot
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-white/80">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-sm flex-shrink-0">
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-info text-white rounded-tr-sm' : 'bg-white border border-gray-100 rounded-tl-sm text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Nhập tin nhắn của bạn..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-info"
            />
            <button 
              onClick={sendMessage}
              className="w-10 h-10 bg-info text-white rounded-full flex items-center justify-center text-lg hover:bg-blue-600 transition-colors"
            >
              📤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
