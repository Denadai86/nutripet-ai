"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PawPrint, Trash2, HeartPulse, UserCircle } from "lucide-react";

interface Pet {
  id: string;
  telefoneDono: string;
  nome: string;
  idade: string;
  peso: string;
  especie: string;
  raca: string;
  cor: string;
  observacoes: string;
}

export default function CRMPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dados do Cliente
  const [cliente, setCliente] = useState({ nome: "", idade: "", endereco: "", telefone: "", observacoes: "" });
  // Dados do Pet
  const [pet, setPet] = useState({ nome: "", idade: "", peso: "", especie: "Cachorro", raca: "", cor: "", observacoes: "" });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pets"), (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Pet));
      setPets(list);
    });
    return () => unsubscribe();
  }, []);

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCliente({ ...cliente, [e.target.name]: e.target.value });
  const handlePetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setPet({ ...pet, [e.target.name]: e.target.value });

  const handleSaveCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.telefone || !pet.nome) return;

    setIsSubmitting(true);
    try {
      let telLimpo = cliente.telefone.replace(/\D/g, "");
      if (telLimpo.length === 10 || telLimpo.length === 11) telLimpo = "55" + telLimpo;

      // 1. Salva/Atualiza Cliente (Upsert usando o Telefone como ID principal)
      await setDoc(doc(db, "clientes", telLimpo), {
        ...cliente,
        telefoneLimpo: telLimpo,
        updatedAt: new Date()
      }, { merge: true });

      // 2. Adiciona o Pet vinculado ao telefone do Cliente
      await addDoc(collection(db, "pets"), {
        ...pet,
        telefoneDono: telLimpo,
        createdAt: new Date(),
      });
      
      setPet({ nome: "", idade: "", peso: "", especie: "Cachorro", raca: "", cor: "", observacoes: "" });
      alert("Paciente e Tutor salvos com sucesso!");
    } catch (error) {
      console.error("Erro no CRM:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <PawPrint className="text-emerald-400" /> CRM Veterinário
          </h1>
          <p className="text-slate-400 text-sm mt-1">Cadastro unificado de Tutores e Pacientes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulário Unificado */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSaveCRM} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
              
              {/* Sessão Tutor */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <UserCircle size={18} className="text-blue-400" /> Dados do Tutor
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp *</label>
                      <input name="telefone" required value={cliente.telefone} onChange={handleClienteChange} placeholder="11999999999" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nome</label>
                      <input name="nome" value={cliente.nome} onChange={handleClienteChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Endereço (Entrega)</label>
                    <input name="endereco" value={cliente.endereco} onChange={handleClienteChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Idade Cliente</label>
                      <input name="idade" value={cliente.idade} onChange={handleClienteChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Obs. do Tutor</label>
                      <input name="observacoes" placeholder="Ex: Cliente VIP, prefere Pix" value={cliente.observacoes} onChange={handleClienteChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessão Pet */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                  <HeartPulse size={18} className="text-pink-400" /> Dados do Pet
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Pet *</label>
                      <input name="nome" required value={pet.nome} onChange={handlePetChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Espécie</label>
                      <select name="especie" value={pet.especie} onChange={handlePetChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                        <option>Cachorro</option><option>Gato</option><option>Ave</option><option>Roedor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Raça</label>
                      <input name="raca" value={pet.raca} onChange={handlePetChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Idade</label>
                      <input name="idade" value={pet.idade} onChange={handlePetChange} placeholder="Ex: 2 anos" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Peso</label>
                      <input name="peso" value={pet.peso} onChange={handlePetChange} placeholder="Ex: 5kg" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Cor</label>
                    <input name="cor" value={pet.cor} onChange={handlePetChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Histórico Clínico / Dieta</label>
                    <textarea name="observacoes" value={pet.observacoes} onChange={handlePetChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white h-20" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition-colors">
                Salvar Cadastro Unificado
              </button>
            </form>
          </div>

          {/* Tabela Resumo */}
          <div className="lg:col-span-7 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-fit">
             <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-bold text-white">Pacientes na Base ({pets.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs">
                    <th className="p-4 font-medium">Pet & Ficha</th>
                    <th className="p-4 font-medium">Contato (Tutor)</th>
                    <th className="p-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {pets.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/30">
                      <td className="p-4">
                        <p className="font-bold text-emerald-400">{p.nome} <span className="text-xs text-slate-400 font-normal ml-1">({p.especie} {p.raca && `- ${p.raca}`})</span></p>
                        <p className="text-xs text-slate-400 mt-1">Peso: {p.peso || "-"} | Idade: {p.idade || "-"}</p>
                        {p.observacoes && <p className="text-xs text-slate-500 mt-1 italic">"{p.observacoes}"</p>}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">
                        +{p.telefoneDono}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => deleteDoc(doc(db, "pets", p.id))} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}