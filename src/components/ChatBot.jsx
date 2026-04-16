import { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaChevronUp } from "react-icons/fa";
import { toast } from "react-toastify";

const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Bonjour ! Je suis votre assistant recrutement. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // NOTE: User should provide HUGGINGFACE_API_KEY in .env
      const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { "Authorization": `Bearer ${apiKey}` })
        },
        body: JSON.stringify({ 
          inputs: userMessage,
          parameters: {
               // Blenderbot specific params if needed
          }
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // BlenderBot response format is usually [{ generated_text: "..." }]
      const botResponse = Array.isArray(data) ? data[0].generated_text : (data.generated_text || "Désolé, je rencontre un problème technique.");
      
      setMessages(prev => [...prev, { role: "bot", text: botResponse }]);
    } catch (error) {
      console.error("ChatBot Error:", error);
      toast.error("Le ChatBot est temporairement indisponible.");
      setMessages(prev => [...prev, { role: "bot", text: "Oups ! Une erreur est survenue. Veuillez réessayer plus tard." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-violet to-brand-magenta p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <FaRobot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistant Recrutement</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest">En ligne</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <FaTimes />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-violet text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 italic text-slate-400 text-xs flex gap-1">
                  En train d'écrire
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-violet/20"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-2xl bg-brand-violet text-white flex items-center justify-center hover:bg-brand-magenta transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-slate-800 rotate-90 scale-90' : 'bg-gradient-to-tr from-brand-violet to-brand-magenta'
        }`}
      >
        {isOpen ? <FaChevronUp size={24} /> : <FaRobot size={28} />}
      </button>
    </div>
  );
}
