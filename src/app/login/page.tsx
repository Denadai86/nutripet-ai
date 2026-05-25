"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bot, KeyRound, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Estados de loading separados para os dois botões
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  // Redireciona automaticamente se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/admin");
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsEmailLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O useEffect trata do redirecionamento
    } catch (err: any) {
      setError("Credenciais inválidas. Verifique o e-mail e a senha.");
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // O useEffect trata do redirecionamento
    } catch (err: any) {
      console.error(err);
      setError("Falha ao entrar com a conta Google.");
      setIsGoogleLoading(false);
    }
  };

  // Evita um "piscar" da tela de login enquanto verifica a sessão
  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Efeitos de Fundo (Glow Premium) */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8 border border-slate-100 relative z-10">
        
        {/* Header do Card */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 shadow-inner">
            <Bot size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Acesso NutriPet</h1>
          <p className="text-sm text-slate-500 max-w-xs">Gerencie o painel da sua Inteligência Artificial.</p>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl font-medium flex items-start gap-3 animate-in fade-in zoom-in duration-300">
            <ShieldAlert className="shrink-0 mt-0.5" size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Formulário E-mail e Senha */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider pl-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                placeholder="admin@nutripet.com"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider pl-1">Senha</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isEmailLoading || isGoogleLoading}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            {isEmailLoading ? "Verificando..." : "Entrar no Painel Seguro"}
          </button>
        </form>

        {/* Linha Divisória */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ou continue com</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Botão Oficial do Google */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={isEmailLoading || isGoogleLoading}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-sm"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.369 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.109 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          {isGoogleLoading ? "Autenticando..." : "Google"}
        </button>

        {/* Rodapé da Tela com os Links Legais */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-400">
            Ao continuar, você concorda com nossos <Link href="/termos" className="text-emerald-500 hover:text-emerald-600 font-semibold hover:underline">Termos</Link> e <Link href="/privacidade" className="text-emerald-500 hover:text-emerald-600 font-semibold hover:underline">Privacidade</Link>.
          </p>
        </div>

      </div>
    </main>
  );
}