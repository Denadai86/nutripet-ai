// src/app/page.tsx
"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen font-sans" style={{ background: "#F7F2E8", color: "#2B1A08" }}>

      {/* NAV */}
      <header className="sticky top-0 z-50" style={{ background: "#F7F2E8", borderBottom: "1px solid #E5DDD0" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="NutriPet AI" className="h-8 w-auto" />
            <span className="font-serif text-lg font-bold tracking-tight" style={{ color: "#2B1A08" }}>
              NutriPet<span style={{ color: "#1565C0" }}>-AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Como funciona", "Planos"].map((l) => (
              <span key={l} className="text-sm cursor-pointer transition-colors" style={{ color: "#6B5744" }}>
                {l}
              </span>
            ))}
            <Link href="/admin" className="text-sm cursor-pointer transition-colors" style={{ color: "#6B5744" }}>
              Admin
            </Link>
          </nav>
          <Link
            href="/loja"
            className="text-sm font-medium px-4 py-2 rounded-md flex items-center gap-1.5 group transition-opacity hover:opacity-80"
            style={{ background: "#1565C0", color: "#fff" }}
          >
            Ver demonstração
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[.14em] uppercase mb-6" style={{ color: "#1565C0" }}>
            Casa de ração · Vet · Agro
          </p>
          <h1 className="font-serif text-5xl font-bold leading-[1.06] tracking-tight mb-6" style={{ color: "#2B1A08" }}>
            Seu WhatsApp vende<br />
            enquanto você{" "}
            <em className="not-italic" style={{ color: "#1565C0" }}>dorme.</em>
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: "#6B5744", maxWidth: "420px" }}>
            Uma IA treinada para o varejo pet que responde clientes, consulta estoque e fecha pedidos — sem você precisar estar online.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/loja"
              className="text-sm font-semibold px-6 py-3 rounded-md flex items-center gap-2 group transition-opacity hover:opacity-85"
              style={{ background: "#2B1A08", color: "#F7F2E8" }}
            >
              Entrar na loja de teste
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium px-6 py-3 rounded-md transition-colors hover:opacity-80"
              style={{ border: "1px solid #C5B9A8", color: "#2B1A08", background: "transparent" }}
            >
              Painel admin
            </Link>
            <span className="text-xs pl-1" style={{ color: "#A89880" }}>Sem cartão de crédito</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ borderTop: "1px solid #E5DDD0", borderBottom: "1px solid #E5DDD0" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3">
          {[
            { num: "24/7", label: "Atendimento sem parar" },
            { num: "< 3s", label: "Tempo médio de resposta" },
            { num: "0 código", label: "Para configurar e usar" },
          ].map((s, i) => (
            <div
              key={s.num}
              className="py-8"
              style={{
                paddingLeft: i > 0 ? "2rem" : "0",
                paddingRight: i < 2 ? "2rem" : "0",
                borderLeft: i > 0 ? "1px solid #E5DDD0" : "none",
              }}
            >
              <div className="font-serif text-3xl font-bold tracking-tight" style={{ color: "#2B1A08" }}>{s.num}</div>
              <div className="text-xs mt-1.5" style={{ color: "#A89880" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ background: "#EFE9DB" }}>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold tracking-[.14em] uppercase mb-10" style={{ color: "#A89880" }}>
            O que a IA faz por você
          </p>
          <div>
            {[
              {
                n: "01",
                title: "Consulta o estoque em tempo real",
                desc: "Nunca mais prometa um produto que acabou. A IA lê o inventário antes de confirmar qualquer pedido e dá baixa automática assim que a venda fecha.",
              },
              {
                n: "02",
                title: "Lembra quem é cada pet",
                desc: "A IA conhece o nome, a raça, o peso e as restrições de saúde de cada animal antes de recomendar qualquer ração ou remédio — direto pelo histórico do cliente.",
              },
              {
                n: "03",
                title: "Fecha pedidos e registra tudo",
                desc: "Do orçamento à confirmação, tudo aparece no painel em tempo real: faturamento, taxa de conversão e os temas mais perguntados pelos seus clientes.",
              },
            ].map((f, i) => (
              <div
                key={f.n}
                className="flex gap-8 py-8"
                style={{ borderTop: i > 0 ? "1px solid #DDD6C8" : "1px solid #DDD6C8" }}
              >
                <span className="font-serif text-sm pt-1 w-6 shrink-0" style={{ color: "#C5B9A8" }}>{f.n}</span>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2" style={{ color: "#2B1A08" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B5744", maxWidth: "480px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAT DEMO */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          <div className="pt-4">
            <p className="text-xs font-semibold tracking-[.14em] uppercase mb-6" style={{ color: "#A89880" }}>
              Uma conversa real no WhatsApp
            </p>
            <h2 className="font-serif text-3xl font-bold leading-snug mb-6" style={{ color: "#2B1A08" }}>
              Inteligência que o<br />dono de pet shop<br />sente na prática.
            </h2>
            <ul className="space-y-3">
              {[
                "Reconhece o cliente pelo número",
                "Cruza histórico de saúde do pet",
                "Sugere produtos compatíveis",
                "Confirma pedidos sem intervenção humana",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#6B5744" }}>
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: "#1565C0" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5DDD0", background: "#fff", boxShadow: "0 1px 4px rgba(43,26,8,.06)" }}>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#2B1A08" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#1565C0", color: "#fff" }}>NP</div>
              <div>
                <div className="text-xs font-medium" style={{ color: "#F7F2E8" }}>NutriPet Assistente</div>
                <div className="text-[10px] flex items-center gap-1" style={{ color: "#A89880" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#4A7C3F" }} />
                  online agora
                </div>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3" style={{ background: "#EFE9DB", minHeight: "220px" }}>
              <div className="self-end text-xs rounded-xl rounded-br-sm px-3 py-2 leading-relaxed" style={{ background: "#2B1A08", color: "#F7F2E8", maxWidth: "80%" }}>
                Oi! Tem ração Hills Prescription para gato com doença renal?
              </div>
              <div className="self-start text-xs rounded-xl rounded-bl-sm px-3 py-2 leading-relaxed" style={{ background: "#fff", color: "#2B1A08", border: "1px solid #E5DDD0", maxWidth: "80%" }}>
                Tenho sim — Hills k/d Felina 1,8kg está disponível (3 un.) por <strong>R$ 98,90</strong>. Posso reservar?
              </div>
              <div className="self-end text-xs rounded-xl rounded-br-sm px-3 py-2 leading-relaxed" style={{ background: "#2B1A08", color: "#F7F2E8", maxWidth: "80%" }}>
                Perfeito, é para o Bolinha — insuficiência renal crônica
              </div>
              <div className="self-start text-xs rounded-xl rounded-bl-sm px-3 py-2 leading-relaxed" style={{ background: "#fff", color: "#2B1A08", border: "1px solid #E5DDD0", maxWidth: "80%" }}>
                Anotado na ficha do Bolinha 🐱 Registro uso contínuo da k/d. Aviso quando o estoque baixar?
              </div>
            </div>

            <div className="px-4 py-2.5 text-[10px]" style={{ borderTop: "1px solid #E5DDD0", background: "#fff", color: "#C5B9A8" }}>
              Resposta automática · sem intervenção humana · 2,4s
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #E5DDD0", background: "#EFE9DB" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NutriPet AI" className="h-6 w-auto" />
            <span className="font-serif text-sm font-bold" style={{ color: "#2B1A08" }}>
              NutriPet<span style={{ color: "#1565C0" }}>-AI</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: "#A89880" }}>
            &copy; {new Date().getFullYear()} NutriPet AI · Casa de Ração | Vet | Agro
          </p>
        </div>
      </footer>

    </main>
  );
}
