import React, { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là trợ lý AI của PixelLog. Bạn cần tìm game gì hôm nay?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      const data = await response.json();
      
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Lỗi kết nối đến server chatbot!' }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ padding: '12px 20px', borderRadius: '30px', backgroundColor: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          💬 Chat AI
        </button>
      )}
      

      {isOpen && (
        <div style={{ width: '320px', height: '400px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '10px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '10px 15px', backgroundColor: '#6366f1', color: '#fff', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PixelLog AI Advisor</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>✖</button>
          </div>
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, index) => (
              <div key={index} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '8px 12px', borderRadius: '8px', backgroundColor: m.sender === 'user' ? '#e0e7ff' : '#f3f4f6', color: '#000' }}>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
          
          <div style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '5px' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Nhập câu hỏi về game..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button onClick={sendMessage} style={{ padding: '8px 12px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Gửi</button>
          </div>
        </div>
      )}
      
    </div>
  );
}