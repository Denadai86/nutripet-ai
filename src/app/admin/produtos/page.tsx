"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PackagePlus, Trash2, Box, AlertTriangle } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: string;
  marca: string;
  pesoVolume: string;
  restricoes: string;
  observacoes: string;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formData, setFormData] = useState({
    nome: "", preco: "", quantidade: "", tipo: "Ração", 
    marca: "", pesoVolume: "", restricoes: "", observacoes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = collection(db, "produtos");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Produto[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Produto));
      setProdutos(list);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco || !formData.quantidade) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "produtos"), {
        nome: formData.nome.trim(),
        preco: parseFloat(formData.preco.replace(",", ".")),
        quantidade: parseInt(formData.quantidade, 10),
        tipo: formData.tipo,
        marca: formData.marca.trim(),
        pesoVolume: formData.pesoVolume.trim(),
        restricoes: formData.restricoes.trim(),
        observacoes: formData.observacoes.trim(),
        createdAt: new Date(),
      });
      setFormData({ nome: "", preco: "", quantidade: "", tipo: "Ração", marca: "", pesoVolume: "", restricoes: "", observacoes: "" });
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Box className="text-emerald-400" /> Gestão de Catálogo Avançado
          </h1>
          <p className="text-slate-400 text-sm mt-1">Metadados enriquecidos para a IA realizar vendas consultivas precisas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PackagePlus size={20} className="text-blue-400" /> Novo Produto
            </h2>
            <form onSubmit={handleAddProduto} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Produto *</label>
                <input name="nome" type="text" required value={formData.nome} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Preço (R$) *</label>
                  <input name="preco" type="number" step="0.01" required value={formData.preco} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Estoque *</label>
                  <input name="quantidade" type="number" required value={formData.quantidade} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500">
                    <option>Ração</option><option>Medicamento</option><option>Acessório</option><option>Higiene</option><option>Petisco</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Marca</label>
                  <input name="marca" type="text" value={formData.marca} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Peso / Volume (ex: 15kg, 500ml)</label>
                <input name="pesoVolume" type="text" value={formData.pesoVolume} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500" />
              </div>

              <div>
                <label className="text-xs font-medium text-amber-400 mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Restrições de Uso</label>
                <input name="restricoes" type="text" placeholder="Ex: Proibido para cães renais" value={formData.restricoes} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações Gerais</label>
                <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500 h-20" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                Salvar Produto
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-bold text-white">Catálogo ({produtos.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs">
                    <th className="p-4 font-medium">Produto & Info</th>
                    <th className="p-4 font-medium text-center">Preço</th>
                    <th className="p-4 font-medium text-center">Estoque</th>
                    <th className="p-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {produtos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/30">
                      <td className="p-4">
                        <p className="font-bold text-slate-200">{p.nome}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {p.marca && <span className="mr-2">🏷️ {p.marca}</span>}
                          {p.pesoVolume && <span className="mr-2">⚖️ {p.pesoVolume}</span>}
                        </p>
                        {p.restricoes && <p className="text-xs text-amber-400 mt-1">⚠️ {p.restricoes}</p>}
                      </td>
                      <td className="p-4 text-center font-semibold text-emerald-400">R$ {p.preco.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.quantidade > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.quantidade} un.
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => deleteDoc(doc(db, "produtos", p.id))} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg">
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