"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DollarSign, MessageCircle, ShoppingBag, PawPrint, TrendingUp, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({ faturacao: 0, totalPedidos: 0, totalConversas: 0, totalPets: 0 });
  const [ultimosPedidos, setUltimosPedidos] = useState<any[]>([]);
  const [ultimasConversas, setUltimasConversas] = useState<any[]>([]);

  useEffect(() => {
    const qPedidos = query(collection(db, "pedidos"), orderBy("data", "desc"));
    const unsubPedidos = onSnapshot(qPedidos, (snapshot) => {
      let fat = 0;
      const pedidosList: any[] = [];
      snapshot.forEach((doc) => {
        fat += doc.data().total || 0;
        pedidosList.push({ id: doc.id, ...doc.data() });
      });
      setStats((s) => ({ ...s, faturacao: fat, totalPedidos: snapshot.size }));
      setUltimosPedidos(pedidosList.slice(0, 3));
    });

    const qConversas = query(collection(db, "conversas"), orderBy("updatedAt", "desc"), limit(3));
    const unsubConversas = onSnapshot(qConversas, (snapshot) => {
      const conversasList: any[] = [];
      snapshot.forEach((doc) => conversasList.push({ id: doc.id, ...doc.data() }));
      setStats((s) => ({ ...s, totalConversas: snapshot.size })); 
      setUltimasConversas(conversasList);
    });

    const unsubPets = onSnapshot(collection(db, "pets"), (snapshot) => {
      setStats((s) => ({ ...s, totalPets: snapshot.size }));
    });

    return () => { unsubPedidos(); unsubConversas(); unsubPets(); };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
          <Activity className="text-emerald-500" /> Visão Geral da IA
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Monitorização em tempo real do desempenho do seu assistente NutriPet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between overflow-hidden transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Faturação IA</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white"><span className="text-lg text-slate-400 mr-1">R$</span>{stats.faturacao.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><DollarSign size={24} /></div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} /> <span>100% Automático</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Vendas Fechadas</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalPedidos}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><ShoppingBag size={24} /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Conversas Recentes</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalConversas}</h3>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><MessageCircle size={24} /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pacientes (CRM)</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalPets}</h3>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl"><PawPrint size={24} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={18} className="text-indigo-500"/> Últimas Interações</h2>
            <Link href="/admin/conversas" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              Ver Radar Completo <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {ultimasConversas.map((c) => (
              <div key={c.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-500 dark:text-slate-400">+{c.cliente}</span>
                  <span className={c.canal === "WEB" ? "text-indigo-500 dark:text-indigo-400 font-bold" : "text-emerald-500 dark:text-emerald-400 font-bold"}>{c.canal || "WHATSAPP"}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 border-l-2 border-slate-300 dark:border-slate-600 pl-2">{c.ultimaMensagem}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><ShoppingBag size={18} className="text-emerald-500"/> Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
              Ver Todos os Pedidos <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {ultimosPedidos.map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200 line-clamp-1">{p.itens}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${p.status.includes("Pendente") ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"}`}>
                    {p.status}
                  </span>
                </div>
                <div className="text-right font-black text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap ml-4">
                  R$ {p.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}