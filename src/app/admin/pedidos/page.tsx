"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingBag, CheckCircle, Clock, Trash2 } from "lucide-react";

interface Pedido {
  id: string;
  cliente: string;
  itens: string;
  total: number;
  status: string;
  data: any;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("data", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Pedido[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Pedido));
      setPedidos(list);
    });
    return () => unsubscribe();
  }, []);

  const marcarComoConcluido = async (id: string) => {
    await updateDoc(doc(db, "pedidos", id), { status: "Concluído e Entregue" });
  };

  const deletarPedido = async (id: string) => {
    if (confirm("Cancelar e excluir este pedido?")) await deleteDoc(doc(db, "pedidos", id));
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="text-emerald-400" /> Gestão de Pedidos
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie as vendas fechadas pela Inteligência Artificial.</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm">
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Itens Vendidos</th>
                <th className="p-4 font-medium">Cliente (WhatsApp)</th>
                <th className="p-4 font-medium text-center">Total (R$)</th>
                <th className="p-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${
                      p.status.includes("Pendente") ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {p.status.includes("Pendente") ? <Clock size={12}/> : <CheckCircle size={12}/>} {p.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{p.itens}</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">+{p.cliente}</td>
                  <td className="p-4 text-center font-bold text-emerald-400">R$ {p.total.toFixed(2)}</td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    {p.status.includes("Pendente") && (
                      <button onClick={() => marcarComoConcluido(p.id)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg" title="Marcar como Concluído">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => deletarPedido(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum pedido recebido ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}