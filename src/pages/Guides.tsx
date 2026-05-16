import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Sparkles, User, Bot, Loader2, ShieldAlert, AlertCircle, Trash2, Expand, Shrink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Guides() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Systems online. I am StraySafe AI, your tactical rescue assistant. How can I help you save a life today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "You are an expert animal rescue assistant named StraySafe AI. You provide clear, step-by-step first aid advice for stray animals (dogs, cats, birds, cows, etc.). Be concise, use tactical high-tech language matching the 'Clean Luminous' light theme, and ALWAYS emphasize safety for both the human and the animal. Use markdown for lists and bold text.",
        },
      });

      const modelResponse = response.text || "Connection lost. Please retry protocol.";
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (err) {
      console.error('Gemini Error:', err);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Neural link failure. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: "Memory purged. Systems reset. Standing by for new instructions." }]);
  };

  return (
    <div className={isFullScreen 
      ? "fixed inset-0 z-50 bg-[#050505] p-8 flex flex-col" 
      : "max-w-6xl mx-auto space-y-16 h-[calc(100vh-160px)] flex flex-col"
    }>
      <header className={`text-center space-y-6 shrink-0 relative ${isFullScreen ? 'mb-8' : ''}`}>
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute right-0 top-0 p-4 glass-strong rounded-[24px] hover:bg-white/10 transition-all text-white/40 hover:text-white border border-white/10"
          title={isFullScreen ? "Minimize" : "Enlarge Screen"}
        >
          {isFullScreen ? <Shrink className="w-6 h-6" /> : <Expand className="w-6 h-6" />}
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20 shadow-[0_0_30px_rgba(255,92,0,0.2)]"
        >
          <Sparkles className="w-5 h-5 fill-primary" /> Tactical Support
        </motion.div>
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-glow text-white uppercase italic leading-none">RESCUE<span className="italic font-serif">AI</span></h1>
        <p className="text-white/30 font-black max-w-2xl mx-auto uppercase tracking-[0.3em] text-[10px]">
          Neural link active. Provide incident parameters for immediate first aid extraction.
        </p>
      </header>

      <div className="flex-1 flex flex-col glass rounded-[64px] border border-white/5 overflow-hidden shadow-2xl relative">
        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-12 space-y-12 scroll-smooth selection:bg-primary/30"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center shrink-0 border-2 transition-all ${
                msg.role === 'user' ? 'glass-strong border-white/10' : 'bg-primary border-primary shadow-[0_0_20px_rgba(255,92,0,0.3)]'
              }`}>
                {msg.role === 'user' ? <User className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-white" />}
              </div>
              <div className={`w-full sm:max-w-[85%] p-8 rounded-[40px] shadow-2xl ${
                msg.role === 'user' ? 'glass-strong border border-white/10 text-white/90' : 'glass border border-white/5 text-white/80'
              }`}>
                <div className="markdown-body prose prose-invert max-w-none prose-p:leading-relaxed prose-p:font-medium prose-strong:text-primary prose-li:text-white/70">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-6">
              <div className="w-14 h-14 rounded-[24px] bg-primary border-2 border-primary flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,92,0,0.3)]">
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
              <div className="max-w-[80%] p-8 rounded-[40px] glass border border-white/5">
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-10 glass-strong border-t border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Initialize query protocol..."
                className="w-full glass-input py-6 pl-10 pr-20 rounded-[32px] outline-none border border-white/10 text-white placeholder:text-white/10 focus:border-primary transition-all font-black text-[10px] uppercase tracking-[0.2em]"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(255,92,0,0.4)]"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button 
              onClick={clearChat}
              className="w-20 h-20 glass-strong rounded-[32px] flex items-center justify-center text-white/20 hover:text-red-500 hover:border-red-500/30 transition-all group border border-white/10"
              title="Purge Memory"
            >
              <Trash2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
          
          <div className="flex justify-between items-center px-6">
             <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
               <ShieldAlert className="w-4 h-4 text-red-500/50" />
               Advisory: Results require human verification
             </div>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <header className="space-y-6">
        <div className="inline-block px-8 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          Super Admin Console
        </div>
        <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic text-glow leading-none">SYSTEM CONTROL</h1>
        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">High-clearance access granted. Monitor all nodes and protocols.</p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar">
        {[
          { id: 'vets', label: 'Clearance Requests', icon: Shield, count: pendingVets.length },
          { id: 'users', label: 'Node Network', icon: Users, count: users.length },
          { id: 'reports', label: 'Signal Log', icon: FileText, count: reports.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center gap-4 px-10 py-6 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] transition-all border ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-[0_0_40px_rgba(255,92,0,0.4)] border-transparent' 
                : 'glass text-white/20 hover:text-white border-white/5 hover:border-white/10'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] ml-2">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="glass p-12 rounded-[64px] border border-white/5 min-h-[60vh] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-10 pointer-events-none" />
        <div className="relative z-10">
          {activeTab === 'vets' && (
            <div className="space-y-6">
              {pendingVets.length === 0 ? (
                <div className="text-center py-32 space-y-6">
                  <Shield className="w-20 h-20 text-white/5 mx-auto" />
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.5em]">No pending clearance requests detected.</p>
                </div>
              ) : (
                pendingVets.map(user => (
                  <div key={user.uid} className="glass-strong p-10 rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-white/5 transition-all shadow-xl">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[24px] glass-strong border border-white/10 overflow-hidden shadow-2xl">
                         <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter">{user.displayName || 'Unknown Unit'}</h3>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => approveVet(user.uid)}
                        disabled={processingId === user.uid}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-green-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                      >
                        {processingId === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Authorize
                      </button>
                      <button
                        onClick={() => rejectVet(user.uid)}
                        disabled={processingId === user.uid}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                      >
                        {processingId === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {users.map(user => (
                <div key={user.uid} className="glass-strong p-10 rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-white/5 transition-all shadow-xl">
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter flex items-center gap-4">
                      {user.displayName || 'Unknown Unit'}
                      {user.role === 'admin' && <Shield className="w-6 h-6 text-primary" />}
                      {user.isVerifiedVet && <Shield className="w-6 h-6 text-green-500" />}
                    </h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{user.email}</p>
                    <div className="flex gap-4 mt-6">
                      <span className="px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/50">{user.role} Segment</span>
                      <span className="px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-primary">Rank {user.grade}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.uid)}
                    disabled={processingId === user.uid || user.email === 'shaheerirfan928@gmail.com'}
                    className="flex items-center justify-center gap-4 px-10 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                  >
                    {processingId === user.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Decommission
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              {reports.map(report => (
                <div key={report.id} className="glass-strong p-10 rounded-[40px] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10 hover:bg-white/5 transition-all shadow-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-primary">
                        {report.status}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                        Signal: {new Date(report.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-black text-2xl text-white uppercase italic tracking-tighter">{report.title}</h3>
                    <p className="text-white/30 text-sm font-medium mt-3 line-clamp-2 leading-relaxed">{report.description}</p>
                  </div>
                  <button
                    onClick={() => deleteReport(report.id)}
                    disabled={processingId === report.id}
                    className="flex-shrink-0 flex items-center justify-center gap-4 px-10 py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-xl"
                  >
                    {processingId === report.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    Purge Signal
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
</div>
        </div>
      </div>
    </div>
  );
}
