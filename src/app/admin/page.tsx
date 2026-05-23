"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageSquare, ShoppingBag, BarChart3, TrendingUp, AlertCircle } from "lucide-react";

interface Pedido {
  id: string;
  cliente: string;
  itens: string;
  total: number;
  status: string;
}

interface Conversa {
  id: string;
  cliente: string;
  ultimaMensagem: string;
  respostaBot: string;
  tema: string;
  status: string;
  updatedAt: any;
}

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [conversas, setConversas] = useState<Conversa[]>([]);

  useEffect(() => {
    // Escuta Pedidos em Tempo Real
    const qPedidos = query(collection(db, "pedidos"), orderBy("data", "desc"));
    const unsubscribePedidos = onSnapshot(qPedidos, (snapshot) => {
      const list: Pedido[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Pedido);
      });
      setPedidos(list);
    });

    // Escuta Linha do Tempo das Conversas da IA em Tempo Real
    const qConversas = query(collection(db, "conversas"), orderBy("updatedAt", "desc"));
    const unsubscribeConversas = onSnapshot(qConversas, (snapshot) => {
      const list: Conversa[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Conversa);
      });
      setConversas(list);
    });

    return () => {
      unsubscribePedidos();
      unsubscribeConversas();
    };
  }, []);

  // Cálculos de Métrica / BI
  const totalFaturamento = pedidos.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const conversasConvertidas = conversas.filter((c) => c.status === "Pedido Fechado").length;
  const taxaConversao = conversas.length > 0 ? ((conversasConvertidas / conversas.length) * 100).toFixed(1) : "0";

  // Agrupamento de Temas mais comentados
  const contagemTemas: { [key: string]: number } = {};
  conversas.forEach((c) => {
    if (c.tema) contagemTemas[c.tema] = (contagemTemas[c.tema] || 0) + 1;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-400" /> NutriPet AI Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoramento em tempo real das ações, conversões e inteligência do robô.
          </p>
        </div>

        {/* Painel de Métricas Rápidas (BI) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Faturamento WhatsApp</p>
              <h3 className="text-2xl font-bold text-white mt-1">R$ {totalFaturamento.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><ShoppingBag /></div>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Contatos Totais</p>
              <h3 className="text-2xl font-bold text-white mt-1">{conversas.length}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><MessageSquare /></div>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Vendas pela IA</p>
              <h3 className="text-2xl font-bold text-white mt-1">{conversasConvertidas}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400"><TrendingUp /></div>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Taxa de Conversão</p>
              <h3 className="text-2xl font-bold text-white mt-1">{taxaConversao}%</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><BarChart3 /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1 & 2: O que o Robô está fazendo (Fila ao vivo) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ações e Conversas do Robô Ao Vivo
            </h2>

            <div className="space-y-3 max-h-150 overflow-y-auto pr-2">
              {conversas.length === 0 ? (
                <p className="text-slate-500 text-sm">Aguardando interações no WhatsApp...</p>
              ) : (
                conversas.map((c) => (
                  <div key={c.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-300">📱 +{c.cliente}</span>
                      <div className="flex gap-2">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md font-mono">
                          🏷️ {c.tema}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${
                          c.status === "Pedido Fechado" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800 text-xs">
                      <p className="text-slate-400"><strong className="text-slate-200">Cliente:</strong> {c.ultimaMensagem}</p>
                      <p className="text-emerald-400/90 mt-1"><strong className="text-emerald-400">IA Bot:</strong> {c.respostaBot}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coluna 3: Auditoria de Temas Quentes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Temas Mais Conversados</h2>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              {Object.keys(contagemTemas).length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhum dado de tema processado.</p>
              ) : (
                Object.entries(contagemTemas).map(([tema, qtd]) => {
                  const percentual = ((qtd / conversas.length) * 100).toFixed(0);
                  return (
                    <div key={tema} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{tema}</span>
                        <span className="text-slate-400">{qtd} interações ({percentual}%)</span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${percentual}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Balanço de Separação de Pedidos Pendentes */}
            <h2 className="text-xl font-bold text-white pt-4">Últimos Pedidos para Separação</h2>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 divide-y divide-slate-700 max-h-62.5 overflow-y-auto">
              {pedidos.length === 0 ? (
                <p className="text-slate-500 text-sm py-2">Nenhum pedido feito ainda.</p>
              ) : (
                pedidos.map((p) => (
                  <div key={p.id} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{p.itens}</p>
                      <p className="text-slate-400 text-[10px]">Cliente: +{p.cliente}</p>
                    </div>
                    <span className="font-bold text-white">R$ {p.total.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}