"use client";

import { useState } from "react";
import { Send, Bot, Package, Clock, ShieldCheck, MessageCircle, X } from "lucide-react";

export default function Home() {
  // Novo estado para controlar se o widget flutuante está aberto ou fechado
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; content: string }[]>([
    { role: "ai", content: "Olá! Sou o assistente da NutriPet. Como posso ajudar com os seus pedidos hoje?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setChatLog((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (data.reply) {
        setChatLog((prev) => [...prev, { role: "ai", content: data.reply }]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setChatLog((prev) => [...prev, { role: "ai", content: "Desculpe, estou com problemas de ligação. Pode tentar novamente?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="text-emerald-600" size={32} />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">NutriPet<span className="text-emerald-600">.AI</span></span>
          </div>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-colors"
          >
            Testar Agora
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          O primeiro assistente que <br className="hidden md:block"/> 
          <span className="text-emerald-600">vende por si no WhatsApp.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Cansado de perder vendas porque não consegue responder a tempo? O nosso sistema inteligente lê o seu stock e fecha pedidos 24 horas por dia.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-12">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
             <Clock className="text-emerald-500 mb-4" size={40} />
             <h3 className="font-bold text-lg">Atendimento 24/7</h3>
             <p className="text-slate-500 text-sm mt-2 text-center">Responde a orçamentos enquanto atende ao balcão.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
             <Package className="text-emerald-500 mb-4" size={40} />
             <h3 className="font-bold text-lg">Stock Sincronizado</h3>
             <p className="text-slate-500 text-sm mt-2 text-center">A IA consulta o seu inventário antes de prometer um produto.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
             <ShieldCheck className="text-emerald-500 mb-4" size={40} />
             <h3 className="font-bold text-lg">Sem Erros</h3>
             <p className="text-slate-500 text-sm mt-2 text-center">Preços sempre corretos, garantindo a sua margem de lucro.</p>
          </div>
        </div>
      </section>

      {/* BOTÃO FLUTUANTE DO CHAT */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-105 transition-all z-50 flex items-center justify-center"
      >
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* JANELA DO CHAT FLUTUANTE */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[90%] max-w-100 bg-white rounded-2xl shadow-2xl flex flex-col h-137.5 border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Chat Header */}
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold leading-tight">NutriPet AI</h3>
                <span className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </span>
              </div>
            </div>
            {/* Botão de fechar interno (opcional, já que o flutuante também fecha) */}
            <button onClick={() => setIsChatOpen(false)} className="text-emerald-100 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
            {chatLog.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl p-3 max-w-[85%] text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white rounded-br-none" 
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl rounded-bl-none p-3 flex gap-1 shadow-sm">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo..."
                className="flex-1 border border-slate-200 bg-slate-50 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:bg-slate-300 transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-center text-sm mt-20">
        <p>&copy; {new Date().getFullYear()} NutriPet AI. Desenvolvido para agilizar negócios locais.</p>
      </footer>
    </main>
  );
}