"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Bot, KeyRound, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin"); // Se der certo, joga pro painel
    } catch (err: any) {
      setError("Credenciais inválidas. Verifique o e-mail e a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8 border border-slate-100">
        
        {/* Header do Card */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 shadow-inner">
            <Bot size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Acesso NutriPet</h1>
          <p className="text-sm text-slate-500 max-w-xs">Olá, Administrador. Digite suas credenciais para gerenciar o painel da IA.</p>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Formulário CORRIGIDO (Com inputs visíveis) */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Campo E-mail */}
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider pl-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // ADICIONADO: border-slate-200 e text-slate-900 para visibilidade
                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                placeholder="dono@nutripet.com"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider pl-1">Senha</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // ADICIONADO: border-slate-200 e text-slate-900 para visibilidade
                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                placeholder="Sua senha secreta"
              />
            </div>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            {loading ? "Verificando..." : "Entrar no Painel Seguro"}
          </button>
        </form>
      </div>
    </main>
  );
}