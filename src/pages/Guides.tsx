import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2, Trash2, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

// Initialize Gemini safely
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

try {
  if (apiKey && apiKey !== 'undefined') {
    ai = new GoogleGenAI(apiKey);
  }
} catch (e) {
  console.error("Failed to initialize Gemini AI:", e);
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Guides() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm **StraySafe AI**. Describe the situation and I'll guide you through the safest steps to help a stray animal." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!ai) {
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ **RescueAI is currently offline.** Please ensure a valid VITE_GEMINI_API_KEY is provided in the environment configuration." }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (err) {
      console.error('Gemini Error:', err);
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please ensure your API key is valid and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: "Chat cleared. How can I help you with a rescue today?" }]);
  };

  return (
    <div className={
      isFullScreen
        ? "fixed inset-0 z-[60] bg-[#0a0908] flex flex-col p-4 md:p-8"
        : "max-w-6xl mx-auto flex flex-col h-[calc(100vh-160px)]"
    }>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
          Rescue<span className="text-primary">AI</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={clearChat}
            className="p-3 rounded-2xl glass hover:bg-red-500/10 text-white/30 hover:text-red-500 transition-all"
            title="Clear Chat"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-3 rounded-2xl glass hover:bg-white/10 text-white/50 hover:text-white transition-all"
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {!ai && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500/80 text-sm font-medium">
          <AlertCircle className="w-5 h-5" />
          <span>Gemini API Key missing. RescueAI is running in offline mode.</span>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative min-h-0">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                msg.role === 'user'
                  ? 'bg-white/10 border border-white/10'
                  : 'bg-primary/20 border border-primary/30'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-6 h-6 text-white/70" />
                  : <Bot className="w-6 h-6 text-primary" />
                }
              </div>
              <div className={`max-w-[85%] px-7 py-5 rounded-[28px] shadow-xl ${
                msg.role === 'user'
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 border border-white/5 text-white/90'
              }`}>
                <div className="prose prose-invert prose-base max-w-none 
                  prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-black
                  prose-li:text-white/80 prose-headings:text-white prose-headings:font-black">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="px-7 py-5 rounded-[28px] bg-white/5 border border-white/5">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-10 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="relative group max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={ai ? "Initialize rescue query protocol..." : "RescueAI is offline..."}
              disabled={!ai}
              className="w-full glass-input py-6 px-8 pr-24 rounded-full text-lg font-medium text-white placeholder:text-white/20"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !ai}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(217,119,6,0.3)]"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
