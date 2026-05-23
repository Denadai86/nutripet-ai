"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PawPrint, Trash2, HeartPulse, User } from "lucide-react";

interface Pet {
  id: string;
  nome: string;
  especie: string;
  telefoneDono: string;
  observacoes: string;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [telefoneDono, setTelefoneDono] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = collection(db, "pets");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefoneDono) return;

    setIsSubmitting(true);
    try {
      // Limpa o telefone para cruzar perfeitamente com a Evolution API
      let telefoneLimpo = telefoneDono.replace(/\D/g, "");
      // Se a pessoa digitou só o DDD e o número (ex: 11999999999), injeta o 55 do Brasil
      if (telefoneLimpo.length === 10 || telefoneLimpo.length === 11) {
        telefoneLimpo = "55" + telefoneLimpo;
      }

      await addDoc(collection(db, "pets"), {
        nome: nome.trim(),
        especie,
        telefoneDono: telefoneLimpo,
        observacoes: observacoes.trim(),
        createdAt: new Date(),
      });
      
      setNome("");
      setTelefoneDono("");
      setObservacoes("");
    } catch (error) {
      console.error("Erro ao cadastrar pet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <PawPrint className="text-emerald-400" /> Prontuário CRM
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre os Pets vinculados ao WhatsApp do cliente. A IA usará isso para hiper-personalizar o atendimento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cadastro */}
          <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HeartPulse size={20} className="text-pink-400" /> Novo Paciente
            </h2>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Pet</label>
                <input
                  type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Bolinha"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Espécie</label>
                  <select
                    value={especie} onChange={(e) => setEspecie(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>Cachorro</option>
                    <option>Gato</option>
                    <option>Ave</option>
                    <option>Roedor</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp do Dono</label>
                  <input
                    type="text" required value={telefoneDono} onChange={(e) => setTelefoneDono(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Histórico / Dietas (Para a IA ler)</label>
                <textarea
                  value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Alérgico a frango, toma vacina V10 mês que vem."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 h-24"
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition-colors mt-4"
              >
                Cadastrar Pet
              </button>
            </form>
          </div>

          {/* Lista de Pets */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
             <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-bold text-white">Pacientes Cadastrados ({pets.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm">
                    <th className="p-4 font-medium">Pet & Espécie</th>
                    <th className="p-4 font-medium">Tutor (WhatsApp)</th>
                    <th className="p-4 font-medium">Observações Clínicas</th>
                    <th className="p-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {pets.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum pet cadastrado.</td></tr>
                  ) : (
                    pets.map((pet) => (
                      <tr key={pet.id} className="hover:bg-slate-700/30">
                        <td className="p-4 font-bold text-emerald-400">
                          {pet.nome} <span className="text-xs font-normal text-slate-400 block">{pet.especie}</span>
                        </td>
                        <td className="p-4 text-slate-300 font-mono text-sm flex items-center gap-2">
                          <User size={14} className="text-slate-500"/> +{pet.telefoneDono}
                        </td>
                        <td className="p-4 text-xs text-slate-400 max-w-50 truncate" title={pet.observacoes}>
                          {pet.observacoes || "-"}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => deleteDoc(doc(db, "pets", pet.id))} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}