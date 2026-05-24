// src/app/loja/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, MessageCircle, X, ShoppingCart, Heart, Phone } from "lucide-react";

export default function LojaDemoPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; content: string }[]>([
    { role: "ai", content: "Olá! Sou o assistente virtual da NutriPet Agropecuária. 🐾\n\nComo posso te ajudar com os nossos produtos ou serviços veterinários hoje?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isLoading]);

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
        // Enviamos o telefone simulado do tutor para cruzar dados do banco
        body: JSON.stringify({ message: userMessage, phone: "5514999999999" }),
      });

      const data = await res.json();
      const respostaIA = data.text || data.response || data.message;

      if (respostaIA) {
        setChatLog((prev) => [...prev, { role: "ai", content: respostaIA }]);
      }
    } catch (error) {
      console.error("Erro no chat da loja:", error);
      setChatLog((prev) => [...prev, { role: "ai", content: "Ops, falha de conexão. Pode tentar novamente?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-emerald-600 text-white text-center text-xs py-2 font-medium tracking-wide">
        ⚡ PROMOÇÃO DA SEMANA: Frete grátis para rações acima de 10kg na sua primeira compra!
      </div>

      {/* LOJA HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
              🏪 NutriPet <span className="text-emerald-600 font-normal text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"> Agro & Vet </span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span className="text-xs font-medium bg-slate-100 p-2 rounded-lg border hidden sm:block">Demonstração de Loja Fictícia</span>
            <div className="relative p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors">
              <ShoppingCart size={22} className="text-slate-700" />
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO BANNER DA LOJA FICTÍCIA */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-md space-y-4 relative z-10">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">Clínica & PetShop</span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Cuidado completo para quem te dá amor incondicional.</h2>
            <p className="text-emerald-100 text-sm">Rações Premium, Medicamentos com orientação e o melhor Banho & Tosa da região.</p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 bg-[url('https://images.unsplash.com/photo-1548767797-d8c844163c4c')] bg-cover bg-center hidden md:block"></div>
        </div>
      </section>

      {/* SEÇÃO DE SERVIÇOS EM DESTAQUE (FOTOS DE BICHINHOS MEDICADOS/BANHO) */}
      <section className="max-w-6xl mx-auto px-4 mt-12 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">🏥 Serviços Especializados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-44 bg-slate-200 bg-[url('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=600')] bg-cover bg-center"></div>
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-slate-900">Estética Canina & Felina</h4>
              <p className="text-xs text-slate-500">Banho com produtos hipoalergênicos, tosa na máquina/tesoura e hidratação de pelagem.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-44 bg-slate-200 bg-[url('https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=600')] bg-cover bg-center"></div>
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-slate-900">Consultório & Vacinação</h4>
              <p className="text-xs text-slate-500">Aplicação de vacinas importadas (V10, Antirrábica) e acompanhamento clínico preventivo.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-44 bg-slate-200 bg-[url('https://images.unsplash.com/photo-1587764379873-97837921fd44?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center"></div>
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-slate-900">Farmácia Veterinária</h4>
              <p className="text-xs text-slate-500">Antibióticos, anti-pulgas e suplementos controlados com total segurança e procedência.</p>
            </div>
          </div>

        </div>
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <section className="max-w-6xl mx-auto px-4 mt-12 space-y-6">
        <h3 className="text-xl font-bold text-slate-900">🛍️ Destaques do Nosso Estoque</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { nome: "Ração Premium Adulto", cat: "Rações", preco: "189.90", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80" },
            { nome: "Coleira Anti-pulgas Eficaz", cat: "Acessórios", preco: "85.00", img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=300" },
            { nome: "Shampoo Pelos Macios 500ml", cat: "Higiene", preco: "32.90", img: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=300" },
            { nome: "Petisco Snappy Crocante", cat: "Petiscos", preco: "14.50", img: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=300" }
          ].map((prod, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm">
              <div className="space-y-2">
                <div className="h-32 w-full bg-slate-100 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${prod.img}')` }}></div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit block">{prod.cat}</span>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{prod.nome}</h4>
              </div>
              <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100">
                <span className="text-sm font-black text-slate-900">R$ {prod.preco}</span>
                <button className="p-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg transition-colors text-xs font-medium">Comprar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WIDGET DE CHAT INTEGRADO DA NUTRIPET-AI */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-105 transition-all z-50 flex items-center justify-center border-2 border-white"
        title="Testar Assistente de IA"
      >
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* JANELA DO CHAT */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[90%] md:w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col h-[550px] border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header do Chat */}
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={24} /></div>
              <div>
                <h3 className="font-bold leading-tight text-sm">NutriPet Assistente IA</h3>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Simulador de Atendimento
                </span>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-emerald-100 hover:text-white"><X size={18} /></button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {chatLog.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl p-3 max-w-[85%] text-xs shadow-sm ${
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
                <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl rounded-bl-none p-2.5 flex gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Campo de Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: Vocês tem remédio anti-pulgas?"
                className="flex-1 border border-slate-200 bg-slate-50 rounded-full pl-4 pr-12 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-1.5 rounded-full hover:bg-emerald-700 disabled:bg-slate-300 transition-colors shadow-sm"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}