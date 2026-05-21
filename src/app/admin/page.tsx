"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingBag, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface Pedido {
  id: string;
  cliente: string;
  itens: string;
  total: number;
  status: string;
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta a coleção "pedidos" em tempo real
    const q = query(collection(db, "pedidos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos: Pedido[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        listaPedidos.push({
          id: doc.id,
          cliente: data.cliente || "Cliente WhatsApp",
          itens: data.itens || "",
          total: data.total || 0,
          status: data.status || "Pendente",
        });
      });
      setPedidos(listaPedidos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalFaturamento = pedidos.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
        <p className="text-slate-500 mt-1">Dados operacionais coletados em tempo real do Firebase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-sm font-medium">Pedidos Totais</span>
          <h3 className="text-2xl font-bold mt-2">{loading ? "..." : pedidos.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-sm font-medium">Faturamento Total</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {loading ? "..." : `R$ ${totalFaturamento.toFixed(2)}`}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold">Fila de Separação de Pedidos</h2>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="p-6 text-center text-slate-400">Carregando pedidos...</div>
          ) : pedidos.length === 0 ? (
            <div className="p-6 text-center text-slate-400">Nenhum pedido ainda.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase border-b">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b">
                    <td className="px-6 py-4 text-xs font-mono">{pedido.id}</td>
                    <td className="px-6 py-4 font-medium">{pedido.cliente}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">R$ {pedido.total.toFixed(2)}</td>
                    <td className="px-6 py-4">{pedido.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}