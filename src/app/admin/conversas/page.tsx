"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageSquare, Smartphone, Globe, Activity } from "lucide-react";

export default function RadarConversasPage() {
  const [conversas, setConversas] = useState<any[]>([]);

  useEffect(() => {
    const qConversas = query(collection(db, "conversas"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(qConversas, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setConversas(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquare className="text-blue-400" /> Radar de Conversas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitorização em tempo real de todas as interações da IA com os seus clientes.
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
           <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-400"/> Feed ao Vivo
              </h2>
            </div>
            
            <div className="divide-y divide-slate-700/50">
              {conversas.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Sem conversas registadas.</div>
              ) : (
                conversas.map((c) => (
                  <div key={c.id} className="p-5 hover:bg-slate-700/20 transition-colors space-y-3">
                    
                    {/* Cabeçalho da Conversa (Com Indicador de Canal) */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {c.canal === "WEB" ? (
                          <span className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs font-bold" title="Veio do Chat do Site">
                            <Globe size={12} /> SITE
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold" title="Veio do WhatsApp">
                            <Smartphone size={12} /> WHATSAPP
                          </span>
                        )}
                        <span className="text-sm font-mono font-bold text-slate-300">+{c.cliente}</span>
                      </div>
                      <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
                        c.status.includes("Fechado") ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    {/* Balões de Mensagem */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cliente disse:</span>
                        <p className="text-sm text-slate-300">{c.ultimaMensagem}</p>
                      </div>
                      <div className="bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/20">
                        <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">IA respondeu:</span>
                        <p className="text-sm text-emerald-100/80 whitespace-pre-wrap">{c.respostaBot}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 border border-slate-700 px-2 py-1 rounded bg-slate-800">
                        TAG: {c.tema}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>
    </div>
  );
}