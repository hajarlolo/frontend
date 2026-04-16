import React, { useState, useRef, useEffect,useMemo  } from "react";
import AppShell from "../../components/layout/AppShell";
import { Card, Button } from "../../components";
import { FaRobot, FaUser, FaPaperPlane, FaPlus, FaTrash, FaExpand, FaCompress } from "react-icons/fa";
import { api } from "../../services/api";

export default function Chatbot() {
  const defaultMessage = { 
    id: 1, 
    type: "bot", 
    text: "Bonjour ! Je suis l'assistant IA de TalentLink. Comment puis-je vous aider aujourd'hui ? Demandez-moi de vous suggérer des offres ou des informations sur nos entreprises partenaires !", 
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  };

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("talentlink_chat_history");
    return saved ? JSON.parse(saved) : [{ id: 1, title: "Nouvelle conversation", messages: [defaultMessage], updatedAt: Date.now() }];
  });
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || 1);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState({ offres: [], entreprises: [] });
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("talentlink_chat_history", JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = useMemo(() => currentSession?.messages || [], [currentSession]);

  const updateMessages = (newMessages) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        let title = s.title;
        if (title === "Nouvelle conversation" && newMessages.length > 1) {
          const firstUser = newMessages.find(m => m.type === "user");
          if (firstUser) {
            title = firstUser.text.substring(0, 25) + (firstUser.text.length > 25 ? "..." : "");
          }
        }
        return { ...s, title, messages: newMessages, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const createNewChat = () => {
    const newSession = { id: Date.now(), title: "Nouvelle conversation", messages: [defaultMessage], updatedAt: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (updated.length === 0) {
         const newSession = { id: Date.now(), title: "Nouvelle conversation", messages: [defaultMessage], updatedAt: Date.now() };
         setActiveSessionId(newSession.id);
         return [newSession];
      }
      if (activeSessionId === id) {
         setActiveSessionId(updated[0].id);
      }
      return updated;
    });
  };

  useEffect(() => {
    // Fetch data for context
    const fetchContextData = async () => {
      try {
        const [offresRes, entreprisesRes] = await Promise.all([
          api.get('/offres').catch(() => ({ data: [] })),
          api.get('/entreprises').catch(() => ({ data: [] }))
        ]);
        setContextData({
          offres: Array.isArray(offresRes.data) ? offresRes.data : [],
          entreprises: Array.isArray(entreprisesRes.data) ? entreprisesRes.data : []
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données pour l'IA:", err);
      }
    };
    fetchContextData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg = {
      id: Date.now(),
      type: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    updateMessages([...messages, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const botResponse = await getGeminiResponse(userText, [...messages, userMsg]);
      const botMsg = {
        id: Date.now() + 1,
        type: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateMessages([...messages, userMsg, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = {
        id: Date.now() + 1,
        type: "bot",
        text: "Désolé, je rencontre des difficultés techniques avec l'API IA. Veuillez réessayer plus tard.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateMessages([...messages, userMsg, errorMsg]);
    }

    setIsLoading(false);
  };

  const getGeminiResponse = async (text, currentHistoryContext) => {
    // We import locally or at top, we already have it at top (we will add it)
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyAxDIzkF6jXFWgWhI7gQa2IksshCqpeZfY" });
    
    // Cleanup context data to keep prompt smaller and only relevant info
    const cleanOffres = contextData.offres.map(o => ({
      titre: o.titre || o.poste,
      type: o.type === "employment" ? "Emploi" : o.type === "internship" ? "Stage" : "Freelance",
      entreprise: o.entreprise?.user?.nom || o.entreprise?.nom || "Inconnue",
      description: o.description,
      localisation: o.adresse
    }));

    const cleanEntreprises = contextData.entreprises.map(e => ({
      nom: e.user?.nom || e.nom || "Inconnue",
      secteur: e.secteur_activite,
      description: e.description,
      site_web: e.site_web
    }));

    const systemInstruction = `Tu es l'assistant de TalentLink, une plateforme de recrutement innovante au Maroc.
Tu aides les étudiants à trouver des offres et des informations sur les entreprises.
Sois amical, professionnel et concis dans tes réponses. Utilise le formatage Markdown (gras, liste) si besoin.
Voici la liste des offres actuelles dans notre base (format JSON) : ${JSON.stringify(cleanOffres)}
Voici la liste des entreprises actuelles dans notre base (format JSON) : ${JSON.stringify(cleanEntreprises)}

Instructions:
- Si l'utilisateur demande des offres (stage, emploi, etc.), cherche dans le JSON ci-dessus et propose les offres les plus pertinentes.
- Si l'utilisateur pose une question sur une entreprise, cherche ses informations dans le JSON ci-dessus.
- S'ils cherchent quelque chose qui n'existe pas, dis-leur gentiment qu'il n'y a pas d'offres/entreprises correspondantes pour le moment.
- Ne parle pas du fait que tu obtiens un fichier JSON, parle-lui comme si c'était "notre base de données".`;

    const formattedHistory = currentHistoryContext.slice(1).map((m, index) => {
      let msgText = m.text;
      // Prepend the system instructions to the very first user message to provide context
      if (index === 0 && m.type === "user") {
         msgText = systemInstruction + "\n\nQuestion de l'utilisateur : " + msgText;
      }
      return {
        role: m.type === "user" ? "user" : "model",
        parts: [{ text: msgText }]
      };
    });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: formattedHistory,
      });
      return response.text;
    } catch (e) {
      console.error(e);
      throw new Error("L'API Gemini a échoué");
    }
  };

  return (
    <AppShell title="Assistant IA TalentLink" subtitle="Démarrez une conversation avec notre IA">
      <div className="flex h-[calc(100vh-250px)] max-h-[800px] flex-col gap-6 lg:flex-row">
        
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-violet text-white shadow-lg shadow-brand-violet/30">
                  <FaRobot size={24} />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">SkillBot IA</h3>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                 onClick={() => setIsExpanded(!isExpanded)} 
                 className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-violet/10 text-brand-violet hover:bg-brand-violet hover:text-white p-0 transition-colors shadow-none border-none"
              >
                 {isExpanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex max-w-[80%] gap-3 ${m.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`mt-auto h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-xs shadow-sm ${m.type === "user" ? "bg-brand-magenta text-white" : "bg-brand-violet text-white"}`}>
                    {m.type === "user" ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className={`relative px-5 py-3 shadow-md ${m.type === "user" ? "rounded-2xl rounded-tr-none bg-brand-magenta text-white shadow-brand-magenta/10" : "rounded-2xl rounded-tl-none bg-white text-slate-700 shadow-slate-100"}`}>
                    <div className="text-sm font-medium leading-relaxed" style={{ wordBreak: 'break-word' }}>
                      {m.text.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
                            part.startsWith('**') && part.endsWith('**') 
                              ? <strong key={j}>{part.slice(2, -2)}</strong> 
                              : part
                          )}
                        </p>
                      ))}
                    </div>
                    <span className={`mt-2 block text-[9px] font-bold uppercase opacity-50 ${m.type === "user" ? "text-white" : "text-slate-400"}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="flex max-w-[80%] gap-3 flex-row">
                  <div className="mt-auto h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-xs shadow-sm bg-brand-violet text-white">
                    <FaRobot />
                  </div>
                  <div className="relative px-5 py-3 shadow-md rounded-2xl rounded-tl-none bg-white text-slate-700 shadow-slate-100 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-50 bg-white p-6">
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                placeholder="Tapez votre message ici..."
                className="flex-1 rounded-2xl border-none bg-slate-50 px-6 py-4 text-sm font-medium text-slate-700 ring-1 ring-slate-100 transition-all focus:bg-white focus:ring-2 focus:ring-brand-violet shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-violet text-white shadow-lg shadow-brand-violet/20 transition-all hover:scale-110 active:scale-95 disabled:grayscale disabled:opacity-50"
              >
                <FaPaperPlane size={18} />
              </button>
            </div>
          </form>
        </div>

        {isExpanded && (
          <div className="w-full lg:w-80 flex flex-col h-full gap-6">
            <Card className="flex-1 overflow-hidden border-none bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Historique</h4>
                 <div className="flex gap-2">
                    <Button onClick={createNewChat} className="h-8 w-8 items-center justify-center rounded-lg bg-brand-violet/10 text-brand-violet hover:bg-brand-violet hover:text-white p-0 transition-colors shadow-none border-none">
                       <FaPlus size={12} />
                    </Button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
               {sessions.map(s => (
                 <div 
                   key={s.id}
                   onClick={() => setActiveSessionId(s.id)}
                   className={`group relative cursor-pointer rounded-xl p-4 transition-all border ${activeSessionId === s.id ? 'bg-gradient-to-r from-brand-violet to-brand-magenta text-white border-transparent shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-brand-violet/20 hover:shadow-sm'}`}
                 >
                   <p className={`truncate text-sm font-bold ${activeSessionId === s.id ? 'text-white' : 'text-slate-800'}`}>
                     {s.title}
                   </p>
                   <p className={`mt-1 text-[10px] uppercase font-bold tracking-wider ${activeSessionId === s.id ? 'text-white/70' : 'text-slate-400'}`}>
                     {new Date(s.updatedAt || s.id).toLocaleDateString()}
                   </p>
                   {sessions.length > 1 && (
                     <button
                       onClick={(e) => deleteChat(e, s.id)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white text-red-500 w-7 h-7 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all z-10"
                     >
                       <FaTrash size={12} />
                     </button>
                   )}
                 </div>
               ))}
            </div>
          </Card>

          </div>
        )}
      </div>
    </AppShell>
  );
}
