"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importando o nosso novo componente

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // O "Segurança da Porta": Se não estiver carregando e não tiver usuário, joga pro login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-800">Carregando painel...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      
      {/* Componente isolado com a navegação e lógica de saída */}
      <Sidebar />
      
      {/* Área onde as páginas são renderizadas */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}