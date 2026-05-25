import { Bot, FileText } from "lucide-react";
import Link from "next/link";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
        <Link href="/loja" className="flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700 font-bold w-fit">
          <Bot size={24} /> NutriPet.AI
        </Link>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <FileText className="text-indigo-500" size={32} /> Termos de Uso
        </h1>
        <p className="text-slate-500 mb-8">Última atualização: Maio de 2026</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>Ao aceder e utilizar o sistema NutriPet.AI, concorda com os presentes termos de serviço. Se não concordar com alguma parte destes termos, não deverá utilizar a nossa plataforma.</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-6">1. O Serviço (Micro-SaaS)</h2>
          <p>A NutriPet.AI fornece um agente virtual de Inteligência Artificial para atendimento automatizado, gestão de agenda e CRM para Pet Shops e Clínicas Veterinárias.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-6">2. Isenção de Responsabilidade Médica</h2>
          <p>A Inteligência Artificial atua como um assistente comercial e de triagem. As sugestões de produtos e serviços <strong>não substituem uma avaliação veterinária profissional</strong>. A loja parceira é a responsável final pela aprovação das vendas.</p>

          <h2 className="text-xl font-bold text-slate-800 mt-6">3. Disponibilidade e Limites (API)</h2>
          <p>O funcionamento contínuo do robô depende da disponibilidade das APIs de terceiros (Google Gemini e WhatsApp). Podem ocorrer atrasos pontuais devido a limites de processamento (Rate Limits).</p>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <Link href="/loja" className="text-indigo-600 font-bold hover:underline">Voltar para o site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}