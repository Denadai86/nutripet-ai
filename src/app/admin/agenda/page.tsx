"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, Clock, PawPrint, Trash2, ExternalLink } from "lucide-react";

interface Agendamento {
  id: string;
  cliente: string;
  pet: string;
  servico: string;
  dataAgendada: string;
  status: string;
}

export default function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    // Escutar agendamentos da IA em tempo real
    const q = query(collection(db, "agendamentos"), orderBy("dataAgendada", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Agendamento[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Agendamento));
      setAgendamentos(list);
    });
    return () => unsubscribe();
  }, []);

  const deletarAgendamento = async (id: string) => {
    if (confirm("Cancelar este agendamento? Ele será removido do sistema (Aviso: terá de o apagar manualmente no Google Calendar se já foi sincronizado).")) {
      await deleteDoc(doc(db, "agendamentos", id));
    }
  };

  const formatarDataHora = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-6 text-slate-800 dark:text-slate-100 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-emerald-500" /> Agenda Veterinária
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Banhos, Tosas e Consultas agendados automaticamente pela Inteligência Artificial.
            </p>
          </div>
          <a 
            href="https://calendar.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Abrir Google Calendar <ExternalLink size={16} />
          </a>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-medium">Data e Hora</th>
                <th className="p-4 font-medium">Paciente (Pet)</th>
                <th className="p-4 font-medium">Serviço Solicitado</th>
                <th className="p-4 font-medium">WhatsApp Tutor</th>
                <th className="p-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              {agendamentos.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <Clock size={14} className="text-emerald-500"/> 
                      {formatarDataHora(a.dataAgendada)}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PawPrint size={14} className="text-pink-500"/> {a.pet}
                  </td>
                  <td className="p-4">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      {a.servico}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    +{a.cliente}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deletarAgendamento(a.id)} 
                      className="p-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      title="Cancelar Agendamento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {agendamentos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar size={32} className="opacity-20" />
                      <p>Ainda não há serviços agendados pela IA.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}