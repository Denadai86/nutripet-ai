"use client";

import React, { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Calendar, LogOut, Bot, Box, } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {FaDog} from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // O "Segurança da Porta": Se não estiver carregando e não tiver usuário, joga pro login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 sticky top-0 h-screen shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-2 py-4 border-b border-slate-800">
            <Bot className="text-emerald-400" size={28} />
            <span className="text-xl font-bold text-white tracking-tight">
              NutriPet<span className="text-emerald-400">.Admin</span>
            </span>
          </div>
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-slate-800 text-white">
              <LayoutDashboard size={18} className="text-emerald-400" />
              Dashboard
            </Link>
            <Link href="/admin/produtos" className="flex items-center gap-2 text-slate-300 hover:text-white p-2">
              <Box size={20} />
              Catálogo
            </Link>
            <Link href="/admin/pets" className="flex items-center gap-2 text-slate-300 hover:text-white p-2">
              <FaDog size={20} />
              Pets
            </Link>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white text-slate-400">
              <ShoppingCart size={18} /> Pedidos da IA
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white text-slate-400">
              <Package size={18} /> Gerenciar Estoque
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white text-slate-400">
              <Calendar size={18} /> Agenda Veterinária
            </button>
          </nav>
        </div>
        
        {/* Botão de Sair com a função real */}
        <button onClick={() => logout().then(() => router.push("/login"))} className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left">
          <LogOut size={18} />
          Sair do Painel
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}