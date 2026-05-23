"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PackagePlus, Trash2, Edit2, Box } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega os produtos em tempo real
  useEffect(() => {
    const q = collection(db, "produtos");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Produto[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Produto);
      });
      setProdutos(list);
    });

    return () => unsubscribe();
  }, []);

  // Função para cadastrar novo produto
  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !preco || !quantidade) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "produtos"), {
        nome: nome.trim(),
        preco: parseFloat(preco.replace(",", ".")),
        quantidade: parseInt(quantidade, 10),
        createdAt: new Date(),
      });
      
      // Limpa o formulário
      setNome("");
      setPreco("");
      setQuantidade("");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao cadastrar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para deletar produto
  const handleDeleteProduto = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto? O bot não poderá mais vendê-lo.")) {
      await deleteDoc(doc(db, "produtos", id));
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Box className="text-emerald-400" /> Gestão de Catálogo
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre os produtos e atualize o estoque. O robô lerá essas informações instantaneamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1: Formulário de Cadastro */}
          <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PackagePlus size={20} className="text-blue-400" /> Novo Produto
            </h2>
            
            <form onSubmit={handleAddProduto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ração Golden 15kg"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="120.90"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar Produto"}
              </button>
            </form>
          </div>

          {/* Coluna 2 & 3: Lista de Produtos */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-bold text-white">Catálogo Ativo ({produtos.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm">
                    <th className="p-4 font-medium">Produto</th>
                    <th className="p-4 font-medium text-center">Preço</th>
                    <th className="p-4 font-medium text-center">Estoque</th>
                    <th className="p-4 font-medium text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {produtos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        Nenhum produto cadastrado ainda.
                      </td>
                    </tr>
                  ) : (
                    produtos.map((produto) => (
                      <tr key={produto.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-medium text-slate-200">
                          {produto.nome}
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {produto.id}</div>
                        </td>
                        <td className="p-4 text-center font-semibold text-emerald-400">
                          R$ {produto.preco.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            produto.quantidade > 5 ? 'bg-blue-500/20 text-blue-400' : 
                            produto.quantidade > 0 ? 'bg-amber-500/20 text-amber-400' : 
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {produto.quantidade} un.
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDeleteProduto(produto.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Excluir"
                          >
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