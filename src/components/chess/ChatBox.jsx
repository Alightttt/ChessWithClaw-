import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatBox({ chatHistory, onSendMessage }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const [botJustMessaged, setBotJustMessaged] = useState(false);
  const [userJustMessaged, setUserJustMessaged] = useState(false);
  const prevChatHistoryLength = useRef(chatHistory.length);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (chatHistory.length > prevChatHistoryLength.current) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.sender === 'agent') {
        setBotJustMessaged(true);
        setTimeout(() => setBotJustMessaged(false), 3000);
      }
    }
    prevChatHistoryLength.current = chatHistory.length;
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
    setUserJustMessaged(true);
    setTimeout(() => setUserJustMessaged(false), 3000);
  };

  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg flex flex-col h-full shadow-lg">
      <div className="p-3 sm:p-4 border-b border-[#333] flex justify-between items-center">
        <h2 className="text-[#c9973a] font-bold text-sm sm:text-base tracking-wider">LIVE CHAT</h2>
        <div className="flex items-center gap-2">
          {userJustMessaged && (
            <span className="text-[#2dc653] text-[10px] sm:text-xs font-mono animate-pulse">Bot informed</span>
          )}
          {botJustMessaged && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#2dc653] animate-pulse shadow-[0_0_8px_#2dc653]" title="Bot just messaged" />
          )}
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm space-y-3 min-h-[150px] max-h-[250px]"
      >
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#666] italic">
            No messages yet. Say hi!
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'human' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-[#666] mb-1">
                {msg.sender === 'human' ? 'You' : '🤖 Claw'}
              </span>
              <div 
                className={`px-3 py-2 rounded-lg max-w-[85%] break-words ${
                  msg.sender === 'human' 
                    ? 'bg-[#c9973a] text-black rounded-tr-none' 
                    : 'bg-[#333] text-[#f0f0f0] rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-[#333] flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message the bot..."
          className="flex-1 bg-[#141414] border border-[#333] rounded px-3 py-2 text-[#f0f0f0] font-mono text-xs sm:text-sm outline-none focus:border-[#c9973a] transition-colors"
        />
        <button 
          type="submit"
          disabled={!message.trim()}
          className="bg-[#c9973a] hover:bg-[#e8b84b] disabled:bg-[#333] disabled:text-[#666] text-black p-2 rounded flex items-center justify-center transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
