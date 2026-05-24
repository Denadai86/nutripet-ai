// src/app/page.tsx
"use client";

import Link from "next/link";
import { Bot, Package, Clock, ShieldCheck, ArrowRight, Zap, MessageSquare, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-900">
      
      {/* HEADER CORPOATIVO */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="text-emerald-400 animate-pulse" size={28} />
            <span className="text-xl font-bold tracking-tight text-white">NutriPet<span className="text-emerald-400">.AI</span></span>
          </div>
          <Link 
            href="/loja" 
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/20 text-sm flex items-center gap-1 group"
          >
            Ver Demo Ao Vivo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Zap size={12}/> Nova Era do Comércio Conversacional
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
          O primeiro assistente de IA que <br/>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            vende e gerencia o seu Pet Shop.
          </span>
        </h1>
        
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Transforme o WhatsApp da sua agropecuária ou clínica veterinária em uma máquina de vendas automática. A IA consulta o estoque real, verifica restrições médicas e fecha pedidos 24/7.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/loja" 
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 text-base group"
          >
            Entrar na Loja de Teste <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/admin" 
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base"
          >
            Painel Admin Gerencial
          </Link>
        </div>
      </section>

      {/* CARDS DE BENEFÍCIOS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/60 hover:border-slate-600 transition-all space-y-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit"><Clock size={24}/></div>
            <h3 className="text-xl font-bold text-white">Automação de Atendimento 24/7</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Nunca mais perca um orçamento de madrugada. O robô responde instantaneamente com simpatia e foco em conversão de vendas.</p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/60 hover:border-slate-600 transition-all space-y-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 w-fit"><Package size={24}/></div>
            <h3 className="text-xl font-bold text-white">Estoque Sincronizado (NoSQL)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Chega de prometer produtos que acabaram. A IA lê o inventário em tempo real e dá baixa automática no banco de dados assim que a venda fecha.</p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/60 hover:border-slate-600 transition-all space-y-4">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400 w-fit"><ShieldCheck size={24}/></div>
            <h3 className="text-xl font-bold text-white">CRM & Prontuário Médico</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Atendimento inteligente. O robô reconhece o pet pelo nome, sabe a idade, o peso e impede a venda de rações ou remédios com restrições de saúde.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NutriPet AI. Todos os direitos reservados. Built for local business scale.</p>
      </footer>
    </main>
  );
}