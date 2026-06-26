import React, { useState, useRef, useEffect } from 'react';
import { askDoubt } from '../../services/api';

const QuickQAComponent = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Mentor. Ask me any doubt about coding, system design, or interview prep. I am here to help you learn!',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await askDoubt(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer }
      ]);
    } catch (error) {
      console.error('Failed to get answer:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try asking again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto text-left pb-16 pt-8 pr-6 md:pr-10 animate-fadeIn h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">Quick Q&A (AI Mentor)</h2>
        <p className="font-body-md text-body-md text-text-secondary">Ask your doubts directly. These sessions are not saved to history.</p>
      </div>

      <div className="flex-1 bg-bg-card border border-border-muted rounded-xl flex flex-col overflow-hidden shadow-sm mt-2 relative min-h-[500px]">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 items-start`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {msg.role === 'user' ? 'person' : 'smart_toy'}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-surface-container-high text-text-primary border border-border-muted rounded-tl-none'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i !== msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-high border border-border-muted rounded-tl-none flex items-center gap-1.5 h-[52px]">
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-low border-t border-border-muted shrink-0">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about code, concepts, or interview prep..."
              className="flex-1 bg-surface-variant text-on-surface border border-border-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl py-3 px-4 resize-none min-h-[52px] max-h-[150px] custom-scrollbar text-sm"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <p className="text-center text-text-secondary text-[10px] mt-2">
            AI can make mistakes. Verify important information. Answers are not saved to your history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickQAComponent;
