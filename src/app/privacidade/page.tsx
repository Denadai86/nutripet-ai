import { Bot, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
        <Link href="/loja" className="flex items-center gap-2 mb-8 text-emerald-600 hover:text-emerald-700 font-bold w-fit">
          <Bot size={24} /> NutriPet.AI
        </Link>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ShieldCheck className="text-emerald-500" size={32} /> Política de Privacidade
        </h1>
        <p className="text-slate-500 mb-8">Última atualização: Maio de 2026</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>A NutriPet.AI respeita a sua privacidade e garante o sigilo total das informações que nos fornece. Esta Política de Privacidade explica como recolhemos, usamos e protegemos os seus dados.</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-6">1. Recolha de Dados</h2>
          <p>Recolhemos apenas as informações necessárias para a prestação do serviço de Inteligência Artificial, incluindo dados de contacto (WhatsApp) e histórico de conversas estritamente para melhorar o atendimento da loja.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-6">2. Uso das Informações</h2>
          <p>As informações do seu Pet e do seu perfil são utilizadas exclusivamente para personalizar o atendimento, validar restrições de saúde em compras e agendar serviços de forma automatizada.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-6">3. Partilha de Dados</h2>
          <p>Os seus dados não são vendidos, alugados ou transferidos para terceiros, exceto quando exigido por lei ou para o processamento de pagamentos através de gateways oficiais.</p>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <Link href="/loja" className="text-emerald-600 font-bold hover:underline">Voltar para o site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}