"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingCart, Calendar, LogOut, Bot, Box, Moon, Sun, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { FaDog } from "react-icons/fa";

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Estado do Tema (Por padrão escuro, porque nós gostamos do Dark Mode!)
  const [isDark, setIsDark] = useState(true);

  // Assim que o componente carrega, verifica se o cliente tinha escolhido o tema claro antes
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Função para alternar o tema
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const isActive = (path: string) => pathname === path;

  // As cores da sidebar também reagem um bocadinho ao tema
  const baseLinkClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors";
  const activeLinkClass = "bg-slate-800 text-white shadow-inner";
  const inactiveLinkClass = "hover:bg-slate-800 hover:text-white text-slate-400";

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 text-slate-300 flex flex-col justify-between p-4 sticky top-0 h-screen shadow-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2 py-4 border-b border-slate-800/50">
          <Bot className="text-emerald-400" size={28} />
          <span className="text-xl font-bold text-white tracking-tight">
            NutriPet<span className="text-emerald-400">.Admin</span>
          </span>
        </div>
        
        <nav className="space-y-1">
          <Link href="/admin" className={`${baseLinkClass} ${isActive('/admin') ? activeLinkClass : inactiveLinkClass}`}>
            <LayoutDashboard size={18} className={isActive('/admin') ? "text-emerald-400" : ""} /> Dashboard
          </Link>
          <Link href="/admin/produtos" className={`${baseLinkClass} ${isActive('/admin/produtos') ? activeLinkClass : inactiveLinkClass}`}>
            <Box size={18} className={isActive('/admin/produtos') ? "text-emerald-400" : ""} /> Catálogo / Estoque
          </Link>
          <Link href="/admin/pedidos" className={`${baseLinkClass} ${isActive('/admin/pedidos') ? activeLinkClass : inactiveLinkClass}`}>
            <ShoppingCart size={18} className={isActive('/admin/pedidos') ? "text-emerald-400" : ""} /> Pedidos da IA
          </Link>
          <Link href="/admin/pets" className={`${baseLinkClass} ${isActive('/admin/pets') ? activeLinkClass : inactiveLinkClass}`}>
            <FaDog size={18} className={isActive('/admin/pets') ? "text-emerald-400" : ""} /> CRM & Pets
          </Link>
          <Link href="/admin/conversas" className={`${baseLinkClass} ${isActive('/admin/conversas') ? activeLinkClass : inactiveLinkClass}`}>
            <MessageSquare size={18} className={isActive('/admin/conversas') ? "text-emerald-400" : ""} /> Radar
          </Link>
          <Link href="/admin/agenda" className={`${baseLinkClass} ${isActive('/admin/agenda') ? activeLinkClass : inactiveLinkClass}`}>
            <Calendar size={18} className={isActive('/admin/agenda') ? "text-emerald-400" : ""} /> Agenda
          </Link>
        </nav>
      </div>
      
      <div className="space-y-2">
        {/* O BOTÃO MÁGICO DE TEMA */}
        <button 
          onClick={toggleTheme} 
          className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full text-left border border-slate-800"
        >
          <span className="flex items-center gap-3">
            {isDark ? <Sun size={18} className="text-amber-400"/> : <Moon size={18} className="text-indigo-400"/>}
            Tema {isDark ? "Claro" : "Escuro"}
          </span>
        </button>

        {/* Botão de Sair */}
        <button onClick={() => logout().then(() => router.push("/login"))} className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left">
          <LogOut size={18} /> Sair do Painel
        </button>
      </div>
    </aside>
  );
}